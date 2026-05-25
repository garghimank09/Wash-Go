# WashGo Web (Vite + React + Tailwind)

Modern SPA for the WashGo FastAPI backend: JWT auth, dashboard, cars, bookings, pricing, and an “AI lab” placeholder for Ollama / YOLO / realtime features.

## Connect backend + database + frontend

1. **PostgreSQL** — service running; database **`washgo`** exists; `backend/.env` has a valid **`DATABASE_URL`** (see [Verify PostgreSQL](#verify-postgresql)).
2. **Backend** — from `backend/`: `python run.py` (API on **port 8000**).
3. **Frontend** — ensure **`frontend/.env`** exists with **`VITE_API_URL=http://127.0.0.1:8000`** (copy from `frontend/.env.example` if needed). Restart **`npm run dev`** after changing `.env`.
4. Open **http://localhost:5173** (or the URL Vite prints), sign up / log in, and use the dashboard — requests go to FastAPI, which uses PostgreSQL.

## Setup

```bash
cd frontend
npm install
```

**Environment:** `frontend/.env` should define:

```env
VITE_API_URL=http://127.0.0.1:8000
# Optional — Google Maps (booking address search, map, 2D/3D/satellite views)
VITE_GOOGLE_MAPS_API_KEY=your_browser_key
# VITE_GOOGLE_MAP_ID=your_vector_map_id
```

Enable **Maps JavaScript API**, **Places API**, and **Geocoding API** in Google Cloud. Use a **browser-restricted** key for `VITE_*` and a **server-restricted** key as `GOOGLE_MAPS_API_KEY` in `backend/.env`.

Restart the dev server whenever you change `.env` (Vite reads it at startup).

## Scripts

```bash
npm run dev    # Vite dev server
npm run build  # production bundle
npm run preview
```

## Structure

| Path | Purpose |
|------|---------|
| `src/pages` | Route-level screens |
| `src/components` | Navbar, Sidebar, forms, cards, guards |
| `src/layouts` | Marketing shell, auth shell, dashboard shell |
| `src/routes` | `AppRoutes` + `BrowserRouter` |
| `src/services` | Axios client + domain APIs |
| `src/context` | Auth + theme (light / dark / system) |
| `src/hooks` | e.g. `useBookings` |
| `src/constants` | API URL, package definitions |
| `src/utils` | Formatting & validation helpers |

## API mapping

| UI | Backend |
|----|---------|
| Login / signup | `POST /auth/login`, `POST /auth/signup`, `GET /auth/me` |
| Cars | `GET/POST/DELETE /cars` |
| Pricing | `POST /pricing/calculate` |
| Bookings | `GET/POST /bookings`, `GET /bookings/:id` |

JWT is stored in `localStorage` (`washgo_access_token`). Axios attaches `Authorization: Bearer …` on every request.
