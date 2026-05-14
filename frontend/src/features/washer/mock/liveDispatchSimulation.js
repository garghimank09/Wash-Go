import { PACKAGES } from '../../../constants/config';

import { dismissMockIncoming, getMockIncomingRequests } from './incomingRequests';

const LIVE_KEY = 'washgo:washer:liveDispatchOffers';

const LIVE_TEMPLATES = [
  {
    customerName: 'Morgan Ellis',
    vehicle: 'Audi A4 · Navarra blue',
    packageId: 'deluxe',
    packageLabel: PACKAGES.find((p) => p.id === 'deluxe')?.label ?? 'Deluxe',
    earningsCents: 7100,
    address: '450 Hayes St, San Francisco',
    etaMinutes: 9,
    windowLabel: 'Live window · accept in',
  },
  {
    customerName: 'Casey Nguyen',
    vehicle: 'Toyota RAV4',
    packageId: 'premium',
    packageLabel: PACKAGES.find((p) => p.id === 'premium')?.label ?? 'Premium',
    earningsCents: 9400,
    address: '2000 Union St, San Francisco',
    etaMinutes: 16,
    windowLabel: 'Surge zone · expires in',
  },
  {
    customerName: 'Taylor Brooks',
    vehicle: 'Mercedes GLC',
    packageId: 'basic',
    packageLabel: PACKAGES.find((p) => p.id === 'basic')?.label ?? 'Basic',
    earningsCents: 4800,
    address: '55 Page St, San Francisco',
    etaMinutes: 22,
    windowLabel: 'Stacked offer · hold',
  },
];

function emitDispatchUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('washgo:dispatch-update'));
  }
}

export function readLiveOffers() {
  try {
    const raw = sessionStorage.getItem(LIVE_KEY);
    const list = Array.isArray(JSON.parse(raw || '[]')) ? JSON.parse(raw || '[]') : [];
    const now = Date.now();
    const fresh = list.filter((o) => o && typeof o.expiresAt === 'number' && o.expiresAt > now);
    if (fresh.length !== list.length) {
      sessionStorage.setItem(LIVE_KEY, JSON.stringify(fresh));
    }
    return fresh;
  } catch {
    return [];
  }
}

function writeLiveOffers(list) {
  try {
    sessionStorage.setItem(LIVE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  emitDispatchUpdate();
}

/** Simulated dispatch pings — auto-expire; dismiss uses same path as mock offers. */
export function appendLiveOffer(offer) {
  const cur = readLiveOffers();
  cur.push(offer);
  writeLiveOffers(cur);
}

export function trySpawnLiveDispatchOffer({ online, maxLive = 2 }) {
  if (!online || typeof window === 'undefined') return false;
  const live = readLiveOffers();
  if (live.length >= maxLive) return false;
  if (Math.random() > 0.28) return false;
  const t = LIVE_TEMPLATES[Math.floor(Math.random() * LIVE_TEMPLATES.length)];
  const ttl = 78000 + Math.floor(Math.random() * 28000);
  appendLiveOffer({
    ...t,
    id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    expiresAt: Date.now() + ttl,
    isLiveSim: true,
  });
  return true;
}

/** Static mock offers + simulated live offers (prunes expired). */
export function getMergedIncomingRequests() {
  const staticList = getMockIncomingRequests();
  const live = readLiveOffers();
  return [...live, ...staticList];
}

export function dismissIncomingOffer(id) {
  if (String(id).startsWith('live-')) {
    const next = readLiveOffers().filter((o) => o.id !== id);
    writeLiveOffers(next);
    return;
  }
  dismissMockIncoming(id);
}
