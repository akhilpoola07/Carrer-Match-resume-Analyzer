import os
from datetime import timedelta


class Config:
    """Application configuration loaded from environment variables."""

    APP_ENV = os.getenv("APP_ENV", "development")
    _jwt_secret = os.getenv("JWT_SECRET")
    if not _jwt_secret and APP_ENV.lower() in {"production", "prod"}:
        raise RuntimeError("JWT_SECRET must be configured in production.")
    SECRET_KEY = _jwt_secret or "dev-only-change-me"
    JWT_SECRET_KEY = SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///careermatch_ai.db",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Railway / Heroku sometimes provide postgres:// — SQLAlchemy needs postgresql://
    if SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace(
            "postgres://", "postgresql://", 1
        )

    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")


class TestConfig(Config):
    """In-memory SQLite for pytest."""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-secret"
    SECRET_KEY = "test-secret"
    GEMINI_API_KEY = ""
