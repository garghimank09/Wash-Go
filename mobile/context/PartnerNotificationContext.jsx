import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DISMISSED_KEY = '@washgo_partner_notif_dismissed';
const LAST_READ_KEY = '@washgo_partner_notif_last_read';

const PartnerNotificationContext = createContext(null);

/**
 * Partner notification surface. The backend has no `/notifications` endpoint
 * for washers yet, so we start empty and let other parts of the app (offer
 * polling, booking sync, etc.) push notifications in via `addLocal` when
 * something noteworthy happens. The dismissal + last-read state is still
 * persisted so the UX behaves identically once a real feed lands.
 */
export function PartnerNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [lastReadAt, setLastReadAt] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

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
            /* ignore corrupt cache */
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

  const visible = useMemo(
    () => notifications.filter((n) => !dismissedIds.has(n.id)),
    [notifications, dismissedIds]
  );

  const unreadCount = useMemo(() => {
    if (!hydrated) return 0;
    const cutoff = lastReadAt ?? 0;
    return visible.filter((n) => n.createdAt > cutoff).length;
  }, [visible, lastReadAt, hydrated]);

  const openPanel = useCallback(() => {
    setPanelOpen(true);
    persistLastRead(Date.now());
  }, [persistLastRead]);

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

  const clearAll = useCallback(async () => {
    const next = new Set(dismissedIds);
    notifications.forEach((n) => next.add(n.id));
    await persistDismissed(next);
  }, [dismissedIds, notifications, persistDismissed]);

  const markAllRead = useCallback(async () => {
    await persistLastRead(Date.now());
  }, [persistLastRead]);

  const addLocal = useCallback((notif) => {
    if (!notif?.id) return;
    setNotifications((prev) => {
      if (prev.some((n) => n.id === notif.id)) return prev;
      return [notif, ...prev];
    });
  }, []);

  const value = useMemo(
    () => ({
      notifications: visible,
      allNotifications: notifications,
      unreadCount,
      lastReadAt,
      panelOpen,
      openPanel,
      closePanel,
      dismiss,
      clearAll,
      markAllRead,
      addLocal,
    }),
    [
      visible,
      notifications,
      unreadCount,
      lastReadAt,
      panelOpen,
      openPanel,
      closePanel,
      dismiss,
      clearAll,
      markAllRead,
      addLocal,
    ]
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
