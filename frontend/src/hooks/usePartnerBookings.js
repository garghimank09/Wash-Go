import { useCallback, useEffect, useState } from 'react';

import { onBookingsSync } from '../lib/bookingSyncEvents';
import { getErrorMessage } from '../services/api';
import { partnerBookingsService } from '../services/partnerBookingsService';

/** Bookings list for partner console — uses partner JWT only. */
export function usePartnerBookings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reloadSilent = useCallback(async () => {
    try {
      const data = await partnerBookingsService.list();
      setItems(data.items || []);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, []);

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await partnerBookingsService.list();
      setItems(data.items || []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void reload();
    }, 0);
    return () => clearTimeout(t);
  }, [reload]);

  useEffect(() => onBookingsSync(() => void reloadSilent()), [reloadSilent]);

  return { items, loading, error, reload };
}
