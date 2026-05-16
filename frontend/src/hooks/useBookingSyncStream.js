import { useEffect, useRef } from 'react';

import { API_URL } from '../constants/config';
import { dispatchBookingsSync } from '../lib/bookingSyncEvents';

const POLL_MS = 12_000;

/**
 * Subscribes to live booking updates via SSE (`/bookings/stream?token=…`).
 * Falls back to REST polling (`/bookings/sync`) if SSE disconnects.
 *
 * @param {{ token: string | null, enabled?: boolean }} options
 */
export function useBookingSyncStream({ token, enabled = true }) {
  const lastVersionRef = useRef(null);

  useEffect(() => {
    if (!enabled || !token || typeof window === 'undefined') return undefined;

    let closed = false;
    let es = null;
    let pollId = null;

    const applyState = (state) => {
      if (!state?.version || closed) return;
      if (lastVersionRef.current === null) {
        lastVersionRef.current = state.version;
        return;
      }
      if (lastVersionRef.current !== state.version) {
        lastVersionRef.current = state.version;
        dispatchBookingsSync(state);
      }
    };

    const startPoll = () => {
      if (pollId) return;
      const poll = async () => {
        if (closed) return;
        try {
          const res = await fetch(`${API_URL}/bookings/sync`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          });
          if (res.ok) {
            const state = await res.json();
            applyState(state);
          }
        } catch {
          /* network blip — retry next tick */
        }
      };
      void poll();
      pollId = window.setInterval(poll, POLL_MS);
    };

    const connectSse = () => {
      const url = `${API_URL}/bookings/stream?token=${encodeURIComponent(token)}`;
      es = new EventSource(url);

      es.addEventListener('bookings', (ev) => {
        try {
          const state = JSON.parse(ev.data);
          applyState(state);
        } catch {
          /* ignore malformed */
        }
      });

      es.onerror = () => {
        es?.close();
        es = null;
        startPoll();
      };
    };

    connectSse();

    return () => {
      closed = true;
      es?.close();
      if (pollId) window.clearInterval(pollId);
    };
  }, [token, enabled]);
}
