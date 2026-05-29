import { useCallback, useRef } from 'react';

/**
 * Fires `onStep` once immediately, then repeats while the press is held.
 */
export function useHoldRepeat(
  onStep,
  { enabled = true, initialDelayMs = 420, intervalMs = 110 } = {},
) {
  const delayRef = useRef(null);
  const intervalRef = useRef(null);

  const clear = useCallback(() => {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const onPressIn = useCallback(() => {
    if (!enabled) return;
    clear();
    onStep();
    delayRef.current = setTimeout(() => {
      intervalRef.current = setInterval(onStep, intervalMs);
    }, initialDelayMs);
  }, [enabled, onStep, initialDelayMs, intervalMs, clear]);

  const onPressOut = useCallback(() => {
    clear();
  }, [clear]);

  return { onPressIn, onPressOut, clear };
}
