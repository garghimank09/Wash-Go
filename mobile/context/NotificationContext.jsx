import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { deriveNotificationsFromBookings } from '../lib/notificationDerivation';
import { computeFeedUnread, useNotificationFeed } from '../hooks/useNotificationFeed';
import { customerNotificationsApi } from '../services/notificationsApiService';
import { bookingService } from '../services/bookingService';
import {
  loadDismissedIds,
  loadLastReadAt,
  saveDismissedIds,
  saveLastReadAt,
} from '../services/notificationService';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [lastReadAt, setLastReadAt] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async () => {
    return bookingService.getBookings();
  }, []);

  const { items, loading, reload } = useNotificationFeed({
    enabled: isAuthenticated,
    apiService: customerNotificationsApi,
    deriveFromBookings: deriveNotificationsFromBookings,
    loadBookings,
    portal: 'customer',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [dismissed, lastRead] = await Promise.all([
        loadDismissedIds(),
        loadLastReadAt(),
      ]);
      if (cancelled) return;
      setDismissedIds(new Set(dismissed));
      setLastReadAt(lastRead);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleNotifications = useMemo(
    () => items.filter((n) => !dismissedIds.has(n.id)),
    [items, dismissedIds],
  );

  const unreadCount = useMemo(() => {
    if (!hydrated) return 0;
    return computeFeedUnread(visibleNotifications, { lastReadAt });
  }, [visibleNotifications, lastReadAt, hydrated]);

  const persistDismissed = useCallback(async (nextSet) => {
    setDismissedIds(nextSet);
    await saveDismissedIds([...nextSet]);
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

  const markAsRead = useCallback(
    async (id) => {
      const row = items.find((n) => n.id === id);
      if (row?.fromApi) {
        try {
          await customerNotificationsApi.markRead(id);
          await reload(true);
        } catch {
          /* ignore */
        }
      }
      const ts = Math.max(lastReadAt ?? 0, row?.createdAt ?? Date.now());
      setLastReadAt(ts);
      await saveLastReadAt(ts);
    },
    [items, lastReadAt, reload],
  );

  const markAllRead = useCallback(async () => {
    try {
      await customerNotificationsApi.markAllRead();
    } catch {
      /* ignore */
    }
    const now = Date.now();
    setLastReadAt(now);
    await saveLastReadAt(now);
    await reload(true);
  }, [reload]);

  const clearAll = useCallback(async () => {
    const next = new Set(dismissedIds);
    items.forEach((n) => next.add(n.id));
    await persistDismissed(next);
  }, [dismissedIds, items, persistDismissed]);

  const refreshFromBookings = useCallback(
    (bookings) => {
      void reload(true);
    },
    [reload],
  );

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
      notifications: visibleNotifications,
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
      refreshFromBookings,
      refresh: handleRefresh,
    }),
    [
      visibleNotifications,
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
      refreshFromBookings,
      handleRefresh,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}
