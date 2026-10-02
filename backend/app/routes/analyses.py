from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, Resume, Analysis
from app.services.ats_service import run_analysis
from app.services.gemini_service import generate_ai_suggestions
from app.utils.responses import success_response, error_response
from app.validators.auth_validators import validate_analysis_payload
import json

analyses_bp = Blueprint("analyses", __name__)


@analyses_bp.route("", methods=["POST"])
@jwt_required()
def create_analysis():
    """Create a new analysis for a resume against a job description."""
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error_response("A JSON request body is required.", 400)

    validation_error = validate_analysis_payload(data)
    if validation_error:
        return error_response(validation_error, 400)

    try:
        resume_id = int(data["resume_id"])
    except (TypeError, ValueError):
        return error_response("resume_id must be a valid integer.", 400)
    
    # Get resume
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    if not resume:
        return error_response("Resume not found", 404)
    
    # Run ATS analysis
    analysis_result = run_analysis(resume.extracted_text, data["job_description"])
    
    # Get AI suggestions if Gemini API key is configured
    ai_suggestions = None
    if current_app.config.get("GEMINI_API_KEY"):
        try:
            ai_suggestions = generate_ai_suggestions(
                current_app.config.get("GEMINI_API_KEY"),
                resume.extracted_text,
                data["job_description"],
                analysis_result
            )
        except Exception as e:
            current_app.logger.warning(f"Failed to get AI suggestions: {str(e)}")
    
    # Create analysis record
    analysis = Analysis(
        user_id=user_id,
        resume_id=resume.id,
        company_name=data["company_name"].strip(),
        job_role=data["job_role"].strip(),
        job_location=data.get("job_location"),
        job_description=data["job_description"].strip(),
        ats_score=analysis_result["ats_score"],
        skills_score=analysis_result["skills_score"],
        keyword_score=analysis_result["keyword_score"],
        experience_score=analysis_result["experience_score"],
        education_score=analysis_result["education_score"],
        completeness_score=analysis_result["completeness_score"],
        matched_skills=json.dumps(analysis_result["matched_skills"]),
        missing_skills=json.dumps(analysis_result["missing_skills"]),
        matched_keywords=json.dumps(analysis_result["matched_keywords"]),
        missing_keywords=json.dumps(analysis_result["missing_keywords"]),
        keyword_coverage=analysis_result["keyword_coverage"],
        experience_analysis=json.dumps(analysis_result["experience_analysis"]),
        education_analysis=json.dumps(analysis_result["education_analysis"]),
        completeness_analysis=json.dumps(analysis_result["completeness_analysis"]),
        ai_suggestions=json.dumps(ai_suggestions) if ai_suggestions else None
    )
    
    db.session.add(analysis)
    db.session.commit()
    
    return success_response(
        {"analysis": analysis.to_dict(detailed=True)},
        "Analysis completed successfully",
        201
    )


@analyses_bp.route("", methods=["GET"])
@jwt_required()
def get_analyses():
    """Get all analyses for the current user."""
    user_id = int(get_jwt_identity())
    analyses = Analysis.query.filter_by(user_id=user_id).order_by(Analysis.created_at.desc()).all()
    
    return success_response({
        "analyses": [analysis.to_dict() for analysis in analyses]
    })


@analyses_bp.route("/<int:analysis_id>", methods=["GET"])
@jwt_required()
def get_analysis(analysis_id):
    """Get a specific analysis with full details."""
    user_id = int(get_jwt_identity())
    analysis = Analysis.query.filter_by(id=analysis_id, user_id=user_id).first()
    
    if not analysis:
        return error_response("Analysis not found", 404)
    
    return success_response({"analysis": analysis.to_dict(detailed=True)})


@analyses_bp.route("/<int:analysis_id>", methods=["DELETE"])
@jwt_required()
def delete_analysis(analysis_id):
    """Delete an analysis."""
    user_id = int(get_jwt_identity())
    analysis = Analysis.query.filter_by(id=analysis_id, user_id=user_id).first()
    
    if not analysis:
        return error_response("Analysis not found", 404)
    
    db.session.delete(analysis)
    db.session.commit()
    
    return success_response({}, "Analysis deleted successfully")
