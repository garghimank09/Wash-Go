import { resolveNotificationGroup } from './notificationModel';

const JOB_COPY = {
  confirmed: {
    type: 'washer_accepted',
    title: 'Job on your schedule',
    message: 'This wash is assigned to you. Head to the job when it is time.',
  },
  in_progress: {
    type: 'washer_arrived',
    title: 'Wash in progress',
    message: 'You marked this job in progress. Keep the customer updated.',
  },
  completed: {
    type: 'payment_completed',
    title: 'Job completed',
    message: 'Nice work — this wash is marked complete.',
  },
  cancelled: {
    type: 'customer_cancelled',
    title: 'Booking cancelled',
    message: 'The customer cancelled this job.',
  },
};

function resolveCreatedAt(booking) {
  const candidates = [
    booking.updated_at,
    booking.updatedAt,
    booking.scheduled_at,
    booking.scheduledAt,
  ];
  for (const c of candidates) {
    if (!c) continue;
    const ts = new Date(c).getTime();
    if (Number.isFinite(ts)) return ts;
  }
  return Date.now();
}

const OFFER_COPY = {
  type: 'new_booking_request',
  title: 'New wash request',
  message: 'A customer paid for a wash nearby. Review and accept in Offers.',
};

/**
 * Booking-scoped activity for the signed-in washer.
 * @param {object|Array} input — assigned bookings array, or `{ assigned, offers }`.
 */
export function derivePartnerNotificationsFromBookings(input = []) {
  const assigned = Array.isArray(input)
    ? input
    : Array.isArray(input?.assigned)
      ? input.assigned
      : [];
  const offers = Array.isArray(input?.offers) ? input.offers : [];
  const items = [];

  for (const offer of offers) {
    if (!offer?.id) continue;
    const status = offer.status;
    if (status && status !== 'pending') continue;
    const createdAt = resolveCreatedAt(offer);
    items.push({
      id: `offer:${offer.id}:request`,
      type: OFFER_COPY.type,
      title: OFFER_COPY.title,
      message: OFFER_COPY.message,
      bookingId: offer.id,
      path: '/(partner)/offers',
      createdAt,
      group: resolveNotificationGroup(createdAt),
      read: false,
      fromApi: false,
      bookingRef: `#${String(offer.id).slice(0, 8)}`,
    });
  }

  for (const booking of assigned) {
    if (!booking?.id) continue;
    const status = booking.status;
    const copy = JOB_COPY[status];
    if (!copy) continue;

    const createdAt = resolveCreatedAt(booking);
    items.push({
      id: `partner:${booking.id}:${status}`,
      type: copy.type,
      title: copy.title,
      message: copy.message,
      bookingId: booking.id,
      path: `/(partner)/job/${booking.id}`,
      createdAt,
      group: resolveNotificationGroup(createdAt),
      read: false,
      fromApi: false,
      bookingRef: `#${String(booking.id).slice(0, 8)}`,
    });
  }

  return items.sort((a, b) => b.createdAt - a.createdAt);
}
