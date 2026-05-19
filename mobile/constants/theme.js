const palette = {
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
  },
  navy: {
    800: '#0f172a',
    850: '#080c1a',
    900: '#040810',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  white: '#ffffff',
  black: '#000000',
};

export const lightTheme = {
  dark: false,

  background: {
    primary: palette.white,
    secondary: palette.slate[50],
    tertiary: palette.slate[100],
    card: palette.white,
    hero: '#e0f2fe',
  },

  text: {
    primary: palette.slate[900],
    secondary: palette.slate[500],
    muted: palette.slate[400],
    inverse: palette.white,
    accent: palette.cyan[500],
  },

  border: {
    light: palette.slate[200],
    default: palette.slate[300],
    strong: palette.slate[400],
  },

  accent: {
    primary: palette.cyan[500],
    light: palette.cyan[100],
    dark: palette.cyan[700],
  },

  button: {
    primary: {
      background: palette.cyan[500],
      text: palette.white,
    },
    ghost: {
      background: palette.white,
      text: palette.slate[800],
      border: palette.slate[200],
    },
  },

  card: {
    background: palette.white,
    border: palette.slate[200],
    iconBackground: '#f0f9ff',
    iconColor: palette.cyan[500],
  },

  stat: {
    background: palette.white,
    border: palette.slate[200],
  },

  nav: {
    background: palette.white,
    border: palette.slate[200],
    active: palette.cyan[500],
    inactive: palette.slate[400],
    activePill: 'rgba(6,182,212,0.1)',
  },

  customer: {
    surface: palette.slate[50],
    surfaceContainerLow: palette.slate[100],
    surfaceContainerLowest: palette.white,
    outlineVariant: palette.slate[200],
    gradientStart: palette.cyan[700],
    gradientEnd: palette.cyan[500],
    secondary: '#2170e4',
    secondaryBg: 'rgba(33,112,228,0.1)',
    tertiary: '#e89337',
    tertiaryBg: 'rgba(232,147,55,0.1)',
    primaryBg: 'rgba(6,182,212,0.1)',
    primaryBgStrong: 'rgba(6,182,212,0.2)',
    plusBg: 'rgba(6,182,212,0.1)',
    error: '#dc2626',
  },

  badge: {
    success: { background: '#ecfdf5', text: '#059669' },
    info: { background: '#e0f2fe', text: '#0284c7' },
    warning: { background: '#fef3c7', text: '#92400e' },
    error: { background: '#fef2f2', text: '#dc2626' },
  },

  phases: {
    searching: { fg: '#b45309', bg: 'rgba(245,158,11,0.14)' },
    awaiting_acceptance: { fg: '#6d28d9', bg: 'rgba(139,92,246,0.14)' },
    accepted: { fg: palette.cyan[700], bg: 'rgba(6,182,212,0.10)' },
    on_the_way: { fg: '#1d4ed8', bg: 'rgba(59,130,246,0.14)' },
    in_progress: { fg: '#0e7490', bg: 'rgba(6,182,212,0.18)' },
    completed: { fg: '#047857', bg: 'rgba(16,185,129,0.14)' },
    cancelled: { fg: '#dc2626', bg: 'rgba(220,38,38,0.10)' },
  },

  notificationTypes: {
    searching: { fg: '#b45309', bg: 'rgba(245,158,11,0.16)', icon: 'search' },
    awaiting_acceptance: { fg: '#ea580c', bg: 'rgba(251,146,60,0.16)', icon: 'hourglass-empty' },
    accepted: { fg: '#4338ca', bg: 'rgba(99,102,241,0.14)', icon: 'event' },
    scheduled: { fg: '#4338ca', bg: 'rgba(99,102,241,0.14)', icon: 'event' },
    on_the_way: { fg: '#0891b2', bg: 'rgba(6,182,212,0.18)', icon: 'directions-car' },
    in_progress: { fg: '#6366f1', bg: 'rgba(99,102,241,0.14)', icon: 'local-car-wash' },
    completed: { fg: '#047857', bg: 'rgba(16,185,129,0.16)', icon: 'check-circle' },
    cancelled: { fg: '#c2410c', bg: 'rgba(248,113,113,0.14)', icon: 'cancel' },
    payment: { fg: '#0e7490', bg: 'rgba(6,182,212,0.14)', icon: 'payments' },
    reschedule: { fg: '#4338ca', bg: 'rgba(99,102,241,0.12)', icon: 'update' },
  },

  shadow: {
    sm: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
};

export const darkTheme = {
  dark: true,

  background: {
    primary: palette.navy[850],
    secondary: '#0d1224',
    tertiary: '#111827',
    card: 'rgba(255,255,255,0.04)',
    hero: 'rgba(34,211,238,0.08)',
  },

  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#475569',
    inverse: palette.navy[850],
    accent: palette.cyan[400],
  },

  border: {
    light: 'rgba(255,255,255,0.06)',
    default: 'rgba(255,255,255,0.10)',
    strong: 'rgba(255,255,255,0.16)',
  },

  accent: {
    primary: palette.cyan[400],
    light: 'rgba(34,211,238,0.12)',
    dark: palette.cyan[200],
  },

  button: {
    primary: {
      background: palette.cyan[400],
      text: palette.navy[850],
    },
    ghost: {
      background: 'rgba(255,255,255,0.06)',
      text: '#e2e8f0',
      border: 'rgba(255,255,255,0.12)',
    },
  },

  card: {
    background: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
    iconBackground: 'rgba(34,211,238,0.10)',
    iconColor: palette.cyan[400],
  },

  stat: {
    background: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
  },

  nav: {
    background: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.06)',
    active: palette.cyan[400],
    inactive: '#334155',
    activePill: 'rgba(34,211,238,0.12)',
  },

  customer: {
    surface: '#0d1224',
    surfaceContainerLow: '#111827',
    surfaceContainerLowest: 'rgba(255,255,255,0.04)',
    outlineVariant: 'rgba(255,255,255,0.08)',
    gradientStart: palette.cyan[700],
    gradientEnd: palette.cyan[500],
    secondary: '#60a5fa',
    secondaryBg: 'rgba(96,165,250,0.12)',
    tertiary: '#fbbf24',
    tertiaryBg: 'rgba(251,191,36,0.12)',
    primaryBg: 'rgba(34,211,238,0.10)',
    primaryBgStrong: 'rgba(34,211,238,0.18)',
    plusBg: 'rgba(34,211,238,0.08)',
    error: '#f87171',
  },

  badge: {
    success: { background: 'rgba(52,211,153,0.12)', text: '#34d399' },
    info: { background: 'rgba(34,211,238,0.12)', text: '#22d3ee' },
    warning: { background: 'rgba(251,191,36,0.12)', text: '#fbbf24' },
    error: { background: 'rgba(239,68,68,0.12)', text: '#f87171' },
  },

  phases: {
    searching: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.18)' },
    awaiting_acceptance: { fg: '#c4b5fd', bg: 'rgba(167,139,250,0.18)' },
    accepted: { fg: palette.cyan[200], bg: 'rgba(34,211,238,0.14)' },
    on_the_way: { fg: '#93c5fd', bg: 'rgba(96,165,250,0.18)' },
    in_progress: { fg: palette.cyan[200], bg: 'rgba(34,211,238,0.22)' },
    completed: { fg: '#34d399', bg: 'rgba(52,211,153,0.16)' },
    cancelled: { fg: '#f87171', bg: 'rgba(248,113,113,0.16)' },
  },

  notificationTypes: {
    searching: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.18)', icon: 'search' },
    awaiting_acceptance: { fg: '#fb923c', bg: 'rgba(251,146,60,0.16)', icon: 'hourglass-empty' },
    accepted: { fg: '#a5b4fc', bg: 'rgba(129,140,248,0.16)', icon: 'event' },
    scheduled: { fg: '#a5b4fc', bg: 'rgba(129,140,248,0.16)', icon: 'event' },
    on_the_way: { fg: '#22d3ee', bg: 'rgba(34,211,238,0.18)', icon: 'directions-car' },
    in_progress: { fg: '#c4b5fd', bg: 'rgba(167,139,250,0.16)', icon: 'local-car-wash' },
    completed: { fg: '#34d399', bg: 'rgba(52,211,153,0.16)', icon: 'check-circle' },
    cancelled: { fg: '#fb923c', bg: 'rgba(251,146,60,0.14)', icon: 'cancel' },
    payment: { fg: '#22d3ee', bg: 'rgba(34,211,238,0.14)', icon: 'payments' },
    reschedule: { fg: '#a5b4fc', bg: 'rgba(129,140,248,0.14)', icon: 'update' },
  },

  shadow: {
    sm: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 4,
    },
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
};
