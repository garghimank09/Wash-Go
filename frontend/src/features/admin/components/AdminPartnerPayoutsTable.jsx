import { Card } from '../../../ui/card';
import { EmptyState } from '../../../ui/empty-state';
import { AdminDataSourceBadge } from './AdminDataSourceBadge';
import { formatCents } from '../../../utils/format';
import { Users } from 'lucide-react';

export function AdminPartnerPayoutsTable({ partners, sharePercent = 90, fromApi = false }) {
  const rows = partners || [];

  return (
    <Card variant="enterprise" className="min-w-0 overflow-hidden p-0">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-4 py-3 dark:border-white/5">
        <div>
          <h2 className="wg-heading-section">Partner payouts</h2>
          <p className="mt-0.5 text-xs text-wg-muted">
            Customer payment split — {sharePercent}% to each partner on accept, remainder to platform.
          </p>
        </div>
        <AdminDataSourceBadge source={fromApi ? 'live' : 'demo'} />
      </div>
      {!rows.length ? (
        <div className="p-8">
          <EmptyState
            icon={Users}
            title="No partner earnings yet"
            description="Earnings rows are created when a partner accepts a job."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-wg-surface-elevated/95 text-[10px] font-black uppercase tracking-wide text-wg-muted">
              <tr className="border-b border-wg-border">
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Jobs</th>
                <th className="px-4 py-3">Gross (accepted)</th>
                <th className="px-4 py-3">Partner share</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">Paid out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wg-border/70">
              {rows.map((p) => (
                <tr key={p.washer_id} className="hover:bg-emerald-500/[0.04]">
                  <td className="px-4 py-3 font-semibold text-wg-text">{p.partner_name}</td>
                  <td className="px-4 py-3 tabular-nums text-wg-muted">{p.jobs}</td>
                  <td className="px-4 py-3 tabular-nums font-medium">{formatCents(p.gross_cents)}</td>
                  <td className="px-4 py-3 tabular-nums font-bold text-emerald-800 dark:text-emerald-200">
                    {formatCents(p.partner_cents)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-amber-800 dark:text-amber-200">
                    {formatCents(p.pending_cents)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-wg-muted">{formatCents(p.paid_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
