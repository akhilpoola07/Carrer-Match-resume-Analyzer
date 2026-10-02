"""Experience requirement detection — never invent years."""

import re


def _extract_required_years(jd_text: str):
    patterns = [
        r"(\d+)\+?\s*[\-\u2013]?\s*(\d+)?\s*\+?\s*years?",
        r"minimum\s+of\s+(\d+)\s*years?",
        r"at\s+least\s+(\d+)\s*years?",
    ]
    for pattern in patterns:
        match = re.search(pattern, jd_text, flags=re.IGNORECASE)
        if match:
            groups = [g for g in match.groups() if g]
            if groups:
                return int(groups[0])
    return None


def _is_fresher_role(jd_text: str) -> bool:
    lower = jd_text.lower()
    markers = [
        "fresher",
        "freshers",
        "entry level",
        "entry-level",
        "internship",
        "intern",
        "graduate",
        "0-1 year",
        "0 years",
        "no experience required",
    ]
    return any(m in lower for m in markers)


def _extract_resume_years(resume_text: str):
    matches = re.findall(
        r"(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience|exp)",
        resume_text,
        flags=re.IGNORECASE,
    )
    if matches:
        return max(int(m) for m in matches)
    return None


def analyze_experience(resume_text: str, jd_text: str) -> dict:
    required_years = _extract_required_years(jd_text)
    fresher_role = _is_fresher_role(jd_text)
    resume_years = _extract_resume_years(resume_text)

    if required_years is None and not fresher_role:
        return {
            "score": 0.7,  # neutral-ish when JD does not specify clearly
            "required_years": None,
            "resume_years": resume_years,
            "is_fresher_role": False,
            "message": "Not enough information available.",
            "match_level": "unclear",
        }

    if fresher_role and required_years is None:
        return {
            "score": 1.0,
            "required_years": 0,
            "resume_years": resume_years,
            "is_fresher_role": True,
            "message": "Job appears suitable for freshers / entry-level candidates.",
            "match_level": "good",
        }

    if resume_years is None:
        return {
            "score": 0.5,
            "required_years": required_years,
            "resume_years": None,
            "is_fresher_role": fresher_role,
            "message": "Not enough information available in the resume to confirm years of experience.",
            "match_level": "unclear",
        }

    if resume_years >= required_years:
        return {
            "score": 1.0,
            "required_years": required_years,
            "resume_years": resume_years,
            "is_fresher_role": fresher_role,
            "message": f"Resume indicates ~{resume_years} years; JD asks for ~{required_years}+ years.",
            "match_level": "good",
        }

    ratio = resume_years / max(required_years, 1)
    return {
        "score": max(0.2, min(0.9, ratio)),
        "required_years": required_years,
        "resume_years": resume_years,
        "is_fresher_role": fresher_role,
        "message": f"Resume indicates ~{resume_years} years; JD asks for ~{required_years}+ years.",
        "match_level": "partial" if ratio >= 0.5 else "low",
    }
