# WashGo Mobile — Android Splash Freeze DEBUG REPORT

**Symptom:** APK installs and opens; custom splash appears but app **never leaves splash** (Samsung + other real Android devices).  
**Stack:** React Native 0.83 · Expo SDK 55 · Expo Router · Reanimated · Render backend (`EXPO_PUBLIC_API_URL`).  
**Report date:** May 2026  
**Scope:** Full startup lifecycle (not splash files only).

---

## Executive summary

The app is **not stuck inside native Expo splash** alone. It is stuck on the **custom route** `app/index.jsx`, which renders `WaterRingRevealSplash` and only navigates away when **three gates** all pass:

1. Customer auth bootstrap finished (`AuthContext.initializing === false`)
2. Partner auth bootstrap finished (`PartnerAuthContext.initializing === false`)
3. Custom splash marked complete (`splashDone.current === true`)

The highest-probability failure modes for your symptom:

| Priority | Issue | Why it freezes |
|----------|--------|----------------|
| **P0** | `router.replace()` runs before Expo Router / Activity is ready | Android log: *"Tried to access onNewIntent while context is not ready"* — navigation no-ops or fails; UI stays on `index` |
| **P0** | `useSplashProgress` regression (`progress` stuck at `1`, 1s timeout only) | Splash looks “done” but animation/timeline broken; `onComplete` churn can delay or confuse timing |
| **P1** | `didNavigate.current = true` before navigation succeeds | If `replace` fails once, **permanent** lock on splash route |
| **P2** | Auth bootstrap slow/hung (2× `/auth/me` on cold start) | `navigate()` returns early until init done; user waits on splash (up to 15s timeout each) |
| **P3** | `preventAutoHideAsync` in splash component module scope | Native splash hidden immediately; white/static custom frame looks “frozen” |

Maps (`react-native-maps`), image picker, and permissions are **not** mounted on the initial route — they are **unlikely** root causes of *splash-only* freeze.

---

## Startup sequence diagram

```mermaid
sequenceDiagram
  participant Native as Android Activity
  participant ExpoSplash as expo-splash-screen
  participant Root as app/_layout.jsx
  participant Auth as AuthProvider
  participant Partner as PartnerAuthProvider
  participant Index as app/index.jsx
  participant Splash as WaterRingRevealSplashLite
  participant API as Render API

  Native->>ExpoSplash: App launch
  Note over Splash: preventAutoHideAsync() module load
  Root->>Auth: mount bootstrap()
  Root->>Partner: mount bootstrap()
  Auth->>API: GET /auth/me (if token)
  Partner->>API: GET /auth/me (if token)
  Index->>Splash: render
  Splash->>ExpoSplash: hideAsync() on mount
  Splash->>Splash: AccessibilityInfo reduce motion
  Splash->>Splash: useSplashProgress 1s timeout
  Splash->>Index: onComplete()
  Index->>Index: navigate() gates
  alt init still true
    Index-->>Index: return early stay on splash
  else init false and splashDone
    Index->>Index: didNavigate=true
    Index->>Index: router.replace(target)
    alt navigator not ready
      Index-->>User: STUCK on splash UI
    else OK
      Index->>User: welcome / dashboard / home
  end
```

---

## Initial route map

| Route file | Role at startup |
|------------|-----------------|
| `app/_layout.jsx` | Root providers + `Stack` (no splash API here) |
| **`app/index.jsx`** | **Entry route** — splash + role routing |
| `app/(auth)/welcome.jsx` | Unauthenticated destination |
| `app/(customer)/dashboard.jsx` | Customer destination |
| `app/(partner)/home.jsx` | Partner destination |

Expo Router default entry: **`/` → `app/index.jsx`**.

---

## Provider tree at startup (mount order)

```
ThemeProvider
  AuthProvider          → bootstrap() → GET /auth/me
  PartnerAuthProvider   → bootstrap() → GET /auth/me
  NotificationProvider  → AsyncStorage hydrate (non-blocking)
  PartnerStatusProvider → AsyncStorage hydrate
  PartnerNotificationProvider
  AddVehicleProvider
  NewBookingProvider    → AsyncStorage draft hydrate
  ThemeScopeSync        → reads segments + auth users
  RootLayoutNav (Stack)
    → index (splash)
```

