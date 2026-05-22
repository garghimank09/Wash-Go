import { useCallback, useMemo } from 'react';
import {
  cancelAnimation,
  interpolate,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ROLE_EASE, ROLE_MOTION, smoothstep } from '../../constants/roleSelectionMotion';

/**
 * Transform-only gateway for full-screen role portals.
 * Never animates width/flex — translateX + opacity only.
 */
export function useRoleCinematicGateway({
  reduceMotion = false,
  screenWidth = 390,
} = {}) {
  const half = screenWidth * 0.5;
  const hideAt = ROLE_MOTION.slide.portalHideProgress;
  const fadeStart = ROLE_MOTION.slide.contentFadeStart;
  const fadeEnd = ROLE_MOTION.slide.contentFadeEnd;

  const customerProgress = useSharedValue(0);
  const partnerProgress = useSharedValue(0);
  const entry = useSharedValue(reduceMotion ? 1 : 0);
  const isLocked = useSharedValue(0);

  const customerTranslateX = useDerivedValue(() => {
    'worklet';
    const c = customerProgress.value;
    const p = partnerProgress.value;
    if (p > 0.001) {
      return -screenWidth;
    }
    return -half * (1 - c);
  });

  const partnerTranslateX = useDerivedValue(() => {
    'worklet';
    const c = customerProgress.value;
    const p = partnerProgress.value;
    if (c > 0.001) {
      return screenWidth;
    }
    return half * (1 - p);
  });

  const customerOpacity = useDerivedValue(() => {
    'worklet';
    if (partnerProgress.value >= hideAt) {
      return 0;
    }
    return 1;
  });

  const partnerOpacity = useDerivedValue(() => {
    'worklet';
    if (customerProgress.value >= hideAt) {
      return 0;
    }
    return 1;
  });

  const splitLineX = useDerivedValue(() => {
    'worklet';
    const c = customerProgress.value;
    const p = partnerProgress.value;
    return half + c * half - p * half;
  });

  const customerIntensity = useDerivedValue(() => customerProgress.value);
  const partnerIntensity = useDerivedValue(() => partnerProgress.value);

  const parallax = useDerivedValue(() => {
    'worklet';
    return customerProgress.value - partnerProgress.value;
  });

  const customerContentOpacity = useDerivedValue(() => {
    'worklet';
    const other = partnerProgress.value;
    if (other <= fadeStart) {
      return 1;
    }
    const t = interpolate(other, [fadeStart, fadeEnd], [0, 1]);
    return 1 - smoothstep(t);
  });

  const partnerContentOpacity = useDerivedValue(() => {
    'worklet';
    const other = customerProgress.value;
    if (other <= fadeStart) {
      return 1;
    }
    const t = interpolate(other, [fadeStart, fadeEnd], [0, 1]);
    return 1 - smoothstep(t);
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

  const resetToNeutral = useCallback(
    (options = {}) => {
      const { replayEntry = false } = options;
      cancelAnimation(customerProgress);
      cancelAnimation(partnerProgress);
      cancelAnimation(entry);
      isLocked.value = 0;
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
    [customerProgress, partnerProgress, entry, isLocked, reduceMotion],
  );

  const lockInteraction = useCallback(() => {
    isLocked.value = 1;
  }, [isLocked]);

  const animateToComplete = useCallback(
    (side, onDone) => {
      const progress = side === 'customer' ? customerProgress : partnerProgress;
      const other = side === 'customer' ? partnerProgress : customerProgress;
      cancelAnimation(progress);
      cancelAnimation(other);
      other.value = 0;
      isLocked.value = 1;
      progress.value = withTiming(
        1,
        {
          duration:
            ROLE_MOTION.duration.slideExpand + ROLE_MOTION.delay.navigateAfterSettle,
          easing: ROLE_EASE,
        },
        (finished) => {
          if (finished && onDone) {
            runOnJS(onDone)();
          }
        },
      );
    },
    [customerProgress, partnerProgress, isLocked],
  );

  const entryOpacity = useDerivedValue(() => {
    'worklet';
    return interpolate(entry.value, [0, 1], [0, 1]);
  });

  return useMemo(
    () => ({
      customerProgress,
      partnerProgress,
      entry,
      isLocked,
      customerTranslateX,
      partnerTranslateX,
      customerOpacity,
      partnerOpacity,
      splitLineX,
      customerIntensity,
      partnerIntensity,
      parallax,
      customerContentOpacity,
      partnerContentOpacity,
      entryOpacity,
      startEntry,
      resetToNeutral,
      lockInteraction,
      animateToComplete,
      screenWidth,
      half,
    }),
    [
      customerProgress,
      partnerProgress,
      entry,
      isLocked,
      customerTranslateX,
      partnerTranslateX,
      customerOpacity,
      partnerOpacity,
      splitLineX,
      customerIntensity,
      partnerIntensity,
      parallax,
      customerContentOpacity,
      partnerContentOpacity,
      entryOpacity,
      startEntry,
      resetToNeutral,
      lockInteraction,
      animateToComplete,
      screenWidth,
      half,
    ],
  );
}
