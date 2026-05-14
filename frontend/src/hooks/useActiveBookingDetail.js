import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { bookingsService } from '../services/bookingsService';
import { getErrorMessage } from '../services/api';

/**
 * Fetches booking detail (timeline, washer, ETA) when an active booking id is present.
 * GET only when `bookingId` is truthy; ignores stale responses when id changes.
 */
export function useActiveBookingDetail(bookingId) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const idRef = useRef(bookingId);

  const load = useCallback(async () => {
    const id = idRef.current;
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const data = await bookingsService.get(id);
      if (idRef.current !== id) return;
      setDetail(data);
    } catch (e) {
      if (idRef.current !== id) return;
      setError(getErrorMessage(e));
      setDetail(null);
    } finally {
      if (idRef.current === id) setLoading(false);
    }
  }, []);

  useEffect(() => {
    idRef.current = bookingId;
    if (!bookingId) return undefined;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      void load();
    });
    return () => {
      cancelled = true;
    };
  }, [bookingId, load]);

  const resolvedDetail = useMemo(() => {
    if (!bookingId || !detail?.id) return null;
    return String(detail.id) === String(bookingId) ? detail : null;
  }, [bookingId, detail]);

  const resolvedLoading = !!bookingId && loading && !resolvedDetail && !error;
  const resolvedError = bookingId ? error : null;

  return { detail: resolvedDetail, loading: resolvedLoading, error: resolvedError, refresh: load };
}