Nothing in `_layout.jsx` blocks rendering children on `isScopeReady`, but **index never unmounts** until navigation succeeds.

---

## Gate logic (exact conditions)

**File:** `app/index.jsx`

```javascript
// Navigation runs only when ALL are true:
!didNavigate.current
!customerInit && !partnerInit
splashDone.current === true
```

**Splash completion** (`handleSplashComplete`):

- `useSplashProgress` → `setTimeout(..., 1000)` → `onComplete()`
- OR reduce-motion path → `onComplete()` via `requestAnimationFrame`

**Auth init** (`context/AuthContext.jsx`, `context/PartnerAuthContext.jsx`):

- `initializing` starts `true`
- `setInitializing(false)` only at end of `bootstrap()`
- Bootstrap always completes (try/catch) unless `bootstrap()` never resolves (network hang up to `API_TIMEOUT_MS` = **15s** per call)

---

## Problematic files (ranked)

### 1. `app/index.jsx` — navigation orchestration

**Issues:**

- No check for `useRootNavigationState()?.key` before `router.replace`
- `didNavigate.current = true` **before** `router.replace` executes (line ~33–49)
- Uses `requestAnimationFrame` only — insufficient on some Android cold starts
- `navigate` in `useEffect` depends on unstable callback; generally OK but couples splash + auth timing

### 2. `hooks/useSplashProgress.js` — broken animation contract

**Current code:**

```javascript
const progress = useSharedValue(1);  // stuck at end state

useEffect(() => {
  if (!enabled) return;
  const timer = setTimeout(() => onComplete?.(), 1000);
  return () => clearTimeout(timer);
}, [enabled, onComplete]);
```

**Expected (from `splashTimeline.js`):** progress animates `0 → 1` over **`SPLASH_DURATION_MS` (4500ms)**, then `onComplete`.

**Impact:**

- `WaterRingLite`, `CarReveal`, `SplashBackground` read `progress.value` as **already complete** — static “frozen” splash frame
- `onComplete` in effect deps → **resets 1s timer** whenever `handleSplashComplete` / `navigate` identity changes (auth finishing causes extra delay)

### 3. `components/splash/WaterRingRevealSplashLite.jsx`

**Issues:**

- Module-level `SplashScreen.preventAutoHideAsync()` (runs on import)
- `SplashScreen.hideAsync()` on first mount — can flash white before custom UI paints
- Reduce-motion branch renders empty white `View` then calls `onComplete` — OK
- Reanimated UI still mounted when `progress` is wrong

### 4. `components/splash/WaterRingRevealSplash.jsx`

Thin wrapper → always uses **Lite** path (no full Blur/Moti splash on device).

### 5. Auth bootstrap — startup API calls

| Call | Trigger | Endpoint | Timeout |
|------|---------|----------|---------|
| Customer bootstrap | `AuthProvider` mount | `GET /auth/me` | 15s |
| Partner bootstrap | `PartnerAuthProvider` mount | `GET /auth/me` | 15s |

**Parallel on every cold start** (if both tokens exist). Render cold start + SSL + Samsung network can add **multi-second** delay before `initializing` flips false — user stays on splash until then **even if** splash animation finished.

**Note:** Failed bootstrap still sets `initializing: false` (catch clears session). Hang only if fetch never returns.

### 6. `lib/apiConfig.js`

```javascript
export const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim() || defaultHostUrl();
// Android default without env: http://10.0.2.2:8001 (emulator only)
```

You configured `EXPO_PUBLIC_API_URL=https://wash-go-hzic.onrender.com` — correct for real devices. **Rebuild APK** after env changes (not just Metro).

### 7. Not startup blockers (verified)

| Area | Finding |
|------|---------|
| `react-native-maps` | Only in `app/booking/[id].jsx`, partner job/schedule — **not** on index |
| `expo-image-picker` | Not imported in `app/` or startup providers |
| `AuthGate` / `PartnerAuthGate` | Only wrap `(customer)` / `(partner)` — **not** index |
| `usePartnerBookingSync` | Partner layout only, after navigation |
| `NotificationProvider` | Loads bookings when `isAuthenticated` — after leaving index |

