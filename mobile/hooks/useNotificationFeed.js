import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { onBookingsSync } from '../lib/bookingSyncEvents';
import { onPartnerBookingsSync } from '../lib/partnerSyncEvents';
import { onNotificationsSync } from '../lib/notificationSyncEvents';
import {
  countUnread,
  dedupeById,
  mapApiNotification,
  mergeNotificationFeeds,
} from '../lib/notificationModel';

const DEFAULT_POLL_MS = 25_000;

/**
 * Shared realtime notification feed: poll + booking/notif sync events + dedupe.
 */
export function useNotificationFeed({
  enabled,
  apiService,
  deriveFromBookings,
  loadBookings,
  portal = 'customer',
  fallbackPath,
  pollMs = DEFAULT_POLL_MS,
}) {
  const resolvedFallback =
    fallbackPath ??
    (portal === 'partner' ? '/(partner)/home' : '/(customer)/bookings');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);

  const reload = useCallback(
    async (silent = false) => {
      if (!enabled || inFlightRef.current) return;
      inFlightRef.current = true;
      if (!silent) setLoading(true);
      try {
        let apiRows = [];
        if (apiService) {
          const data = await apiService.list();
          apiRows = (data.items ?? []).map((row) =>
            mapApiNotification(row, { portal, fallbackPath: resolvedFallback }),
          );
        }

        let derived = [];
        if (deriveFromBookings && loadBookings) {
          const bookings = await loadBookings();
          derived = deriveFromBookings(bookings) || [];
        }

        const merged = dedupeById(mergeNotificationFeeds(apiRows, derived));
        if (!mountedRef.current) return;
        setItems(merged);
      } catch {
        /* keep last good feed */
      } finally {
        if (mountedRef.current && !silent) setLoading(false);
        inFlightRef.current = false;
      }
    },
    [enabled, apiService, deriveFromBookings, loadBookings, portal, resolvedFallback],
  );

  useEffect(() => {
    mountedRef.current = true;
    if (!enabled) {
      setItems([]);
      return undefined;
    }

    void reload(false);
    const pollId = setInterval(() => void reload(true), pollMs);
    const offBookings =
      portal === 'partner'
        ? onPartnerBookingsSync(() => void reload(true))
        : onBookingsSync(() => void reload(true));
    const offNotif = onNotificationsSync(() => void reload(true));
    const appSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void reload(true);
    });

    return () => {
      mountedRef.current = false;
      clearInterval(pollId);
      offBookings();
      offNotif();
      appSub.remove();
    };
  }, [enabled, reload, pollMs, portal]);

  return { items, loading, reload };
}

export function computeFeedUnread(visibleItems, { lastReadAt }) {
  return countUnread(visibleItems, { lastReadAt });
}
