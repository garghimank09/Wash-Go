/**
 * In-memory holder for credentials between auth form and OTP screen.
 * Avoids passing passwords through route params.
 */
let pending = null;

export function setPendingAuthFlow(data) {
  pending = data ? { ...data, createdAt: Date.now() } : null;
}

export function getPendingAuthFlow() {
  return pending;
}

export function clearPendingAuthFlow() {
  pending = null;
}

export function consumePendingAuthFlow() {
  const current = pending;
  pending = null;
  return current;
}
