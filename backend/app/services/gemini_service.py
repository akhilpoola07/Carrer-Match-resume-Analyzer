"""Optional Gemini AI suggestions. Deterministic analysis must work without this."""

import json
import re
import requests


def generate_ai_suggestions(
    api_key: str,
    resume_text: str,
    job_description: str,
    analysis: dict,
) -> dict | None:
    """Return structured AI suggestions or None if Gemini is unavailable."""
    if not api_key:
        return None

    prompt = f"""
You are assisting with resume improvement. Use ONLY information present in the resume.
NEVER invent work experience, certifications, education, projects, or skills.

Return ONLY valid JSON with this shape:
{{
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "improved_summary": "...",
  "skills_to_learn": ["...", "..."],
  "project_suggestions": ["...", "..."]
}}

Rules:
- strengths: 3-5 points based on resume content
- improvements: 3-5 practical suggestions
- improved_summary: rewrite using only resume facts
- skills_to_learn: 3-5 from missing skills list only
- project_suggestions: how to describe existing projects better for this JD

Matched skills: {analysis.get('matched_skills')}
Missing skills: {analysis.get('missing_skills')}
ATS-style score: {analysis.get('ats_score')}

JOB DESCRIPTION:
{job_description[:4000]}

RESUME TEXT:
{resume_text[:6000]}
"""

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.0-flash:generateContent?key={api_key}"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3},
    }

    try:
        response = requests.post(url, json=payload, timeout=30)
        if response.status_code != 200:
            return None
        data = response.json()
        text = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )
        return _parse_json_response(text)
    except Exception:
        return None


def _parse_json_response(text: str) -> dict | None:
    if not text:
        return None
    cleaned = text.strip()
    cleaned = re.sub(r"^```json\s*", "", cleaned)
    cleaned = re.sub(r"^```\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if not match:
            return None
        try:
            data = json.loads(match.group(0))
        except json.JSONDecodeError:
            return None

    required = [
        "strengths",
        "improvements",
        "improved_summary",
        "skills_to_learn",
        "project_suggestions",
    ]
    if not all(k in data for k in required):
        return None
    return data
