import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';

import { useNotifications } from '../hooks/useNotifications';
import { cn } from '../lib/cn';
import { Button } from '../ui/button';

function resolvePath(notification, fallback) {
  const path = notification?.data?.path;
  if (typeof path === 'string' && path.startsWith('/')) return path;
  if (notification?.data?.booking_id) return `/bookings/${notification.data.booking_id}`;
  return fallback;
}

function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * @param {ReturnType<import('../services/notificationsService').createNotificationsService>} service
 * @param {string} [defaultPath] fallback when notification has no path
 */
export function NotificationBell({ service, defaultPath = '/dashboard' }) {
  const navigate = useNavigate();
  const { items, unreadCount, loading, markRead, markAllRead } = useNotifications(service);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const handleSelect = async (n) => {
    if (!n.read) await markRead(n.id);
    setOpen(false);
    navigate(resolvePath(n, defaultPath));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-wg-border/90 bg-wg-surface-elevated/80 text-wg-text transition hover:border-cyan-500/35 wg-focus-ring',
          'dark:border-white/10 dark:bg-white/[0.06]',
        )}
        aria-label={unreadCount ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-expanded={open}
      >
        <Bell className="size-5" strokeWidth={1.75} aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[1.125rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-white/25 bg-[color:var(--wg-glass-bg)] shadow-xl backdrop-blur-xl dark:border-white/10"
          role="menu"
        >
          <div className="flex items-center justify-between gap-2 border-b border-wg-border/80 px-4 py-3">
            <p className="text-sm font-bold text-wg-text">Notifications</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
                onClick={() => void markAllRead()}
              >
                <CheckCheck className="size-3.5" aria-hidden />
                Mark all read
              </button>
            ) : null}
          </div>
          <ul className="max-h-[min(60vh,20rem)] overflow-y-auto">
            {loading && items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-wg-muted">Loading…</li>
            ) : items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-wg-muted">No notifications yet</li>
            ) : (
              items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    role="menuitem"
                    className={cn(
                      'w-full border-b border-wg-border/60 px-4 py-3 text-left transition last:border-0 hover:bg-wg-surface/80 dark:hover:bg-white/[0.04]',
                      !n.read && 'bg-cyan-500/5',
                    )}
                    onClick={() => void handleSelect(n)}
                  >
                    <p className="text-sm font-semibold text-wg-text">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-wg-muted">{n.body}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-wg-muted/80">
                      {formatWhen(n.created_at)}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
