import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAdminBookings } from '../../../hooks/useAdminBookings';
import { onBookingsSync } from '../../../lib/bookingSyncEvents';
import { adminLiveAlertTemplates, adminLiveFeed } from '../mock/adminMock';

const MAX_FEED = 8;

function buildFeedFromBookings(items) {
  const rows = [];
  for (const b of items.slice(0, 5)) {
    const label = b.customer_name || 'Customer';
    if (b.status === 'pending' && !b.washer_id) {
      rows.push({
        id: `sync-${b.id}-pending`,
        type: 'dispatch',
        severity: 'warn',
        title: `Unassigned · ${label}`,
        time: 'Live',
        source: 'live',
      });
    } else if (b.status === 'in_progress') {
      rows.push({
        id: `sync-${b.id}-prog`,
        type: 'job',
        severity: 'info',
        title: `In progress · ${label}`,
        time: 'Live',
        source: 'live',
      });
    } else if (b.status === 'completed') {
      rows.push({
        id: `sync-${b.id}-done`,
        type: 'complete',
        severity: 'success',
        title: `Completed · ${label}`,
        time: 'Live',
        source: 'live',
      });
    }
  }
  return rows;
}

/**
 * Live ops snapshot from API + booking-driven feed items (SSE-refreshed).
 */
export function useAdminLiveOps(enabled = true) {
  const { items, liveOpsSnapshot } = useAdminBookings();
  const snapshot = useMemo(() => liveOpsSnapshot, [liveOpsSnapshot]);

  const [feedItems, setFeedItems] = useState(() =>
    [...buildFeedFromBookings([]), ...(adminLiveFeed || [])].slice(0, MAX_FEED),
  );
  const [tickVersion, setTickVersion] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());

  const refreshFeed = useCallback(() => {
    const live = buildFeedFromBookings(items);
    const demo = (adminLiveFeed || []).map((f) => ({ ...f, source: 'demo' }));
    setFeedItems([...live, ...demo].slice(0, MAX_FEED));
    setTickVersion((v) => v + 1);
    setLastUpdatedAt(Date.now());
  }, [items]);

  useEffect(() => {
    if (!enabled) return undefined;
    refreshFeed();
    return onBookingsSync(refreshFeed);
  }, [enabled, refreshFeed]);

  useEffect(() => {
    if (!enabled || items.length > 0) return undefined;
    const tpl = adminLiveAlertTemplates;
    const id = window.setInterval(() => {
      const t = tpl[Math.floor(Math.random() * tpl.length)];
      setFeedItems((prev) =>
        [
          {
            id: `synth-${Date.now()}`,
            type: t.type,
            severity: t.severity,
            title: t.title,
            time: 'Demo',
            source: 'demo',
          },
          ...prev,
        ].slice(0, MAX_FEED),
      );
    }, 45000);
    return () => window.clearInterval(id);
  }, [enabled, items.length]);

  return {
    snapshot,
    feedItems,
    tickVersion,
    lastUpdatedAt,
    pulseLive: enabled,
  };
}
