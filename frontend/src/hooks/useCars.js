import { useCallback, useEffect, useState } from 'react';

import { carsService } from '../services/carsService';
import { getErrorMessage } from '../services/api';

/** Cars list + count for dashboard and cars flows (same API as Cars page). */
export function useCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await carsService.list();
      setCars(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(getErrorMessage(e));
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void carsService
      .list()
      .then((list) => {
        if (!cancelled) {
          setCars(Array.isArray(list) ? list : []);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(getErrorMessage(e));
          setCars([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const count = cars.length;

  return { cars, count, loading, error, reload };
}
