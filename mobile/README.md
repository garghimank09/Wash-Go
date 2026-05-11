# WashGo — Expo (React Native) MVP

React Native + Expo client for the WashGo FastAPI backend: JWT auth, cars, bookings, pricing estimate, and navigation ready for AI, live tracking, and payments.

## Prerequisites

- Node 18+
- Backend running (see `../backend/README.md`)
- For a **physical phone**, set `EXPO_PUBLIC_API_URL` (or `app.json` → `expo.extra.apiUrl`) to your computer’s LAN IP (same Wi‑Fi).

## Configure API URL

1. **Recommended:** create `mobile/.env`:

   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.10:8000
   ```

2. Or edit `app.json` → `expo.extra.apiUrl`.

Defaults:

| Target            | Typical base URL        |
|-------------------|-------------------------|
| iOS Simulator     | `http://127.0.0.1:8000` |
| Android Emulator  | `http://10.0.2.2:8000`  |
| Expo Go on device | `http://<PC-LAN-IP>:8000` |

Ensure the FastAPI app allows CORS for your origin (`CORS_ORIGINS` in backend `.env`).

## Scripts

```bash
cd mobile
npm install
npm start
```

Then press `a` (Android), `i` (iOS simulator), or scan the QR code with Expo Go.

## Structure

- `src/screens` — Splash, auth, home, cars, bookings, booking flow, AI placeholder
- `src/components` — Button, Input, Card, Chip, Loader, GradientCard
- `src/navigation` — Auth stack, main stack + tabs
- `src/services` — Axios client (`api.ts`), auth/cars/bookings/pricing APIs, token storage
- `src/context` — `AuthProvider` / JWT bootstrap
- `src/theme`, `src/utils`, `src/types`

## Backend routes used

| Feature        | Method & path |
|----------------|---------------|
| Sign up / in   | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me` |
| Cars           | `POST /cars`, `GET /cars`, `DELETE /cars/{id}` |
| Pricing        | `POST /pricing/calculate` |
| Bookings       | `POST /bookings`, `GET /bookings`, `GET /bookings/{id}` |

Aliases `/cars` and `/pricing/calculate` are implemented in the backend for this app; cars are also available under `/users/me/cars`.
