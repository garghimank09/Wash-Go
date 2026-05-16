import { useCallback, useEffect, useRef, useState } from 'react';

import { trackingService } from '../services/trackingService';
import { getErrorMessage } from '../services/api';

const POLL_MS = 2000;

/**
 * Poll live map tracking for a booking.
 * @param {object} options
 * @param {boolean} [options.enabled=true]
 * @param {number} [options.pollMs=3000]
 * @param {boolean} [options.asPartner=false] — use partner JWT (washer app)
 */
export function useBookingTracking(bookingId, { enabled = true, pollMs = POLL_MS, asPartner = false } = {}) {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled && bookingId));
  const [error, setError] = useState('');
  const mounted = useRef(true);

  const fetchOnce = useCallback(async () => {
    if (!bookingId || !enabled) return;
    try {
      const data = asPartner
        ? await trackingService.getForPartner(bookingId)
        : await trackingService.get(bookingId);
      if (mounted.current) {
        setTracking(data);
        setError('');
      }
    } catch (e) {
      if (mounted.current) setError(getErrorMessage(e));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [bookingId, enabled, asPartner]);

  useEffect(() => {
    mounted.current = true;
    if (!enabled || !bookingId) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    void fetchOnce();
    const id = window.setInterval(() => void fetchOnce(), pollMs);
    return () => {
      mounted.current = false;
      window.clearInterval(id);
    };
  }, [bookingId, enabled, pollMs, fetchOnce]);

  return { tracking, loading, error, refresh: fetchOnce };
}
