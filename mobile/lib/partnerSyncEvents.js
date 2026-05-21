/**
 * Tiny event bus that lets the partner booking-sync poller broadcast
 * "your bookings changed" to any subscribed screen without a global store.
 *
 * Mirrors the role of `frontend/src/lib/bookingSyncEvents.js` on the web.
 */

const listeners = new Set();

export function onPartnerBookingsSync(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitPartnerBookingsSync(payload) {
  for (const fn of listeners) {
    try {
      fn(payload);
    } catch {
      /* ignore subscriber errors */
    }
  }
}
