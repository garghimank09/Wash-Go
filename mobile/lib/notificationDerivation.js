import {
  deriveCustomerPhase,
  PHASE_LABEL,
  PHASE_SUBTITLE,
  isPhaseActive,
} from './customerBookingPhase';

const NOTIF_COPY = {
  searching: {
    title: 'Finding a washer',
    message: 'We are matching you with a nearby washer.',
  },
  awaiting_acceptance: {
    title: 'Awaiting confirmation',
    message: 'Your washer needs to accept the booking.',
  },
  accepted: {
    title: 'Booking scheduled',
    message: 'Your wash is confirmed and on the calendar.',
  },
  on_the_way: {
    title: 'Washer on the way',
    message: 'Your washer is heading to your location.',
  },
  in_progress: {
    title: 'Wash in progress',
    message: 'Your vehicle is being cleaned right now.',
  },
  completed: {
    title: 'Wash complete',
    message: 'Your booking has been completed.',
  },
  cancelled: {
    title: 'Booking cancelled',
    message: 'This booking was cancelled.',
  },
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function resolveCreatedAt(booking) {
  const candidates = [
    booking.updated_at,
    booking.updatedAt,
    booking.scheduled_at,
    booking.scheduledAt,
    booking.created_at,
    booking.createdAt,
  ];
  for (const c of candidates) {
    if (!c) continue;
    const ts = new Date(c).getTime();
    if (Number.isFinite(ts)) return ts;
  }
  return Date.now();
}

function resolveGroup(createdAt) {
  return createdAt >= startOfToday() ? 'today' : 'earlier';
}

export function deriveNotificationsFromBookings(bookings = []) {
  const items = [];

  for (const booking of bookings) {
    if (!booking?.id) continue;
    const phase = deriveCustomerPhase(booking);
    const copy = NOTIF_COPY[phase] || {
      title: PHASE_LABEL[phase] || 'Booking update',
      message: PHASE_SUBTITLE[phase] || 'Your booking status changed.',
    };
    const createdAt = resolveCreatedAt(booking);

    items.push({
      id: `${booking.id}:${phase}`,
      type: phase,
      title: copy.title,
      message: copy.message,
      bookingId: booking.id,
      createdAt,
      group: resolveGroup(createdAt),
      isActive: isPhaseActive(phase),
    });
  }

  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
