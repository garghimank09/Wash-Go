import { CreditCard, ShieldCheck } from 'lucide-react';

import { formatCents } from '../../../utils/format';
import { Card } from '../../../ui/card';

export function PaymentStep({
  carLabel,
  packageLabel,
  scheduledLabel,
  priceCents,
  pricingLoading,
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/15 text-indigo-800 dark:text-indigo-200">
          <CreditCard className="size-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-wg-text">Pay & confirm (demo)</h2>
          <p className="mt-1 text-sm leading-relaxed text-wg-muted">
            Complete demo payment to send your booking to WashGo partners for acceptance.
          </p>
        </div>
      </div>

      <Card variant="glass" className="border-white/35 p-5 dark:border-white/10">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-wg-muted">Vehicle</dt>
            <dd className="font-semibold text-wg-text">{carLabel}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-wg-muted">Package</dt>
            <dd className="font-semibold text-wg-text">{packageLabel}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-wg-muted">When</dt>
            <dd className="text-right font-semibold text-wg-text">{scheduledLabel}</dd>
          </div>
          <div className="flex items-end justify-between gap-3 border-t border-white/20 pt-4 dark:border-white/10">
            <dt className="text-wg-muted">Total due</dt>
            <dd className="text-2xl font-black tabular-nums text-wg-text">
              {pricingLoading || priceCents == null ? '…' : formatCents(priceCents)}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="flex gap-3 border-dashed p-4 text-sm text-wg-muted">
        <ShieldCheck className="size-5 shrink-0 text-emerald-600" aria-hidden />
        <p>
          Demo only — no card is charged. After you pay, the job appears in partner Offers as an open
          booking they can accept.
        </p>
      </Card>
    </div>
  );
}
