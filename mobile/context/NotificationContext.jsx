import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { deriveNotificationsFromBookings } from '../lib/notificationDerivation';
import {
  loadDismissedIds,
  loadLastReadAt,
  saveDismissedIds,
  saveLastReadAt,
} from '../services/notificationService';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [lastReadAt, setLastReadAt] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

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
    () => notifications.filter((n) => !dismissedIds.has(n.id)),
    [notifications, dismissedIds]
  );

  const unreadCount = useMemo(() => {
    if (!hydrated) return 0;
    const readCutoff = lastReadAt ?? 0;
    return visibleNotifications.filter((n) => n.createdAt > readCutoff).length;
  }, [visibleNotifications, lastReadAt, hydrated]);

  const refreshFromBookings = useCallback((bookings) => {
    const derived = deriveNotificationsFromBookings(bookings || []);
    setNotifications(derived);
  }, []);

  const persistDismissed = useCallback(async (nextSet) => {
    setDismissedIds(nextSet);
    await saveDismissedIds([...nextSet]);
  }, []);

  const openPanel = useCallback(() => {
    setPanelOpen(true);
    const now = Date.now();
    setLastReadAt(now);
    saveLastReadAt(now);
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
    [dismissedIds, persistDismissed]
  );

  const markAsRead = useCallback(async (id) => {
    const item = notifications.find((n) => n.id === id);
    if (!item) return;
    const ts = Math.max(lastReadAt ?? 0, item.createdAt);
    setLastReadAt(ts);
    await saveLastReadAt(ts);
  }, [notifications, lastReadAt]);

  const markAllRead = useCallback(async () => {
    const now = Date.now();
    setLastReadAt(now);
    await saveLastReadAt(now);
  }, []);

  const clearAll = useCallback(async () => {
    const next = new Set(dismissedIds);
    notifications.forEach((n) => next.add(n.id));
    await persistDismissed(next);
  }, [dismissedIds, notifications, persistDismissed]);

  const value = useMemo(
    () => ({
      notifications: visibleNotifications,
      allNotifications: notifications,
      unreadCount,
      lastReadAt,
      panelOpen,
      openPanel,
      closePanel,
      dismiss,
      clearAll,
      markAllRead,
      markAsRead,
      refreshFromBookings,
    }),
    [
      visibleNotifications,
      notifications,
      unreadCount,
      lastReadAt,
      panelOpen,
      openPanel,
      closePanel,
      dismiss,
      clearAll,
      markAllRead,
      markAsRead,
      refreshFromBookings,
    ]
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
