import { useEffect, useMemo, useState } from 'react';

import { useAdminBookings } from '../../../hooks/useAdminBookings';
import {
  computeActiveMonitorRows,
  computeBookingVolumeSeries,
  fleetWashersToGridRows,
  mergeActiveMonitorWithDemo,
  mergeFleetWithDemo,
  toDispatchQueueItem,
} from '../../../lib/adminBookingsMap';
import {
  adminActiveMonitorRows,
  adminBookingVolumeSeries,
  adminCustomerGrowth,
  adminDayLabels,
  adminEarningsBreakdown,
  adminEscalations,
  adminHeatmapHourLabels,
  adminHeatmapMatrix,
  adminLiveFeed,
  adminPeakHourInsight,
  adminRevenueSeries,
  adminSatisfactionSegments,
  adminSlaAlerts,
  adminSurgeZones,
  adminTopPerformers,
  adminWashers,
  adminZonePerformance,
} from '../mock/adminMock';

const CHART_LOAD_MS = 520;

export function useAdminOverview() {
  const { items, fleetWashers, loading, error, kpis, liveOpsSnapshot } = useAdminBookings();
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setChartsReady(true), CHART_LOAD_MS);
    return () => window.clearTimeout(t);
  }, []);

  const dispatchQueue = useMemo(() => {
    const pending = items.filter((b) => b.status === 'pending' && !b.washer_id);
    return pending.map((b, i) => toDispatchQueueItem(b, i));
  }, [items]);

  const activeMonitorRows = useMemo(() => {
    const live = computeActiveMonitorRows(items);
    return mergeActiveMonitorWithDemo(live, adminActiveMonitorRows);
  }, [items]);

  const bookingVolumeFromApi = useMemo(() => computeBookingVolumeSeries(items), [items]);
  const bookingVolumeSeries = useMemo(
    () => bookingVolumeFromApi || adminBookingVolumeSeries,
    [bookingVolumeFromApi],
  );

  const washers = useMemo(() => {
    const live = fleetWashersToGridRows(fleetWashers);
    return mergeFleetWithDemo(live, adminWashers);
  }, [fleetWashers]);

  const data = useMemo(
    () => ({
      kpis: {
        ...kpis,
        openComplaints: 12,
        customerGrowthPct: kpis.bookings30d > 0 ? 12 : 0,
        csatScore: 4.7,
      },
      revenueSeries: adminRevenueSeries,
      bookingVolumeSeries,
      bookingVolumeFromApi: !!bookingVolumeFromApi,
      customerGrowth: adminCustomerGrowth,
      satisfaction: adminSatisfactionSegments,
      earnings: adminEarningsBreakdown,
      heatmap: { matrix: adminHeatmapMatrix, dayLabels: adminDayLabels, hourLabels: adminHeatmapHourLabels },
      washers,
      washersFromApi: !!fleetWashers?.length,
      fleetWashers,
      feed: adminLiveFeed,
      liveOpsSnapshot,
      zonePerformance: adminZonePerformance,
      peakHourInsight: adminPeakHourInsight,
      topPerformers: adminTopPerformers,
      surgeZones: adminSurgeZones,
      activeMonitorRows,
      activeMonitorLiveCount: activeMonitorRows.filter((r) => r.source === 'live').length,
      dispatchQueue,
      slaAlerts: adminSlaAlerts,
      escalations: adminEscalations,
    }),
    [kpis, liveOpsSnapshot, dispatchQueue, activeMonitorRows, bookingVolumeSeries, bookingVolumeFromApi, washers, fleetWashers],
  );

  return {
    data,
    chartsReady,
    loading,
    error,
  };
}
