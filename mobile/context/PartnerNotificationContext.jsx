import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePartnerAuth } from './PartnerAuthContext';
import { derivePartnerNotificationsFromBookings } from '../lib/partnerNotificationDerivation';
import { computeFeedUnread, useNotificationFeed } from '../hooks/useNotificationFeed';
import { partnerNotificationsApi } from '../services/notificationsApiService';
import { partnerBookingsService } from '../services/partnerBookingsService';

const DISMISSED_KEY = '@washgo_partner_notif_dismissed';
const LAST_READ_KEY = '@washgo_partner_notif_last_read';

const PartnerNotificationContext = createContext(null);

export function PartnerNotificationProvider({ children }) {
  const { isPartnerAuthenticated } = usePartnerAuth();
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [lastReadAt, setLastReadAt] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async () => {
    const [assignedRaw, offersRaw] = await Promise.all([
      partnerBookingsService.list(),
      partnerBookingsService.listOffers().catch(() => []),
    ]);
    const assigned = Array.isArray(assignedRaw) ? assignedRaw : assignedRaw?.items ?? [];
    const offers = Array.isArray(offersRaw) ? offersRaw : offersRaw?.items ?? [];
    return { assigned, offers };
  }, []);

  const { items, loading, reload } = useNotificationFeed({
    enabled: isPartnerAuthenticated,
    apiService: partnerNotificationsApi,
    deriveFromBookings: derivePartnerNotificationsFromBookings,
    loadBookings,
    portal: 'partner',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dismissedRaw, lastReadRaw] = await Promise.all([
          AsyncStorage.getItem(DISMISSED_KEY),
          AsyncStorage.getItem(LAST_READ_KEY),
        ]);
        if (cancelled) return;
        if (dismissedRaw) {
          try {
            const parsed = JSON.parse(dismissedRaw);
            if (Array.isArray(parsed)) setDismissedIds(new Set(parsed));
          } catch {
            /* ignore */
          }
        }
        if (lastReadRaw) {
          const ts = Number(lastReadRaw);
          if (Number.isFinite(ts)) setLastReadAt(ts);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(
    () => items.filter((n) => !dismissedIds.has(n.id)),
    [items, dismissedIds],
  );

  const unreadCount = useMemo(() => {
    if (!hydrated) return 0;
    return computeFeedUnread(visible, { lastReadAt });
  }, [visible, lastReadAt, hydrated]);

  const persistDismissed = useCallback(async (nextSet) => {
    setDismissedIds(nextSet);
    try {
      await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify([...nextSet]));
    } catch {
      /* ignore */
    }
  }, []);

  const persistLastRead = useCallback(async (ts) => {
    setLastReadAt(ts);
    try {
      await AsyncStorage.setItem(LAST_READ_KEY, String(ts));
    } catch {
      /* ignore */
    }
  }, []);

  const openPanel = useCallback(() => {
    setPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  const dismiss = useCallback(
    async (id) => {
      const next = new Set(dismissedIds);
      next.add(id);
      await persistDismissed(next);
    },
    [dismissedIds, persistDismissed],
  );

  const clearAll = useCallback(async () => {
    const next = new Set(dismissedIds);
    items.forEach((n) => next.add(n.id));
    await persistDismissed(next);
  }, [dismissedIds, items, persistDismissed]);

  const markAsRead = useCallback(
    async (id) => {
      const row = items.find((n) => n.id === id);
      if (row?.fromApi) {
        try {
          await partnerNotificationsApi.markRead(id);
          await reload(true);
        } catch {
          /* ignore */
        }
      }
      const ts = Math.max(lastReadAt ?? 0, row?.createdAt ?? Date.now());
      await persistLastRead(ts);
    },
    [items, lastReadAt, persistLastRead, reload],
  );

  const markAllRead = useCallback(async () => {
    try {
      await partnerNotificationsApi.markAllRead();
    } catch {
      /* ignore */
    }
    await persistLastRead(Date.now());
    await reload(true);
  }, [persistLastRead, reload]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reload(true);
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  const value = useMemo(
    () => ({
      notifications: visible,
      allNotifications: items,
      unreadCount,
      lastReadAt,
      panelOpen,
      loading,
      refreshing,
      openPanel,
      closePanel,
      dismiss,
      clearAll,
      markAllRead,
      markAsRead,
      refresh: handleRefresh,
    }),
    [
      visible,
      items,
      unreadCount,
      lastReadAt,
      panelOpen,
      loading,
      refreshing,
      openPanel,
      closePanel,
      dismiss,
      clearAll,
      markAllRead,
      markAsRead,
      handleRefresh,
    ],
  );

  return (
    <PartnerNotificationContext.Provider value={value}>
      {children}
    </PartnerNotificationContext.Provider>
  );
}

export function usePartnerNotifications() {
  const ctx = useContext(PartnerNotificationContext);
  if (!ctx) {
    throw new Error('usePartnerNotifications must be used within PartnerNotificationProvider');
  }
  return ctx;
}
