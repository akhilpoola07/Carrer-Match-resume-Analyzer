from datetime import datetime, timezone

from app.extensions import db


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    resumes = db.relationship(
        "Resume", back_populates="user", cascade="all, delete-orphan"
    )
    analyses = db.relationship(
        "Analysis", back_populates="user", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Resume(db.Model):
    __tablename__ = "resumes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    file_name = db.Column(db.String(255), nullable=False)
    extracted_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    user = db.relationship("User", back_populates="resumes")
    analyses = db.relationship(
        "Analysis", back_populates="resume", cascade="all, delete-orphan"
    )

    def to_dict(self, include_text=False):
        import re

        display_name = re.sub(r"^[0-9a-f]{32}_", "", self.file_name)
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "file_name": display_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "text_length": len(self.extracted_text or ""),
        }
        if include_text:
            data["extracted_text"] = self.extracted_text
        return data


class Analysis(db.Model):
    __tablename__ = "analyses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    resume_id = db.Column(
        db.Integer, db.ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    company_name = db.Column(db.String(255), nullable=False)
    job_role = db.Column(db.String(255), nullable=False)
    job_location = db.Column(db.String(255), nullable=True)
    job_description = db.Column(db.Text, nullable=False)

    ats_score = db.Column(db.Integer, nullable=False)
    skills_score = db.Column(db.Integer, nullable=False)
    keyword_score = db.Column(db.Integer, nullable=False)
    experience_score = db.Column(db.Integer, nullable=False)
    education_score = db.Column(db.Integer, nullable=False)
    completeness_score = db.Column(db.Integer, nullable=False)

    # JSON stored as text for simplicity / SQLite test compatibility
    matched_skills = db.Column(db.Text, nullable=False, default="[]")
    missing_skills = db.Column(db.Text, nullable=False, default="[]")
    matched_keywords = db.Column(db.Text, nullable=False, default="[]")
    missing_keywords = db.Column(db.Text, nullable=False, default="[]")
    keyword_coverage = db.Column(db.Integer, nullable=False, default=0)

    experience_analysis = db.Column(db.Text, nullable=True)
    education_analysis = db.Column(db.Text, nullable=True)
    completeness_analysis = db.Column(db.Text, nullable=True)
    ai_suggestions = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    user = db.relationship("User", back_populates="analyses")
    resume = db.relationship("Resume", back_populates="analyses")

    def to_dict(self, detailed=False):
        import json

        def loads(value, default=None):
            if value is None:
                return default
            if isinstance(value, (list, dict)):
                return value
            try:
                return json.loads(value)
            except (TypeError, ValueError):
                return default if default is not None else value

        data = {
            "id": self.id,
            "user_id": self.user_id,
            "resume_id": self.resume_id,
            "company_name": self.company_name,
            "job_role": self.job_role,
            "job_location": self.job_location,
            "ats_score": self.ats_score,
            "skills_score": self.skills_score,
            "keyword_score": self.keyword_score,
            "experience_score": self.experience_score,
            "education_score": self.education_score,
            "completeness_score": self.completeness_score,
            "keyword_coverage": self.keyword_coverage,
            "matched_skills": loads(self.matched_skills, []),
            "missing_skills": loads(self.missing_skills, []),
            "matched_keywords": loads(self.matched_keywords, []),
            "missing_keywords": loads(self.missing_keywords, []),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "resume_file_name": self.resume.file_name if self.resume else None,
        }

        if detailed:
            data.update(
                {
                    "job_description": self.job_description,
                    "experience_analysis": loads(self.experience_analysis, {}),
                    "education_analysis": loads(self.education_analysis, {}),
                    "completeness_analysis": loads(self.completeness_analysis, {}),
                    "ai_suggestions": loads(self.ai_suggestions, None),
                }
            )
        return data
