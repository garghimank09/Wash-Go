import { useCallback, useEffect, useState } from 'react';

import { onBookingsSync } from '../lib/bookingSyncEvents';
import { bookingsService } from '../services/bookingsService';
import { getErrorMessage } from '../services/api';

export function useBookings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    setRefreshing(true);
    try {
      const data = await bookingsService.list();
      setItems(data.items || []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await bookingsService.list();
        if (!cancelled) {
          setItems(data.items || []);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => onBookingsSync(() => void reloadSilent()), [reloadSilent]);

  return { items, loading, refreshing, error, reload };
}
