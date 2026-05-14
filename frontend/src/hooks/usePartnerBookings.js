import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../services/api';
import { partnerBookingsService } from '../services/partnerBookingsService';

/** Bookings list for partner console — uses partner JWT only. */
export function usePartnerBookings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return { items, loading, error, reload };
}
