import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { partnerBookingsService } from '../services/partnerBookingsService';
import { partnerTrackingService } from '../services/partnerTrackingService';
import { mapBookingDetail, mapTracking } from '../lib/partnerMappers';
import { onPartnerBookingsSync } from '../lib/partnerSyncEvents';

const TRACKING_POLL_MS = 8_000;

function normalizeJobError(err) {
  const raw = err?.message || 'Could not load job';
  if (raw.includes('status code')) {
    const match = raw.match(/status code (\d+)/i);
    if (match) return `Request failed (${match[1]}). Check the backend logs and try again.`;
  }
  return raw;
}

/**
 * Single-job realtime adapter.
 *
 * Pulls `GET /bookings/{id}` once, then polls `GET /bookings/{id}/tracking`
 * every {@link TRACKING_POLL_MS} milliseconds while the booking is active.
 * Booking-level changes are picked up via the global `partnerSyncEvents`
 * bus (driven by `usePartnerBookingSync`), so we don't run a second timer
 * for the detail payload.
 */
export default function usePartnerJob(bookingId) {
  const [detail, setDetail] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingError, setTrackingError] = useState(null);
  const aliveRef = useRef(true);
  const stateRef = useRef({ status: null });

  const fetchDetail = useCallback(async () => {
    if (!bookingId) return;
    try {
      const data = await partnerBookingsService.getById(bookingId);
      if (!aliveRef.current) return;
      const mapped = mapBookingDetail(data);
      if (!mapped) {
        setError('Invalid job data from server.');
        setDetail(null);
        return;
      }
      setDetail(mapped);
      stateRef.current.status = mapped?.status || null;
      setError(null);
    } catch (e) {
      if (!aliveRef.current) return;
      setError(normalizeJobError(e));
      setDetail(null);
      throw e;
    }
  }, [bookingId]);

  const fetchTracking = useCallback(async () => {
    if (!bookingId) return;
    try {
      const data = await partnerTrackingService.getBookingTracking(bookingId);
      if (!aliveRef.current) return;
      setTracking(mapTracking(data));
      setTrackingError(null);
    } catch (e) {
      if (!aliveRef.current) return;
      setTrackingError(normalizeJobError(e));
    }
  }, [bookingId]);

  useEffect(() => {
    aliveRef.current = true;
    if (!bookingId) {
      setLoading(false);
      setError('Missing booking id.');
      return () => {
        aliveRef.current = false;
      };
    }

    setLoading(true);
    setError(null);
    (async () => {
      try {
        await fetchDetail();
        await fetchTracking();
      } catch {
        /* error state set in fetchDetail */
      } finally {
        if (aliveRef.current) setLoading(false);
      }
    })();

    return () => {
      aliveRef.current = false;
    };
  }, [bookingId, fetchDetail, fetchTracking]);

  useEffect(() => {
    if (!bookingId) return undefined;
    const id = setInterval(() => {
      const status = stateRef.current.status;
      if (status === 'completed' || status === 'cancelled') return;
      fetchTracking();
    }, TRACKING_POLL_MS);
    return () => clearInterval(id);
  }, [bookingId, fetchTracking]);

  useEffect(() => onPartnerBookingsSync(() => fetchDetail()), [fetchDetail]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        fetchDetail().catch(() => {});
        fetchTracking();
      }
    });
    return () => sub.remove();
  }, [fetchDetail, fetchTracking]);

  const refresh = useCallback(async () => {
    await fetchDetail();
    await fetchTracking();
  }, [fetchDetail, fetchTracking]);

  return {
    detail,
    tracking,
    loading,
    error,
    trackingError,
    refresh,
    refetchDetail: fetchDetail,
  };
}
