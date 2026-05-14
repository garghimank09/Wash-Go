import Skeleton from 'react-loading-skeleton';

/** Skeleton for the vehicle step while cars are loading — avoids full-screen loader flash. */
export function BookingCarsSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading vehicles">
      <div className="space-y-2">
        <Skeleton height={14} width="42%" className="max-w-xs" />
        <Skeleton height={12} width="58%" className="max-w-md" />
      </div>
      <div className="flex flex-wrap gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={76} width={148} borderRadius={14} />
        ))}
      </div>
    </div>
  );
}
