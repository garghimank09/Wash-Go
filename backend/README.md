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

## AI assistant (chatbot)

Authenticated users can call **`POST /assistant/chat`** with a JSON body:

```json
{ "messages": [{ "role": "user", "content": "How do bookings work?" }] }
```

The API proxies to either **Ollama** (default) or **OpenAI**, configured in `.env`:

| Variable | Purpose |
|----------|---------|
| `AI_PROVIDER` | `ollama` (default) or `openai` |
| `OLLAMA_BASE_URL` | e.g. `http://localhost:11434` |
| `OLLAMA_MODEL` | e.g. `llama3.2` (run `ollama pull <name>` first) |
| `OPENAI_API_KEY` | Required when `AI_PROVIDER=openai` |
| `OPENAI_MODEL` | e.g. `gpt-4o-mini` |

The frontend **floating concierge** (dashboard) uses this route (JWT required).

## Ollama (legacy single-shot)

`app/ai_models/ollama_service.py` still wraps `POST /api/generate` for one-shot prompts if you need it elsewhere.

## Verify PostgreSQL

From `backend/` (with venv activated):

```powershell
python scripts\check_db.py
```

You should see `DB_OK 1`. If not, fix **`DATABASE_URL`** in `.env` (Postgres running, database `washgo` exists, user/password correct).

## Web frontend companion

The **`../frontend`** Vite app calls **`/cars`**, **`/pricing/calculate`**, **`/bookings`**, **`/bookings/{id}`**, **`/assistant/chat`**, and auth routes. Cars are also available under **`/users/me/cars`**.

Use **`CORS_ORIGINS=*`** (default in `.env.example`) for local dev, or list explicit origins such as `http://localhost:5173,http://127.0.0.1:5173`.

## Project layout

See the repository `backend/app/` tree: `config`, `database`, `models`, `schemas`, `routes`, `auth`, `services`, `middleware`, `ai_models`, `utils`.
