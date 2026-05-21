/**
 * Schedule-specific tokens layered on top of partnerTheme + earningsTheme.
 * Used by day selector, route summary card, schedule status pills, and
 * insight icon palettes. Does NOT introduce a parallel design system.
 */

const SCHEDULE_TOKENS = {
  light: {
    daySelector: {
      pillBg: 'rgba(255,255,255,0.92)',
      pillBorder: 'rgba(15,23,42,0.08)',
      pillFg: '#475569',
      pillMuted: '#94a3b8',
      activeGradient: ['#06b6d4', '#3b82f6'],
      activeFg: '#ffffff',
      activeShadow: 'rgba(8,145,178,0.30)',
      dot: '#06b6d4',
      todayRing: 'rgba(8,145,178,0.25)',
    },
    hero: {
      gradient: ['#0891b2', '#3b82f6'],
      softTop: 'rgba(255,255,255,0.18)',
      progressTrack: 'rgba(255,255,255,0.18)',
      progressFill: 'rgba(255,255,255,0.95)',
    },
    status: {
      pending: { fg: '#b45309', bg: 'rgba(245,158,11,0.14)', dot: '#f59e0b', label: 'Pending' },
      confirmed: { fg: '#1d4ed8', bg: 'rgba(59,130,246,0.14)', dot: '#3b82f6', label: 'Confirmed' },
      scheduled: { fg: '#1d4ed8', bg: 'rgba(59,130,246,0.14)', dot: '#3b82f6', label: 'Scheduled' },
      en_route: { fg: '#0e7490', bg: 'rgba(6,182,212,0.16)', dot: '#06b6d4', label: 'En route' },
      in_progress: { fg: '#7c3aed', bg: 'rgba(124,58,237,0.14)', dot: '#7c3aed', label: 'In progress' },
      completed: { fg: '#047857', bg: 'rgba(16,185,129,0.14)', dot: '#10b981', label: 'Completed' },
      cancelled: { fg: '#c2410c', bg: 'rgba(248,113,113,0.14)', dot: '#f97316', label: 'Cancelled' },
    },
    route: {
      gradient: ['rgba(8,145,178,0.10)', 'rgba(59,130,246,0.04)'],
      stroke: '#0891b2',
      strokeGlow: 'rgba(8,145,178,0.20)',
      stopUpcoming: '#06b6d4',
      stopActive: '#f59e0b',
      stopDone: '#10b981',
      trafficLow: { fg: '#047857', bg: 'rgba(16,185,129,0.14)', label: 'Light traffic' },
      trafficMedium: { fg: '#b45309', bg: 'rgba(245,158,11,0.14)', label: 'Moderate' },
      trafficHigh: { fg: '#b91c1c', bg: 'rgba(248,113,113,0.14)', label: 'Heavy traffic' },
    },
    insights: {
      surge: { fg: '#0891b2', bg: 'rgba(6,182,212,0.14)' },
      zone: { fg: '#1d4ed8', bg: 'rgba(59,130,246,0.14)' },
      pace: { fg: '#7c3aed', bg: 'rgba(124,58,237,0.14)' },
      time: { fg: '#b45309', bg: 'rgba(245,158,11,0.14)' },
    },
    spine: {
      line: 'rgba(15,23,42,0.10)',
      rail: 'rgba(15,23,42,0.05)',
      hourLabel: '#94a3b8',
    },
    actionChip: {
      bg: 'rgba(15,23,42,0.05)',
      fg: '#0f172a',
      primaryBg: 'rgba(6,182,212,0.14)',
      primaryFg: '#0e7490',
    },
    skeleton: {
      base: 'rgba(15,23,42,0.06)',
    },
  },
  dark: {
    daySelector: {
      pillBg: 'rgba(255,255,255,0.04)',
      pillBorder: 'rgba(255,255,255,0.08)',
      pillFg: '#cbd5e1',
      pillMuted: '#64748b',
      activeGradient: ['#0e7490', '#1d4ed8'],
      activeFg: '#ffffff',
      activeShadow: 'rgba(34,211,238,0.30)',
      dot: '#22d3ee',
      todayRing: 'rgba(34,211,238,0.30)',
    },
    hero: {
      gradient: ['#0e7490', '#1e3a8a'],
      softTop: 'rgba(255,255,255,0.18)',
      progressTrack: 'rgba(255,255,255,0.18)',
      progressFill: 'rgba(255,255,255,0.95)',
    },
    status: {
      pending: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.18)', dot: '#fbbf24', label: 'Pending' },
      confirmed: { fg: '#93c5fd', bg: 'rgba(59,130,246,0.18)', dot: '#60a5fa', label: 'Confirmed' },
      scheduled: { fg: '#93c5fd', bg: 'rgba(59,130,246,0.18)', dot: '#60a5fa', label: 'Scheduled' },
      en_route: { fg: '#22d3ee', bg: 'rgba(34,211,238,0.18)', dot: '#22d3ee', label: 'En route' },
      in_progress: { fg: '#c4b5fd', bg: 'rgba(167,139,250,0.18)', dot: '#a78bfa', label: 'In progress' },
      completed: { fg: '#34d399', bg: 'rgba(52,211,153,0.18)', dot: '#34d399', label: 'Completed' },
      cancelled: { fg: '#fb923c', bg: 'rgba(251,146,60,0.18)', dot: '#fb923c', label: 'Cancelled' },
    },
    route: {
      gradient: ['rgba(34,211,238,0.14)', 'rgba(59,130,246,0.04)'],
      stroke: '#22d3ee',
      strokeGlow: 'rgba(34,211,238,0.28)',
      stopUpcoming: '#22d3ee',
      stopActive: '#fbbf24',
      stopDone: '#34d399',
      trafficLow: { fg: '#34d399', bg: 'rgba(52,211,153,0.18)', label: 'Light traffic' },
      trafficMedium: { fg: '#fbbf24', bg: 'rgba(245,158,11,0.18)', label: 'Moderate' },
      trafficHigh: { fg: '#fca5a5', bg: 'rgba(248,113,113,0.18)', label: 'Heavy traffic' },
    },
    insights: {
      surge: { fg: '#22d3ee', bg: 'rgba(34,211,238,0.18)' },
      zone: { fg: '#93c5fd', bg: 'rgba(59,130,246,0.18)' },
      pace: { fg: '#c4b5fd', bg: 'rgba(167,139,250,0.18)' },
      time: { fg: '#fbbf24', bg: 'rgba(245,158,11,0.18)' },
    },
    spine: {
      line: 'rgba(255,255,255,0.10)',
      rail: 'rgba(255,255,255,0.05)',
      hourLabel: '#64748b',
    },
    actionChip: {
      bg: 'rgba(255,255,255,0.06)',
      fg: '#e2e8f0',
      primaryBg: 'rgba(34,211,238,0.18)',
      primaryFg: '#7dd3fc',
    },
    skeleton: {
      base: 'rgba(255,255,255,0.06)',
    },
  },
};

export function getScheduleTokens(isDark = false) {
  return isDark ? SCHEDULE_TOKENS.dark : SCHEDULE_TOKENS.light;
}

export function getScheduleStatus(statusId, isDark = false) {
  const tokens = getScheduleTokens(isDark).status;
  return tokens[statusId] || tokens.scheduled;
}

export function getInsightPalette(key, isDark = false) {
  const tokens = getScheduleTokens(isDark).insights;
  return tokens[key] || tokens.surge;
}

export function getTrafficTokens(level, isDark = false) {
  const route = getScheduleTokens(isDark).route;
  if (level === 'high') return route.trafficHigh;
  if (level === 'medium') return route.trafficMedium;
  return route.trafficLow;
}
