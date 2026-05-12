import { useCallback, useEffect, useState } from 'react';

import { bookingsService } from '../services/bookingsService';
import { getErrorMessage } from '../services/api';

export function useBookings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return { items, loading, error, reload };
}
