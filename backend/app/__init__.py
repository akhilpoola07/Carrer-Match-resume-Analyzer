from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.extensions import db, jwt, cors
from app.models import User, Resume, Analysis


def create_app(config_class=Config):
    """Application factory pattern."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)

    # Create tables
    with app.app_context():
        db.create_all()

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.resumes import resumes_bp
    from app.routes.analyses import analyses_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(resumes_bp, url_prefix="/api/resumes")
    app.register_blueprint(analyses_bp, url_prefix="/api/analyses")

    return app
