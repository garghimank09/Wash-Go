export const BOOKING_FILTER_IDS = ['All', 'Active', 'Completed', 'Cancelled'];

export const BOOKING_FILTERS = [
  { id: 'All', label: 'All' },
  { id: 'Active', label: 'Active' },
  { id: 'Completed', label: 'Completed' },
  { id: 'Cancelled', label: 'Cancelled' },
];

/** Filter chip colors — separate from theme for light/dark via getBookingFilterStyle */
export const BOOKING_FILTER_STYLES = {
  light: {
    All: {
      fg: '#475569',
      bg: 'rgba(100,116,139,0.12)',
      border: 'rgba(100,116,139,0.25)',
      dot: '#64748b',
    },
    Active: {
      fg: '#0e7490',
      bg: 'rgba(6,182,212,0.14)',
      border: 'rgba(6,182,212,0.35)',
      dot: '#06b6d4',
    },
    Completed: {
      fg: '#047857',
      bg: 'rgba(16,185,129,0.14)',
      border: 'rgba(16,185,129,0.30)',
      dot: '#10b981',
    },
    Cancelled: {
      fg: '#c2410c',
      bg: 'rgba(248,113,113,0.12)',
      border: 'rgba(248,113,113,0.28)',
      dot: '#f87171',
    },
  },
  dark: {
    All: {
      fg: '#94a3b8',
      bg: 'rgba(148,163,184,0.12)',
      border: 'rgba(148,163,184,0.22)',
      dot: '#94a3b8',
    },
    Active: {
      fg: '#22d3ee',
      bg: 'rgba(34,211,238,0.14)',
      border: 'rgba(34,211,238,0.35)',
      dot: '#22d3ee',
    },
    Completed: {
      fg: '#34d399',
      bg: 'rgba(52,211,153,0.14)',
      border: 'rgba(52,211,153,0.30)',
      dot: '#34d399',
    },
    Cancelled: {
      fg: '#fb923c',
      bg: 'rgba(251,146,60,0.12)',
      border: 'rgba(251,146,60,0.28)',
      dot: '#fb923c',
    },
  },
};

export function getBookingFilterStyle(filterId, isDark) {
  const palette = isDark ? BOOKING_FILTER_STYLES.dark : BOOKING_FILTER_STYLES.light;
  return palette[filterId] || palette.All;
}
