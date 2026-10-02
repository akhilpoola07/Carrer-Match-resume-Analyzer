import os
from datetime import timedelta
from urllib.parse import urlparse


class Config:
    """Application configuration loaded from environment variables."""

    APP_ENV = os.getenv("APP_ENV", "development")
    IS_PRODUCTION = APP_ENV.lower() in {"production", "prod"}
    _jwt_secret = os.getenv("JWT_SECRET")
    if not _jwt_secret and IS_PRODUCTION:
        raise RuntimeError("JWT_SECRET must be configured in production.")
    if IS_PRODUCTION and (len(_jwt_secret) < 32 or _jwt_secret == "dev-only-change-me"):
        raise RuntimeError("JWT_SECRET must contain at least 32 characters in production.")
    SECRET_KEY = _jwt_secret or "dev-only-change-me"
    JWT_SECRET_KEY = SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    _database_url = os.getenv("DATABASE_URL")
    if IS_PRODUCTION and not _database_url:
        raise RuntimeError("DATABASE_URL must point to the production database.")
    SQLALCHEMY_DATABASE_URI = _database_url or "sqlite:///careermatch_ai.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Railway / Heroku sometimes provide postgres:// — SQLAlchemy needs postgresql://
    if SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace(
            "postgres://", "postgresql://", 1
        )

    _frontend_url = os.getenv("FRONTEND_URL")
    if IS_PRODUCTION and not _frontend_url:
        raise RuntimeError("FRONTEND_URL must be configured in production.")
    if IS_PRODUCTION and any(
        urlparse(origin.strip()).scheme != "https"
        or not urlparse(origin.strip()).netloc
        for origin in _frontend_url.split(",")
        if origin.strip()
    ):
        raise RuntimeError("Production FRONTEND_URL origins must use HTTPS.")
    FRONTEND_URL = _frontend_url or "http://localhost:5173"
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB
    _upload_folder = os.getenv("UPLOAD_FOLDER")
    if IS_PRODUCTION and (not _upload_folder or not os.path.isabs(_upload_folder)):
        raise RuntimeError("UPLOAD_FOLDER must be an absolute persistent-storage path in production.")
    UPLOAD_FOLDER = _upload_folder or "uploads"


class TestConfig(Config):
    """In-memory SQLite for pytest."""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-secret"
    SECRET_KEY = "test-secret"
    GEMINI_API_KEY = ""
