const LABELS = {
  searching: 'Finding a washer near you',
  awaiting_acceptance: 'Awaiting washer acceptance',
  accepted: 'Washer accepted',
  on_the_way: 'Washer on the way',
  in_progress: 'Wash in progress',
  awaiting_review: 'Ready for your review',
  issue_reported: 'Issue under review',
  completed: 'Completed',
};

const ORDER = [
  'searching',
  'awaiting_acceptance',
  'accepted',
  'on_the_way',
  'in_progress',
  'awaiting_review',
  'completed',
];

/** Phases where the customer is still *at* that step (not yet achieved). */
const IN_PROGRESS_PHASES = new Set([
  'searching',
  'awaiting_acceptance',
  'on_the_way',
  'in_progress',
  'awaiting_review',
  'issue_reported',
]);

function stepDone(stepIndex, phaseIndex, phase) {
  if (phase === 'issue_reported' && stepIndex <= ORDER.indexOf('awaiting_review')) return true;
  if (stepIndex < phaseIndex) return true;
  if (stepIndex === phaseIndex && !IN_PROGRESS_PHASES.has(phase)) return true;
  return false;
}

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

  const resolvedPhase = phase === 'issue_reported' ? 'awaiting_review' : phase;
  const idx = ORDER.indexOf(resolvedPhase);
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
    done: stepDone(i, idx, phase),
    at: null,
  }));
}
