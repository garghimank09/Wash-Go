import { partnerApiFetch } from './partnerApiClient';

/**
 * GET / PATCH /partner/availability — drives the partner online/offline switch.
 *
 * Backend exposes a boolean (`is_available`) plus a free-text `service_area`.
 * The mobile UI maps its four states (`online_accepting`, `online_busy`,
 * `paused`, `offline`) onto `is_available` per the mapping documented in
 * {@link statusToAvailable}.
 */
export const partnerAvailabilityService = {
  get({ signal } = {}) {
    return partnerApiFetch('/partner/availability', { auth: true, signal });
  },
  setAvailable(isAvailable) {
    return partnerApiFetch('/partner/availability', {
      method: 'PATCH',
      auth: true,
      body: { is_available: !!isAvailable },
    });
  },
};

/** Only `online_accepting` exposes the partner to dispatch. */
export function statusToAvailable(status) {
  return status === 'online_accepting';
}

/** Reverse mapping when bootstrapping from the backend. */
export function availableToStatus(isAvailable) {
  return isAvailable ? 'online_accepting' : 'offline';
}
