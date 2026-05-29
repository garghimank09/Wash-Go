const PREFIX = 'washgo:washer:jobPhase:';

export const WASHER_PHASE_ORDER = [
  'received',
  'accepted',
  'on_the_way',
  'arrived',
  'awaiting_approval',
  'arrival_approved',
  'wash_started',
  'qc_review',
  'completed',
];

export function phaseRank(p) {
  const i = WASHER_PHASE_ORDER.indexOf(p);
  return i === -1 ? 0 : i;
}

/** Map API service_phase → washer UI phase. */
export function washerPhaseFromServicePhase(servicePhase) {
  const map = {
    awaiting_acceptance: 'received',
    washer_accepted: 'accepted',
    heading_to_you: 'on_the_way',
    arrived_onsite: 'arrived',
    awaiting_arrival_approval: 'awaiting_approval',
    arrival_approved: 'arrival_approved',
    wash_in_progress: 'wash_started',
    completed: 'completed',
  };
  return map[servicePhase] ?? null;
}

/** Minimum washer UX phase implied by API booking status. */
export function minPhaseFromApiStatus(status) {
  const s = String(status || 'pending');
  if (s === 'completed') return 'completed';
  if (s === 'in_progress') return 'wash_started';
  if (s === 'confirmed') return 'accepted';
  return 'received';
}

/** Map UI phase to API status for persistence. */
export function apiStatusForPhase(phase) {
  if (phase === 'completed') return 'completed';
  if (['wash_started', 'qc_review'].includes(phase)) return 'in_progress';
  if (['accepted', 'on_the_way', 'arrived', 'awaiting_approval', 'arrival_approved'].includes(phase)) {
    return 'confirmed';
  }
  return 'pending';
}

/** Next phase in the field workflow (pure). */
export function getNextWasherPhase(current) {
  const idx = WASHER_PHASE_ORDER.indexOf(current);
  if (idx === -1 || idx >= WASHER_PHASE_ORDER.length - 1) return current;
  return WASHER_PHASE_ORDER[idx + 1];
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

/** Effective phase = max(stored progression, floor from API status, service_phase). */
export function effectiveWasherPhase(bookingId, apiStatus, servicePhase = null) {
  const floor = minPhaseFromApiStatus(apiStatus);
  const fromService = servicePhase ? washerPhaseFromServicePhase(servicePhase) : null;
  let base = floor;
  if (fromService && phaseRank(fromService) > phaseRank(base)) {
    base = fromService;
  }
  const raw = getStoredPhase(bookingId);
  const stored = normalizeStoredPhase(raw);
  if (!stored) return base;
  return phaseRank(stored) >= phaseRank(base) ? stored : base;
}

/** Advance local UI phase (call API separately for real bookings). */
export function advanceWasherPhase(bookingId, apiStatus, servicePhase = null) {
  const current = effectiveWasherPhase(bookingId, apiStatus, servicePhase);
  const next = getNextWasherPhase(current);
  setStoredPhase(bookingId, next);
  return next;
}

/** Whether the dock primary action should be enabled. */
export function canWasherAdvancePhase(phase, { hasArrivalPhoto, hasBeforePhoto, hasAfterPhoto, servicePhase }) {
  if (phase === 'arrived' && !hasArrivalPhoto) return false;
  if (phase === 'awaiting_approval') return false;
  if (phase === 'arrival_approved' && !hasBeforePhoto) return false;
  if (phase === 'qc_review' && !hasAfterPhoto) return false;
  if (phase === 'arrival_approved') return true;
  if (phase === 'wash_started' && servicePhase === 'awaiting_arrival_approval') return false;
  return phase !== 'completed';
}

export function washerAdvanceBlockedReason(phase, { hasArrivalPhoto, hasBeforePhoto, hasAfterPhoto }) {
  if (phase === 'arrived' && !hasArrivalPhoto) {
    return 'Capture the vehicle condition photo (and optional notes) above before continuing';
  }
  if (phase === 'awaiting_approval') {
    return 'Waiting for the customer to approve the vehicle condition';
  }
  if (phase === 'arrival_approved' && !hasBeforePhoto) {
    return 'Upload the before wash photo above, then start service';
  }
  if (phase === 'qc_review' && !hasAfterPhoto) {
    return 'Upload the after wash photo above before finishing the job';
  }
  return null;
}
