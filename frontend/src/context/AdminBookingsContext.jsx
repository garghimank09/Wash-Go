import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { computeAdminKpis, computeLiveOpsSnapshot } from '../lib/adminBookingsMap';
import { onBookingsSync } from '../lib/bookingSyncEvents';
import { getErrorMessage } from '../services/api';
import { adminService } from '../services/adminService';

const AdminBookingsContext = createContext(null);

function useAdminBookingsState() {
  const [items, setItems] = useState([]);
  const [fleetWashers, setFleetWashers] = useState([]);
  const [earningsOverview, setEarningsOverview] = useState(null);
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

  const fetchEarnings = useCallback(async () => {
    try {
      const data = await adminService.getEarningsOverview();
      setEarningsOverview(data);
    } catch {
      setEarningsOverview(null);
    }
  }, []);

  const reloadSilent = useCallback(async () => {
    try {
      const data = await adminService.listBookings();
      setItems(data.items || []);
      setError(null);
      await Promise.all([fetchFleet(), fetchEarnings()]);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [fetchFleet, fetchEarnings]);

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await adminService.listBookings();
      setItems(data.items || []);
      await Promise.all([fetchFleet(), fetchEarnings()]);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [fetchFleet, fetchEarnings]);

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

  return { items, fleetWashers, earningsOverview, loading, error, reload, kpis, liveOpsSnapshot };
}

export function AdminBookingsProvider({ children }) {
  const value = useAdminBookingsState();
  return <AdminBookingsContext.Provider value={value}>{children}</AdminBookingsContext.Provider>;
}

/** Live admin booking dataset — one provider instance per admin shell (SSE-synced). */
export function useAdminBookings() {
  const ctx = useContext(AdminBookingsContext);
  if (!ctx) {
    throw new Error('useAdminBookings must be used within AdminBookingsProvider');
  }
  return ctx;
}
