import { Easing } from 'react-native-reanimated';

/** Premium, non-bouncy easing — calm ease-out (Linear / Apple style). */
export const PARTNER_EASE = Easing.bezier(0.25, 0.1, 0.25, 1);

export const PARTNER_MOTION = {
  duration: {
    fast: 180,
    normal: 260,
    slow: 320,
    panel: 300,
    panelBackdrop: 340,
    tabIndicator: 260,
    statusIndicator: 280,
    statusGradient: 380,
    entrance: 280,
    counter: 650,
  },
};

export function partnerTiming(duration, easing = PARTNER_EASE) {
  return { duration, easing };
}
