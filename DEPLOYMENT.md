# WashGo deployment (Vercel + Render)

This project can be deployed as:
- `frontend` (Vite React SPA) -> **Vercel**
- `backend` (FastAPI) -> **Render Web Service**

---

## 1) Deploy backend to Render

Render can auto-detect `render.yaml` from repo root.

### Create service
1. Push this repo to GitHub.
2. In Render: **New +** -> **Blueprint** -> connect repository.
3. Select the generated `washgo-api` service.
4. Set required secret env vars in Render dashboard:
   - `DATABASE_URL` = Render Postgres external URL (or your managed Postgres URL)
   - `SECRET_KEY` = random 32+ char string
   - `FRONTEND_BASE_URL` = your Vercel site URL (for example `https://washgo.vercel.app`)
   - `CORS_ORIGINS` = same Vercel URL(s), comma-separated if multiple
   - `OPENAI_API_KEY` = your OpenAI key

### Recommended backend env values
- `ENVIRONMENT=production`
- `AUTH_COOKIE_SECURE=true`
- `AUTH_COOKIE_SAMESITE=none`
- `OPENAI_MODEL=gpt-4o-mini`

### Start/build commands (already in `render.yaml`)
- Build: `pip install -r app/requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

After deploy, verify:
- `https://<render-service>.onrender.com/health` returns `{"status":"ok","service":"washgo-api"}`

---

## 2) Deploy frontend to Vercel

### Create project
1. In Vercel: **Add New Project** -> import this repo.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite**.
4. Build command: `npm run build` (default).
5. Output directory: `dist` (default for Vite).

### Frontend env vars (Vercel)
- `VITE_API_URL=https://<your-render-service>.onrender.com`
- `VITE_GOOGLE_MAPS_API_KEY=<browser-restricted-google-maps-key>` (if maps are used)

`frontend/vercel.json` is added for SPA routing rewrite to `index.html`.

---

## 3) Cross-origin checklist (important)

Because frontend and backend are on different domains:
- Backend `CORS_ORIGINS` must include the exact Vercel domain(s).
- `FRONTEND_BASE_URL` should match your primary Vercel domain.
- Keep `AUTH_COOKIE_SECURE=true` in production.

If you use preview domains, include both production + preview origins in `CORS_ORIGINS`.

---

## 4) Final smoke test

1. Open deployed frontend URL.
2. Try login/signup.
3. Create booking and open assistant chat.
4. Confirm browser network calls hit Render backend URL.
5. Check Render logs for 4xx/5xx and fix any missing env vars.
