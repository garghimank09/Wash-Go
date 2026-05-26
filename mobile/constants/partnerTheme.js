/**
 * Partner-specific design tokens layered on top of the customer theme.
 * Use `getPartnerStatus(statusId, isDark)` to grab gradient + label + glow + icon for a status.
 */

export const PARTNER_STATUSES = [
  'online_accepting',
  'online_busy',
  'on_break',
  'offline',
];

const STATUS_TOKENS = {
  light: {
    online_accepting: {
      label: 'Accepting',
      shortLabel: 'On',
      gradient: ['#10b981', '#06b6d4'],
      bgSoft: 'rgba(16,185,129,0.10)',
      fg: '#047857',
      dot: '#10b981',
      glow: 'rgba(16,185,129,0.45)',
      icon: 'Zap',
      description: 'Receiving new offers',
    },
    online_busy: {
      label: 'Busy',
      shortLabel: 'Busy',
      gradient: ['#f59e0b', '#fb923c'],
      bgSoft: 'rgba(245,158,11,0.12)',
      fg: '#b45309',
      dot: '#f59e0b',
      glow: 'rgba(245,158,11,0.40)',
      icon: 'Hourglass',
      description: 'On a job — paused from new offers',
    },
    on_break: {
      label: 'On break',
      shortLabel: 'Break',
      gradient: ['#6366f1', '#8b5cf6'],
      bgSoft: 'rgba(99,102,241,0.12)',
      fg: '#4338ca',
      dot: '#8b5cf6',
      glow: 'rgba(99,102,241,0.40)',
      icon: 'Coffee',
      description: 'Stepping away for a moment',
    },
    offline: {
      label: 'Offline',
      shortLabel: 'Off',
      gradient: ['#94a3b8', '#64748b'],
      bgSoft: 'rgba(100,116,139,0.10)',
      fg: '#475569',
      dot: '#94a3b8',
      glow: 'rgba(100,116,139,0.18)',
      icon: 'Power',
      description: 'Not receiving offers',
    },
  },
  dark: {
    online_accepting: {
      label: 'Accepting',
      shortLabel: 'On',
      gradient: ['#0ea371', '#0891b2'],
      bgSoft: 'rgba(16,185,129,0.16)',
      fg: '#34d399',
      dot: '#34d399',
      glow: 'rgba(52,211,153,0.50)',
      icon: 'Zap',
      description: 'Receiving new offers',
    },
    online_busy: {
      label: 'Busy',
      shortLabel: 'Busy',
      gradient: ['#d97706', '#ea580c'],
      bgSoft: 'rgba(245,158,11,0.18)',
      fg: '#fbbf24',
      dot: '#fbbf24',
      glow: 'rgba(251,191,36,0.40)',
      icon: 'Hourglass',
      description: 'On a job — paused from new offers',
    },
    on_break: {
      label: 'On break',
      shortLabel: 'Break',
      gradient: ['#4f46e5', '#7c3aed'],
      bgSoft: 'rgba(99,102,241,0.20)',
      fg: '#a5b4fc',
      dot: '#a5b4fc',
      glow: 'rgba(165,180,252,0.40)',
      icon: 'Coffee',
      description: 'Stepping away for a moment',
    },
    offline: {
      label: 'Offline',
      shortLabel: 'Off',
      gradient: ['#475569', '#334155'],
      bgSoft: 'rgba(148,163,184,0.12)',
      fg: '#94a3b8',
      dot: '#94a3b8',
      glow: 'rgba(148,163,184,0.20)',
      icon: 'Power',
      description: 'Not receiving offers',
    },
  },
};

export function getPartnerStatus(statusId, isDark = false) {
  const palette = isDark ? STATUS_TOKENS.dark : STATUS_TOKENS.light;
  return palette[statusId] || palette.offline;
}

export const PARTNER_SURGE = {
  light: {
    gradient: ['#3b82f6', '#22d3ee'],
    pulseRing: 'rgba(59,130,246,0.30)',
    badgeBg: 'rgba(59,130,246,0.14)',
    badgeFg: '#1d4ed8',
    accent: '#0ea5e9',
  },
  dark: {
    gradient: ['#2563eb', '#06b6d4'],
    pulseRing: 'rgba(96,165,250,0.40)',
    badgeBg: 'rgba(96,165,250,0.20)',
    badgeFg: '#93c5fd',
    accent: '#38bdf8',
  },
};

export function getPartnerSurge(isDark = false) {
  return isDark ? PARTNER_SURGE.dark : PARTNER_SURGE.light;
}

/**
 * Notification type tokens for the partner notification panel.
 * Falls back to a neutral cyan token when an unknown type is passed.
 */
