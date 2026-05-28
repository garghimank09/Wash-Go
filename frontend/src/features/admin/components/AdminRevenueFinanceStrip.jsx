import Skeleton from 'react-loading-skeleton';
import { Building2, DollarSign, Layers, Truck } from 'lucide-react';

import { cn } from '../../../lib/cn';
import { formatCents } from '../../../utils/format';
import { Card } from '../../../ui/card';
import { AdminDataSourceBadge } from './AdminDataSourceBadge';

function FinanceMetricCard({
  label,
  value,
  caption,
  lifetimeCents,
  loading,
  icon: Icon,
  className,
}) {
  return (
    <Card
      variant="glass"
      className={cn('flex min-w-0 flex-col p-5', className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-wg-muted">{label}</p>
          <div className="mt-2 min-h-[2.25rem]">
            {loading ? (
              <Skeleton height={32} width="60%" />
            ) : (
              <p className="text-2xl font-black tabular-nums text-wg-text">{value}</p>
            )}
          </div>
        </div>
        {Icon ? (
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from/18 to-brand-to/15 text-cyan-700 dark:text-cyan-300"
            aria-hidden
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </span>
        ) : null}
      </div>
      {caption ? (
        <p className="mt-3 block text-xs leading-relaxed text-wg-muted">{caption}</p>
      ) : null}
      {lifetimeCents != null && !loading ? (
        <p className="mt-2 block text-xs text-wg-muted">
          <span className="font-semibold text-wg-text">Lifetime:</span>{' '}
          <span className="tabular-nums">{formatCents(lifetimeCents)}</span>
        </p>
      ) : null}
    </Card>
  );
}

export function AdminRevenueFinanceStrip({ earnings, loading }) {
  const share = earnings?.sharePercent ?? 90;
  const platformShare = 100 - share;

  const showLedgerNote =
    earnings?.grossCents != null &&
    earnings.grossCents !== earnings.customerPaid30dCents;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-wg-muted">Financial summary (30 days)</p>
        <AdminDataSourceBadge source={earnings?.fromApi ? 'live' : 'demo'} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinanceMetricCard
          label="Total revenue"
          value={earnings ? formatCents(earnings.customerPaid30dCents) : '—'}
          caption="Customer payments on completed washes."
          lifetimeCents={earnings?.customerPaidLifetimeCents}
          loading={loading}
          icon={DollarSign}
          className="ring-1 ring-cyan-500/20"
        />
        <FinanceMetricCard
          label="Total income"
          value={earnings ? formatCents(earnings.grossCents) : '—'}
          caption="Accepted job gross from the partner earnings ledger."
          lifetimeCents={earnings?.grossAcceptedLifetimeCents}
          loading={loading}
          icon={Layers}
        />
        <FinanceMetricCard
          label="Washer revenue total"
          value={earnings ? formatCents(earnings.washerPayoutsCents) : '—'}
          caption={`Partner share (${share}%) on accepted jobs.`}
          lifetimeCents={earnings?.partnerPayoutsLifetimeCents}
          loading={loading}
          icon={Truck}
        />
        <FinanceMetricCard
          label="Our income"
          value={earnings ? formatCents(earnings.platformFeesCents) : '—'}
          caption={`Platform share (${platformShare}%) — your take.`}
          lifetimeCents={earnings?.platformFeesLifetimeCents}
          loading={loading}
          icon={Building2}
          className="ring-1 ring-violet-500/25"
        />
      </div>

      {showLedgerNote ? (
        <Card variant="inset" className="p-4">
          <p className="block text-xs leading-relaxed text-wg-muted">
            <span className="font-semibold text-wg-text">Note:</span> Total income (accepted gross) can differ from
            total revenue (completed payments) until washers accept jobs and bookings finish. Washer revenue + our
            income equals accepted gross on the ledger.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
