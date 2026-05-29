/**
 * Earnings-specific accent tokens. Layered on top of partnerTheme — does NOT introduce
 * a separate design system. Used for sparkline gradients, payout status chips,
 * incentive cards, and insight icon palettes.
 */

const EARNINGS_TOKENS = {
  light: {
    hero: {
      gradient: ['#06b6d4', '#3b82f6'],
      accent: '#0891b2',
      glow: 'rgba(34,211,238,0.45)',
    },
    chart: {
      stroke: '#0891b2',
      strokeGlow: 'rgba(8,145,178,0.18)',
      areaTop: 'rgba(34,211,238,0.22)',
      areaBottom: 'rgba(34,211,238,0)',
      gridLine: 'rgba(15,23,42,0.06)',
      label: '#64748b',
      labelActive: '#0e7490',
      dot: '#0891b2',
      dotRing: 'rgba(8,145,178,0.18)',
      tooltipBg: '#0f172a',
      tooltipFg: '#ffffff',
    },
    payoutStatus: {
      paid: { fg: '#047857', bg: 'rgba(16,185,129,0.14)', label: 'Paid' },
      pending: { fg: '#b45309', bg: 'rgba(245,158,11,0.14)', label: 'Pending payout' },
      failed: { fg: '#b91c1c', bg: 'rgba(248,113,113,0.14)', label: 'Failed' },
      processing: { fg: '#1d4ed8', bg: 'rgba(59,130,246,0.14)', label: 'Processing' },
    },
    incentives: {
      peak: {
        gradient: ['#f59e0b', '#fb923c'],
        soft: 'rgba(245,158,11,0.10)',
        fg: '#b45309',
      },
      surge: {
        gradient: ['#3b82f6', '#22d3ee'],
        soft: 'rgba(59,130,246,0.10)',
        fg: '#1d4ed8',
      },
      streak: {
        gradient: ['#6366f1', '#8b5cf6'],
        soft: 'rgba(99,102,241,0.10)',
        fg: '#4338ca',
      },
      weekend: {
        gradient: ['#a855f7', '#ec4899'],
        soft: 'rgba(168,85,247,0.10)',
        fg: '#7e22ce',
      },
    },
    insights: {
      trend: { fg: '#0891b2', bg: 'rgba(6,182,212,0.14)' },
      zone: { fg: '#1d4ed8', bg: 'rgba(59,130,246,0.14)' },
      rating: { fg: '#b45309', bg: 'rgba(245,158,11,0.14)' },
      sparkle: { fg: '#7c3aed', bg: 'rgba(124,58,237,0.14)' },
    },
    skeleton: {
      base: 'rgba(15,23,42,0.06)',
      shimmer: 'rgba(15,23,42,0.10)',
    },
    pendingCard: {
      fill: '#fffbeb',
      border: '#fde68a',
    },
  },
  dark: {
    hero: {
      gradient: ['#0e7490', '#1d4ed8'],
      accent: '#22d3ee',
      glow: 'rgba(34,211,238,0.50)',
    },
    chart: {
      stroke: '#22d3ee',
      strokeGlow: 'rgba(34,211,238,0.22)',
      areaTop: 'rgba(34,211,238,0.26)',
      areaBottom: 'rgba(34,211,238,0)',
      gridLine: 'rgba(255,255,255,0.06)',
      label: '#94a3b8',
      labelActive: '#7dd3fc',
      dot: '#22d3ee',
      dotRing: 'rgba(34,211,238,0.22)',
      tooltipBg: '#e2e8f0',
      tooltipFg: '#0f172a',
    },
    payoutStatus: {
      paid: { fg: '#34d399', bg: 'rgba(52,211,153,0.18)', label: 'Paid' },
      pending: { fg: '#fbbf24', bg: 'rgba(245,158,11,0.18)', label: 'Pending payout' },
      failed: { fg: '#fca5a5', bg: 'rgba(248,113,113,0.18)', label: 'Failed' },
      processing: { fg: '#93c5fd', bg: 'rgba(59,130,246,0.18)', label: 'Processing' },
    },
    incentives: {
      peak: {
        gradient: ['#d97706', '#ea580c'],
        soft: 'rgba(245,158,11,0.16)',
        fg: '#fbbf24',
      },
      surge: {
        gradient: ['#2563eb', '#06b6d4'],
        soft: 'rgba(59,130,246,0.16)',
        fg: '#93c5fd',
      },
      streak: {
        gradient: ['#4f46e5', '#7c3aed'],
        soft: 'rgba(99,102,241,0.18)',
        fg: '#a5b4fc',
      },
      weekend: {
        gradient: ['#9333ea', '#db2777'],
        soft: 'rgba(168,85,247,0.16)',
        fg: '#d8b4fe',
      },
    },
    insights: {
      trend: { fg: '#22d3ee', bg: 'rgba(34,211,238,0.18)' },
      zone: { fg: '#93c5fd', bg: 'rgba(59,130,246,0.18)' },
      rating: { fg: '#fbbf24', bg: 'rgba(245,158,11,0.18)' },
      sparkle: { fg: '#c4b5fd', bg: 'rgba(167,139,250,0.18)' },
    },
    skeleton: {
      base: 'rgba(255,255,255,0.06)',
      shimmer: 'rgba(255,255,255,0.10)',
    },
    pendingCard: {
      fill: '#2a2010',
      border: 'rgba(251,191,36,0.35)',
    },
  },
};

export function getEarningsTokens(isDark = false) {
  return isDark ? EARNINGS_TOKENS.dark : EARNINGS_TOKENS.light;
}

export function getPayoutStatus(statusId, isDark = false) {
  const tokens = getEarningsTokens(isDark).payoutStatus;
  return tokens[statusId] || tokens.pending;
}

export function getIncentiveTokens(key, isDark = false) {
  const tokens = getEarningsTokens(isDark).incentives;
  return tokens[key] || tokens.surge;
}

export function getInsightTokens(key, isDark = false) {
  const tokens = getEarningsTokens(isDark).insights;
  return tokens[key] || tokens.trend;
}
