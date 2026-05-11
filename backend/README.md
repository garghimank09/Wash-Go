# WashGo — Backend (Day 1)

FastAPI + PostgreSQL (`washgo`) foundation with JWT auth, SQLAlchemy 2 async ORM, bcrypt passwords, and an Ollama-ready client stub.

## Prerequisites

- Python 3.11+
- PostgreSQL with database **`washgo`** (already created in pgAdmin)
- Recommended: [Ollama](https://ollama.com/) on `http://localhost:11434` for future AI features

## Configuration

1. Copy `.env.example` to `.env` if you do not already have `.env`.
2. Set **`DATABASE_URL`** to your user/password/host/port and database `washgo`.
   - Async SQLAlchemy uses the **`asyncpg`** driver. Example:
     `postgresql+asyncpg://postgres:yourpassword@localhost:5432/washgo`
3. Set **`SECRET_KEY`** to a random string of at least 32 characters.

## Virtual environment and install (Windows PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r app\requirements.txt
```

## Run the API

From the `backend` directory (so `app` is importable as a package):

```powershell
python run.py
```

Or:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Interactive docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

In **`ENVIRONMENT=development`**, tables are auto-created on startup (`create_all`). For production, switch to migrations (e.g. Alembic) and set `ENVIRONMENT=production`.

## Roles

- **customer** — default on signup; can manage own cars and create bookings.
- **washer** — sees bookings assigned to their washer profile (profile creation can be added on Day 2).
- **admin** — bypasses role checks where implemented; sees all bookings.

Promote users to `washer` or `admin` via SQL/pgAdmin for now, or add an admin API later.

## Ollama

`app/ai_models/ollama_service.py` wraps `POST {OLLAMA_BASE_URL}/api/generate` for future chatbot, booking insights, review analysis, and recommendations.

## Mobile (Expo) companion

The `../mobile` Expo app calls **`/cars`**, **`/pricing/calculate`**, **`/bookings`**, **`/bookings/{id}`**, and auth routes. Cars are also available under **`/users/me/cars`**.

## Project layout

See the repository `backend/app/` tree: `config`, `database`, `models`, `schemas`, `routes`, `auth`, `services`, `middleware`, `ai_models`, `utils`.
