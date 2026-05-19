// Derives the 7 customer-facing booking phases from the 5 backend API statuses.
// API statuses: pending | confirmed | in_progress | completed | cancelled

export const CUSTOMER_PHASES = [
  'searching',
  'awaiting_acceptance',
  'accepted',
  'on_the_way',
  'in_progress',
  'completed',
  'cancelled',
];

const ACTIVE_PHASES = new Set([
  'searching',
  'awaiting_acceptance',
  'accepted',
  'on_the_way',
  'in_progress',
]);

const TERMINAL_PHASES = new Set(['completed', 'cancelled']);

export const PHASE_LABEL = {
  searching: 'Searching',
  awaiting_acceptance: 'Awaiting acceptance',
  accepted: 'Accepted',
  on_the_way: 'On the way',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const PHASE_SUBTITLE = {
  searching: 'Finding a washer for your booking',
  awaiting_acceptance: 'Waiting for the washer to confirm',
  accepted: 'Your washer is scheduled',
  on_the_way: 'Your washer is heading over',
  in_progress: 'Your wash is in progress',
  completed: 'Your wash is complete',
  cancelled: 'This booking was cancelled',
};

export function deriveCustomerPhase(booking) {
  if (!booking || !booking.status) return 'searching';
  const { status, washer_id: washerId, scheduled_at: scheduledAt } = booking;

  if (status === 'cancelled') return 'cancelled';
  if (status === 'completed') return 'completed';
  if (status === 'in_progress') return 'in_progress';

  if (status === 'pending') {
    return washerId ? 'awaiting_acceptance' : 'searching';
  }

  if (status === 'confirmed') {
    if (!scheduledAt) return 'accepted';
    const scheduled = new Date(scheduledAt).getTime();
    if (Number.isNaN(scheduled)) return 'accepted';
    const now = Date.now();
    const diffMinutes = (scheduled - now) / 60000;
    // -30 .. +60 minutes from scheduled time -> washer is on the way
    if (diffMinutes >= -30 && diffMinutes <= 60) return 'on_the_way';
    return 'accepted';
  }

  return 'searching';
}

export function isPhaseActive(phase) {
  return ACTIVE_PHASES.has(phase);
}

export function isPhaseTerminal(phase) {
  return TERMINAL_PHASES.has(phase);
}

export function canCancelPhase(phase) {
  // Backend allows cancellation only when status is "pending"
  return phase === 'searching' || phase === 'awaiting_acceptance';
}

export function canRescheduleBooking(booking) {
  return booking?.status === 'pending';
}

export function shouldTrackLive(phase) {
  return phase === 'accepted' || phase === 'on_the_way' || phase === 'in_progress';
}

export function phaseColor(phase, theme) {
  const c = theme.customer;
  switch (phase) {
    case 'searching':
      return { fg: '#b45309', bg: 'rgba(245,158,11,0.14)' };
    case 'awaiting_acceptance':
      return { fg: '#6d28d9', bg: 'rgba(139,92,246,0.14)' };
    case 'accepted':
      return { fg: theme.accent.dark, bg: c.primaryBg };
    case 'on_the_way':
      return { fg: '#1d4ed8', bg: 'rgba(59,130,246,0.14)' };
    case 'in_progress':
      return { fg: '#0e7490', bg: 'rgba(6,182,212,0.18)' };
    case 'completed':
      return { fg: '#047857', bg: 'rgba(16,185,129,0.14)' };
    case 'cancelled':
      return { fg: c.error, bg: 'rgba(220,38,38,0.10)' };
    default:
      return { fg: theme.text.secondary, bg: c.surfaceContainerLow };
  }
}
