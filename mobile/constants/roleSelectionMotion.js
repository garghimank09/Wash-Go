import { Easing } from 'react-native-reanimated';

/** Cinematic ease — no springs, no bounce. */
export const ROLE_EASE = Easing.bezier(0.22, 1, 0.36, 1);
export const ROLE_EASE_OUT = Easing.bezier(0.25, 0.1, 0.25, 1);

export const ROLE_MOTION = {
  duration: {
    fade: 500,
    entry: 620,
    slideExpand: 520,
    slideSettle: 280,
    slideComplete: 520,
    slideSnapBack: 380,
    arrowBreath: 3600,
    ambientLoop: 5200,
    heroSettle: 680,
  },
  delay: {
    leftPanel: 60,
    rightPanel: 140,
    header: 180,
    hero: 280,
    floor: 420,
    arrow: 520,
    ambient: 560,
    navigateAfterSettle: 280,
  },
  slide: {
    threshold: 0.68,
    trackWidthRatio: 0.4,
    /** >1 = more resistance near the end of the track. */
    dragResistance: 1.12,
    arrowSize: 52,
  },
  layout: {
    neutralWidthRatio: 0.5,
    activeWidthRatio: 0.76,
    inactiveWidthRatio: 0.24,
    heroScaleNeutral: 1,
    heroScaleActive: 1.08,
    heroScaleInactive: 0.96,
    tabletBreakpoint: 768,
    tabletActiveWidthRatio: 0.72,
    tabletInactiveWidthRatio: 0.28,
    partnerHeroCenterFix: -0.06,
    customerHeroCenterFix: 0,
  },
};

export function roleTiming(duration, easing = ROLE_EASE) {
  return { duration, easing };
}

/** Smoothstep 0–1 for premium drag feel. */
export function smoothstep(t) {
  'worklet';
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}
