import { PACKAGES } from '../../../constants/config';

const DISMISSED_KEY = 'washgo:washer:mockIncomingDismissed';

function getDismissed() {
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function dismissMockIncoming(id) {
  const s = getDismissed();
  s.add(id);
  sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...s]));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('washgo:dispatch-update'));
  }
}

/** Premium demo offers — no backend until dispatch connects. */
export function getMockIncomingRequests() {
  const dismissed = getDismissed();
  const all = [
    {
      id: 'mock-in-1',
      customerName: 'Jordan Lee',
      vehicle: 'BMW 330i · Pearl white',
      packageId: 'premium',
      packageLabel: PACKAGES.find((p) => p.id === 'premium')?.label ?? 'Premium',
      earningsCents: 8900,
      address: '1420 Market St, San Francisco',
      etaMinutes: 12,
      windowLabel: 'Today · 3:10 PM – 3:40 PM',
    },
    {
      id: 'mock-in-2',
      customerName: 'Sam Patel',
      vehicle: 'Honda CR-V',
      packageId: 'deluxe',
      packageLabel: PACKAGES.find((p) => p.id === 'deluxe')?.label ?? 'Deluxe',
      earningsCents: 6200,
      address: '88 Spear St, San Francisco',
      etaMinutes: 28,
      windowLabel: 'Today · 4:00 PM slot',
    },
    {
      id: 'mock-in-3',
      customerName: 'Riley Chen',
      vehicle: 'Tesla Model Y',
      packageId: 'basic',
      packageLabel: PACKAGES.find((p) => p.id === 'basic')?.label ?? 'Basic',
      earningsCents: 4100,
      address: '1 Ferry Building',
      etaMinutes: 44,
      windowLabel: 'Tomorrow · 9:30 AM',
    },
  ];
  return all.filter((r) => !dismissed.has(r.id));
}
