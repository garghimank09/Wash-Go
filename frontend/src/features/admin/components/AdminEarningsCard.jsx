import { Card } from '../../../ui/card';
import { formatCents } from '../../../utils/format';

export function AdminEarningsCard({ earnings }) {
  if (!earnings) return null;

  const rows = [
    { label: 'Gross volume', value: earnings.grossCents, emphasize: true },
    { label: 'Platform fees', value: earnings.platformFeesCents },
    { label: 'Washer payouts', value: earnings.washerPayoutsCents },
    { label: 'Pending settlement', value: earnings.pendingSettlementCents },
  ];

  return (
    <Card variant="enterprise" className="min-w-0 border-white/35 dark:border-white/10">
      <h2 className="wg-heading-section">Earnings overview</h2>
      <p className="mt-1 text-xs text-wg-muted">Settlement pipeline snapshot (30d gross).</p>
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
