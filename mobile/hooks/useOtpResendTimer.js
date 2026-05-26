import { useCallback, useEffect, useRef, useState } from 'react';

import { OTP_RESEND_COOLDOWN_SECONDS } from '../lib/otpConstants';

function formatCountdown(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Countdown for OTP resend — matches web cooldown (60s default).
 * @param {number} [initialSeconds]
 */
export function useOtpResendTimer(initialSeconds = OTP_RESEND_COOLDOWN_SECONDS) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const intervalRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const restart = useCallback((seconds = OTP_RESEND_COOLDOWN_SECONDS) => {
    clearTimer();
    setSecondsLeft(seconds);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  useEffect(() => {
    if (initialSeconds > 0) {
      restart(initialSeconds);
    }
    return clearTimer;
  }, [initialSeconds, restart, clearTimer]);

  return {
    secondsLeft,
    canResend: secondsLeft <= 0,
    countdownLabel: formatCountdown(secondsLeft),
    restart,
    clearTimer,
  };
}
