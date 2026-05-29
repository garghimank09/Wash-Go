/**
 * Customer-specific design tokens layered on top of theme.js.
 * Mirrors partnerTheme geometry and shadow patterns for visual parity.
 */

import { Platform } from 'react-native';
import { lightTheme, darkTheme } from './theme';

export const CUSTOMER_LAYOUT = {
  screenPadding: 20,
  sectionGap: 14,
  tabBar: {
    height: 52,
    horizontalMargin: 20,
    bottomGap: 8,
    floatOffset: 4,
    scrimHeight: 14,
    scrollEndPadding: 12,
    radius: 22,
    indicatorInset: 5,
    iconSize: 22,
  },
  card: {
    radius: 22,
    radiusLg: 28,
    radiusSm: 16,
  },
};

const CUSTOMER_GRADIENTS = {
  light: {
    hero: ['#06b6d4', '#3b82f6'],
    heroHighlight: ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)'],
    fab: ['#06b6d4', '#0891b2'],
    ctaGlow: 'rgba(6,182,212,0.40)',
  },
  dark: {
    hero: ['#0e7490', '#1d4ed8'],
    heroHighlight: ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)'],
    fab: ['#0e7490', '#0891b2'],
    ctaGlow: 'rgba(34,211,238,0.40)',
  },
};

const SKELETON = {
  light: {
    base: 'rgba(15,23,42,0.06)',
    shimmer: 'rgba(15,23,42,0.10)',
  },
  dark: {
    base: 'rgba(255,255,255,0.06)',
    shimmer: 'rgba(255,255,255,0.10)',
  },
};

export function getCustomerGradients(isDark = false) {
  return isDark ? CUSTOMER_GRADIENTS.dark : CUSTOMER_GRADIENTS.light;
}

export function getCustomerSkeleton(isDark = false) {
  return isDark ? SKELETON.dark : SKELETON.light;
}

export function getCustomerPhaseTokens(phaseId, isDark = false) {
  const theme = isDark ? darkTheme : lightTheme;
  return theme.phases[phaseId] || theme.phases.accepted;
}

export function getCustomerTabBarOccupiedHeight(insetsBottom = 0) {
  const { height, bottomGap, floatOffset } = CUSTOMER_LAYOUT.tabBar;
  const safeBottom = Math.max(insetsBottom, bottomGap);
  return safeBottom + height + floatOffset;
}

export function getCustomerScrollEndPadding() {
  return CUSTOMER_LAYOUT.tabBar.scrollEndPadding;
}

export function getCustomerContentPadding(insetsBottom = 0) {
  return getCustomerTabBarOccupiedHeight(insetsBottom) + getCustomerScrollEndPadding();
}

export function getCustomerShadow(isDark = false) {
  return {
    soft: Platform.select({
      android: { elevation: 0 },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.35 : 0.10,
        shadowRadius: 18,
        elevation: 6,
      },
    }),
    rim: Platform.select({
      android: { elevation: 0 },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.30 : 0.06,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
    glow: (color) =>
      Platform.select({
        android: { elevation: 0 },
        default: {
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 16,
          elevation: 8,
        },
      }),
  };
}
