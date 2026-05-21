import { Easing } from 'react-native-reanimated';

/** Premium, non-bouncy easing — aligned with partner motion. */
export const CUSTOMER_EASE = Easing.bezier(0.25, 0.1, 0.25, 1);

export const CUSTOMER_MOTION = {
  duration: {
    fast: 180,
    normal: 260,
    slow: 320,
    panel: 300,
    panelBackdrop: 340,
    tabIndicator: 260,
    entrance: 280,
  },
};

export function customerTiming(duration, easing = CUSTOMER_EASE) {
  return { duration, easing };
}
