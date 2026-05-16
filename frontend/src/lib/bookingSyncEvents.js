/** Dispatched when SSE (or poll fallback) detects booking data changed on the server. */
export const BOOKINGS_SYNC_EVENT = 'washgo:bookings-sync';

export function dispatchBookingsSync(detail = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(BOOKINGS_SYNC_EVENT, { detail }));
}

export function onBookingsSync(handler) {
  if (typeof window === 'undefined') return () => {};
  const wrapped = (e) => handler(e.detail);
  window.addEventListener(BOOKINGS_SYNC_EVENT, wrapped);
  return () => window.removeEventListener(BOOKINGS_SYNC_EVENT, wrapped);
}
