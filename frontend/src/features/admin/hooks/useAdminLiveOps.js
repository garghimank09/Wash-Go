import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAdminBookings } from '../../../hooks/useAdminBookings';
import { onBookingsSync } from '../../../lib/bookingSyncEvents';

const MAX_FEED = 8;

function buildFeedFromBookings(items) {
  const rows = [];
  for (const b of items.slice(0, 12)) {
    const label = b.customer_name || 'Customer';
    const when = b.updated_at || b.scheduled_at;
    const timeLabel = when
      ? new Date(when).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
      : 'Live';
    if (b.status === 'pending' && !b.washer_id) {
      rows.push({
        id: `sync-${b.id}-pending`,
        type: 'dispatch',
        severity: 'warn',
        title: `Unassigned · ${label}`,
        time: timeLabel,
        source: 'live',
      });
    } else if (b.status === 'in_progress') {
      rows.push({
        id: `sync-${b.id}-prog`,
        type: 'job',
        severity: 'info',
        title: `In progress · ${label}`,
        time: timeLabel,
        source: 'live',
      });
    } else if (b.status === 'completed') {
      rows.push({
        id: `sync-${b.id}-done`,
        type: 'complete',
        severity: 'success',
        title: `Completed · ${label}`,
        time: timeLabel,
        source: 'live',
      });
    } else if (b.status === 'confirmed') {
      rows.push({
        id: `sync-${b.id}-conf`,
        type: 'booking',
        severity: 'info',
        title: `Confirmed · ${label}`,
        time: timeLabel,
        source: 'live',
      });
    }
  }
  return rows.sort((a, b) => (a.time < b.time ? 1 : -1)).slice(0, MAX_FEED);
}

/**
 * Live ops snapshot from API + booking-driven feed items (SSE-refreshed).
 */
export function useAdminLiveOps(enabled = true) {
  const { items, liveOpsSnapshot } = useAdminBookings();
  const snapshot = useMemo(() => liveOpsSnapshot, [liveOpsSnapshot]);

  const [feedItems, setFeedItems] = useState([]);
  const [tickVersion, setTickVersion] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());

  const refreshFeed = useCallback(() => {
    setFeedItems(buildFeedFromBookings(items));
    setTickVersion((v) => v + 1);
    setLastUpdatedAt(Date.now());
  }, [items]);

  useEffect(() => {
    if (!enabled) return undefined;
    refreshFeed();
    return onBookingsSync(refreshFeed);
  }, [enabled, refreshFeed]);

  return {
    snapshot,
    feedItems,
    tickVersion,
    lastUpdatedAt,
    pulseLive: enabled,
  };
}
