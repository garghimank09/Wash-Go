import { lazy, Suspense } from 'react';

import { Card } from '../../ui/card';
import { Loader } from '../../ui/loader';

const DashboardActivityChart = lazy(() =>
  import('./DashboardActivityChart').then((mod) => ({ default: mod.DashboardActivityChart })),
);
const DashboardStatusMix = lazy(() =>
  import('./DashboardStatusMix').then((mod) => ({ default: mod.DashboardStatusMix })),
);
const DashboardRevenueChart = lazy(() =>
  import('./DashboardRevenueChart').then((mod) => ({ default: mod.DashboardRevenueChart })),
);

function ChartFallback() {
  return (
    <Card className="flex min-h-[220px] min-w-0 items-center justify-center">
      <Loader compact />
    </Card>
  );
}

export function DashboardAnalyticsSection({ items }) {
  return (
    <div className="space-y-6">
      <div className="grid min-w-0 gap-6 md:grid-cols-2">
        <Suspense fallback={<ChartFallback />}>
          <DashboardActivityChart items={items} />
        </Suspense>
        <Suspense fallback={<ChartFallback />}>
          <DashboardStatusMix items={items} />
        </Suspense>
      </div>
      <Suspense fallback={<ChartFallback />}>
        <DashboardRevenueChart items={items} />
      </Suspense>
    </div>
  );
}