---

## Suspected freeze points (checklist)

- [ ] **F1** — `router.replace` before navigation container ready (Android / Samsung)
- [ ] **F2** — `didNavigate` set true but replace failed → never retry
- [ ] **F3** — Auth `initializing` true for 15s+ (Render timeout / no network)
- [ ] **F4** — `onComplete` timer keeps resetting (dependency churn on `navigate`)
- [ ] **F5** — User perceives static splash because `progress === 1` (no animation)
- [ ] **F6** — Native splash hidden early; blank white screen mistaken for freeze
- [ ] **F7** — Reanimated worklets error on device (check logcat for Reanimated / UI thread)

---

## Android-specific issues

1. **Activity / Expo Router readiness** — Cold start + `singleTask` activity → `onNewIntent` before React context ready.
2. **Samsung One UI** — Aggressive battery optimization can delay first network (auth bootstrap); kill “sleeping” apps for testing.
3. **SecureStore** — First read can be slow; should not block > few seconds.
4. **Dev build vs release** — Test freeze on **release** APK too (`assembleRelease`); JS errors differ.
5. **`elevation` / shadow on splash** — `CarReveal` uses `elevation: 8`; unrelated to navigation but can cause jank on low-end GPUs.

---

## Samsung-specific risks

- Disable battery optimization for WashGo during QA.
- Test on **mobile data** and **Wi‑Fi** (Render latency).
- Clear app data if old tokens cause slow/failing `/auth/me`.
- USB debugging: `adb logcat *:S ReactNative:V ReactNativeJS:V Expo:V AndroidRuntime:E`

---

## Recommended fixes (priority order)

### P0 — Production-ready navigation

1. Wait for navigation ready:

```javascript
import { useRootNavigationState, useRouter } from 'expo-router';

const rootState = useRootNavigationState();
const navigationReady = Boolean(rootState?.key);
```

2. Only call `router.replace` when `navigationReady && !customerInit && !partnerInit && splashDone`.
3. Set `didNavigate.current = true` **only after** successful replace (or use a `navigationAttempted` ref + retry).
4. Prefer `InteractionManager.runAfterInteractions(() => router.replace(target))` on Android.

### P0 — Restore splash progress + completion

Restore `useSplashProgress` to animate `0 → 1` with `withTiming` + `runOnJS(onComplete)` at end (see `splashTimeline.js` / git history). Align timeout with `SPLASH_DURATION_MS` or shorten timeline for APK.

### P1 — Centralize splash screen API

Move `SplashScreen.preventAutoHideAsync()` to `app/_layout.jsx` once.  
Call `hideAsync()` only when custom splash is painted (or when leaving index).

### P1 — Decouple splash from auth

Option A: Navigate to welcome/dashboard when splash done **regardless** of auth; let `AuthGate` show loading on protected routes.  
Option B: Max wait — if auth > 3s, navigate to welcome with offline banner.

### P2 — Auth bootstrap

- Single shared “session bootstrap” instead of 2× `/auth/me` when only one role used.
- Lower cold-start timeout for `/auth/me` (e.g. 8s) with fallback `initializing: false`.
- Log duration of each bootstrap in dev builds.

### P3 — Defensive logging

Add `__DEV__` logs at each gate in `index.jsx` (see below).

---

## Safe temporary fixes (QA unblock)

1. **Bypass custom splash** (debug only):

```javascript
// app/index.jsx — temporary
export default function Index() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(auth)/welcome');
  }, []);
  return null;
}
```

If app works → problem is splash gating or `onComplete`, not global app.

2. **Force short-circuit auth** — clear app storage / uninstall reinstall (no stale SecureStore).

3. **Skip animation** — reduce motion path already calls `onComplete`; enable reduce motion in Android accessibility settings to test.

---

## Production-ready code targets

