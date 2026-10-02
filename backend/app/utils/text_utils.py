"""Text cleaning and resume section detection helpers."""

import re

SECTION_HEADERS = {
    "contact": ["contact", "contact information", "personal information"],
    "summary": ["summary", "professional summary", "profile", "objective", "about me"],
    "skills": ["skills", "technical skills", "core competencies", "technologies"],
    "education": ["education", "academic background", "qualifications"],
    "experience": [
        "experience",
        "work experience",
        "professional experience",
        "employment",
        "work history",
    ],
    "projects": ["projects", "personal projects", "academic projects"],
    "certifications": ["certifications", "certificates", "licenses"],
    "achievements": ["achievements", "accomplishments", "awards"],
}


def clean_text(text: str) -> str:
    if not text:
        return ""
    # Normalize whitespace while keeping line breaks for section detection
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def detect_sections(text: str) -> dict:
    """Return which common resume sections appear to be present."""
    lower = text.lower()
    found = {}
    for key, headers in SECTION_HEADERS.items():
        found[key] = any(
            re.search(rf"(^|\n)\s*{re.escape(h)}\s*[:\-]?\s*(\n|$)", lower)
            or h in lower
            for h in headers
        )
    # Contact heuristic: email or phone present
    has_email = bool(re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text))
    has_phone = bool(re.search(r"(\+?\d[\d\-\s()]{8,}\d)", text))
    found["contact"] = found.get("contact", False) or has_email or has_phone
    return found
