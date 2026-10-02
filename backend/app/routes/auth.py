from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User
from app.validators.auth_validators import validate_registration, validate_login
from app.utils.responses import success_response, error_response
import bcrypt

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user."""
    data = request.get_json(silent=True)
    
    # Validate input
    validation_error = validate_registration(data)
    if validation_error:
        return error_response(validation_error, 400)
    
    # Check if user already exists
    if User.query.filter_by(email=data["email"]).first():
        return error_response("Email already registered", 409)
    
    # Hash password
    password_hash = bcrypt.hashpw(
        data["password"].encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")
    
    # Create user
    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=password_hash
    )
    
    db.session.add(user)
    db.session.commit()
    
    return success_response(
        {"user": user.to_dict()},
        "User registered successfully",
        201
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    """Login user and return JWT token."""
    data = request.get_json(silent=True)
    
    # Validate input
    validation_error = validate_login(data)
    if validation_error:
        return error_response(validation_error, 400)
    
    # Find user
    user = User.query.filter_by(email=data["email"]).first()
    if not user:
        return error_response("Invalid credentials", 401)
    
    # Verify password
    if not bcrypt.checkpw(
        data["password"].encode("utf-8"),
        user.password_hash.encode("utf-8")
    ):
        return error_response("Invalid credentials", 401)
    
    # Create access token
    access_token = create_access_token(identity=str(user.id))
    
    return success_response(
        {"token": access_token, "user": user.to_dict()},
        "Login successful"
    )


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Get current user profile."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return error_response("User not found", 404)
    
    return success_response({"user": user.to_dict()})
