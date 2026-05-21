import { useCallback, useMemo } from 'react';
import {
  cancelAnimation,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ROLE_EASE, ROLE_MOTION } from '../../constants/roleSelectionMotion';

/**
 * Slide-to-enter progress for customer (left) and partner (right).
 * Drives panel widths, hero scale, ambient intensity, and parallax.
 */
export function useRoleSlideGateway({ reduceMotion = false, isTablet = false } = {}) {
  const customerProgress = useSharedValue(0);
  const partnerProgress = useSharedValue(0);
  const entry = useSharedValue(reduceMotion ? 1 : 0);

  const active = ROLE_MOTION.layout.activeWidthRatio;
  const inactive = ROLE_MOTION.layout.inactiveWidthRatio;
  const neutral = ROLE_MOTION.layout.neutralWidthRatio;
  const activeW = isTablet ? ROLE_MOTION.layout.tabletActiveWidthRatio : active;
  const inactiveW = isTablet ? ROLE_MOTION.layout.tabletInactiveWidthRatio : inactive;
  const expandDelta = activeW - neutral;
  const compressDelta = neutral - inactiveW;

  const customerWidthRatio = useDerivedValue(() => {
    'worklet';
    return (
      neutral +
      customerProgress.value * expandDelta -
      partnerProgress.value * compressDelta
    );
  });

  const partnerWidthRatio = useDerivedValue(() => {
    'worklet';
    return 1 - customerWidthRatio.value;
  });

  const customerIntensity = useDerivedValue(() => customerProgress.value);
  const partnerIntensity = useDerivedValue(() => partnerProgress.value);

  const parallax = useDerivedValue(() => {
    'worklet';
    return customerProgress.value - partnerProgress.value;
  });

  const startEntry = useCallback(() => {
    if (reduceMotion) {
      entry.value = 1;
      return;
    }
    entry.value = withTiming(1, {
      duration: ROLE_MOTION.duration.entry,
      easing: ROLE_EASE,
    });
  }, [entry, reduceMotion]);

  /** Hard reset to neutral 50/50 — call on focus / back navigation. */
  const resetToNeutral = useCallback(
    (options = {}) => {
      const { replayEntry = false } = options;
      cancelAnimation(customerProgress);
      cancelAnimation(partnerProgress);
      cancelAnimation(entry);
      customerProgress.value = 0;
      partnerProgress.value = 0;

      if (replayEntry && !reduceMotion) {
        entry.value = 0;
        entry.value = withTiming(1, {
          duration: ROLE_MOTION.duration.entry,
          easing: ROLE_EASE,
        });
      } else {
        entry.value = 1;
      }
    },
    [customerProgress, partnerProgress, entry, reduceMotion],
  );

  return useMemo(
    () => ({
      customerProgress,
      partnerProgress,
      entry,
      customerWidthRatio,
      partnerWidthRatio,
      customerIntensity,
      partnerIntensity,
      parallax,
      startEntry,
      resetToNeutral,
      expandDelta,
      compressDelta,
      neutral,
      activeW,
      inactiveW,
    }),
    [
      customerProgress,
      partnerProgress,
      entry,
      customerWidthRatio,
      partnerWidthRatio,
      customerIntensity,
      partnerIntensity,
      parallax,
      startEntry,
      resetToNeutral,
      expandDelta,
      compressDelta,
      neutral,
      activeW,
      inactiveW,
    ],
  );
}
