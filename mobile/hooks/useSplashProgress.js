import { useCallback, useEffect, useRef } from 'react';
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SPLASH_DURATION_MS } from '../components/splash/splashTimeline';

export function useSplashProgress(onComplete, enabled = true) {
  const progress = useSharedValue(0);
  const onCompleteRef = useRef(onComplete);
  const firedRef = useRef(false);

  onCompleteRef.current = onComplete;

  const triggerComplete = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    requestAnimationFrame(() => {
      const fn = onCompleteRef.current;
      if (typeof fn === 'function') {
        fn();
      }
    });
  }, []);

  useEffect(() => {
    firedRef.current = false;

    if (!enabled) {
      return undefined;
    }

    progress.value = 0;
    progress.value = withTiming(
      1,
      {
        duration: SPLASH_DURATION_MS,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
      (finished) => {
        if (finished) {
          runOnJS(triggerComplete)();
        }
      }
    );

    return () => {
      cancelAnimation(progress);
    };
  }, [enabled, progress, triggerComplete]);

  return progress;
}