| File | Change |
|------|--------|
| `app/index.jsx` | Navigation ready guard, retry replace, `didNavigate` after success |
| `hooks/useSplashProgress.js` | Restore Reanimated timeline + stable `onComplete` ref |
| `app/_layout.jsx` | Optional: `SplashScreen.preventAutoHideAsync` + error boundary |
| `components/splash/WaterRingRevealSplashLite.jsx` | Remove module side-effect preventAutoHide; defer hideAsync |
| `context/AuthContext.jsx` | `finally { setInitializing(false) }` (already effectively true) |
| `babel.config.js` | Keep Reanimated plugin **last** (already correct) |

---

## Commands to debug further

```bash
# Device connected
adb devices

# React Native / Expo / crashes
adb logcat -c
adb logcat *:S ReactNative:V ReactNativeJS:V Expo:V AndroidRuntime:E

# Filter startup
adb logcat | grep -E "ReactNativeJS|ExpoRouter|SplashScreen|washgo|FATAL"

# Install APK
adb install -r mobile/android/app/build/outputs/apk/debug/app-debug.apk

# Metro for dev client (if using dev build)
cd mobile && npm start
```

**Build release-like APK:**

```bash
cd mobile/android
./gradlew assembleRelease
# APK: app/build/outputs/apk/release/app-release.apk
```

**Verify env baked into build:**

```bash
cd mobile
npx expo config --type public | grep -i api
```

---

## Recommended log points

Add to `app/index.jsx`:

```javascript
if (__DEV__) {
  console.log('[startup]', {
    customerInit,
    partnerInit,
    splashDone: splashDone.current,
    isCustomer,
    isPartner,
    navigationReady: Boolean(rootState?.key),
  });
}
```

Add to `AuthContext` / `PartnerAuthContext` bootstrap:

```javascript
console.log('[auth] bootstrap start');
// ...
console.log('[auth] bootstrap end', { ms: Date.now() - t0, hasUser: !!user });
```

Add to `useSplashProgress`:

```javascript
console.log('[splash] onComplete fired');
```

---

## Startup `useEffect` inventory

| Location | Effect | Blocks startup? |
|----------|--------|-----------------|
| `AuthContext` | `bootstrap()` | Sets `initializing` until done |
| `PartnerAuthContext` | `bootstrap()` | Sets `initializing` until done |
| `ThemeScopeSync` | `setThemeScope` on segment change | No |
| `NotificationProvider` | load dismissed IDs | No (index doesn’t use) |
| `PartnerStatusProvider` | AsyncStorage status | No |
| `NewBookingProvider` | draft hydrate | No |
| `app/index.jsx` | `navigate()` on deps | **Critical path** |
| `WaterRingRevealSplashLite` | hideAsync, reduce motion | **Critical path** |
| `useSplashProgress` | 1s timer | **Critical path** |

---

## Router redirects at startup (after leaving index)

| Destination | Condition |
|-------------|-----------|
| `/(auth)/welcome` | No customer/partner session |
| `/(customer)/dashboard` | Customer session |
| `/(partner)/home` | Partner session |
| Tie-break | `getLastActiveRole()` from AsyncStorage |

**Downstream guards (after replace):**

- `AuthGate` → unauthenticated customer routes → welcome
- `PartnerAuthGate` → unauthenticated partner routes → partner-login
- `welcome.jsx` → redirects if `isAuthenticated` customer

No redirect loop on index itself; risk is **failed first replace**.

---

## Splash dependencies

```
app/index.jsx
  └── WaterRingRevealSplash.jsx
        └── WaterRingRevealSplashLite.jsx
              ├── expo-splash-screen (preventAutoHide / hideAsync)
              ├── useSplashProgress.js
              ├── SplashBackground (reanimated + progress)
              ├── StaticDropletField
              ├── WaterRingLite (reanimated + progress)
              ├── CarReveal (reanimated + progress)
              └── WashGoLogo (reanimated + progress)
```

**Timeline source of truth:** `components/splash/splashTimeline.js` (`SPLASH_DURATION_MS = 4500`).

---

## API calls during startup (cold start)

