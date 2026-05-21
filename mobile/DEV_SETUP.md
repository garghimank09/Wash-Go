# WashGo mobile — local dev

## iOS Simulator (recommended, SDK 55)

Backend on your Mac:

```bash
cd backend && python run.py
```

Simulator uses `http://127.0.0.1:8000` by default — no `.env` required.

```bash
cd mobile
npm install
npm run ios
```

Or: `npx expo start --ios` then press `i` if Metro is already running.

## Physical iPhone

- App Store **Expo Go 54.x** does **not** run this project (SDK **55**).
- Use **iOS Simulator** (`npm run ios`) or a **dev build** (`npx expo run:ios --device`), or wait for Expo Go 55.

### "Could not connect to development server" (red screen)

The phone cannot reach Metro at `http://YOUR_MAC_IP:8081`. Fix:

1. **Only one Metro** — do not run `npx expo start` in multiple terminals. If port 8081 is busy:
   ```bash
   npm run kill-metro
   npm run start:device:clear
   ```
2. **Same Wi‑Fi** — Mac and iPhone on the same network (no guest/VPN).
3. **iOS Local Network** — Settings → Expo Go → enable **Local Network**.
4. **Start with the device script** (sets LAN IP + `--lan`):
   ```bash
   cd mobile
   npm run start:device:clear
   ```
   Then scan the QR code in **Expo Go** (not an old dev-build icon unless you ran `expo run:ios`).
5. **If LAN still fails**, use tunnel (slower but works through firewalls):
   ```bash
   npm run start:tunnel
   ```
6. **Mac firewall** — allow incoming connections for Node / Metro.

Create `.env` for API (optional):

```env
EXPO_PUBLIC_API_URL=http://YOUR_MAC_LAN_IP:8000
```

## `withPlugins is not a function` / Invalid package config / Plugin must export a function

Almost always **corrupt `node_modules` on iCloud Desktop**. iCloud creates duplicate folders like `expo-modules-core 2`, which breaks Expo config plugins.

**Fix (from `mobile/`):**

```bash
npm run reinstall
npx expo start -c
```

`reinstall` removes iCloud `"name 2"` duplicates, deletes `node_modules`, and runs a fresh `npm install`. `verify-deps.js` runs on install and fails early if files are still broken.

**Permanent fix:** move the repo to `~/Developer/Wash-Go` (not iCloud Desktop), or turn off Desktop & Documents iCloud sync for this project.

## ETIMEDOUT / expo-router plugin error

Same root cause — incomplete files on iCloud. Use `npm run reinstall` above.
