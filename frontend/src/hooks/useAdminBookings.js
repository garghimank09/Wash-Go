import { useCallback, useEffect, useMemo, useState } from 'react';

import { computeAdminKpis, computeLiveOpsSnapshot } from '../lib/adminBookingsMap';
import { onBookingsSync } from '../lib/bookingSyncEvents';
import { getErrorMessage } from '../services/api';
import { adminService } from '../services/adminService';

/** Live admin booking dataset — synced via SSE like customer/partner shells. */
export function useAdminBookings() {
  const [items, setItems] = useState([]);
  const [fleetWashers, setFleetWashers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFleet = useCallback(async () => {
    try {
      const data = await adminService.listAdminFleet();
      setFleetWashers(data.items || []);
    } catch {
      setFleetWashers([]);
    }
  }, []);

  const reloadSilent = useCallback(async () => {
    try {
      const data = await adminService.listBookings();
      setItems(data.items || []);
      setError(null);
      await fetchFleet();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [fetchFleet]);

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await adminService.listBookings();
      setItems(data.items || []);
      await fetchFleet();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [fetchFleet]);

  useEffect(() => {
    const t = setTimeout(() => void reload(), 0);
    return () => clearTimeout(t);
  }, [reload]);

  useEffect(() => onBookingsSync(() => void reloadSilent()), [reloadSilent]);

  const kpis = useMemo(() => computeAdminKpis(items), [items]);
  const liveOpsSnapshot = useMemo(
    () => computeLiveOpsSnapshot(kpis, items, fleetWashers),
    [kpis, items, fleetWashers],
  );

  return { items, fleetWashers, loading, error, reload, kpis, liveOpsSnapshot };
}
