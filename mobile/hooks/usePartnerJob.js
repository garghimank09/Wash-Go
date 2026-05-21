import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { partnerBookingsService } from '../services/partnerBookingsService';
import { partnerTrackingService } from '../services/partnerTrackingService';
import { mapBookingDetail, mapTracking } from '../lib/partnerMappers';
import { onPartnerBookingsSync } from '../lib/partnerSyncEvents';

const TRACKING_POLL_MS = 8_000;

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
  const aliveRef = useRef(true);
  const stateRef = useRef({ status: null });

  const fetchDetail = useCallback(async () => {
    if (!bookingId) return;
    try {
      const data = await partnerBookingsService.getById(bookingId);
      if (!aliveRef.current) return;
      const mapped = mapBookingDetail(data);
      setDetail(mapped);
      stateRef.current.status = mapped?.status || null;
      setError(null);
    } catch (e) {
      if (!aliveRef.current) return;
      setError(e?.message || 'Could not load job');
    }
  }, [bookingId]);

  const fetchTracking = useCallback(async () => {
    if (!bookingId) return;
    try {
      const data = await partnerTrackingService.getBookingTracking(bookingId);
      if (!aliveRef.current) return;
      setTracking(mapTracking(data));
    } catch {
      /* tracking is best-effort; swallow */
    }
  }, [bookingId]);

  useEffect(() => {
    aliveRef.current = true;
    setLoading(true);
    (async () => {
      await fetchDetail();
      await fetchTracking();
      if (aliveRef.current) setLoading(false);
    })();
    return () => {
      aliveRef.current = false;
    };
  }, [fetchDetail, fetchTracking]);

  // Poll tracking while job is open. Stop when complete/cancelled.
  useEffect(() => {
    if (!bookingId) return undefined;
    const id = setInterval(() => {
      const status = stateRef.current.status;
      if (status === 'completed' || status === 'cancelled') return;
      fetchTracking();
    }, TRACKING_POLL_MS);
    return () => clearInterval(id);
  }, [bookingId, fetchTracking]);

  // Booking-level updates piggy-back on the global sync poller.
  useEffect(() => onPartnerBookingsSync(() => fetchDetail()), [fetchDetail]);

  // Refresh when the app returns to the foreground.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        fetchDetail();
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
    refresh,
    refetchDetail: fetchDetail,
  };
}