export const PARTNER_NOTIF_TYPES = {
  light: {
    new_booking_request: { fg: '#0e7490', bg: 'rgba(6,182,212,0.16)', icon: 'Sparkles' },
    customer_cancelled: { fg: '#b91c1c', bg: 'rgba(248,113,113,0.14)', icon: 'CircleX' },
    washer_accepted: { fg: '#047857', bg: 'rgba(16,185,129,0.16)', icon: 'CircleCheck' },
    washer_arrived: { fg: '#1d4ed8', bg: 'rgba(59,130,246,0.16)', icon: 'MapPin' },
    payment_completed: { fg: '#7c3aed', bg: 'rgba(124,58,237,0.14)', icon: 'Wallet' },
    surge_alert: { fg: '#0284c7', bg: 'rgba(56,189,248,0.14)', icon: 'TrendingUp' },
    reschedule: { fg: '#4338ca', bg: 'rgba(99,102,241,0.14)', icon: 'CalendarClock' },
    rating: { fg: '#b45309', bg: 'rgba(245,158,11,0.14)', icon: 'Star' },
  },
  dark: {
    new_booking_request: { fg: '#22d3ee', bg: 'rgba(34,211,238,0.18)', icon: 'Sparkles' },
    customer_cancelled: { fg: '#fca5a5', bg: 'rgba(248,113,113,0.18)', icon: 'CircleX' },
    washer_accepted: { fg: '#34d399', bg: 'rgba(52,211,153,0.18)', icon: 'CircleCheck' },
    washer_arrived: { fg: '#93c5fd', bg: 'rgba(96,165,250,0.18)', icon: 'MapPin' },
    payment_completed: { fg: '#c4b5fd', bg: 'rgba(167,139,250,0.18)', icon: 'Wallet' },
    surge_alert: { fg: '#7dd3fc', bg: 'rgba(56,189,248,0.18)', icon: 'TrendingUp' },
    reschedule: { fg: '#a5b4fc', bg: 'rgba(129,140,248,0.18)', icon: 'CalendarClock' },
    rating: { fg: '#fbbf24', bg: 'rgba(245,158,11,0.18)', icon: 'Star' },
  },
};

const PARTNER_NOTIF_ALIASES = {
  booking_paid: 'new_booking_request',
  membership_subscribed: 'surge_alert',
  membership_active: 'rating',
};

export function getPartnerNotifStyle(type, isDark = false) {
  const palette = isDark ? PARTNER_NOTIF_TYPES.dark : PARTNER_NOTIF_TYPES.light;
  const key = PARTNER_NOTIF_ALIASES[type] || type;
  return palette[key] || palette.new_booking_request;
}

/**
 * Geometry tokens shared across partner surfaces — the floating tab bar
 * uses these for safe-area math.
 */
export const PARTNER_LAYOUT = {
  tabBar: {
    height: 52,
    horizontalMargin: 20,
    /** Used only when device safe-area bottom is 0. */
    bottomGap: 8,
    /** Small float gap above content (not including scrim). */
    floatOffset: 4,
    /** Visual fade above bar — does not add to layout inset. */
    scrimHeight: 14,
    scrollEndPadding: 12,
    radius: 22,
    indicatorInset: 5,
    iconSize: 20,
  },
  card: {
    radius: 22,
    radiusLg: 28,
  },
};

/**
 * Total height reserved at the screen bottom for tab bar + safe area + scrim.
 * Apply on the partner layout wrapper so content never draws under the chrome.
 */
export function getPartnerTabBarOccupiedHeight(insetsBottom = 0) {
  const { height, bottomGap, floatOffset } = PARTNER_LAYOUT.tabBar;
  const safeBottom = Math.max(insetsBottom, bottomGap);
  return safeBottom + height + floatOffset;
}

/** Extra padding at the end of a ScrollView (after layout inset). */
export function getPartnerScrollEndPadding() {
  return PARTNER_LAYOUT.tabBar.scrollEndPadding;
}

/**
 * Full scroll content padding when the layout does NOT reserve tab chrome.
 * @deprecated Prefer layout inset + getPartnerScrollEndPadding.
 */
export function getPartnerContentPadding(insetsBottom = 0) {
  return getPartnerTabBarOccupiedHeight(insetsBottom) + getPartnerScrollEndPadding();
}

export function getPartnerShadow(isDark = false) {
  return {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.35 : 0.10,
      shadowRadius: 18,
      elevation: 6,
    },
    rim: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.30 : 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    glow: (color) => ({
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 16,
      elevation: 8,
    }),
  };
}
