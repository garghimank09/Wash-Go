import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Washer-side job phase ladder.
 *
 * Ported from `frontend/src/lib/washerJobPhase.js`. The backend booking
 * model only stores 5 API statuses (`pending`, `confirmed`, `in_progress`,
 * `completed`, `cancelled`). The washer UX exposes finer-grained phases to
 * structure the on-site workflow; intermediate transitions are persisted
 * locally so they survive reloads but never lie about backend state — the
 * effective phase is always at least the minimum implied by the API status.
 */

const PREFIX = 'washgo:partner:job:phase:';

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

export function phaseRank(phase) {
  const i = WASHER_PHASE_ORDER.indexOf(phase);
  return i === -1 ? 0 : i;
}

/** Minimum washer phase implied by the booking's API status. */
export function minPhaseFromApiStatus(status) {
  const s = String(status || 'pending');
  if (s === 'completed') return 'completed';
  if (s === 'in_progress') return 'wash_started';
  if (s === 'confirmed') return 'accepted';
  return 'received';
}

/** Map a washer UX phase to the API status that should be persisted. */
export function apiStatusForPhase(phase) {
  if (phase === 'completed') return 'completed';
  if (['wash_started', 'qc_review', 'awaiting_approval'].includes(phase)) {
    return 'in_progress';
  }
  if (['accepted', 'on_the_way', 'arrived'].includes(phase)) {
    return 'confirmed';
  }
  return 'pending';
}

/** Next phase in the sequence; clamps at `completed`. */
export function getNextWasherPhase(current) {
  const idx = WASHER_PHASE_ORDER.indexOf(current);
  if (idx === -1 || idx >= WASHER_PHASE_ORDER.length - 1) return current;
  return WASHER_PHASE_ORDER[idx + 1];
}

function normalize(stored) {
  if (!stored || typeof stored !== 'string') return null;
  if (WASHER_PHASE_ORDER.includes(stored)) return stored;
  return null;
}

export async function getStoredPhase(bookingId) {
  if (!bookingId) return null;
  try {
    return await AsyncStorage.getItem(`${PREFIX}${bookingId}`);
  } catch {
    return null;
  }
}

export async function setStoredPhase(bookingId, phase) {
  if (!bookingId || !phase) return;
  try {
    await AsyncStorage.setItem(`${PREFIX}${bookingId}`, phase);
  } catch {
    /* ignore */
  }
}

export async function clearStoredPhase(bookingId) {
  if (!bookingId) return;
  try {
    await AsyncStorage.removeItem(`${PREFIX}${bookingId}`);
  } catch {
    /* ignore */
  }
}

/**
 * Effective phase = max(stored progression, floor from API).
 *
 * If the API has moved ahead of the local progression (e.g. customer
 * cancelled while you were offline, or another device advanced the wash)
 * we honour the API floor.
 */
export async function effectiveWasherPhase(bookingId, apiStatus) {
  const floor = minPhaseFromApiStatus(apiStatus);
  const stored = normalize(await getStoredPhase(bookingId));
  if (!stored) return floor;
  return phaseRank(stored) >= phaseRank(floor) ? stored : floor;
}
