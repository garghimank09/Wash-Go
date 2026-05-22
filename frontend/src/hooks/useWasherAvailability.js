import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { dispatchBookingsSync } from '../lib/bookingSyncEvents';
import { partnerAvailabilityService } from '../services/partnerAvailabilityService';

const KEY = 'washgo:washer:availability';

const defaultState = () => ({
  online: true,
  acceptingJobs: true,
  busy: false,
  onBreak: false,
});

function readLocal() {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

function writeLocal(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

/** True when washer should appear in admin dispatch pool. */
function dispatchAvailable(state) {
  return Boolean(state.online && state.acceptingJobs && !state.busy && !state.onBreak);
}

export function useWasherAvailability() {
  const [state, setState] = useState(() => readLocal());
  const [profile, setProfile] = useState(null);
  const syncTimer = useRef(null);
  const skipNextSync = useRef(false);

  const pushAvailability = useCallback(async (nextState) => {
    try {
      await partnerAvailabilityService.update(dispatchAvailable(nextState));
      dispatchBookingsSync();
    } catch {
      /* offline / logged out */
    }
  }, []);

  const applyState = useCallback(
    (updater, { sync = true } = {}) => {
      setState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        writeLocal(next);
        if (sync && !skipNextSync.current) {
          if (syncTimer.current) clearTimeout(syncTimer.current);
          syncTimer.current = setTimeout(() => void pushAvailability(next), 280);
        }
        return next;
      });
    },
    [pushAvailability],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await partnerAvailabilityService.get();
        if (cancelled) return;
        setProfile(data);
        skipNextSync.current = true;
        applyState((prev) => {
          const available = Boolean(data.is_available);
          if (!available) {
            return { ...prev, online: prev.online, acceptingJobs: false, busy: false, onBreak: false };
          }
          return { ...prev, online: true, acceptingJobs: true };
        }, { sync: false });
        skipNextSync.current = false;
      } catch {
        /* partner not logged in */
      }
    })();
    return () => {
      cancelled = true;
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [applyState]);

  const setOnline = useCallback(
    (online) => {
      applyState((prev) => ({
        ...prev,
        online,
        acceptingJobs: online ? prev.acceptingJobs : false,
        busy: online ? prev.busy : false,
        onBreak: online ? prev.onBreak : false,
      }));
    },
    [applyState],
  );

  const setAcceptingJobs = useCallback(
    (acceptingJobs) => {
      applyState((prev) => {
        if (!prev.online) return prev;
        return {
          ...prev,
          acceptingJobs,
          busy: acceptingJobs ? prev.busy : false,
        };
      });
    },
    [applyState],
  );

  const setBusy = useCallback(
    (busy) => {
      applyState((prev) => {
        if (!prev.online) return prev;
        return {
          ...prev,
          busy,
          onBreak: busy ? false : prev.onBreak,
          acceptingJobs: busy ? false : prev.acceptingJobs,
        };
      });
    },
    [applyState],
  );

  const setOnBreak = useCallback(
    (onBreak) => {
      applyState((prev) => {
        if (!prev.online) return prev;
        return {
          ...prev,
          onBreak,
          busy: onBreak ? false : prev.busy,
          acceptingJobs: onBreak ? false : prev.acceptingJobs,
        };
      });
    },
    [applyState],
  );

  const workMode = useMemo(() => {
    if (!state.online) return 'offline';
    if (state.onBreak) return 'break';
    if (state.busy) return 'busy';
    if (state.acceptingJobs) return 'accepting';
    return 'idle';
  }, [state]);

  const summary = useMemo(() => {
    if (!state.online) return 'Offline';
    if (state.onBreak) return 'On break';
    if (state.busy) return 'Busy on job';
    if (!state.acceptingJobs) return 'Not accepting';
    return 'Accepting offers';
  }, [state]);

  return {
    ...state,
    workMode,
    summary,
    profile,
    setOnline,
    setAcceptingJobs,
    setBusy,
    setOnBreak,
  };
};
