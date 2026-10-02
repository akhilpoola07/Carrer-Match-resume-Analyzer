"""Deterministic ATS-style compatibility scoring.

Weights:
  Skills 50% | Keywords 20% | Experience 15% | Education 10% | Completeness 5%
"""

from app.utils.skill_extractor import extract_skills
from app.utils.keyword_extractor import extract_important_keywords
from app.utils.experience_analyzer import analyze_experience
from app.utils.education_analyzer import analyze_education
from app.utils.completeness_analyzer import analyze_completeness
from app.utils.text_utils import clean_text

WEIGHTS = {
    "skills": 50,
    "keywords": 20,
    "experience": 15,
    "education": 10,
    "completeness": 5,
}


def run_analysis(resume_text: str, job_description: str) -> dict:
    resume_text = clean_text(resume_text)
    job_description = clean_text(job_description)

    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(job_description)

    matched_skills = [s for s in jd_skills if s in resume_skills]
    missing_skills = [s for s in jd_skills if s not in resume_skills]

    if jd_skills:
        skills_score = round((len(matched_skills) / len(jd_skills)) * WEIGHTS["skills"])
    else:
        skills_score = WEIGHTS["skills"]

    jd_keywords = extract_important_keywords(job_description, limit=30)
    resume_lower = resume_text.lower()
    matched_keywords = [kw for kw in jd_keywords if kw in resume_lower]
    missing_keywords = [kw for kw in jd_keywords if kw not in resume_lower]

    if jd_keywords:
        keyword_coverage = round((len(matched_keywords) / len(jd_keywords)) * 100)
        keyword_score = round((len(matched_keywords) / len(jd_keywords)) * WEIGHTS["keywords"])
    else:
        keyword_coverage = 100
        keyword_score = WEIGHTS["keywords"]

    experience_analysis = analyze_experience(resume_text, job_description)
    experience_score = round(experience_analysis["score"] * WEIGHTS["experience"])

    education_analysis = analyze_education(resume_text, job_description)
    education_score = round(education_analysis["score"] * WEIGHTS["education"])

    completeness_result = analyze_completeness(resume_text)
    completeness_score = round(
        (completeness_result["percentage"] / 100) * WEIGHTS["completeness"]
    )

    ats_score = min(
        100,
        skills_score
        + keyword_score
        + experience_score
        + education_score
        + completeness_score,
    )

    return {
        "ats_score": ats_score,
        "skills_score": skills_score,
        "keyword_score": keyword_score,
        "experience_score": experience_score,
        "education_score": education_score,
        "completeness_score": completeness_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "keyword_coverage": keyword_coverage,
        "resume_skills": resume_skills,
        "jd_skills": jd_skills,
        "experience_analysis": experience_analysis,
        "education_analysis": education_analysis,
        "completeness_analysis": completeness_result,
        "disclaimer": (
            "This score is an estimate generated using our matching algorithm and "
            "does not represent the proprietary scoring system of any specific employer's ATS."
        ),
    }
