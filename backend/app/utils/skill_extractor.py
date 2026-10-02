"""Skill extraction using the extendable skill dictionary."""

import re
from app.utils.skill_dictionary import SKILL_DICTIONARY


def extract_skills(text: str) -> list[str]:
    if not text:
        return []

    found = set()
    # Pad with spaces so word-boundary style matching is easier
    haystack = f" {text.lower()} "

    for skill in SKILL_DICTIONARY:
        terms = [skill["name"].lower(), *[a.lower() for a in skill["aliases"]]]
        for term in terms:
            # Avoid matching "C" inside "CSS" / "React" etc. with boundaries
            pattern = rf"(^|[^a-z0-9+#.]){re.escape(term)}([^a-z0-9+#.]|$)"
            if re.search(pattern, haystack, flags=re.IGNORECASE):
                found.add(skill["name"])
                break

    return sorted(found)


def get_skill_category(skill_name: str) -> str:
    for skill in SKILL_DICTIONARY:
        if skill["name"].lower() == skill_name.lower():
            return skill["category"]
    return "Other"
