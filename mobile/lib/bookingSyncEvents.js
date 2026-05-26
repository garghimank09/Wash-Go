const listeners = new Set();

export function onBookingsSync(handler) {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

export function emitBookingsSync(detail) {
  listeners.forEach((fn) => {
    try {
      fn(detail);
    } catch (err) {
      console.warn('bookingsSync listener', err);
    }
  });
}
