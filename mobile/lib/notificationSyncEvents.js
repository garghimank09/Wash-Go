const listeners = new Set();

export function onNotificationsSync(handler) {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

export function emitNotificationsSync(detail) {
  listeners.forEach((fn) => {
    try {
      fn(detail);
    } catch (err) {
      console.warn('notificationsSync listener', err);
    }
  });
}
