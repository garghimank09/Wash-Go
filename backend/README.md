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
4. Optional: **`ACCESS_TOKEN_EXPIRE_MINUTES`** (default `10080` = 7 days). Login sets a JWT plus HttpOnly cookies; sessions persist until logout or expiry. Use **`CORS_ORIGINS`** as a comma list (not `*`) when using cookies in production.
5. Optional: **`AUTH_COOKIE_SECURE`** / **`AUTH_COOKIE_SAMESITE`** — cookie flags for HTTPS deployments (`samesite=none` requires `secure=true`).
6. For partner signup place suggestions, set **`GOOGLE_MAPS_API_KEY`** and enable **Places API (New)** (not the legacy Places API) in Google Cloud Console.
7. For **SMS OTP** (all roles except demo accounts) via Twilio:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM_NUMBER` (E.164, e.g. `+15005550006`)
   - If Twilio is unset, codes are **printed in the API server log** (development only).
   - **Sign-in uses mobile number only** (10-digit India). Signup still collects email + phone; OTP is sent to phone.

## Virtual environment and install (Windows PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r app\requirements.txt
```

## Demo accounts (development)

On startup in **`ENVIRONMENT=development`**, these users are created or refreshed in the database:

| Role | Mobile | Password | Sign in at |
|------|--------|----------|------------|
| Admin | `9876543210` | `Demo1234` | `/admin/login` |
| Customer | `9876543211` | `Demo1234` | `/login` |
| Partner (washer) | `9876543212` | `Demo1234` | `/partner/login` |

Restart the API after pulling changes so `seed_demo_users` runs.

Demo accounts (`*@washgo.demo`) **skip OTP** — use them for quick testing without email.

## Email OTP (signup & login)

| Step | Endpoint | Notes |
|------|----------|--------|
| Send code | `POST /auth/otp/send` | Body: `{ "phone", "purpose", "role_hint" }` — signup also requires `"email"` |
| Login | `POST /auth/login` | Body: `{ "phone", "password", "otp_code" }` |
| Reset password | `POST /auth/password/reset` | Body: `{ "email", "otp_code", "new_password" }` |

## Membership plans (landing preview)

Admin: **Membership plans** at `/admin/membership-plans` — edit monthly price (₹), checklist features, and **Popular** highlight.

Public: `GET /membership-plans` — active plans for the landing **Membership preview** section.

Default seeds (if table empty): Spark ₹499/mo, Gleam ₹999/mo (Popular), Apex Fleet ₹2,499/mo.
| Customer signup | `POST /auth/signup` | Include `otp_code` (6 digits) — returns JWT |
| Partner signup | `POST /auth/partner/signup` | Include `otp_code` — returns JWT |
| Login | `POST /auth/login` | Include `otp_code` after password step (skipped for demo emails) |

Codes expire in **10 minutes** (see `OTP_EXPIRE_MINUTES` in settings). Resend cooldown: **60 seconds**.

## Run the API

From the `backend` directory (so `app` is importable as a package):

```powershell
.\.venv\Scripts\Activate.ps1
python run.py
```

Or (always uses `.venv`, even if the shell is not activated):

```powershell
.\start.ps1
```

Or explicitly:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Do **not** run bare `uvicorn` from a global Python install — it will miss packages such as `asyncpg`.

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
| `AI_PROVIDER` | `openai` (default) or `ollama` — auto-uses OpenAI when `OPENAI_API_KEY` is set |
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
