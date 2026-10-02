"""Resume completeness scoring based on common sections."""

from app.utils.text_utils import detect_sections

CHECKS = [
    ("contact", "Contact"),
    ("summary", "Summary"),
    ("skills", "Skills"),
    ("education", "Education"),
    ("experience", "Experience"),
    ("projects", "Projects"),
    ("certifications", "Certifications"),
]


def analyze_completeness(resume_text: str) -> dict:
    sections = detect_sections(resume_text or "")
    details = []
    present_count = 0

    for key, label in CHECKS:
        present = bool(sections.get(key))
        if present:
            present_count += 1
        details.append({"section": label, "present": present})

    percentage = round((present_count / len(CHECKS)) * 100) if CHECKS else 0
    return {
        "percentage": percentage,
        "present_count": present_count,
        "total_checks": len(CHECKS),
        "details": details,
    }
