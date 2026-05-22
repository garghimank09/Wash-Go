import { useCallback, useEffect, useState } from 'react';

import { onBookingsSync } from '../lib/bookingSyncEvents';
import { onNotificationsSync } from '../lib/notificationSyncEvents';
import { getErrorMessage } from '../services/api';

const POLL_MS = 25_000;

/**
 * @param {ReturnType<import('../services/notificationsService').createNotificationsService>} service
 */
export function useNotifications(service) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await service.list();
      setItems(data.items ?? []);
      setUnreadCount(data.unread_count ?? 0);
    } catch (err) {
      if (!silent) console.warn('notifications', getErrorMessage(err));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    void reload(false);
    const poll = window.setInterval(() => void reload(true), POLL_MS);
    const offBookings = onBookingsSync(() => void reload(true));
    const offNotif = onNotificationsSync(() => void reload(true));
    return () => {
      window.clearInterval(poll);
      offBookings();
      offNotif();
    };
  }, [reload]);

  const markRead = useCallback(
    async (id) => {
      await service.markRead(id);
      await reload(true);
    },
    [service, reload],
  );

  const markAllRead = useCallback(async () => {
    await service.markAllRead();
    await reload(true);
  }, [service, reload]);

  return { items, unreadCount, loading, reload, markRead, markAllRead };
}
