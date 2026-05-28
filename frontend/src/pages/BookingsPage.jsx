import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { RefreshCw, Sparkles } from 'lucide-react';

import { BookingCardLink } from '../components/BookingCard';
import { ListFilterToolbar } from '../components/list/ListFilterToolbar';
import { ListPagination } from '../components/list/ListPagination';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useBookings } from '../hooks/useBookings';
import { usePaginatedList } from '../hooks/usePaginatedList';
import {
  compareByScheduledAt,
  CUSTOMER_BOOKING_STATUS_OPTIONS,
  matchCustomerBookingStatus,
  searchBookingRow,
} from '../lib/paginatedList';

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
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');

  const { pageItems, filteredCount, page, setPage, totalPages, rangeStart, rangeEnd } = usePaginatedList(
    items,
    {
      statusFilter,
      query,
      sort,
      matchStatus: matchCustomerBookingStatus,
      matchSearch: searchBookingRow,
      compare: compareByScheduledAt,
    },
  );

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

      {!loading && items.length > 0 ? (
        <ListFilterToolbar
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          statusOptions={CUSTOMER_BOOKING_STATUS_OPTIONS}
          sort={sort}
          onSort={setSort}
        />
      ) : null}

      {loading ? (
        <BookingsGridSkeleton />
      ) : error ? (
        <p className="text-rose-600">{error}</p>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed py-12 text-center">
          <p className="text-wg-muted">No bookings yet.</p>
          <Link to="/booking" className="mt-4">
            <Button size="sm" className="gap-2">
              <Sparkles className="size-4" strokeWidth={1.75} aria-hidden />
              Book your first wash
            </Button>
          </Link>
        </Card>
      ) : filteredCount === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed py-12 text-center">
          <p className="text-wg-muted">No bookings match your filters.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setQuery('');
              setStatusFilter('all');
            }}
          >
            Clear filters
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {pageItems.map((b) => (
              <BookingCardLink key={b.id} booking={b} />
            ))}
          </div>
          <ListPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            totalCount={filteredCount}
          />
        </div>
      )}
    </div>
  );
}
