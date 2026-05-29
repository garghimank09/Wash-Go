import { useEffect } from 'react';
import { useSharedValue } from 'react-native-reanimated';

export function useSplashProgress(onComplete, enabled = true) {
  const progress = useSharedValue(1);

  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      onComplete?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [enabled, onComplete]);

  return progress;
}