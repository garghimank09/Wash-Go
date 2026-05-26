/**
 * Customer-facing service milestones with transparency sub-checkpoints.
 * Synced from booking.service_phase (set by partner app).
 */

export const CUSTOMER_MILESTONE_ORDER = [
  'payment_received',
  'awaiting_acceptance',
  'washer_accepted',
  'heading_to_you',
  'arrived_onsite',
  'awaiting_arrival_approval',
  'arrival_approved',
  'wash_in_progress',
  'completed',
];

export const MILESTONE_META = {
  payment_received: {
    label: 'Payment received',
    subCheckpoints: [
      'Demo payment captured by WashGo',
      'Booking queued for partner dispatch',
      'Receipt available in your bookings list',
    ],
  },
  awaiting_acceptance: {
    label: 'Awaiting washer acceptance',
    subCheckpoints: [
      'Paid job visible to nearby partners',
      'First available washer can accept',
      'You will be notified when accepted',
    ],
  },
  washer_accepted: {
    label: 'Washer accepted',
    subCheckpoints: [
      'Partner assigned to your booking',
      'Service window confirmed',
      'En-route updates start when they head out',
    ],
  },
  heading_to_you: {
    label: 'Washer heading to you',
    subCheckpoints: [
      'Live map shows washer movement',
      'ETA updates as they drive',
      'Route optimized to your service address',
    ],
  },
  arrived_onsite: {
    label: 'Arrived on site',
    subCheckpoints: [
      'Washer checked in at your location',
      'Vehicle condition photo and notes coming next',
      'You may meet them at the vehicle',
    ],
  },
  awaiting_arrival_approval: {
    label: 'Review vehicle condition',
    subCheckpoints: [
      'Washer documented your vehicle’s current condition',
      'Review the photo and any condition notes',
      'Approve so the washer can accept the car and start the wash',
    ],
  },
  arrival_approved: {
    label: 'Vehicle condition approved',
    subCheckpoints: [
      'You approved the documented condition',
      'Washer can accept the vehicle and begin the wash',
      'Before/after wash photos will follow for your records',
    ],
  },
  wash_in_progress: {
    label: 'Wash in progress',
    subCheckpoints: [
      'Service timer running',
      'Quality checks during the wash',
      'Before and after photos captured for verification',
    ],
  },
  completed: {
    label: 'Completed',
    subCheckpoints: [
      'Service finished',
      'Final QC cleared',
      'Rate your experience anytime',
    ],
  },
};

/** Map partner field phase → persisted service_phase. */
export const WASHER_PHASE_TO_SERVICE_PHASE = {
  received: 'awaiting_acceptance',
  accepted: 'washer_accepted',
  on_the_way: 'heading_to_you',
  arrived: 'arrived_onsite',
  awaiting_approval: 'awaiting_arrival_approval',
  arrival_approved: 'arrival_approved',
  wash_started: 'wash_in_progress',
  qc_review: 'wash_in_progress',
  completed: 'completed',
};

const IN_PROGRESS_MILESTONES = new Set([
  'awaiting_acceptance',
  'washer_accepted',
  'heading_to_you',
  'arrived_onsite',
  'awaiting_arrival_approval',
  'arrival_approved',
  'wash_in_progress',
]);

/** Live status line shown on the current (not yet finished) step. */
export const CURRENT_MILESTONE_STATUS = {
  awaiting_acceptance: 'Waiting for a washer to accept',
  washer_accepted: 'Washer assigned — preparing to head out',
  heading_to_you: 'Currently heading to you',
  arrived_onsite: 'Washer is on site — vehicle condition check next',
  awaiting_arrival_approval: 'Review vehicle condition — approve to start the wash',
  arrival_approved: 'Condition approved — washer can begin the wash',
  wash_in_progress: 'Currently washing your vehicle',
};

export function currentMilestoneStatusPhrase(milestone) {
  return CURRENT_MILESTONE_STATUS[milestone] ?? null;
}

function milestoneIndex(key) {
  return CUSTOMER_MILESTONE_ORDER.indexOf(key);
}

/**
 * @param {{ status?: string; service_phase?: string | null }} booking
 * @param {{ live?: boolean } | null} [tracking]
 */
export function deriveCustomerMilestone(booking, tracking = null) {
  if (!booking) return 'payment_received';
  const status = String(booking.status || 'pending');

  if (status === 'cancelled') return 'cancelled';
  if (status === 'completed') return 'completed';

  const phase = booking.service_phase;
  if (phase && phase !== 'cancelled' && milestoneIndex(phase) >= 0) {
    return phase;
  }

  if (status === 'in_progress') return 'wash_in_progress';
  if (status === 'confirmed') {
    if (tracking?.live) return 'heading_to_you';
    return 'washer_accepted';
  }
  if (status === 'pending') return 'awaiting_acceptance';
  return 'payment_received';
}

function milestoneDone(stepIndex, currentIndex, milestoneKey) {
  if (stepIndex < currentIndex) return true;
  if (stepIndex === currentIndex && !IN_PROGRESS_MILESTONES.has(milestoneKey)) return true;
  return false;
}

/**
 * @param {string} milestone
 * @returns {Array<{ key: string; label: string; done: boolean; statusLabel: string; subCheckpoints: string[]; isCurrent: boolean }>}
 */
export function buildCustomerMilestoneTimeline(milestone) {
  if (milestone === 'cancelled') {
    return [
      {
        key: 'placed',
        label: 'Booking placed',
        done: true,
        statusLabel: 'Completed',
        subCheckpoints: ['Payment was processed before cancel'],
        isCurrent: false,
      },
      {
        key: 'cancelled',
        label: 'Cancelled',
        done: true,
        statusLabel: 'Completed',
        subCheckpoints: ['Slot released · contact support if needed'],
        isCurrent: false,
      },
    ];
  }

  const idx = milestoneIndex(milestone);
  if (idx === -1) return [];

  return CUSTOMER_MILESTONE_ORDER.map((key, i) => {
    const meta = MILESTONE_META[key];
    const done = milestoneDone(i, idx, key);
    const isCurrent = i === idx && IN_PROGRESS_MILESTONES.has(key);
    const isCurrentDone = i === idx && !IN_PROGRESS_MILESTONES.has(key);

    let statusLabel = 'Up next';
    if (done && !isCurrent) statusLabel = 'Completed';
    else if (isCurrent) {
      if (key === 'awaiting_arrival_approval') statusLabel = 'Waiting for your OK';
      else statusLabel = CURRENT_MILESTONE_STATUS[key] ?? 'In progress';
    } else if (isCurrentDone) statusLabel = 'Completed';

    return {
      key,
      label: meta?.label ?? key,
      done: done || isCurrentDone,
      statusLabel,
      subCheckpoints: meta?.subCheckpoints ?? [],
      isCurrent: isCurrent || (isCurrentDone && milestone === 'completed' && key === 'completed'),
    };
  });
}

export function servicePhaseForWasherPhase(washerPhase) {
  return WASHER_PHASE_TO_SERVICE_PHASE[washerPhase] ?? null;
}

