/**
 * Active Job theme tokens. Layered on top of partnerTheme — does NOT introduce
 * a separate design system. Used for phase palette, dispatch insight banners,
 * upload tile chrome, checklist tick states, map overlays, and footer CTAs.
 */

const JOB_TOKENS = {
  light: {
    phase: {
      accepted: { fg: '#4338ca', bg: 'rgba(99,102,241,0.12)', dot: '#6366f1', label: 'Accepted' },
      heading: { fg: '#0e7490', bg: 'rgba(6,182,212,0.16)', dot: '#06b6d4', label: 'En route' },
      arrived: { fg: '#1d4ed8', bg: 'rgba(59,130,246,0.16)', dot: '#3b82f6', label: 'Arrived' },
      service_started: { fg: '#7c3aed', bg: 'rgba(124,58,237,0.14)', dot: '#7c3aed', label: 'Service started' },
      before_uploaded: { fg: '#7c3aed', bg: 'rgba(124,58,237,0.14)', dot: '#8b5cf6', label: 'Pre-wash done' },
      washing: { fg: '#0e7490', bg: 'rgba(34,211,238,0.16)', dot: '#06b6d4', label: 'Washing' },
      after_uploaded: { fg: '#1d4ed8', bg: 'rgba(96,165,250,0.16)', dot: '#3b82f6', label: 'Post-wash done' },
      qc_complete: { fg: '#b45309', bg: 'rgba(245,158,11,0.14)', dot: '#f59e0b', label: 'QC complete' },
      approval_pending: { fg: '#b45309', bg: 'rgba(245,158,11,0.16)', dot: '#f59e0b', label: 'Awaiting customer' },
      completed: { fg: '#047857', bg: 'rgba(16,185,129,0.14)', dot: '#10b981', label: 'Completed' },
    },
    map: {
      polyline: '#0ea5e9',
      polylineGlow: 'rgba(14,165,233,0.25)',
      polylineBg: 'rgba(15,23,42,0.10)',
      washerPin: '#0ea5e9',
      washerPinRing: 'rgba(14,165,233,0.30)',
      customerPin: '#ec4899',
      customerPinRing: 'rgba(236,72,153,0.25)',
      overlayTop: 'rgba(255,255,255,0.0)',
      overlayBottom: 'rgba(255,255,255,0.55)',
      mapBg: '#e6f4f8',
      grid: 'rgba(15,23,42,0.05)',
    },
    insights: {
      surge: {
        gradient: ['#3b82f6', '#22d3ee'],
        soft: 'rgba(59,130,246,0.12)',
        fg: '#1d4ed8',
        icon: 'TrendingUp',
      },
      dispatch: {
        gradient: ['#6366f1', '#8b5cf6'],
        soft: 'rgba(99,102,241,0.12)',
        fg: '#4338ca',
        icon: 'Radio',
      },
      streak: {
        gradient: ['#f59e0b', '#fb923c'],
        soft: 'rgba(245,158,11,0.12)',
        fg: '#b45309',
        icon: 'Flame',
      },
      peak: {
        gradient: ['#10b981', '#06b6d4'],
        soft: 'rgba(16,185,129,0.12)',
        fg: '#047857',
        icon: 'Activity',
      },
    },
    briefing: {
      info: { fg: '#1d4ed8', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.20)' },
      warning: { fg: '#b45309', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.20)' },
      critical: { fg: '#b91c1c', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.20)' },
      premium: { fg: '#7c3aed', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.22)' },
      neutral: { fg: '#475569', bg: 'rgba(100,116,139,0.10)', border: 'rgba(100,116,139,0.16)' },
    },
    upload: {
      tileBg: 'rgba(15,23,42,0.04)',
      tileBorder: 'rgba(15,23,42,0.08)',
      tileGhost: 'rgba(8,145,178,0.06)',
      tileGhostBorder: 'rgba(8,145,178,0.30)',
      progressTrack: 'rgba(255,255,255,0.35)',
      progressFg: '#ffffff',
      ringTrack: 'rgba(15,23,42,0.12)',
      ringFg: '#22d3ee',
      failBg: 'rgba(248,113,113,0.12)',
      failFg: '#b91c1c',
      successBg: 'rgba(16,185,129,0.16)',
      successFg: '#047857',
    },
    checklist: {
      idle: { ring: 'rgba(15,23,42,0.18)', tick: '#0891b2', fill: 'rgba(8,145,178,0)' },
      checked: { ring: '#0891b2', tick: '#ffffff', fill: '#0891b2' },
      progress: '#06b6d4',
      progressTrack: 'rgba(15,23,42,0.08)',
    },
    timeline: {
      activeDot: '#06b6d4',
      activeRing: 'rgba(34,211,238,0.30)',
      doneDot: '#10b981',
      pendingDot: 'rgba(15,23,42,0.12)',
      pendingRing: 'rgba(15,23,42,0.06)',
      spine: 'rgba(15,23,42,0.10)',
      activeSpine: '#06b6d4',
    },
    footer: {
      gradient: ['#06b6d4', '#3b82f6'],
      glow: 'rgba(6,182,212,0.40)',
      disabledGradient: ['#cbd5e1', '#94a3b8'],
      surface: 'rgba(255,255,255,0.92)',
      border: 'rgba(15,23,42,0.06)',
      secondaryBg: 'rgba(15,23,42,0.05)',
      secondaryFg: '#475569',
    },
    skeleton: {
      base: 'rgba(15,23,42,0.06)',
      shimmer: 'rgba(15,23,42,0.10)',
    },
    connection: {
      connected: { dot: '#10b981', fg: '#047857', label: 'Live' },
      reconnecting: { dot: '#f59e0b', fg: '#b45309', label: 'Reconnecting' },
      offline: { dot: '#94a3b8', fg: '#475569', label: 'Offline' },
    },
  },
  dark: {
    phase: {
      accepted: { fg: '#a5b4fc', bg: 'rgba(129,140,248,0.18)', dot: '#a5b4fc', label: 'Accepted' },
      heading: { fg: '#22d3ee', bg: 'rgba(34,211,238,0.18)', dot: '#22d3ee', label: 'En route' },
      arrived: { fg: '#93c5fd', bg: 'rgba(96,165,250,0.18)', dot: '#60a5fa', label: 'Arrived' },
      service_started: { fg: '#c4b5fd', bg: 'rgba(167,139,250,0.18)', dot: '#a78bfa', label: 'Service started' },
      before_uploaded: { fg: '#c4b5fd', bg: 'rgba(167,139,250,0.18)', dot: '#c4b5fd', label: 'Pre-wash done' },
      washing: { fg: '#22d3ee', bg: 'rgba(34,211,238,0.18)', dot: '#22d3ee', label: 'Washing' },
      after_uploaded: { fg: '#93c5fd', bg: 'rgba(96,165,250,0.18)', dot: '#93c5fd', label: 'Post-wash done' },
      qc_complete: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.18)', dot: '#fbbf24', label: 'QC complete' },
      approval_pending: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.20)', dot: '#fbbf24', label: 'Awaiting customer' },
      completed: { fg: '#34d399', bg: 'rgba(52,211,153,0.18)', dot: '#34d399', label: 'Completed' },
    },
    map: {
      polyline: '#38bdf8',
      polylineGlow: 'rgba(56,189,248,0.30)',
      polylineBg: 'rgba(255,255,255,0.10)',
      washerPin: '#38bdf8',
      washerPinRing: 'rgba(56,189,248,0.35)',
      customerPin: '#f472b6',
      customerPinRing: 'rgba(244,114,182,0.30)',
      overlayTop: 'rgba(13,18,36,0.0)',
      overlayBottom: 'rgba(13,18,36,0.65)',
      mapBg: '#0b1224',
      grid: 'rgba(255,255,255,0.05)',
    },
    insights: {
      surge: {
        gradient: ['#1d4ed8', '#0891b2'],
        soft: 'rgba(59,130,246,0.18)',
        fg: '#93c5fd',
        icon: 'TrendingUp',
      },
      dispatch: {
        gradient: ['#4f46e5', '#7c3aed'],
        soft: 'rgba(99,102,241,0.18)',
        fg: '#c4b5fd',
        icon: 'Radio',
      },
      streak: {
        gradient: ['#d97706', '#ea580c'],
        soft: 'rgba(245,158,11,0.18)',
        fg: '#fbbf24',
        icon: 'Flame',
      },
      peak: {
        gradient: ['#0ea371', '#0891b2'],
        soft: 'rgba(16,185,129,0.18)',
        fg: '#34d399',
        icon: 'Activity',
      },
    },
    briefing: {
      info: { fg: '#93c5fd', bg: 'rgba(59,130,246,0.18)', border: 'rgba(96,165,250,0.30)' },
      warning: { fg: '#fbbf24', bg: 'rgba(245,158,11,0.18)', border: 'rgba(251,191,36,0.30)' },
      critical: { fg: '#fca5a5', bg: 'rgba(248,113,113,0.18)', border: 'rgba(248,113,113,0.30)' },
      premium: { fg: '#c4b5fd', bg: 'rgba(124,58,237,0.20)', border: 'rgba(167,139,250,0.30)' },
      neutral: { fg: '#94a3b8', bg: 'rgba(148,163,184,0.14)', border: 'rgba(148,163,184,0.22)' },
    },
    upload: {
      tileBg: 'rgba(255,255,255,0.04)',
      tileBorder: 'rgba(255,255,255,0.08)',
      tileGhost: 'rgba(34,211,238,0.08)',
      tileGhostBorder: 'rgba(34,211,238,0.35)',
      progressTrack: 'rgba(255,255,255,0.20)',
      progressFg: '#ffffff',
      ringTrack: 'rgba(255,255,255,0.14)',
      ringFg: '#22d3ee',
      failBg: 'rgba(248,113,113,0.18)',
      failFg: '#fca5a5',
      successBg: 'rgba(52,211,153,0.18)',
      successFg: '#34d399',
    },
    checklist: {
      idle: { ring: 'rgba(255,255,255,0.20)', tick: '#22d3ee', fill: 'rgba(34,211,238,0)' },
      checked: { ring: '#22d3ee', tick: '#0f172a', fill: '#22d3ee' },
      progress: '#22d3ee',
      progressTrack: 'rgba(255,255,255,0.10)',
    },
    timeline: {
      activeDot: '#22d3ee',
      activeRing: 'rgba(34,211,238,0.40)',
      doneDot: '#34d399',
      pendingDot: 'rgba(255,255,255,0.14)',
      pendingRing: 'rgba(255,255,255,0.06)',
      spine: 'rgba(255,255,255,0.10)',
      activeSpine: '#22d3ee',
    },
    footer: {
      gradient: ['#0e7490', '#1d4ed8'],
      glow: 'rgba(34,211,238,0.40)',
      disabledGradient: ['#334155', '#475569'],
      surface: 'rgba(13,18,36,0.86)',
      border: 'rgba(255,255,255,0.08)',
      secondaryBg: 'rgba(255,255,255,0.06)',
      secondaryFg: '#94a3b8',
    },
    skeleton: {
      base: 'rgba(255,255,255,0.06)',
      shimmer: 'rgba(255,255,255,0.10)',
    },
    connection: {
      connected: { dot: '#34d399', fg: '#34d399', label: 'Live' },
      reconnecting: { dot: '#fbbf24', fg: '#fbbf24', label: 'Reconnecting' },
      offline: { dot: '#94a3b8', fg: '#94a3b8', label: 'Offline' },
    },
  },
};

export function getJobTokens(isDark = false) {
  return isDark ? JOB_TOKENS.dark : JOB_TOKENS.light;
}

export function getPhaseTokens(phaseId, isDark = false) {
  const tokens = getJobTokens(isDark).phase;
  return tokens[phaseId] || tokens.accepted;
}

export function getInsightBannerTokens(key, isDark = false) {
  const tokens = getJobTokens(isDark).insights;
  return tokens[key] || tokens.dispatch;
}

export function getBriefingTokens(key, isDark = false) {
  const tokens = getJobTokens(isDark).briefing;
  return tokens[key] || tokens.neutral;
}

export function getConnectionTokens(state, isDark = false) {
  const tokens = getJobTokens(isDark).connection;
  return tokens[state] || tokens.connected;
}
