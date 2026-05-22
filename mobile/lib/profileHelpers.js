/** Fallback saved addresses when no booking history exists (no backend address API). */
export const MOCK_SAVED_ADDRESSES = [
  {
    id: 'home',
    label: 'Home',
    address: 'Tower B, Sector 56, Gurgaon, Haryana',
    icon: 'home',
    primary: true,
  },
  {
    id: 'work',
    label: 'Work',
    address: 'Cyber Hub, DLF Phase 3, Gurgaon',
    icon: 'work',
    primary: false,
  },
];

/**
 * Derive unique service addresses from recent bookings; merge with mock fallbacks.
 * @param {Array<{ id: string, service_address?: string }>} bookings
 */
export function deriveSavedAddresses(bookings = []) {
  const seen = new Set();
  const fromBookings = [];

  for (const b of bookings) {
    const addr = b.service_address?.trim();
    if (!addr || seen.has(addr)) continue;
    seen.add(addr);
    fromBookings.push({
      id: `booking-${b.id}`,
      label: fromBookings.length === 0 ? 'Recent' : 'Saved',
      address: addr,
      icon: 'place',
      primary: fromBookings.length === 0,
    });
    if (fromBookings.length >= 3) break;
  }

  if (fromBookings.length >= 2) return fromBookings;

  const extras = MOCK_SAVED_ADDRESSES.filter((m) => !seen.has(m.address));
  return [...fromBookings, ...extras].slice(0, 3);
}

/** Profile completion score from available fields (0–100). */
export function profileCompletionScore({ fullName, email, phone, avatarUrl }) {
  let score = 0;
  if (fullName?.trim()) score += 30;
  if (email?.trim()) score += 25;
  if (phone?.trim()) score += 25;
  if (avatarUrl) score += 20;
  return Math.min(100, score);
}

export function initialOf(name) {
  if (!name) return '?';
  const t = String(name).trim();
  return t ? t[0].toUpperCase() : '?';
}
