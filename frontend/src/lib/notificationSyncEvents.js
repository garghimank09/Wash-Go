export const NOTIFICATIONS_SYNC_EVENT = 'washgo:notifications-sync';

export function dispatchNotificationsSync(detail = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_SYNC_EVENT, { detail }));
}

export function onNotificationsSync(handler) {
  if (typeof window === 'undefined') return () => {};
  const wrapped = (e) => handler(e.detail);
  window.addEventListener(NOTIFICATIONS_SYNC_EVENT, wrapped);
  return () => window.removeEventListener(NOTIFICATIONS_SYNC_EVENT, wrapped);
}
