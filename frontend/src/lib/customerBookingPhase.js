/**
 * Customer-facing operational phases (maps from API status + washer + schedule).
 * API statuses: pending | confirmed | in_progress | completed | cancelled
 */
export const CUSTOMER_PHASES = [
  'searching',
  'awaiting_acceptance',
  'accepted',
  'on_the_way',
  'in_progress',
  'completed',
  'cancelled',
];

const PHASE_LABELS = {
  searching: 'Searching',
  awaiting_acceptance: 'Awaiting acceptance',
  accepted: 'Accepted',
  on_the_way: 'On the way',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/**
 * @param {{ status: string; washer_id?: string | null; scheduled_at?: string }} bookingLike
 */
export function deriveCustomerPhase(bookingLike) {
  if (!bookingLike) return 'searching';
  const { status, scheduled_at } = bookingLike;
  const s = String(status || 'pending');

  if (s === 'cancelled') return 'cancelled';
  if (s === 'completed') return 'completed';
  if (s === 'in_progress') return 'in_progress';
  if (s === 'confirmed') {
    const t = scheduled_at ? new Date(scheduled_at).getTime() : NaN;
    if (!Number.isNaN(t)) {
      const mins = (t - Date.now()) / 60000;
      if (mins <= 60 && mins >= -30) return 'on_the_way';
    }
    return 'accepted';
  }
  if (s === 'pending') {
    return 'awaiting_acceptance';
  }
  return 'searching';
}

export function customerPhaseLabel(phase) {
  return PHASE_LABELS[phase] || String(phase).replace(/_/g, ' ');
}

/** Only while API booking is still open (before washer acceptance). */
export function canCustomerCancelFromApi(status) {
  return String(status || '') === 'pending';
}

export function canCustomerRescheduleFromApi(status) {
  return String(status || '') === 'pending';
}

/** True when washer has accepted / visit underway — show support messaging, block self-serve cancel. */
export function requiresAssistedCancellation(phase) {
  return ['accepted', 'on_the_way', 'in_progress'].includes(phase);
}
