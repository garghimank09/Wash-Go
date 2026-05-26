/**
 * Shared notification normalization for customer + partner mobile feeds.
 * Mirrors web `NotificationRead` + list response without changing backend contracts.
 */

export function startOfTodayMs() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function resolveNotificationGroup(createdAt) {
  const ts = Number(createdAt);
  if (!Number.isFinite(ts)) return 'today';
  return ts >= startOfTodayMs() ? 'today' : 'earlier';
}

/**
 * Map web notification `data.path` to Expo Router paths.
 */
export function resolveMobileNotificationPath({
  path,
  bookingId,
  portal = 'customer',
  fallbackPath,
}) {
  if (portal === 'partner') {
    if (bookingId) return `/(partner)/job/${bookingId}`;
    if (typeof path === 'string') {
      if (path === '/partner/requests' || path.startsWith('/partner/offers')) {
        return '/(partner)/offers';
      }
      const jobsMatch = path.match(/^\/partner\/jobs\/([^/]+)/);
      if (jobsMatch?.[1]) return `/(partner)/job/${jobsMatch[1]}`;
    }
    return fallbackPath || '/(partner)/home';
  }

  if (bookingId) return `/booking/${bookingId}`;
  if (typeof path === 'string' && path.startsWith('/')) {
    if (path.startsWith('/bookings')) return '/(customer)/bookings';
    if (path.startsWith('/dashboard')) return '/(customer)/dashboard';
  }
  return fallbackPath || '/(customer)/bookings';
}

export function isNotificationUnread(item, lastReadAt = 0) {
  if (!item) return false;
  if (item.fromApi) return !item.read;
  return item.createdAt > (lastReadAt ?? 0);
}

export function resolveBookingId(data) {
  if (!data) return null;
  return data.booking_id ?? data.bookingId ?? null;
}

/**
 * Map `GET /notifications` item → mobile feed row.
 * @param {object} item
 * @param {{ fallbackPath?: string, portal?: 'customer'|'partner' }} opts
 */
export function mapApiNotification(item, opts = {}) {
  const createdAt = item.created_at ? new Date(item.created_at).getTime() : Date.now();
  const bookingId = resolveBookingId(item.data);
  const path = resolveMobileNotificationPath({
    path: item.data?.path,
    bookingId,
    portal: opts.portal,
    fallbackPath: opts.fallbackPath,
  });

  return {
    id: String(item.id),
    type: item.notification_type || 'update',
    title: item.title || 'Notification',
    message: item.body || '',
    bookingId,
    path,
    createdAt,
    group: resolveNotificationGroup(createdAt),
    read: Boolean(item.read),
    fromApi: true,
    bookingRef: bookingId ? `#${String(bookingId).slice(0, 8)}` : null,
  };
}

/**
 * Merge API + locally derived rows; API wins on id collision.
 */
export function mergeNotificationFeeds(apiRows = [], derivedRows = []) {
  const map = new Map();
  for (const row of derivedRows) {
    if (row?.id) map.set(row.id, row);
  }
  for (const row of apiRows) {
    if (row?.id) map.set(row.id, row);
  }
  return [...map.values()].sort((a, b) => b.createdAt - a.createdAt);
}

export function groupNotificationsForUi(items = []) {
  const today = [];
  const earlier = [];
  for (const n of items) {
    const g = n.group || resolveNotificationGroup(n.createdAt);
    if (g === 'today') today.push(n);
    else earlier.push(n);
  }
  const sections = [];
  if (today.length) sections.push({ key: 'today', title: 'Today', data: today });
  if (earlier.length) sections.push({ key: 'earlier', title: 'Earlier', data: earlier });
  return sections;
}

/**
 * Unread: API uses `read` flag; derived rows use timestamp vs lastReadAt.
 */
export function countUnread(items, { lastReadAt = 0 } = {}) {
  const cutoff = lastReadAt ?? 0;
  return items.filter((n) => {
    if (n.fromApi) return !n.read;
    return n.createdAt > cutoff;
  }).length;
}

export function dedupeById(items) {
  const seen = new Set();
  return items.filter((n) => {
    if (!n?.id || seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });
}
