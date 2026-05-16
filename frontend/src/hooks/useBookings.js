import { useCallback, useEffect, useState } from 'react';

import { onBookingsSync } from '../lib/bookingSyncEvents';
import { bookingsService } from '../services/bookingsService';
import { getErrorMessage } from '../services/api';

export function useBookings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reloadSilent = useCallback(async () => {
    try {
      const data = await bookingsService.list();
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
      const data = await bookingsService.list();
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
