import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { partnerBookingsService } from '../services/partnerBookingsService';
import {
  apiStatusForPhase,
  effectiveWasherPhase,
  setStoredPhase,
} from '../lib/washerJobPhase';
import { getNextPhase, buildInitialTimelineEvents, findPhase } from '../lib/jobPhases';
import { emitPartnerBookingsSync } from '../lib/partnerSyncEvents';
import { emitNotificationsSync } from '../lib/notificationSyncEvents';

/**
 * Drives the active-job screen.
 *
 * Bridges the local washer-side phase ladder (granular UX states) with the
 * backend booking status (5 coarse states). Matches web `WasherJobPage.onAdvance`:
 * only PATCH when `apiStatusForPhase(next)` differs from the current API status.
 */
export default function useJobRealtime({
  bookingId,
  apiStatus,
  tracking,
  initialPhase,
  onStatusSynced,
}) {
  const [phase, setPhase] = useState(initialPhase || 'accepted');
  const [events, setEvents] = useState(() => buildInitialTimelineEvents(initialPhase || 'accepted'));
  const [connection, setConnection] = useState('connected');
  const advancingRef = useRef(false);

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

      const targetStatus = apiStatusForPhase(next);
      const needsApiWrite =
        Boolean(targetStatus) &&
        Boolean(apiStatus) &&
        targetStatus !== apiStatus;
      const needsHandoffRequest = next === 'approval_pending';

      try {
        if (needsHandoffRequest) {
          await partnerBookingsService.requestHandoff(bookingId);
          emitPartnerBookingsSync({ source: 'handoff_request', bookingId });
          emitNotificationsSync({ source: 'handoff_request', bookingId });
        } else if (needsApiWrite) {
          await partnerBookingsService.updateStatus(bookingId, targetStatus);
          emitPartnerBookingsSync({ source: 'status_update', bookingId });
          emitNotificationsSync({ source: 'status_update', bookingId });
          await onStatusSynced?.();
        }

        setPhase(next);
        setEvents((evts) => [
          ...evts,
          { id: `evt-${next}-${Date.now()}`, phase: next, at: Date.now() },
        ]);
        await setStoredPhase(bookingId, next);
      } catch (err) {
        advancingRef.current = false;
        throw err;
      }

      advancingRef.current = false;
      return next;
    },
    [bookingId, phase, apiStatus, onStatusSynced],
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
