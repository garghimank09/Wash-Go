import { Card } from '../../../ui/card';
import { AdminDataSourceBadge } from './AdminDataSourceBadge';
import { formatCents } from '../../../utils/format';

export function AdminEarningsCard({ earnings }) {
  if (!earnings) return null;

  const rows = [
    { label: 'Customer paid (30d · completed)', value: earnings.customerPaid30dCents, emphasize: false },
    { label: 'Accepted gross (30d · ledger)', value: earnings.grossCents, emphasize: true },
    { label: `Partner share (${earnings.sharePercent ?? 90}%)`, value: earnings.washerPayoutsCents },
    { label: 'Platform fees (30d)', value: earnings.platformFeesCents },
    { label: 'Pending partner settlement', value: earnings.pendingSettlementCents },
    { label: 'Paid out to partners', value: earnings.paidOutCents },
  ];

  if (earnings.customerPaidLifetimeCents != null) {
    rows.push({
      label: 'Customer paid (lifetime)',
      value: earnings.customerPaidLifetimeCents,
    });
  }

  return (
    <Card variant="enterprise" className="min-w-0 border-white/35 dark:border-white/10">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="wg-heading-section">Earnings overview</h2>
          <p className="mt-1 text-xs text-wg-muted">Live from bookings + partner earnings ledger.</p>
        </div>
        <AdminDataSourceBadge source={earnings.fromApi ? 'live' : 'demo'} />
      </div>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li
            key={r.label}
            className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 last:border-0 last:pb-0 dark:border-white/5"
          >
            <span className="text-sm font-medium text-wg-muted">{r.label}</span>
            <span
              className={
                r.emphasize
                  ? 'text-lg font-black tabular-nums text-wg-text'
                  : 'text-sm font-semibold tabular-nums text-wg-text'
              }
            >
              {formatCents(r.value)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
