import { useMemo } from 'react';
import { History } from 'lucide-react';

import { WasherWashHistoryList } from '../../features/washer/WasherWashHistoryList';
import { usePartnerBookings } from '../../hooks/usePartnerBookings';
import { selectCompletedWashHistory, historyPayoutCents } from '../../lib/partnerWashHistory';
import { formatCents } from '../../utils/format';
import { Card } from '../../ui/card';

export function WasherHistoryPage() {
  const { items, loading, error } = usePartnerBookings();
  const history = useMemo(() => selectCompletedWashHistory(items), [items]);
  const totalPayout = useMemo(
    () => history.reduce((sum, b) => sum + historyPayoutCents(b), 0),
    [history],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-wg-text">
          <History className="size-7 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} aria-hidden />
          Wash history
        </h1>
        <p className="mt-1 text-sm text-wg-muted">
          Every job you accepted and completed — payout shown at your 90% partner share.
        </p>
      </div>

      {!loading && history.length > 0 ? (
        <Card variant="glass" className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 to-transparent p-4 dark:border-emerald-500/10">
          <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Lifetime completed</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-wg-text">{history.length}</p>
          <p className="mt-0.5 text-sm text-wg-muted">
            Total partner share · <span className="font-bold text-wg-text">{formatCents(totalPayout)}</span>
          </p>
        </Card>
      ) : null}

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <WasherWashHistoryList bookings={items} loading={loading} />
    </div>
  );
}
