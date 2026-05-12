import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { BookingCard } from '../components/BookingCard';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Loader } from '../components/Loader';
import { MembershipCard } from '../components/MembershipCard';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../hooks/useBookings';
import { formatCents } from '../utils/format';

const ACTIVE = ['pending', 'confirmed', 'in_progress'];

export function DashboardPage() {
  const { user } = useAuth();
  const { items, loading, error, reload } = useBookings();

  const active = useMemo(() => items.find((b) => ACTIVE.includes(b.status)), [items]);
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((b) => b.status === 'completed').length;
    const upcoming = items.filter(
      (b) => ACTIVE.includes(b.status) && new Date(b.scheduled_at) > new Date(),
    ).length;
    const revenue = items.reduce((s, b) => s + (b.status === 'completed' ? b.price_cents : 0), 0);
    return { total, completed, upcoming, revenue };
  }, [items]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Hello, {user?.full_name?.split(' ')[0] ?? 'driver'}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Here is your wash command center.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/booking">
            <Button size="sm">Quick booking</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total bookings', value: stats.total },
          { label: 'Completed', value: stats.completed },
          { label: 'Upcoming active', value: stats.upcoming },
          { label: 'Paid through app', value: formatCents(stats.revenue) },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active booking</h2>
            <Button variant="ghost" size="sm" onClick={() => reload()}>
              Refresh
            </Button>
          </div>
          {loading ? (
            <Loader />
          ) : error ? (
            <p className="text-sm text-rose-600">{error}</p>
          ) : active ? (
            <div className="mt-4">
              <Link to={`/bookings/${active.id}`}>
                <BookingCard booking={active} />
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">No active wash right now.</p>
          )}
        </Card>
        <MembershipCard
          title="WashGo Plus"
          price="$39"
          perks={['Priority scheduling', 'AI wash recap', 'Member pricing']}
          highlighted
        />
      </div>
    </div>
  );
}
