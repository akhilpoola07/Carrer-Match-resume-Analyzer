import re

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate_registration(data: dict) -> str | None:
    if not isinstance(data, dict):
        return "A JSON request body is required."
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    confirm = data.get("confirm_password") or data.get("confirmPassword") or ""

    if not name:
        return "Full name is required."
    if not email or not EMAIL_RE.match(email):
        return "A valid email is required."
    if len(password) < 8:
        return "Password must be at least 8 characters."
    if password != confirm:
        return "Password confirmation does not match."
    return None


def validate_login(data: dict) -> str | None:
    if not isinstance(data, dict):
        return "A JSON request body is required."
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""
    if not email or not password:
        return "Email and password are required."
    return None


def validate_analysis_payload(data: dict) -> str | None:
    if not isinstance(data, dict):
        return "A JSON request body is required."
    if not data.get("resume_id"):
        return "resume_id is required."
    if not (data.get("company_name") or "").strip():
        return "Company name is required."
    if not (data.get("job_role") or "").strip():
        return "Job role is required."
    jd = (data.get("job_description") or "").strip()
    if not jd:
        return "Job description is required."
    if len(jd) < 30:
        return "Job description is too short to analyze meaningfully."
    return None
