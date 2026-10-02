from io import BytesIO

import pytest
from pathlib import Path

from app import create_app
from app.config import TestConfig
from app.extensions import db


@pytest.fixture
def def_client(tmp_path):
    class IsolatedTestConfig(TestConfig):
        UPLOAD_FOLDER = str(tmp_path)

    app = create_app(IsolatedTestConfig)
    with app.app_context():
        yield app.test_client()
        db.session.remove()
        db.drop_all()


def test_resume_upload_and_analysis_flow(def_client, monkeypatch):
    health = def_client.get("/api/health")
    assert health.status_code == 200
    assert health.json == {"status": "ok"}

    cors_preflight = def_client.options(
        "/api/analyses",
        headers={
            "Origin": "http://127.0.0.1:5175",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )
    assert cors_preflight.status_code == 200
    assert cors_preflight.headers["Access-Control-Allow-Origin"] == "http://127.0.0.1:5175"

    extracted_text = (
        "Jordan Example\nSoftware Engineer\nPython, SQL, React, AWS\n"
        "Bachelor of Science in Computer Science\n"
        "Email: jordan@example.test\n5 years of experience building APIs."
    )

    def extract_pdf(file_bytes):
        assert isinstance(file_bytes, bytes)
        if b"%PDF-" not in file_bytes[:1024]:
            raise ValueError("Corrupted or invalid PDF file.")
        return extracted_text

    monkeypatch.setattr("app.routes.resumes.extract_text_from_pdf", extract_pdf)

    registered = def_client.post(
        "/api/auth/register",
        json={
            "name": "Jordan Example",
            "email": "jordan@example.test",
            "password": "strong-password",
            "confirm_password": "strong-password",
        },
    )
    assert registered.status_code == 201
    assert registered.json["success"] is True
    assert registered.json["message"]
    assert isinstance(registered.json["data"]["user"], dict)
    assert registered.json["data"]["user"]["email"] == "jordan@example.test"

    duplicate = def_client.post(
        "/api/auth/register",
        json={
            "name": "Jordan Example",
            "email": "jordan@example.test",
            "password": "strong-password",
            "confirm_password": "strong-password",
        },
    )
    assert duplicate.status_code == 409

    mismatch = def_client.post(
        "/api/auth/register",
        json={
            "name": "Wrong Confirmation",
            "email": "wrong@example.test",
            "password": "strong-password",
            "confirm_password": "different-password",
        },
    )
    assert mismatch.status_code == 400

    login = def_client.post(
        "/api/auth/login",
        json={"email": "jordan@example.test", "password": "strong-password"},
    )
    assert login.status_code == 200
    token = login.json["data"]["token"]
    assert token
    assert login.json["data"]["user"]["id"] == registered.json["data"]["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    assert def_client.get("/api/auth/me").status_code == 401
    assert def_client.get("/api/auth/me", headers={"Authorization": "Bearer invalid"}).status_code == 422
    assert def_client.post("/api/auth/login", json={"email": "jordan@example.test", "password": "wrong"}).status_code == 401

    profile = def_client.get("/api/auth/me", headers=headers)
    assert profile.status_code == 200
    assert profile.json["data"]["user"]["email"] == "jordan@example.test"

    upload = def_client.post(
        "/api/resumes",
        data={"file": (BytesIO(b"Generated preamble\n%PDF-test"), "jordan-resume.pdf")},
        content_type="multipart/form-data",
        headers=headers,
    )
    assert upload.status_code == 201
    resume = upload.json["data"]["resume"]
    assert resume["text_length"] == len(extracted_text)
    assert len(list(Path(def_client.application.config["UPLOAD_FOLDER"]).glob("*.pdf"))) == 1

    second_upload = def_client.post(
        "/api/resumes",
        data={"file": (BytesIO(b"%PDF-test-2"), "jordan-resume.pdf")},
        content_type="multipart/form-data",
        headers=headers,
    )
    assert second_upload.status_code == 201
    stored_files = list(Path(def_client.application.config["UPLOAD_FOLDER"]).glob("*.pdf"))
    assert len(stored_files) == 2
    assert len({path.name for path in stored_files}) == 2
    assert second_upload.json["data"]["resume"]["file_name"] == resume["file_name"]

    invalid_upload = def_client.post(
        "/api/resumes",
        data={"file": (BytesIO(b"not a pdf"), "invalid.pdf")},
        content_type="multipart/form-data",
        headers=headers,
    )
    assert invalid_upload.status_code == 400

    empty_upload = def_client.post(
        "/api/resumes",
        data={"file": (BytesIO(b""), "empty.pdf")},
        content_type="multipart/form-data",
        headers=headers,
    )
    assert empty_upload.status_code == 400

    oversized_upload = def_client.post(
        "/api/resumes",
        data={"file": (BytesIO(b"%PDF-" + b"x" * (5 * 1024 * 1024)), "oversized.pdf")},
        content_type="multipart/form-data",
        headers=headers,
    )
    assert oversized_upload.status_code == 413

    analysis_response = def_client.post(
        "/api/analyses",
        json={
            "resume_id": resume["id"],
            "company_name": "Northstar Systems",
            "job_role": "Software Engineer",
            "job_location": "Remote",
            "job_description": (
                "We need a software engineer with Python, SQL, React, AWS, "
                "five years of experience, and a computer science degree."
            ),
        },
        headers=headers,
    )
    assert analysis_response.status_code == 201
    analysis_id = analysis_response.json["data"]["analysis"]["id"]

    detail = def_client.get(f"/api/analyses/{analysis_id}", headers=headers)
    assert detail.status_code == 200
    result = detail.json["data"]["analysis"]
    assert isinstance(result["ats_score"], int)
    assert "Python" in result["matched_skills"]
    assert isinstance(result["education_analysis"]["resume_degrees"], list)
    assert isinstance(result["completeness_analysis"]["details"], list)
    assert isinstance(result["matched_keywords"], list)
    assert isinstance(result["missing_keywords"], list)
    assert all(not keyword.endswith(".") for keyword in result["matched_keywords"] + result["missing_keywords"])
    assert result["job_description"].startswith("We need")

    history = def_client.get("/api/analyses", headers=headers)
    assert history.status_code == 200
    assert history.json["data"]["analyses"][0]["id"] == analysis_id

    reload_detail = def_client.get(f"/api/analyses/{analysis_id}", headers=headers)
    assert reload_detail.json["data"]["analysis"]["ats_score"] == result["ats_score"]

    short_jd = def_client.post(
        "/api/analyses",
        json={"resume_id": resume["id"], "company_name": "X", "job_role": "Y", "job_description": "too short"},
        headers=headers,
    )
    assert short_jd.status_code == 400

    other_user = def_client.post(
        "/api/auth/register",
        json={"name": "Other User", "email": "other@example.test", "password": "other-password", "confirm_password": "other-password"},
    )
    assert other_user.status_code == 201
    other_login = def_client.post(
        "/api/auth/login",
        json={"email": "other@example.test", "password": "other-password"},
    )
    other_headers = {"Authorization": f"Bearer {other_login.json['data']['token']}"}
    assert def_client.get(f"/api/analyses/{analysis_id}", headers=other_headers).status_code == 404

    deleted = def_client.delete(f"/api/analyses/{analysis_id}", headers=headers)
    assert deleted.status_code == 200
    assert def_client.get(f"/api/analyses/{analysis_id}", headers=headers).status_code == 404


def test_production_cors_allows_only_configured_frontend(tmp_path):
    class IsolatedProductionConfig(TestConfig):
        IS_PRODUCTION = True
        FRONTEND_URL = "https://career-match.example"
        UPLOAD_FOLDER = str(tmp_path)

    app = create_app(IsolatedProductionConfig)
    client = app.test_client()

    allowed = client.options(
        "/api/health",
        headers={
            "Origin": "https://career-match.example",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert allowed.headers["Access-Control-Allow-Origin"] == "https://career-match.example"

    denied = client.options(
        "/api/health",
        headers={
            "Origin": "https://untrusted.example",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert "Access-Control-Allow-Origin" not in denied.headers
