import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { onBookingsSync } from '../lib/bookingSyncEvents';
import { bookingsService } from '../services/bookingsService';
import { getErrorMessage } from '../services/api';

/**
 * Fetches booking detail (timeline, washer, ETA) when an active booking id is present.
 * GET only when `bookingId` is truthy; ignores stale responses when id changes.
 * Refreshes silently when live sync detects booking changes.
 */
export function useActiveBookingDetail(bookingId) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const idRef = useRef(bookingId);

  const load = useCallback(async (silent = false) => {
    const id = idRef.current;
    if (!id) return;
    if (!silent) {
      setError(null);
      setLoading(true);
    }
    try {
      const data = await bookingsService.get(id);
      if (idRef.current !== id) return;
      setDetail(data);
      setError(null);
    } catch (e) {
      if (idRef.current !== id) return;
      if (!silent) {
        setError(getErrorMessage(e));
        setDetail(null);
      }
    } finally {
      if (idRef.current === id && !silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    idRef.current = bookingId;
    if (!bookingId) return undefined;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      void load(false);
    });
    return () => {
      cancelled = true;
    };
  }, [bookingId, load]);

  useEffect(() => {
    if (!bookingId) return undefined;
    return onBookingsSync(() => void load(true));
  }, [bookingId, load]);

  const resolvedDetail = useMemo(() => {
    if (!bookingId || !detail?.id) return null;
    return String(detail.id) === String(bookingId) ? detail : null;
  }, [bookingId, detail]);

  const resolvedLoading = !!bookingId && loading && !resolvedDetail && !error;
  const resolvedError = bookingId ? error : null;

  return { detail: resolvedDetail, loading: resolvedLoading, error: resolvedError, refresh: () => load(false) };
}
