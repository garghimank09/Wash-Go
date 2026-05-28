const EVENT = 'washgo:membership-updated';

export function dispatchMembershipSync() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function onMembershipSync(handler) {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
