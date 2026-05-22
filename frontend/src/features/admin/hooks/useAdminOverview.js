import { useEffect, useMemo, useState } from 'react';

import { useAdminBookings } from '../../../hooks/useAdminBookings';
import {
  computeCustomerGrowth,
  computeEarningsBreakdown,
  computeEscalations,
  computeHeatmap,
  computePeakHourInsight,
  computeRepeatCustomerPct,
  computeRevenueSeries,
  computeSatisfactionSegments,
  computeSlaAlerts,
  computeSurgeZones,
  computeTopPerformers,
  computeZonePerformance,
} from '../../../lib/adminAnalytics';
import {
  computeActiveMonitorRows,
  computeBookingVolumeSeries,
  fleetWashersToGridRows,
  toDispatchQueueItem,
} from '../../../lib/adminBookingsMap';

const CHART_LOAD_MS = 320;

export function useAdminOverview() {
  const { items, fleetWashers, loading, error, kpis: baseKpis, liveOpsSnapshot } = useAdminBookings();
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setChartsReady(true), CHART_LOAD_MS);
    return () => window.clearTimeout(t);
  }, []);

  const dispatchQueue = useMemo(() => {
    const pending = items.filter((b) => b.status === 'pending' && !b.washer_id);
    return pending.map((b, i) => toDispatchQueueItem(b, i));
  }, [items]);

  const activeMonitorRows = useMemo(() => computeActiveMonitorRows(items), [items]);

  const bookingVolumeSeries = useMemo(() => {
    const live = computeBookingVolumeSeries(items);
    return live || [
      { label: 'Mon', bookings: 0 },
      { label: 'Tue', bookings: 0 },
      { label: 'Wed', bookings: 0 },
      { label: 'Thu', bookings: 0 },
      { label: 'Fri', bookings: 0 },
      { label: 'Sat', bookings: 0 },
      { label: 'Sun', bookings: 0 },
    ];
  }, [items]);

  const washers = useMemo(() => fleetWashersToGridRows(fleetWashers), [fleetWashers]);

  const kpis = useMemo(
    () => ({
      ...baseKpis,
      repeatCustomerPct: computeRepeatCustomerPct(items),
      customerGrowthPct:
        baseKpis.bookings30d > 0
          ? Math.min(99, Math.round(computeRepeatCustomerPct(items)))
          : 0,
    }),
    [baseKpis, items],
  );

  const data = useMemo(
    () => ({
      kpis,
      revenueSeries: computeRevenueSeries(items),
      bookingVolumeSeries,
      bookingVolumeFromApi: true,
      customerGrowth: computeCustomerGrowth(items),
      satisfaction: computeSatisfactionSegments(items),
      earnings: computeEarningsBreakdown(kpis),
      heatmap: computeHeatmap(items),
      washers,
      washersFromApi: !!fleetWashers?.length,
      fleetWashers,
      liveOpsSnapshot,
      zonePerformance: computeZonePerformance(items),
      peakHourInsight: computePeakHourInsight(items),
      topPerformers: computeTopPerformers(fleetWashers),
      surgeZones: computeSurgeZones(items),
      activeMonitorRows,
      activeMonitorLiveCount: activeMonitorRows.length,
      dispatchQueue,
      slaAlerts: computeSlaAlerts(items, kpis),
      escalations: computeEscalations(items),
    }),
    [
      kpis,
      liveOpsSnapshot,
      dispatchQueue,
      activeMonitorRows,
      bookingVolumeSeries,
      washers,
      fleetWashers,
      items,
    ],
  );

  return {
    data,
    chartsReady,
    loading,
    error,
  };
}
