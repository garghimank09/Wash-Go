import { BookingCardLink } from '../components/BookingCard';
import { Button } from '../components/Button';
import { Loader } from '../components/Loader';
import { useBookings } from '../hooks/useBookings';

export function BookingsPage() {
  const { items, loading, error, reload } = useBookings();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Bookings</h1>
          <p className="text-slate-600 dark:text-slate-400">Every row links to live detail & timeline.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => reload()}>
          Refresh
        </Button>
      </div>
      {loading ? (
        <Loader />
      ) : error ? (
        <p className="text-rose-600">{error}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">No bookings yet — create one from Quick booking.</p>
          ) : (
            items.map((b) => <BookingCardLink key={b.id} booking={b} />)
          )}
        </div>
      )}
    </div>
  );
}
