import Skeleton from 'react-loading-skeleton';

import { BookingCardLink } from '../components/BookingCard';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useBookings } from '../hooks/useBookings';

function BookingsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[0, 1, 2, 3].map((k) => (
        <Card key={k} className="min-h-[140px]">
          <Skeleton height={22} width={100} className="mb-3" />
          <Skeleton height={28} width="45%" className="mb-4" />
          <Skeleton count={2} height={14} />
        </Card>
      ))}
    </div>
  );
}

export function BookingsPage() {
  const { items, loading, error, reload } = useBookings();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="wg-heading-display">Bookings</h1>
          <p className="text-wg-muted">Every card opens live detail and a richer timeline.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => reload()}>
          Refresh
        </Button>
      </div>
      {loading ? (
        <BookingsGridSkeleton />
      ) : error ? (
        <p className="text-rose-600">{error}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.length === 0 ? (
            <p className="text-wg-muted">No bookings yet — create one from Book a wash.</p>
          ) : (
            items.map((b) => <BookingCardLink key={b.id} booking={b} />)
          )}
        </div>
      )}
    </div>
  );
}
