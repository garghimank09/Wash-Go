import { Link } from 'react-router-dom';
import { Banknote } from 'lucide-react';

import { Card } from '../../../ui/card';
import { formatCents } from '../../../utils/format';
import { cn } from '../../../lib/cn';

const REFUND_LABEL = {
  none: 'None',
  requested: 'Requested',
  approved: 'Approved',
};

export function AdminRefundQueueCard({ rows }) {
  const refunds = (rows || []).filter((r) => r.refundStatus && r.refundStatus !== 'none');
  if (!refunds.length) return null;

  return (
    <Card variant="glass" className="border-l-4 border-l-rose-500/50 border-white/20 p-4 dark:border-white/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Banknote className="size-5 text-rose-600 dark:text-rose-400" strokeWidth={1.75} aria-hidden />
          <div>
            <h2 className="wg-heading-section">Refund & credits queue</h2>
            <p className="mt-0.5 text-xs text-wg-muted">Cases with refund motion (mock).</p>
          </div>
        </div>
        <Link to="/admin/complaints" className="text-xs font-bold text-cyan-700 dark:text-cyan-300">
          Full complaints →
        </Link>
      </div>
      <ul className="mt-3 space-y-2">
        {refunds.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-sm dark:border-white/8"
          >
            <span className="font-mono text-xs text-wg-muted">{r.id}</span>
            <span className="font-semibold text-wg-text">{r.customer}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                r.refundStatus === 'approved' && 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200',
                r.refundStatus === 'requested' && 'bg-amber-500/15 text-amber-900 dark:text-amber-100',
              )}
            >
              {REFUND_LABEL[r.refundStatus] || r.refundStatus}
            </span>
            <span className="tabular-nums font-bold text-wg-text">{r.refundCents ? formatCents(r.refundCents) : '—'}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
