import Skeleton from 'react-loading-skeleton';

import { Card } from '../../ui/card';

export function GarageSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
      {[0, 1, 2].map((k) => (
        <Card key={k} variant="glass" className="min-h-[220px] overflow-hidden shadow-wg-card">
          <div className="flex gap-4">
            <Skeleton circle height={56} width={56} />
            <div className="flex-1 space-y-2">
              <Skeleton height={20} width="55%" />
              <Skeleton height={14} width="40%" />
              <Skeleton className="mt-4" height={12} width="100%" />
              <Skeleton height={12} width="88%" />
            </div>
          </div>
          <Skeleton className="mt-6" height={72} borderRadius={14} />
        </Card>
      ))}
    </div>
  );
}
