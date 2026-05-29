/**
 * Maps mobile jobPhases UI ids ↔ backend service_phase for milestone PATCH.
 */

/** Persisted service_phase when advancing TO `toUiPhase`. */
export function servicePhaseForUiAdvance(toUiPhase) {
  switch (toUiPhase) {
    case 'heading':
      return 'heading_to_you';
    case 'arrived':
      return 'arrived_onsite';
    case 'service_started':
    case 'before_uploaded':
    case 'washing':
    case 'after_uploaded':
    case 'qc_complete':
      return 'wash_in_progress';
    case 'completed':
      return 'completed';
    default:
      return null;
  }
}

/**
 * Minimum UI phase implied by backend service_phase.
 * @param {string | null | undefined} servicePhase
 */
export function uiPhaseFromServicePhase(servicePhase, _handoffStatus = null) {
  if (servicePhase === 'completed') return 'completed';

  const map = {
    awaiting_acceptance: 'accepted',
    washer_accepted: 'accepted',
    heading_to_you: 'heading',
    arrived_onsite: 'arrived',
    awaiting_arrival_approval: 'arrived',
    arrival_approved: 'service_started',
    wash_in_progress: 'washing',
  };
  return map[servicePhase] || null;
}

/**
 * Whether the primary advance CTA should be blocked.
 */
export function canAdvanceUiPhase(phase, { hasArrivalPhoto, servicePhase }) {
  if (phase === 'completed') return true;

  if (phase === 'arrived') {
    if (!hasArrivalPhoto) return false;
    if (servicePhase === 'awaiting_arrival_approval') return false;
    if (servicePhase !== 'arrival_approved' && servicePhase !== 'wash_in_progress') return false;
  }

  if (phase === 'service_started' && servicePhase === 'awaiting_arrival_approval') {
    return false;
  }

  return phase !== 'completed';
}

export function advanceBlockedReason(phase, { hasArrivalPhoto, servicePhase }) {
  if (phase === 'arrived' && !hasArrivalPhoto) {
    return 'Capture the vehicle condition photo before continuing';
  }
  if (phase === 'arrived' && servicePhase === 'awaiting_arrival_approval') {
    return 'Waiting for the customer to approve the vehicle condition';
  }
  if (phase === 'arrived' && hasArrivalPhoto && servicePhase !== 'arrival_approved') {
    return 'Customer must approve the vehicle condition first';
  }
  return null;
}
