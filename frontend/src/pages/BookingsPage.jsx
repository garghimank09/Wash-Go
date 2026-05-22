import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { RefreshCw, Sparkles } from 'lucide-react';

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
  const { items, loading, refreshing, error, reload } = useBookings();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="wg-heading-display">Bookings</h1>
          <p className="text-wg-muted">Every card opens live detail and a richer timeline.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/booking">
            <Button size="sm" className="gap-2">
              <Sparkles className="size-4" strokeWidth={1.75} aria-hidden />
              New wash
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={refreshing}
            onClick={() => void reload()}
            type="button"
            aria-busy={refreshing}
          >
            <RefreshCw
              className={`size-4 shrink-0 ${refreshing ? 'animate-spin' : ''}`}
              strokeWidth={1.75}
              aria-hidden
            />
            Refresh
          </Button>
        </div>
      </div>
      {loading ? (
        <BookingsGridSkeleton />
      ) : error ? (
        <p className="text-rose-600">{error}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.length === 0 ? (
            <Card className="col-span-full flex flex-col items-center justify-center border-dashed py-12 text-center">
              <p className="text-wg-muted">No bookings yet.</p>
              <Link to="/booking" className="mt-4">
                <Button size="sm" className="gap-2">
                  <Sparkles className="size-4" strokeWidth={1.75} aria-hidden />
                  Book your first wash
                </Button>
              </Link>
            </Card>
          ) : (
            items.map((b) => <BookingCardLink key={b.id} booking={b} />)
          )}
        </div>
      )}
    </div>
  );
}
