import { useCallback, useEffect, useRef, useState } from 'react';
import { partnerBookingsService } from '../services/partnerBookingsService';
import { onPartnerBookingsSync } from '../lib/partnerSyncEvents';
import { usePartnerAuth } from '../context/PartnerAuthContext';

/**
 * Fetch the partner's assigned bookings and stay in sync with the global
 * `/bookings/sync` poller — any change to the version fingerprint triggers
 * a silent reload.
 *
 * @returns {{
 *   items: any[],
 *   loading: boolean,
 *   refreshing: boolean,
 *   error: string | null,
 *   reload: () => Promise<void>,
 *   reloadSilent: () => Promise<void>,
 * }}
 */
export default function usePartnerBookings() {
  const { isPartnerAuthenticated } = usePartnerAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const inFlightRef = useRef(false);

  const reloadSilent = useCallback(async () => {
    if (!isPartnerAuthenticated || inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const data = await partnerBookingsService.list();
      setItems(data?.items || []);
      setError(null);
    } catch (e) {
      setError(e?.message || 'Could not load jobs');
    } finally {
      inFlightRef.current = false;
    }
  }, [isPartnerAuthenticated]);

  const reload = useCallback(async () => {
    if (!isPartnerAuthenticated) return;
    setRefreshing(true);
    try {
      const data = await partnerBookingsService.list();
      setItems(data?.items || []);
      setError(null);
    } catch (e) {
      setError(e?.message || 'Could not load jobs');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [isPartnerAuthenticated]);

  useEffect(() => {
    if (!isPartnerAuthenticated) {
      setItems([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    let cancelled = false;
    (async () => {
      try {
        const data = await partnerBookingsService.list();
        if (cancelled) return;
        setItems(data?.items || []);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || 'Could not load jobs');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPartnerAuthenticated]);

  useEffect(() => onPartnerBookingsSync(() => reloadSilent()), [reloadSilent]);

  return { items, loading, refreshing, error, reload, reloadSilent };
}
