import toast from 'react-hot-toast';

import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { StatusPill } from '../../../ui/status-pill';
import { EmptyState } from '../../../ui/empty-state';
import { Calendar } from 'lucide-react';
import { formatCents, formatDateTime } from '../../../utils/format';

export function AdminBookingsTable({ rows }) {
  const onOpen = () => {
    toast('Demo data — connect admin APIs to open live bookings.', { icon: 'ℹ️' });
  };

  if (!rows?.length) {
    return (
      <Card variant="glass" className="min-w-0 p-8">
        <EmptyState icon={Calendar} title="No bookings match" description="Try clearing filters or search." />
      </Card>
    );
  }

  return (
    <Card variant="glass" className="min-w-0 overflow-hidden border-white/35 p-0 dark:border-white/10">
      <div className="border-b border-white/15 px-6 py-4 dark:border-white/10">
        <h2 className="wg-heading-section">Booking management</h2>
        <p className="mt-1 text-xs text-wg-muted">Queue and lifecycle (mock rows).</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-wg-surface-elevated/95 text-xs font-bold uppercase tracking-wide text-wg-muted backdrop-blur-md dark:bg-wg-surface-elevated/90">
            <tr className="border-b border-wg-border">
              <th className="whitespace-nowrap px-6 py-3">ID</th>
              <th className="whitespace-nowrap px-4 py-3">Customer</th>
              <th className="whitespace-nowrap px-4 py-3">Washer</th>
              <th className="whitespace-nowrap px-4 py-3">Scheduled</th>
              <th className="whitespace-nowrap px-4 py-3">Status</th>
              <th className="whitespace-nowrap px-4 py-3">City</th>
              <th className="whitespace-nowrap px-4 py-3 text-right">Price</th>
              <th className="whitespace-nowrap px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wg-border/80">
            {rows.map((r) => (
              <tr
                key={r.id}
                className="bg-white/[0.02] transition hover:bg-cyan-500/[0.04] dark:bg-transparent dark:hover:bg-cyan-500/[0.06]"
              >
                <td className="whitespace-nowrap px-6 py-3 font-mono text-xs text-wg-muted">{r.id}</td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-wg-text">{r.customer}</td>
                <td className="whitespace-nowrap px-4 py-3 text-wg-muted">{r.washer}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-wg-muted">{formatDateTime(r.scheduledAt)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusPill status={r.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-wg-muted">{r.city}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-wg-text">
                  {r.priceCents > 0 ? formatCents(r.priceCents) : '—'}
                </td>
                <td className="whitespace-nowrap px-6 py-3 text-right">
                  <Button type="button" size="sm" variant="outline" onClick={onOpen}>
                    Open
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
