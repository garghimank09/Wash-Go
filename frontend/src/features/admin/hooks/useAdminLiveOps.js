import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  adminLiveAlertTemplates,
  adminLiveFeed,
  adminLiveOpsSnapshot,
} from '../mock/adminMock';

const MAX_FEED = 8;
const TICK_MS_MIN = 22000;
const TICK_MS_MAX = 38000;

let alertSeq = 0;

function nextTickMs() {
  return TICK_MS_MIN + Math.floor(Math.random() * (TICK_MS_MAX - TICK_MS_MIN));
}

/**
 * Live ops snapshot + throttled synthetic feed (investor-safe, no API).
 */
export function useAdminLiveOps(enabled = true) {
  const snapshot = useMemo(() => adminLiveOpsSnapshot, []);
  const [feedItems, setFeedItems] = useState(() =>
    (adminLiveFeed || []).map((x) => ({ ...x, severity: x.severity || 'info' })),
  );
  const [tickVersion, setTickVersion] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());

  const appendSynthetic = useCallback(() => {
    const tpl = adminLiveAlertTemplates[Math.floor(Math.random() * adminLiveAlertTemplates.length)];
    alertSeq += 1;
    const row = {
      id: `live-${Date.now()}-${alertSeq}`,
      type: tpl.type,
      severity: tpl.severity,
      title: tpl.title,
      time: 'Just now',
    };
    setFeedItems((prev) => [row, ...prev].slice(0, MAX_FEED));
    setTickVersion((v) => v + 1);
    setLastUpdatedAt(Date.now());
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    const schedule = () => {
      const ms = nextTickMs();
      return window.setTimeout(() => {
        if (cancelled) return;
        appendSynthetic();
        timeoutId = schedule();
      }, ms);
    };
    let timeoutId = schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [enabled, appendSynthetic]);

  return {
    snapshot,
    feedItems,
    tickVersion,
    lastUpdatedAt,
    pulseLive: enabled,
  };
}
