import { useCallback, useMemo, useState } from 'react';

const KEY = 'washgo:washer:availability';

const defaultState = () => ({
  online: true,
  acceptingJobs: true,
  busy: false,
  onBreak: false,
});

function read() {
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

function write(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function useWasherAvailability() {
  const [state, setState] = useState(() => read());

  const setOnline = useCallback(
    (online) => {
      setState((prev) => {
        const next = {
          ...prev,
          online,
          acceptingJobs: online ? prev.acceptingJobs : false,
          busy: online ? prev.busy : false,
          onBreak: online ? prev.onBreak : false,
        };
        write(next);
        return next;
      });
    },
    [],
  );

  const setAcceptingJobs = useCallback((acceptingJobs) => {
    setState((prev) => {
      if (!prev.online) return prev;
      const next = { ...prev, acceptingJobs, busy: acceptingJobs ? prev.busy : false };
      write(next);
      return next;
    });
  }, []);

  const setBusy = useCallback((busy) => {
    setState((prev) => {
      if (!prev.online) return prev;
      const next = { ...prev, busy, acceptingJobs: busy ? false : prev.acceptingJobs };
      write(next);
      return next;
    });
  }, []);

  const setOnBreak = useCallback((onBreak) => {
    setState((prev) => {
      if (!prev.online) return prev;
      const next = {
        ...prev,
        onBreak,
        acceptingJobs: onBreak ? false : prev.acceptingJobs,
        busy: onBreak ? false : prev.busy,
      };
      write(next);
      return next;
    });
  }, []);

  const summary = useMemo(() => {
    if (!state.online) return 'Offline';
    if (state.onBreak) return 'On break';
    if (state.busy) return 'Busy';
    if (!state.acceptingJobs) return 'Paused';
    return 'Accepting jobs';
  }, [state]);

  return { ...state, summary, setOnline, setAcceptingJobs, setBusy, setOnBreak };
}
