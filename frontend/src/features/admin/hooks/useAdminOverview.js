import { useEffect, useMemo, useState } from 'react';

import {
  adminActiveMonitorRows,
  adminBookingVolumeSeries,
  adminCustomerGrowth,
  adminDayLabels,
  adminDispatchQueue,
  adminEarningsBreakdown,
  adminEscalations,
  adminHeatmapHourLabels,
  adminHeatmapMatrix,
  adminKpis,
  adminLiveFeed,
  adminLiveOpsSnapshot,
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
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setChartsReady(true), CHART_LOAD_MS);
    return () => window.clearTimeout(t);
  }, []);

  const data = useMemo(
    () => ({
      kpis: adminKpis,
      revenueSeries: adminRevenueSeries,
      bookingVolumeSeries: adminBookingVolumeSeries,
      customerGrowth: adminCustomerGrowth,
      satisfaction: adminSatisfactionSegments,
      earnings: adminEarningsBreakdown,
      heatmap: { matrix: adminHeatmapMatrix, dayLabels: adminDayLabels, hourLabels: adminHeatmapHourLabels },
      washers: adminWashers,
      feed: adminLiveFeed,
      liveOpsSnapshot: adminLiveOpsSnapshot,
      zonePerformance: adminZonePerformance,
      peakHourInsight: adminPeakHourInsight,
      topPerformers: adminTopPerformers,
      surgeZones: adminSurgeZones,
      activeMonitorRows: adminActiveMonitorRows,
      dispatchQueue: adminDispatchQueue,
      slaAlerts: adminSlaAlerts,
      escalations: adminEscalations,
    }),
    [],
  );

  return {
    data,
    chartsReady,
    loading: false,
    error: null,
  };
}
