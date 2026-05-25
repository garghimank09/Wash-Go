/** Target accuracy before we stop watching GPS (meters). */
export const GPS_TARGET_ACCURACY_M = 65;

/** Still acceptable to use without strong warning (meters). */
export const GPS_OK_ACCURACY_M = 200;

/** Reject only when nothing better arrives and reading is worse than this (meters). */
export const GPS_MAX_ACCEPT_ACCURACY_M = 12_000;

const DEFAULT_TIMEOUT_MS = 20_000;

/**
 * Collect the best available GPS fix using watchPosition (single getCurrentPosition
 * is often coarse on desktop/Wi‑Fi). Returns { lat, lng, accuracyMeters }.
 *
 * @param {{ timeoutMs?: number, targetAccuracyM?: number }} [options]
 */
export function getAccurateUserPosition(options = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const targetAccuracyM = options.targetAccuracyM ?? GPS_TARGET_ACCURACY_M;
  const maxAcceptAccuracyM = options.maxAcceptAccuracyM ?? GPS_MAX_ACCEPT_ACCURACY_M;

  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(Object.assign(new Error('Geolocation is not supported on this device.'), { code: 'UNSUPPORTED' }));
      return;
    }

    let best = null;
    let watchId = null;
    let settled = false;

    const geoOptions = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: Math.min(12_000, timeoutMs),
    };

    const pickBest = (pos) => {
      const accuracyMeters = Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : Infinity;
      const candidate = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracyMeters,
        timestamp: pos.timestamp,
      };
      if (!best || candidate.accuracyMeters < best.accuracyMeters) {
        best = candidate;
      }
      if (candidate.accuracyMeters <= targetAccuracyM) {
        finish(best);
      }
    };

    const finish = (result, err) => {
      if (settled) return;
      settled = true;
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      window.clearTimeout(timerId);
      if (result) {
        resolve(result);
        return;
      }
      reject(err ?? Object.assign(new Error('Could not determine your location.'), { code: 'FAILED' }));
    };

    const timerId = window.setTimeout(() => {
      if (best) {
        if (best.accuracyMeters <= maxAcceptAccuracyM) {
          finish(best);
        } else {
          reject(
            Object.assign(
              new Error(
                `Location is too imprecise (±${Math.round(best.accuracyMeters)} m). Drag the pin on the map to your exact spot.`,
              ),
              { code: 'LOW_ACCURACY', accuracyMeters: best.accuracyMeters, ...best },
            ),
          );
        }
        return;
      }
      reject(Object.assign(new Error('Location timed out. Try again or set the pin on the map.'), { code: 'TIMEOUT' }));
    }, timeoutMs);

    watchId = navigator.geolocation.watchPosition(
      (pos) => pickBest(pos),
      (err) => {
        if (best && best.accuracyMeters <= maxAcceptAccuracyM) {
          finish(best);
          return;
        }
        const code = err?.code === 1 ? 'DENIED' : err?.code === 3 ? 'TIMEOUT' : 'FAILED';
        reject(
          Object.assign(
            new Error(
              code === 'DENIED'
                ? 'Location permission denied — allow access in browser settings or set the pin on the map.'
                : 'Could not get your location — drag the pin or type your address.',
            ),
            { code, cause: err },
          ),
        );
      },
      geoOptions,
    );

    navigator.geolocation.getCurrentPosition(
      (pos) => pickBest(pos),
      () => {},
      geoOptions,
    );
  });
}

/** Map zoom level from reported GPS accuracy (meters). */
export function zoomForGpsAccuracy(accuracyMeters) {
  if (!Number.isFinite(accuracyMeters)) return 16;
  if (accuracyMeters <= 40) return 18;
  if (accuracyMeters <= 120) return 17;
  if (accuracyMeters <= 400) return 16;
  return 15;
}

/** User-facing hint when GPS fix is coarse. */
export function gpsAccuracyHint(accuracyMeters) {
  if (!Number.isFinite(accuracyMeters)) return null;
  if (accuracyMeters <= GPS_OK_ACCURACY_M) return null;
  const rounded = Math.round(accuracyMeters);
  if (accuracyMeters <= 800) {
    return `GPS is approximate (±${rounded} m) — drag the pin to your gate, parking, or building entrance.`;
  }
  return `Your device reported a rough location (±${rounded} m, often Wi‑Fi/IP on laptops). Drag the pin to your exact service spot.`;
}