| # | When | Request | Auth |
|---|------|---------|------|
| 1 | AuthProvider mount | `GET /auth/me` | Bearer customer token if any |
| 2 | PartnerAuthProvider mount | `GET /auth/me` | Bearer partner token if any |

No other HTTP calls until user reaches customer/partner shells (then sync/polling may start).

---

## FINAL ACTION PLAN

### Step 1 — Confirm diagnosis (15 min)

1. Install APK with USB debugging.
2. Run `adb logcat` while opening app.
3. Confirm `ReactNativeJS` logs: does `[splash] onComplete` appear?
4. Does `[startup]` show `customerInit/partnerInit` false?
5. Any `ExpoRouter` / navigation errors after that?

### Step 2 — Fix `app/index.jsx` (required)

**File:** `mobile/app/index.jsx`

```javascript
import { useRootNavigationState, useRouter } from 'expo-router';
import { InteractionManager, Platform } from 'react-native';

// inside component:
const rootNavigationState = useRootNavigationState();
const navigationReady = Boolean(rootNavigationState?.key);

const navigate = useCallback(async () => {
  if (didNavigate.current) return;
  if (!navigationReady) return;
  if (customerInit || partnerInit) return;
  if (!splashDone.current) return;

  const lastRole = await getLastActiveRole();
  const target = /* same target logic as today */;

  const go = () => {
    try {
      router.replace(target);
      didNavigate.current = true;
    } catch (e) {
      if (__DEV__) console.warn('[startup] replace failed', e);
      // allow retry
    }
  };

  if (Platform.OS === 'android') {
    InteractionManager.runAfterInteractions(go);
  } else {
    requestAnimationFrame(go);
  }
}, [navigationReady, customerInit, partnerInit, isCustomer, isPartner, router]);
```

Add `navigationReady` to the `useEffect` that calls `navigate()`.

### Step 3 — Fix `useSplashProgress.js` (required)

**File:** `mobile/hooks/useSplashProgress.js`

Restore animation-driven completion:

```javascript
import { useEffect } from 'react';
import { runOnJS, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { SPLASH_DURATION_MS } from '../components/splash/splashTimeline';

export function useSplashProgress(onComplete, enabled = true) {
  const progress = useSharedValue(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!enabled) return;
    progress.value = 0;
    progress.value = withTiming(
      1,
      { duration: SPLASH_DURATION_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(() => onCompleteRef.current?.())();
      },
    );
  }, [enabled, progress]);

  return progress;
}
```

Use `useRef` for `onComplete` so the timer/animation is **not** reset when `navigate` changes.

### Step 4 — Fix splash screen native bridge

**File:** `mobile/app/_layout.jsx` (add once at top level)

```javascript
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync().catch(() => {});
```

**File:** `WaterRingRevealSplashLite.jsx`

- Remove module-level `preventAutoHideAsync`.
- Call `hideAsync()` in `onLayout` of root view (first paint), not bare `useEffect([])`.

### Step 5 — Rebuild APK

```bash
cd mobile
# ensure .env has EXPO_PUBLIC_API_URL
npm run android
# or
cd android && ./gradlew assembleDebug
```

### Step 6 — Verify on Samsung

1. Cold start → splash animates → welcome or dashboard within ~5–8s.
2. Airplane mode test → should reach welcome within splash + auth timeout (not infinite).
3. Call button on job screen (separate feature; physical device only).

### Step 7 — Cleanup (follow-up)

- Consolidate dual `/auth/me` bootstraps.
- Add ErrorBoundary on root layout.
- Document startup contract in `mobile/docs/partner-job-flow.md` cross-link.

---

## Related docs

- [WASHGO_ANDROID_PROJECT.md](./WASHGO_ANDROID_PROJECT.md) — Android build & features
- [partner-job-flow.md](./partner-job-flow.md) — Partner job screen (post-startup)

---

## Summary for stakeholders

The app **does reach** the custom splash React screen; the freeze is almost certainly **failure to transition from `app/index.jsx`** to auth/home/dashboard, not a broken APK install or blank native launch. Fix navigation readiness on Android and restore splash `progress` completion; then rebuild the APK with the correct `EXPO_PUBLIC_API_URL`.
