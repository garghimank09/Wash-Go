const LABELS = {
  searching: 'Finding a washer near you',
  awaiting_acceptance: 'Awaiting washer acceptance',
  accepted: 'Washer accepted',
  on_the_way: 'Washer on the way',
  in_progress: 'Wash in progress',
  completed: 'Completed',
};

const ORDER = ['searching', 'awaiting_acceptance', 'accepted', 'on_the_way', 'in_progress', 'completed'];

/**
 * Steps compatible with {@link BookingTimeline} (key, label, done, at).
 */
export function buildCustomerServiceTimeline(phase) {
  if (phase === 'cancelled') {
    return [
      { key: 'placed', label: 'Booking placed', done: true, at: null },
      { key: 'cancelled', label: 'Cancelled', done: true, at: null },
    ];
  }

  const idx = ORDER.indexOf(phase);
  if (idx === -1) {
    return [];
  }

  if (phase === 'completed') {
    return ORDER.map((key) => ({
      key,
      label: LABELS[key],
      done: true,
      at: null,
    }));
  }

  return ORDER.map((key, i) => ({
    key,
    label: LABELS[key],
    done: i < idx,
    at: null,
  }));
}
