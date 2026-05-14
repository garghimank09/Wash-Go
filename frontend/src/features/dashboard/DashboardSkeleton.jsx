import Skeleton from 'react-loading-skeleton';

import { Card } from '../../ui/card';

/** Initial dashboard load — customer-first bento (no business chart placeholders). */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <Card variant="glass" className="min-h-[140px] overflow-hidden shadow-wg-card">
        <Skeleton width={100} height={14} />
        <Skeleton className="mt-3" height={36} width="55%" />
        <Skeleton className="mt-3" height={16} width="78%" />
        <div className="mt-6 flex flex-wrap gap-2">
          <Skeleton height={36} width={120} borderRadius={12} />
          <Skeleton height={36} width={140} borderRadius={12} />
        </div>
      </Card>

      <Card variant="glass" className="min-h-[96px] shadow-wg-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton circle height={48} width={48} />
          <div className="flex-1 space-y-2">
            <Skeleton height={18} width="38%" />
            <Skeleton height={14} width="72%" />
          </div>
          <Skeleton height={40} width={160} borderRadius={12} />
        </div>
      </Card>

      <Card variant="glass" className="min-h-[88px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Skeleton circle height={48} width={48} />
            <div className="flex-1 space-y-2">
              <Skeleton height={16} width="42%" />
              <Skeleton height={12} width="88%" />
            </div>
          </div>
          <Skeleton height={40} width={132} borderRadius={12} />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} variant="glass" className="min-h-[112px] shadow-wg-card">
            <Skeleton height={12} width="50%" />
            <Skeleton className="mt-4" height={30} width="45%" />
          </Card>
        ))}
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card variant="glass" className="min-h-[280px] shadow-wg-card">
            <Skeleton height={20} width="40%" />
            <Skeleton className="mt-4" height={120} borderRadius={16} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Skeleton height={96} borderRadius={16} />
              <Skeleton height={96} borderRadius={16} />
            </div>
            <Skeleton className="mt-5" height={8} borderRadius={999} />
            <Skeleton className="mt-4" height={14} width="100%" />
            <Skeleton className="mt-2" height={14} width="92%" />
          </Card>
          <Card variant="glass" className="min-h-[180px]">
            <Skeleton height={20} width="48%" />
            <Skeleton className="mt-4" height={64} borderRadius={14} />
            <Skeleton className="mt-2" height={64} borderRadius={14} />
          </Card>
          <div className="grid min-w-0 gap-6 md:grid-cols-2">
            <Card variant="glass" className="min-h-[160px]">
              <Skeleton height={20} width="55%" />
              <Skeleton className="mt-4" height={52} borderRadius={12} />
            </Card>
            <Card variant="glass" className="min-h-[160px]">
              <Skeleton height={20} width="62%" />
              <Skeleton className="mt-4" height={14} count={3} />
            </Card>
          </div>
          <Card variant="glass" className="min-h-[140px]">
            <Skeleton height={22} width="40%" />
            <Skeleton className="mt-4" height={14} count={2} />
            <Skeleton className="mt-4" height={40} width={140} borderRadius={12} />
          </Card>
        </div>
        <div className="min-w-0 space-y-6">
          <Card variant="glass" className="min-h-[200px]">
            <Skeleton height={22} width="38%" />
            <Skeleton className="mt-4" height={28} width="50%" />
            <Skeleton className="mt-3" height={8} borderRadius={999} />
          </Card>
          <Card variant="glass" className="min-h-[160px]">
            <Skeleton height={22} width="55%" />
            <Skeleton className="mt-4" height={72} borderRadius={14} />
          </Card>
          <Card variant="glass" className="min-h-[200px]">
            <Skeleton height={22} width="48%" />
            <Skeleton className="mt-4" height={14} count={4} />
          </Card>
          <Card variant="glass" className="min-h-[200px]">
            <Skeleton height={22} width="52%" />
            <Skeleton className="mt-4" height={14} count={4} />
          </Card>
          <Card variant="glass" className="min-h-[200px]">
            <Skeleton height={22} width="44%" />
            <Skeleton className="mt-4" height={14} count={3} />
          </Card>
        </div>
      </div>
    </div>
  );
}
