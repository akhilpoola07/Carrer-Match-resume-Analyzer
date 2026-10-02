from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
from app.extensions import db
from app.models import User, Resume
from app.services.pdf_service import extract_text_from_pdf
from app.utils.responses import success_response, error_response

resumes_bp = Blueprint("resumes", __name__)
MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024


@resumes_bp.route("", methods=["POST"])
@jwt_required()
def upload_resume():
    """Upload and parse a PDF resume."""
    user_id = int(get_jwt_identity())
    
    if "file" not in request.files:
        return error_response("No file provided", 400)
    
    file = request.files["file"]
    if file.filename == "":
        return error_response("No file selected", 400)
    
    if not file.filename.lower().endswith(".pdf"):
        return error_response("Only PDF files are allowed", 400)
    
    # Secure filename
    original_filename = secure_filename(file.filename)
    if not original_filename:
        return error_response("Invalid file name.", 400)
    
    # Create upload directory if it doesn't exist
    upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
    os.makedirs(upload_folder, exist_ok=True)
    
    # Save file
    filename = f"{uuid.uuid4().hex}_{original_filename}"
    filepath = os.path.join(upload_folder, filename)
    try:
        file_bytes = file.read()
        if not file_bytes:
            return error_response("Empty file uploaded.", 400)
        if len(file_bytes) > MAX_RESUME_SIZE_BYTES:
            return error_response("Resume file exceeds the 5 MB limit.", 413)
        extracted_text = extract_text_from_pdf(file_bytes)
        with open(filepath, "wb") as stored_file:
            stored_file.write(file_bytes)
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        current_app.logger.info("Resume PDF parsing failed: %s", str(e))
        return error_response(f"Failed to parse PDF: {str(e)}", 400)
    
    # Create resume record
    resume = Resume(
        user_id=user_id,
        file_name=filename,
        extracted_text=extracted_text
    )
    
    db.session.add(resume)
    db.session.commit()
    
    return success_response(
        {"resume": resume.to_dict()},
        "Resume uploaded and parsed successfully",
        201
    )


@resumes_bp.route("", methods=["GET"])
@jwt_required()
def get_resumes():
    """Get all resumes for the current user."""
    user_id = int(get_jwt_identity())
    resumes = Resume.query.filter_by(user_id=user_id).order_by(Resume.created_at.desc()).all()
    
    return success_response({
        "resumes": [resume.to_dict() for resume in resumes]
    })


@resumes_bp.route("/<int:resume_id>", methods=["GET"])
@jwt_required()
def get_resume(resume_id):
    """Get a specific resume with full text."""
    user_id = int(get_jwt_identity())
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    
    if not resume:
        return error_response("Resume not found", 404)
    
    return success_response({"resume": resume.to_dict(include_text=True)})


@resumes_bp.route("/<int:resume_id>", methods=["DELETE"])
@jwt_required()
def delete_resume(resume_id):
    """Delete a resume."""
    user_id = int(get_jwt_identity())
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    
    if not resume:
        return error_response("Resume not found", 404)
    
    # Delete file from disk
    upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
    filepath = os.path.join(upload_folder, resume.file_name)
    if os.path.exists(filepath):
        os.remove(filepath)
    
    db.session.delete(resume)
    db.session.commit()
    
    return success_response({}, "Resume deleted successfully")
