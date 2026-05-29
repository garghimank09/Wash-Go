// Derives customer-facing booking phases from API status + service_phase.

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

const PHASE_SUBTITLES = {
  searching: 'We are matching you with a nearby washer',
  awaiting_acceptance: 'Waiting for the washer to confirm',
  accepted: 'Your washer has accepted the booking',
  on_the_way: 'Your washer is heading to you',
  in_progress: 'Your vehicle is being washed',
  completed: 'Your wash is complete',
  cancelled: 'This booking was cancelled',
};

/** Bookings still in progress (shown under Active filters, live notifications). */
const ACTIVE_PHASES = new Set([
  'searching',
  'awaiting_acceptance',
  'accepted',
  'on_the_way',
  'in_progress',
]);

const TERMINAL_PHASES = new Set(['completed', 'cancelled']);

/**
 * @param {{ status: string; washer_id?: string | null; scheduled_at?: string; service_phase?: string | null }} bookingLike
 */
export function deriveCustomerPhase(bookingLike) {
  if (!bookingLike) return 'searching';
  const { status, washer_id: washerId, scheduled_at: scheduledAt, service_phase: servicePhase } =
    bookingLike;
  const s = String(status || 'pending');

  if (s === 'cancelled') return 'cancelled';
  if (s === 'completed') return 'completed';
  if (s === 'in_progress') return 'in_progress';
  if (s === 'confirmed') {
    const sp = servicePhase || bookingLike.servicePhase;
    if (
      sp === 'heading_to_you' ||
      sp === 'arrived_onsite' ||
      sp === 'awaiting_arrival_approval' ||
      sp === 'arrival_approved'
    ) {
      const t = scheduledAt ? new Date(scheduledAt).getTime() : NaN;
      if (!Number.isNaN(t)) {
        const mins = (t - Date.now()) / 60000;
        if (mins <= 60 && mins >= -30) return 'on_the_way';
      }
      return 'accepted';
    }
    if (sp === 'wash_in_progress') return 'in_progress';
    const t = scheduledAt ? new Date(scheduledAt).getTime() : NaN;
    if (!Number.isNaN(t)) {
      const mins = (t - Date.now()) / 60000;
      if (mins <= 60 && mins >= -30) return 'on_the_way';
    }
    return washerId ? 'accepted' : 'awaiting_acceptance';
  }
  if (s === 'pending') {
    return washerId ? 'awaiting_acceptance' : 'searching';
  }
  return 'searching';
}

export function customerPhaseLabel(phase) {
  return PHASE_LABELS[phase] || String(phase).replace(/_/g, ' ');
}

/** @deprecated Use customerPhaseLabel */
export const PHASE_LABEL = PHASE_LABELS;

export const PHASE_SUBTITLE = PHASE_SUBTITLES;

export function customerPhaseSubtitle(phase) {
  return PHASE_SUBTITLES[phase] || '';
}

/** True while the booking is still in a live / non-terminal phase. */
export function isPhaseActive(phase) {
  return ACTIVE_PHASES.has(phase);
}

export function isPhaseTerminal(phase) {
  return TERMINAL_PHASES.has(phase);
}

export function canCancelPhase(phase) {
  return phase === 'searching' || phase === 'awaiting_acceptance';
}

export function canRescheduleBooking(booking) {
  return booking?.status === 'pending';
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

export function getCustomerPhaseThemeKey(phase) {
  switch (phase) {
    case 'searching':
      return 'searching';
    case 'awaiting_acceptance':
      return 'awaiting_acceptance';
    case 'accepted':
      return 'accepted';
    case 'on_the_way':
      return 'on_the_way';
    case 'in_progress':
      return 'in_progress';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'searching';
  }
}
