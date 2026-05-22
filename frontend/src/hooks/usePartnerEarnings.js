import { useCallback, useEffect, useState } from 'react';

import { onBookingsSync } from '../lib/bookingSyncEvents';
import { computePartnerEarningsFromBookings } from '../lib/partnerEarnings';
import { getErrorMessage } from '../services/api';
import { partnerEarningsService } from '../services/partnerEarningsService';

/**
 * @param {import('../hooks/usePartnerBookings').usePartnerBookings} bookingsHook
 */
export function usePartnerEarnings(bookingsHook) {
  const { items: bookings, loading: bookingsLoading } = bookingsHook ?? { items: [], loading: true };
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await partnerEarningsService.getSummary();
      setSummary(data);
    } catch (e) {
      setError(getErrorMessage(e));
      setSummary(computePartnerEarningsFromBookings(bookings));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [bookings]);

  useEffect(() => {
    void reload(false);
  }, [reload]);

  useEffect(() => onBookingsSync(() => void reload(true)), [reload]);

  const loadingAny = loading || bookingsLoading;

  return { summary, loading: loadingAny, error, reload };
}
