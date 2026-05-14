const PREFIX = 'washgo:washer:jobPhase:';

export const WASHER_PHASE_ORDER = [
  'received',
  'accepted',
  'on_the_way',
  'arrived',
  'wash_started',
  'qc_review',
  'awaiting_approval',
  'completed',
];

export function phaseRank(p) {
  const i = WASHER_PHASE_ORDER.indexOf(p);
  return i === -1 ? 0 : i;
}

/** Minimum washer UX phase implied by API booking status. */
export function minPhaseFromApiStatus(status) {
  const s = String(status || 'pending');
  if (s === 'completed') return 'completed';
  if (s === 'in_progress') return 'wash_started';
  if (s === 'confirmed') return 'accepted';
  return 'received';
}

/** Normalize legacy stored phases after workflow expansion. */
function normalizeStoredPhase(stored) {
  if (!stored || typeof stored !== 'string') return null;
  if (WASHER_PHASE_ORDER.includes(stored)) return stored;
  return null;
}

export function getStoredPhase(bookingId) {
  if (!bookingId || typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(`${PREFIX}${bookingId}`);
  } catch {
    return null;
  }
}

export function setStoredPhase(bookingId, phase) {
  if (!bookingId || typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(`${PREFIX}${bookingId}`, phase);
  } catch {
    /* ignore */
  }
}

export function clearStoredPhase(bookingId) {
  if (!bookingId || typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(`${PREFIX}${bookingId}`);
  } catch {
    /* ignore */
  }
}

/** Effective phase = max(stored demo progression, floor from API). */
export function effectiveWasherPhase(bookingId, apiStatus) {
  const floor = minPhaseFromApiStatus(apiStatus);
  const raw = getStoredPhase(bookingId);
  const stored = normalizeStoredPhase(raw);
  if (!stored) return floor;
  return phaseRank(stored) >= phaseRank(floor) ? stored : floor;
}

export function advanceWasherPhase(bookingId, apiStatus) {
  const current = effectiveWasherPhase(bookingId, apiStatus);
  const idx = WASHER_PHASE_ORDER.indexOf(current);
  if (idx === -1 || idx >= WASHER_PHASE_ORDER.length - 1) return current;
  const next = WASHER_PHASE_ORDER[idx + 1];
  setStoredPhase(bookingId, next);
  return next;
}
