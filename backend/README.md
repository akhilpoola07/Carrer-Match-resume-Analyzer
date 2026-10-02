# CareerMatch AI Backend

Flask API for authentication, PDF resume uploads, and resume-to-job analysis. For the full application setup, see the [project README](../README.md).

## Run Locally

From this directory, create and activate a virtual environment, install the Python dependencies, copy the local settings, then start the API:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

On Windows PowerShell, use these environment setup commands instead:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python run.py
```

The example settings use local SQLite, start Flask on port `5001`, and allow the Vite app at `http://localhost:5173`. The database tables are created automatically. Confirm the API is ready at `http://localhost:5001/api/health`; the response should be `{"status":"ok"}`.

### Settings

The copied `.env` contains working local defaults:

- `APP_ENV=development`
- `PORT=5001`
- `DATABASE_URL=sqlite:///careermatch_ai.db`
- `FRONTEND_URL=http://localhost:5173`
- `UPLOAD_FOLDER=uploads`
- `GEMINI_API_KEY` is optional

The frontend's root `.env.local` must point to the same API port:

```dotenv
VITE_API_URL=http://localhost:5001
```

Never commit `.env` or real secrets. For production deployment, configure a secure `JWT_SECRET`, PostgreSQL or another persistent database, HTTPS `FRONTEND_URL`, and a persistent absolute `UPLOAD_FOLDER` path.

## Tests

With the virtual environment active, run from this directory:

```bash
python -m pytest -q
```
