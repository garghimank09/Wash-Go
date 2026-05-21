import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { partnerTrackingService } from '../services/partnerTrackingService';

const REPORT_INTERVAL_MS = 20_000;
const ACCURACY = Location.Accuracy.Balanced;

/**
 * Sends the washer's GPS heartbeat to `POST /partner/location` while
 * {@link enabled} is true.
 *
 * Uses `expo-location` foreground updates — no background permission is
 * requested, the heartbeat just runs while the screen is visible. Errors
 * are intentionally swallowed because the customer-facing map will fall
 * back to the simulated coordinates if the live ping stops.
 */
export default function usePartnerLocationReporter(enabled) {
  const subscriptionRef = useRef(null);
  const lastReportAtRef = useRef(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const perms = await Location.getForegroundPermissionsAsync();
        let granted = perms.status === 'granted';
        if (!granted) {
          const req = await Location.requestForegroundPermissionsAsync();
          granted = req.status === 'granted';
        }
        if (!granted || cancelled) return;

        subscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: ACCURACY,
            timeInterval: REPORT_INTERVAL_MS,
            distanceInterval: 25,
          },
          (loc) => {
            const now = Date.now();
            if (now - lastReportAtRef.current < REPORT_INTERVAL_MS - 1000) return;
            lastReportAtRef.current = now;
            partnerTrackingService
              .reportLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                heading: Number.isFinite(loc.coords.heading)
                  ? loc.coords.heading
                  : null,
              })
              .catch(() => {});
          },
        );
      } catch {
        /* permission denied or hardware issue; nothing to do */
      }
    })();

    return () => {
      cancelled = true;
      try {
        subscriptionRef.current?.remove?.();
      } catch {
        /* ignore */
      }
      subscriptionRef.current = null;
    };
  }, [enabled]);
}
