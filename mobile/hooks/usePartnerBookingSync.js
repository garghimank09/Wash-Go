import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { partnerBookingsService } from '../services/partnerBookingsService';
import { usePartnerAuth } from '../context/PartnerAuthContext';
import { emitPartnerBookingsSync } from '../lib/partnerSyncEvents';
import { emitNotificationsSync } from '../lib/notificationSyncEvents';

/**
 * Polls `GET /bookings/sync` every {@link POLL_MS} milliseconds while the
 * partner is signed in and the app is foregrounded. When the version
 * fingerprint changes, fire {@link emitPartnerBookingsSync} so screens can
 * refetch their slice without each one running its own timer.
 *
 * Polling-first by design: the React Native fetch implementation does not
 * speak SSE cleanly, and the backend `/bookings/stream` endpoint already
 * documents `/bookings/sync` as the fallback contract. Switching to a real
 * websocket gateway later only requires swapping this hook.
 */

const POLL_MS = 12_000;

export function usePartnerBookingSync() {
  const { isPartnerAuthenticated } = usePartnerAuth();
  const lastVersionRef = useRef(null);
  const lastEmitAtRef = useRef(0);

  useEffect(() => {
    if (!isPartnerAuthenticated) return undefined;

    let cancelled = false;
    let intervalId = null;
    let inFlight = false;

    const poll = async () => {
      if (cancelled || inFlight) return;
      inFlight = true;
      try {
        const state = await partnerBookingsService.sync();
        if (cancelled) return;
        if (!state?.version) return;
        if (lastVersionRef.current === null) {
          lastVersionRef.current = state.version;
          return;
        }
        if (lastVersionRef.current !== state.version) {
          lastVersionRef.current = state.version;
          lastEmitAtRef.current = Date.now();
          emitPartnerBookingsSync(state);
          emitNotificationsSync({ source: 'booking_sync' });
        }
      } catch {
        /* swallow — next tick will retry */
      } finally {
        inFlight = false;
      }
    };

    poll();
    intervalId = setInterval(poll, POLL_MS);

    // Refresh the fingerprint immediately when the app returns to foreground.
    const appStateSub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        const since = Date.now() - lastEmitAtRef.current;
        if (since > 4_000) poll();
      }
    });

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      appStateSub.remove();
    };
  }, [isPartnerAuthenticated]);
}
