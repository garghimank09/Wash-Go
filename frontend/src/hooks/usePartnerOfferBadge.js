import { useEffect, useState } from 'react';

import { onBookingsSync } from '../lib/bookingSyncEvents';
import { partnerBookingsService } from '../services/partnerBookingsService';

/** Offer count for partner nav badges — live-synced. */
export function usePartnerOfferBadge() {
  const [badge, setBadge] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      try {
        const data = await partnerBookingsService.listOffers();
        if (!cancelled) setBadge((data.items || []).length);
      } catch {
        if (!cancelled) setBadge(0);
      }
    };
    void sync();
    const unsub = onBookingsSync(() => void sync());
    const id = setInterval(() => void sync(), 15000);
    return () => {
      cancelled = true;
      unsub();
      clearInterval(id);
    };
  }, []);

  return badge;
}
