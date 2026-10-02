<div align="center">

# ✨ CareerMatch AI

### 🎯 Match your resume to the role. Find your next opportunity.

A full-stack resume analysis app that compares a PDF resume with a job description and presents an ATS-style compatibility score, skill matches, keyword coverage, and improvement insights.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Flask](https://img.shields.io/badge/Flask-3-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)

</div>

---

## 🌈 What It Does

- 📄 Upload and parse PDF resumes (up to 5 MB).
- 🧮 Calculate a deterministic ATS-style match score from resume content and a job description.
- 🧩 Show matched and missing skills, keywords, score components, experience and education signals, and resume completeness.
- 💡 Optionally generate resume suggestions with Gemini when `GEMINI_API_KEY` is configured.
- 📚 Save resumes and analyses, browse analysis history, and reopen reports.
- 🔐 Protect user data and API operations with JWT authentication.

> Scores are estimates from this application's matching algorithm; they do not represent the scoring system of a specific employer or ATS.

## 🛠️ Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Recharts, Axios |
| Backend | Python, Flask, Flask-JWT-Extended, Flask-SQLAlchemy |
| Database | SQLite by default; PostgreSQL supported through `DATABASE_URL` |
| Resume parsing | `pypdf` |
| Optional AI suggestions | Google Gemini API |

## 🚀 Run Locally

### Prerequisites

- Node.js 18 or newer and npm
- Python 3.10 or newer
- PostgreSQL only if you prefer it over the default SQLite database

### 1. Start the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set the backend port to `5001` in `backend/.env` to match the frontend's default API URL. For local SQLite, use:

```dotenv
PORT=5001
DATABASE_URL=sqlite:///careermatch_ai.db
JWT_SECRET=replace-with-a-long-random-secret
GEMINI_API_KEY=
FRONTEND_URL=http://localhost:5173
APP_ENV=development
```

Then start Flask:

```bash
python run.py
```

The API will be available at `http://localhost:5001`. The application creates database tables on startup. To use PostgreSQL, replace `DATABASE_URL` with your PostgreSQL connection string.

### 2. Start the frontend

In a second terminal, from the project root:

```bash
npm ci
```

Create a root `.env.local` if the API is not running at the default URL:

```dotenv
VITE_API_URL=http://localhost:5001
```

Then run Vite:

```bash
npm run dev
```

Open the local URL printed by Vite (by default, `http://localhost:5173`).

## 🧭 Typical Workflow

1. Create an account and sign in.
2. Upload a text-based PDF resume.
3. Choose that resume, enter a company and role, and paste the job description.
4. Run the analysis to see the generated report.
5. Revisit reports from the dashboard or analysis history.

## 🔌 API Overview

All routes are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Purpose | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account | No |
| `POST` | `/api/auth/login` | Sign in and receive a JWT | No |
| `GET` | `/api/auth/me` | Get the signed-in user | Yes |
| `POST` | `/api/resumes` | Upload and parse a PDF | Yes |
| `GET` | `/api/resumes` | List the user's resumes | Yes |
| `GET` | `/api/resumes/<id>` | Get resume details and extracted text | Yes |
| `DELETE` | `/api/resumes/<id>` | Delete a resume | Yes |
| `POST` | `/api/analyses` | Analyze a resume against a job description | Yes |
| `GET` | `/api/analyses` | List the user's analyses | Yes |
| `GET` | `/api/analyses/<id>` | Get a detailed analysis report | Yes |
| `DELETE` | `/api/analyses/<id>` | Delete an analysis | Yes |

## 🧪 Checks

Run backend tests from `backend/` with the backend virtual environment active:

```bash
python -m pytest -q
```

Run frontend checks from the project root:

```bash
npm run build
npm run typecheck
npm run lint
```

## 🗂️ Project Layout

```text
backend/
  app/
    routes/       Authentication, resume, and analysis endpoints
    services/     PDF parsing, ATS scoring, and optional Gemini suggestions
    utils/        Skill, keyword, experience, education, and completeness analysis
  tests/          Backend regression tests
src/
  components/     Shared layout and UI components
  context/        Authentication, theme, and toast state
  pages/          Dashboard, resume, analysis, history, and account screens
  services/       Flask API client and Supabase client
supabase/
  migrations/     SQL schema migrations
```

## ⚙️ Configuration Notes

- The frontend reads `VITE_API_URL`; it defaults to `http://localhost:5001`.
- The backend reads `PORT`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `APP_ENV`, and optional `GEMINI_API_KEY` from its environment or `backend/.env`.
- Never commit real secrets. Use a strong `JWT_SECRET` outside local development.
- If using a different API port, set `VITE_API_URL` to the same host and port before starting Vite.

## 🚀 Production Deployment

Build the frontend with `VITE_API_URL` set to the HTTPS URL of the deployed Flask API. Production builds fail if this value is missing, uses HTTP, or points to localhost.

Run the backend with the WSGI server already included in `backend/requirements.txt`:

```bash
gunicorn --bind 0.0.0.0:$PORT run:app
```

Set `APP_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, and `UPLOAD_FOLDER` in the hosting platform. `FRONTEND_URL` must be the HTTPS frontend origin. `UPLOAD_FOLDER` must be an absolute path on persistent storage. Set `PORT` from the hosting platform; Gemini suggestions are optional and use `GEMINI_API_KEY` when available.

The checked-in environment is configured for local SQLite and local file uploads, and no hosting-platform configuration or production database/storage target is present. Do not deploy with the development database or an ephemeral upload directory. Configure the production database and persistent storage first; then the backend can be deployed before the frontend.

## 🤝 Contributing

Issues and pull requests are welcome. Please include a clear description of the change and relevant test results.
