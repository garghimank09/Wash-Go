import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Card } from '../components/Card';
import { Loader } from '../components/Loader';
import { bookingsService } from '../services/bookingsService';
import { getErrorMessage } from '../services/api';
import { formatCents, formatDateTime } from '../utils/format';

export function BookingDetailPage() {
  const { id } = useParams();
  const [b, setB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await bookingsService.get(id);
        if (!cancelled) setB(data);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <Loader fullScreen message="Loading booking…" />;
  if (error || !b) {
    return (
      <div>
        <p className="text-rose-600">{error || 'Not found'}</p>
        <Link to="/bookings" className="mt-4 inline-block text-cyan-600 hover:underline">
          ← Back to bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/bookings" className="text-sm font-semibold text-cyan-600 hover:underline dark:text-cyan-400">
          ← All bookings
        </Link>
        <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-bold uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {b.status.replace('_', ' ')}
        </span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Booking detail</h1>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCents(b.price_cents, b.currency)}</p>
      </div>

      {b.eta_minutes != null ? (
        <Card>
          <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">ETA</p>
          <p className="mt-1 text-2xl font-black text-cyan-600 dark:text-cyan-400">~{b.eta_minutes} minutes</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Swap this block for a live map + WebSocket stream when ready.
          </p>
        </Card>
      ) : null}

      <Card>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Washer</h2>
        {b.washer ? (
          <div className="mt-3">
            <p className="text-xl font-semibold text-slate-900 dark:text-white">{b.washer.full_name}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Rating {Number(b.washer.rating_avg).toFixed(1)}
              {b.washer.service_area ? ` · ${b.washer.service_area}` : ''}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Washer assignment pending.</p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Summary</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Vehicle</dt>
            <dd className="font-medium text-slate-900 dark:text-white">{b.car_label || '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Scheduled</dt>
            <dd className="font-medium text-slate-900 dark:text-white">{formatDateTime(b.scheduled_at)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500 dark:text-slate-400">Address</dt>
            <dd className="font-medium text-slate-900 dark:text-white">{b.service_address}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Status timeline</h2>
        <ul className="mt-4 space-y-0">
          {b.timeline?.map((step, i) => (
            <li key={step.key} className={`flex gap-4 py-4 ${i < b.timeline.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
              <span
                className={`mt-1 h-3 w-3 shrink-0 rounded-full ${step.done ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{step.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {step.at ? formatDateTime(step.at) : step.done ? 'Completed' : 'Pending'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
