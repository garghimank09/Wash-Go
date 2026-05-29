import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { partnerBookingsService } from '../services/partnerBookingsService';
import {
  apiStatusForPhase,
  effectiveWasherPhase,
  setStoredPhase,
} from '../lib/washerJobPhase';
import {
  advanceBlockedReason,
  canAdvanceUiPhase,
  servicePhaseForUiAdvance,
} from '../lib/jobPhaseMilestones';
import { getNextPhase, buildInitialTimelineEvents, findPhase } from '../lib/jobPhases';
import { emitPartnerBookingsSync } from '../lib/partnerSyncEvents';
import { emitNotificationsSync } from '../lib/notificationSyncEvents';

/**
 * Drives the active-job screen — mirrors web WasherJobPage.onAdvance:
 * PATCH milestone (service_phase) + status when needed.
 */
export default function useJobRealtime({
  bookingId,
  apiStatus,
  servicePhase = null,
  handoffStatus: _handoffStatus = null,
  hasArrivalPhoto = false,
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
      const next = await effectiveWasherPhase(bookingId, apiStatus, servicePhase);
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
  }, [bookingId, apiStatus, servicePhase]);

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

      if (!canAdvanceUiPhase(phase, { hasArrivalPhoto, servicePhase })) {
        const reason = advanceBlockedReason(phase, { hasArrivalPhoto, servicePhase });
        throw new Error(reason || 'Complete the step above first');
      }

      advancingRef.current = true;

      try {
        const targetStatus = apiStatusForPhase(next);
        if (targetStatus && apiStatus && targetStatus !== apiStatus) {
          await partnerBookingsService.updateStatus(bookingId, targetStatus);
        }

        const milestonePhase = servicePhaseForUiAdvance(next);
        if (milestonePhase) {
          await partnerBookingsService.updateMilestone(bookingId, milestonePhase);
        }

        emitPartnerBookingsSync({ source: 'milestone', bookingId, phase: milestonePhase });
        emitNotificationsSync({ source: 'milestone', bookingId });
        await onStatusSynced?.();

        setPhase(next);
        setEvents((evts) => [
          ...evts,
          { id: `evt-${next}-${Date.now()}`, phase: next, at: Date.now() },
        ]);
        await setStoredPhase(bookingId, next);
      } catch (err) {
        throw err;
      } finally {
        advancingRef.current = false;
      }

      return next;
    },
    [
      bookingId,
      phase,
      apiStatus,
      servicePhase,
      hasArrivalPhoto,
      onStatusSynced,
    ],
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
