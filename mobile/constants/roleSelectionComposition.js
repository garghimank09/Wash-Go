import { ROLE_LAYOUT } from './roleSelectionTheme';

/** Set true to outline portal/composition/hero/CTA bounds. */
export const DEBUG_ROLE_LAYOUT = false;

/**
 * Static half-region layout metrics for role selection portals.
 * Regions anchor to the portal half that is visible at neutral translateX
 * (customer portal shifted left → use right half of portal; partner → left half).
 */
export function getCompositionMetrics(screenWidth) {
  const ratio = ROLE_LAYOUT.composition.regionWidthRatio;
  const regionWidth = screenWidth * ratio;
  const visibleHalfLeft = screenWidth * ratio;
  return {
    regionWidth,
    regionLeft: {
      customer: visibleHalfLeft,
      partner: 0,
    },
    horizontalPad: ROLE_LAYOUT.composition.horizontalPad,
  };
}

/**
 * Horizontal hero framing offset inside the composition region (worklet-safe).
 * Values mirror ROLE_LAYOUT.hero peek/reveal fractions.
 */
export function getHeroFrameOffset(side, progress, regionWidth) {
  'worklet';
  const p = Math.max(0, Math.min(1, progress));
  const isCustomer = side === 'customer';

  if (isCustomer) {
    const peekX = regionWidth * -0.12;
    const revealX = 0;
    return peekX + p * (revealX - peekX);
  }

  return 0;
}
