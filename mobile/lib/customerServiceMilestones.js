/**
 * Customer-facing service milestones — synced from booking.service_phase.
 * Ported from frontend/src/lib/customerServiceMilestones.js
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
    label: 'Finding your washer',
    subCheckpoints: [
      'Paid job visible to nearby partners',
      'First available washer can accept',
      'You will be notified when accepted',
    ],
  },
  washer_accepted: {
    label: 'Washer assigned',
    subCheckpoints: [
      'Partner assigned to your booking',
      'Service window confirmed',
      'En-route updates when they head out',
    ],
  },
  heading_to_you: {
    label: 'Washer on the way',
    subCheckpoints: [
      'Live map shows washer movement',
      'ETA updates as they drive',
      'Route optimized to your service address',
    ],
  },
  arrived_onsite: {
    label: 'Washer arrived',
    subCheckpoints: [
      'Washer checked in at your location',
      'Vehicle condition photo coming next',
      'You may meet them at the vehicle',
    ],
  },
  awaiting_arrival_approval: {
    label: 'Review vehicle condition',
    subCheckpoints: [
      'Washer documented your vehicle’s condition',
      'Review the photo and any notes',
      'Approve so the wash can start',
    ],
  },
  arrival_approved: {
    label: 'Condition approved',
    subCheckpoints: [
      'You approved the documented condition',
      'Washer can begin the wash',
      'Before and after photos will follow',
    ],
  },
  wash_in_progress: {
    label: 'Wash in progress',
    subCheckpoints: [
      'Service timer running',
      'Quality checks during the wash',
      'Before and after photos for your records',
    ],
  },
  completed: {
    label: 'Service completed',
    subCheckpoints: [
      'Service finished',
      'Final QC cleared',
      'Rate your experience anytime',
    ],
  },
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

export const CURRENT_MILESTONE_STATUS = {
  awaiting_acceptance: 'Waiting for a washer to accept',
  washer_accepted: 'Washer assigned — preparing to head out',
  heading_to_you: 'Currently heading to you',
  arrived_onsite: 'Washer is on site',
  awaiting_arrival_approval: 'Review vehicle condition to start the wash',
  arrival_approved: 'Condition approved — wash starting',
  wash_in_progress: 'Currently washing your vehicle',
};

export function currentMilestoneStatusPhrase(milestone) {
  return CURRENT_MILESTONE_STATUS[milestone] ?? null;
}

function milestoneIndex(key) {
  return CUSTOMER_MILESTONE_ORDER.indexOf(key);
}

/**
 * @param {{ status?: string; service_phase?: string | null; handoff_status?: string }} booking
 * @param {{ live?: boolean } | null} [tracking]
 */
export function deriveCustomerMilestone(booking, tracking = null) {
  if (!booking) return 'payment_received';
  const status = String(booking.status || 'pending');

  if (status === 'cancelled') return 'cancelled';
  if (status === 'completed') return 'completed';

  const phase = booking.service_phase || booking.servicePhase;
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
 */
export function buildCustomerMilestoneTimeline(milestone) {
  if (milestone === 'cancelled') {
    return [
      {
        key: 'placed',
        label: 'Booking placed',
        done: true,
        statusLabel: 'Completed',
        subCheckpoints: [],
        isCurrent: false,
      },
      {
        key: 'cancelled',
        label: 'Cancelled',
        done: true,
        statusLabel: 'Completed',
        subCheckpoints: [],
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
      statusLabel = CURRENT_MILESTONE_STATUS[key] ?? 'In progress';
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
