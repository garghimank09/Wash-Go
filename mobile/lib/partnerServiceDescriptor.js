/**
 * Single-line service descriptor for partner cards from booking `notes` only.
 * Decodes WashGo pipe metadata (same encoding as customer booking flow) and
 * maps IDs to catalog labels from pricingService.
 */

import { decodeBookingMeta } from '../services/bookingService';
import { getPackage, getVehicleSize } from '../services/pricingService';

const DESC_MAX_LEN = 42;

function truncateNotes(text) {
  const t = String(text).replace(/\s+/g, ' ').trim();
  if (!t) return null;
  if (t.length <= DESC_MAX_LEN) return t;
  return `${t.slice(0, DESC_MAX_LEN - 1)}…`;
}

/**
 * @param {string | null | undefined} notes — backend `booking.notes`
 * @returns {string | null} compact line for payout row, or null to omit
 */
export function formatPartnerServiceDescriptor(notes) {
  if (notes == null || typeof notes !== 'string') return null;
  const trimmed = notes.trim();
  if (!trimmed) return null;

  const { packageId, vehicleSize } = decodeBookingMeta(trimmed);
  if (packageId && vehicleSize) {
    const pkg = getPackage(packageId);
    const size = getVehicleSize(vehicleSize);
    const tier = pkg.label.replace(/\s*wash\s*$/i, '').trim() || pkg.label;
    return `${tier} ${size.label} Wash`;
  }

  return truncateNotes(trimmed);
}
