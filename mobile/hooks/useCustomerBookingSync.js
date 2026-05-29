import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { emitBookingsSync } from '../lib/bookingSyncEvents';
import { emitNotificationsSync } from '../lib/notificationSyncEvents';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

const POLL_MS = 4_000;

/**
 * Polls `GET /bookings/sync` while the customer is signed in (same contract as web SSE fallback).
 */
export function useCustomerBookingSync() {
  const { isAuthenticated, initializing } = useAuth();
  const lastVersionRef = useRef(null);
  const lastEmitAtRef = useRef(0);

  useEffect(() => {
    if (initializing || !isAuthenticated) return undefined;

    let cancelled = false;
    let intervalId = null;
    let inFlight = false;

    const poll = async () => {
      if (cancelled || inFlight) return;
      inFlight = true;
      try {
        const state = await bookingService.sync();
        if (cancelled || !state?.version) return;
        if (lastVersionRef.current === null) {
          lastVersionRef.current = state.version;
          return;
        }
        if (lastVersionRef.current !== state.version) {
          lastVersionRef.current = state.version;
          lastEmitAtRef.current = Date.now();
          emitBookingsSync(state);
          emitNotificationsSync({ source: 'booking_sync' });
        }
      } catch {
        /* retry next tick */
      } finally {
        inFlight = false;
      }
    };

    poll();
    intervalId = setInterval(poll, POLL_MS);

    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active' && Date.now() - lastEmitAtRef.current > 4000) {
        poll();
      }
    });

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      sub.remove();
    };
  }, [isAuthenticated, initializing]);
}
