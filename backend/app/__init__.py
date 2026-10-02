from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import text
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
    frontend_origins = [
        origin.strip().rstrip("/")
        for origin in app.config["FRONTEND_URL"].split(",")
        if origin.strip()
    ]
    if not app.config.get("IS_PRODUCTION"):
        frontend_origins.extend(
            f"http://{host}:{port}"
            for host in ("localhost", "127.0.0.1")
            for port in range(5173, 5176)
        )
    cors.init_app(app, resources={r"/api/*": {"origins": frontend_origins}})

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

    @app.get("/api/health")
    def health():
        try:
            db.session.execute(text("SELECT 1"))
        except Exception:
            app.logger.exception("Health check database query failed")
            return jsonify({"status": "unavailable"}), 503
        return jsonify({"status": "ok"}), 200

    return app
