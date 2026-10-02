"""Education requirement detection — explain uncertainty, never invent degrees."""

import re

DEGREE_PATTERNS = [
    ("B.Tech", [r"b\.?\s*tech", r"bachelor\s+of\s+technology", r"btech"]),
    ("B.E.", [r"b\.?\s*e\.?\b", r"bachelor\s+of\s+engineering"]),
    ("M.Tech", [r"m\.?\s*tech", r"master\s+of\s+technology", r"mtech"]),
    ("MCA", [r"\bmca\b", r"master\s+of\s+computer\s+applications"]),
    ("BCA", [r"\bbca\b", r"bachelor\s+of\s+computer\s+applications"]),
    ("MBA", [r"\bmba\b", r"master\s+of\s+business\s+administration"]),
    ("B.Sc", [r"b\.?\s*sc", r"bachelor\s+of\s+science"]),
    ("M.Sc", [r"m\.?\s*sc", r"master\s+of\s+science"]),
    ("PhD", [r"\bph\.?\s*d\b", r"doctorate"]),
]


def _find_degrees(text: str) -> list[str]:
    found = []
    lower = text.lower()
    for name, patterns in DEGREE_PATTERNS:
        for pattern in patterns:
            if re.search(pattern, lower, flags=re.IGNORECASE):
                found.append(name)
                break
    return found


def analyze_education(resume_text: str, jd_text: str) -> dict:
    resume_degrees = _find_degrees(resume_text)
    jd_degrees = _find_degrees(jd_text)

    if not jd_degrees:
        return {
            "score": 0.8,
            "resume_degrees": resume_degrees,
            "required_degrees": [],
            "matched_degrees": [],
            "message": "Job description does not clearly list specific degree requirements.",
            "match_level": "unclear",
        }

    if not resume_degrees:
        return {
            "score": 0.4,
            "resume_degrees": [],
            "required_degrees": jd_degrees,
            "matched_degrees": [],
            "message": "Not enough information available in the resume to confirm education requirements.",
            "match_level": "unclear",
        }

    matched = [d for d in jd_degrees if d in resume_degrees]
    # Also treat B.Tech / B.E. as related undergrad engineering degrees
    related = {
        "B.Tech": {"B.E."},
        "B.E.": {"B.Tech"},
    }
    for req in jd_degrees:
        for alt in related.get(req, set()):
            if alt in resume_degrees and req not in matched:
                matched.append(req)

    if matched:
        score = len(set(matched)) / max(len(set(jd_degrees)), 1)
        return {
            "score": min(1.0, score),
            "resume_degrees": resume_degrees,
            "required_degrees": jd_degrees,
            "matched_degrees": list(set(matched)),
            "message": f"Matched education signals: {', '.join(sorted(set(matched)))}.",
            "match_level": "good" if score >= 0.7 else "partial",
        }

    return {
        "score": 0.3,
        "resume_degrees": resume_degrees,
        "required_degrees": jd_degrees,
        "matched_degrees": [],
        "message": (
            "Resume education does not clearly match the degrees mentioned in the JD. "
            "This may be ambiguous depending on equivalent qualifications."
        ),
        "match_level": "low",
    }
