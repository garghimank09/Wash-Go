import AsyncStorage from '@react-native-async-storage/async-storage';
import { PHASE_INDEX } from './jobPhases';
import { uiPhaseFromServicePhase } from './jobPhaseMilestones';

/**
 * Washer-side job phase ladder + UI phase bridging.
 *
 * Ported from `frontend/src/lib/washerJobPhase.js`. The backend booking
 * model only stores 5 API statuses (`pending`, `confirmed`, `in_progress`,
 * `completed`, `cancelled`). The washer UX exposes finer-grained phases in
 * `jobPhases.js` (e.g. `heading`, `service_started`); this module maps those
 * UI ids to API statuses without ever sending illegal values like `pending`.
 */

const PREFIX = 'washgo:partner:job:phase:';

export const WASHER_PHASE_ORDER = [
  'received',
  'accepted',
  'on_the_way',
  'arrived',
  'wash_started',
  'qc_review',
  'completed',
];

/** Map mobile UI phase ids (`jobPhases.js`) → canonical washer phase ids. */
const UI_TO_CANONICAL = {
  heading: 'on_the_way',
  service_started: 'wash_started',
  before_uploaded: 'wash_started',
  washing: 'wash_started',
  after_uploaded: 'qc_review',
  qc_complete: 'qc_review',
};

const IN_PROGRESS_UI = new Set([
  'service_started',
  'before_uploaded',
  'washing',
  'after_uploaded',
  'qc_complete',
  'wash_started',
  'qc_review',
]);

const CONFIRMED_UI = new Set(['accepted', 'heading', 'on_the_way', 'arrived']);

export function phaseRank(phase) {
  const i = WASHER_PHASE_ORDER.indexOf(phase);
  return i === -1 ? 0 : i;
}

export function uiPhaseRank(phase) {
  if (!phase || PHASE_INDEX[phase] == null) return 0;
  return PHASE_INDEX[phase];
}

/**
 * Normalize a UI or canonical phase id to the washer ladder id used for API mapping.
 */
export function normalizeJobPhase(phase) {
  if (!phase || typeof phase !== 'string') return null;
  if (WASHER_PHASE_ORDER.includes(phase)) return phase;
  return UI_TO_CANONICAL[phase] || null;
}

/** Minimum UI phase implied by the booking's API status (`jobPhases.js` ids). */
export function minUiPhaseFromApiStatus(status) {
  const s = String(status || 'pending');
  if (s === 'completed') return 'completed';
  if (s === 'in_progress') return 'service_started';
  if (s === 'confirmed') return 'accepted';
  return 'accepted';
}

/** @deprecated Use minUiPhaseFromApiStatus for job screen phases. */
export function minPhaseFromApiStatus(status) {
  return minUiPhaseFromApiStatus(status);
}

/**
 * Map washer/UI phase → coarse API status for `PATCH /bookings/{id}/status`.
 * Returns null when no API write is needed / phase is unknown (never `pending`).
 */
export function apiStatusForPhase(phase) {
  if (!phase) return null;
  if (phase === 'completed') return 'completed';

  if (IN_PROGRESS_UI.has(phase)) return 'in_progress';

  const canonical = normalizeJobPhase(phase);
  if (canonical && ['wash_started', 'qc_review'].includes(canonical)) {
    return 'in_progress';
  }

  if (CONFIRMED_UI.has(phase) || (canonical && ['accepted', 'on_the_way', 'arrived'].includes(canonical))) {
    return 'confirmed';
  }

  return null;
}

/** Next phase in the canonical sequence; clamps at `completed`. */
export function getNextWasherPhase(current) {
  const canonical = normalizeJobPhase(current) || current;
  const idx = WASHER_PHASE_ORDER.indexOf(canonical);
  if (idx === -1 || idx >= WASHER_PHASE_ORDER.length - 1) return current;
  return WASHER_PHASE_ORDER[idx + 1];
}

function isValidStoredUiPhase(stored) {
  if (!stored || typeof stored !== 'string') return false;
  return PHASE_INDEX[stored] != null;
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
 * Effective UI phase = max(stored progression, floor from API status, service_phase).
 * Stored values use `jobPhases.js` ids (`heading`, `service_started`, …).
 */
export async function effectiveWasherPhase(
  bookingId,
  apiStatus,
  servicePhase = null,
  _handoffStatus = null,
) {
  const floor = minUiPhaseFromApiStatus(apiStatus);
  const fromService = uiPhaseFromServicePhase(servicePhase);
  let base = floor;
  if (fromService && uiPhaseRank(fromService) > uiPhaseRank(base)) {
    base = fromService;
  }
  const raw = await getStoredPhase(bookingId);
  if (!isValidStoredUiPhase(raw)) return base;
  return uiPhaseRank(raw) >= uiPhaseRank(base) ? raw : base;
}
