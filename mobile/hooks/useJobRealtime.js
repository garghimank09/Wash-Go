import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { partnerBookingsService } from '../services/partnerBookingsService';
import {
  apiStatusForPhase,
  effectiveWasherPhase,
  setStoredPhase,
} from '../lib/washerJobPhase';
import { getNextPhase, buildInitialTimelineEvents, findPhase } from '../lib/jobPhases';

/**
 * Drives the active-job screen.
 *
 * Bridges the local washer-side phase ladder (granular UX states) with the
 * backend booking status (5 coarse states). The hook exposes the same shape
 * the UI used to consume from the mock realtime stream, so the screen code
 * stays nearly identical, but now every advance results in a real
 * `PATCH /bookings/{id}/status` (with optimistic update + rollback).
 */
export default function useJobRealtime({
  bookingId,
  apiStatus,
  tracking,
  initialPhase,
}) {
  const [phase, setPhase] = useState(initialPhase || 'accepted');
  const [events, setEvents] = useState(() => buildInitialTimelineEvents(initialPhase || 'accepted'));
  const [connection, setConnection] = useState('connected');
  const advancingRef = useRef(false);

  // Reconcile the local phase against the backend floor whenever the API status changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = await effectiveWasherPhase(bookingId, apiStatus);
      if (cancelled) return;
      setPhase((current) => (next !== current ? next : current));
      setEvents((prev) => {
        const hasNext = prev.some((e) => e.phase === next);
        if (hasNext) return prev;
        return buildInitialTimelineEvents(next);
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId, apiStatus]);

  // Foreground/background → simple connection indicator (no real socket today).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        setConnection('reconnecting');
        setTimeout(() => setConnection('connected'), 600);
      } else if (s === 'background') {
        setConnection('offline');
      }
    });
    return () => sub.remove();
  }, []);

  const advance = useCallback(
    async (targetPhase) => {
      if (advancingRef.current) return phase;
      const next = targetPhase || getNextPhase(phase).id;
      if (!next || next === phase) return phase;

      const prevPhase = phase;
      advancingRef.current = true;
      setPhase(next);
      setEvents((evts) => [
        ...evts,
        { id: `evt-${next}-${Date.now()}`, phase: next, at: Date.now() },
      ]);
      await setStoredPhase(bookingId, next);

      const targetStatus = apiStatusForPhase(next);
      if (targetStatus && targetStatus !== apiStatus) {
        try {
          await partnerBookingsService.updateStatus(bookingId, targetStatus);
        } catch (err) {
          // Roll back the local advance so the UI stays honest.
          setPhase(prevPhase);
          setEvents((evts) => evts.filter((e) => e.phase !== next));
          await setStoredPhase(bookingId, prevPhase);
          advancingRef.current = false;
          throw err;
        }
      }

      advancingRef.current = false;
      return next;
    },
    [bookingId, phase, apiStatus],
  );

  const api = useMemo(
    () => ({
      advance,
      dismissAlert: () => {},
      pushAlert: () => {},
      setProgress: () => {},
    }),
    [advance],
  );

  return {
    phase,
    events,
    connection,
    etaMinutes: tracking?.etaMinutes ?? null,
    distanceKm: tracking?.distanceKm ?? null,
    washerCoord: tracking?.washerCoord || null,
    customerCoord: tracking?.customerCoord || null,
    route: tracking?.route || [],
    alerts: [],
    findPhase,
    ...api,
  };
}
