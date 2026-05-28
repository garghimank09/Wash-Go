import { useState } from 'react';

import { Button } from '../../../ui/button';
import { AdminBookingMonitorModal } from './AdminBookingMonitorModal';
import { Card } from '../../../ui/card';
import { StatusPill } from '../../../ui/status-pill';
import { EmptyState } from '../../../ui/empty-state';
import { Calendar } from 'lucide-react';
import { formatCents, formatDateTime } from '../../../utils/format';

export function AdminBookingsTable({
  rows,
  title = 'Booking management',
  description = 'Live queue — syncs with customer & washer apps.',
  emptyTitle = 'No bookings match',
  emptyDescription = 'Try clearing filters or search.',
}) {
  const [monitorId, setMonitorId] = useState(null);

  if (!rows?.length) {
    return (
      <Card variant="enterprise" className="min-w-0 p-8">
        <EmptyState icon={Calendar} title={emptyTitle} description={emptyDescription} />
      </Card>
    );
  }

  return (
    <Card variant="enterprise" className="min-w-0 overflow-hidden p-0">
      <div className="border-b border-white/15 px-6 py-4 dark:border-white/10">
        <h2 className="wg-heading-section">{title}</h2>
        <p className="mt-1 text-xs text-wg-muted">{description}</p>
      </div>
      <div className="wg-admin-table-wrap">
        <table className="wg-admin-table min-w-[720px]">
          <thead className="wg-admin-table-head">
            <tr>
              <th className="wg-admin-table-th whitespace-nowrap">ID</th>
              <th className="wg-admin-table-th whitespace-nowrap">Customer</th>
              <th className="wg-admin-table-th whitespace-nowrap">Washer</th>
              <th className="wg-admin-table-th whitespace-nowrap">Scheduled</th>
              <th className="wg-admin-table-th whitespace-nowrap">Status</th>
              <th className="wg-admin-table-th whitespace-nowrap">City</th>
              <th className="wg-admin-table-th whitespace-nowrap text-right">Price</th>
              <th className="wg-admin-table-th whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="wg-admin-table-row">
                <td className="wg-admin-table-td whitespace-nowrap font-mono text-xs text-wg-muted">{r.id}</td>
                <td className="wg-admin-table-td whitespace-nowrap font-semibold">{r.customer}</td>
                <td className="wg-admin-table-td whitespace-nowrap text-wg-muted">{r.washer}</td>
                <td className="wg-admin-table-td whitespace-nowrap tabular-nums text-wg-muted">{formatDateTime(r.scheduledAt)}</td>
                <td className="wg-admin-table-td whitespace-nowrap">
                  <StatusPill status={r.status} />
                </td>
                <td className="wg-admin-table-td whitespace-nowrap text-wg-muted">{r.city}</td>
                <td className="wg-admin-table-td whitespace-nowrap text-right font-semibold tabular-nums">
                  {r.priceCents > 0 ? formatCents(r.priceCents) : '—'}
                </td>
                <td className="wg-admin-table-td whitespace-nowrap text-right">
                  <Button type="button" size="sm" variant="outline" onClick={() => setMonitorId(r.rawId)}>
                    Photos
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminBookingMonitorModal bookingId={monitorId} onClose={() => setMonitorId(null)} />
    </Card>
  );
}
