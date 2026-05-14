import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MessageSquareWarning } from 'lucide-react';

import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { EmptyState } from '../../../ui/empty-state';
import { cn } from '../../../lib/cn';
import { formatDateTime } from '../../../utils/format';

const PRIORITY_STYLES = {
  urgent: 'bg-rose-500/15 text-rose-800 dark:text-rose-200',
  high: 'bg-orange-500/15 text-orange-900 dark:text-orange-200',
  medium: 'bg-amber-500/15 text-amber-900 dark:text-amber-200',
  low: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const STATUS_STYLES = {
  open: 'bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200',
  in_review: 'bg-violet-100 text-violet-900 dark:bg-violet-950/50 dark:text-violet-200',
  resolved: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200',
};

const ESCALATION_STYLES = {
  L1: 'bg-slate-500/15 text-slate-800 dark:text-slate-200',
  L2: 'bg-violet-500/15 text-violet-900 dark:text-violet-100',
  Exec: 'bg-rose-500/15 text-rose-900 dark:text-rose-100',
};

const REFUND_STYLES = {
  none: 'bg-slate-500/10 text-wg-muted',
  requested: 'bg-amber-500/15 text-amber-900 dark:text-amber-100',
  approved: 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-100',
};

function Pill({ children, className }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide', className)}>
      {children}
    </span>
  );
}

function formatSlaRemaining(iso) {
  if (!iso) return { text: '—', overdue: false };
  const due = new Date(iso).getTime();
  const t = due - Date.now();
  const overdue = t <= 0;
  if (overdue) return { text: 'Overdue', overdue: true };
  const h = Math.floor(t / 3600000);
  const m = Math.floor((t % 3600000) / 60000);
  let text;
  if (h >= 48) text = `${Math.floor(h / 24)}d ${h % 24}h`;
  else if (h > 0) text = `${h}h ${m}m`;
  else text = `${m}m`;
  return { text, overdue: false };
}

export function AdminComplaintsTable({ rows }) {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setPulse((p) => p + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  const onResolve = () => {
    toast('Demo data — workflow hooks to admin API.', { icon: 'ℹ️' });
  };

  if (!rows?.length) {
    return (
      <Card variant="glass" className="min-w-0 p-8">
        <EmptyState icon={MessageSquareWarning} title="No complaints match" description="Adjust filters or search." />
      </Card>
    );
  }

  return (
    <Card variant="glass" className="min-w-0 overflow-hidden border-white/35 p-0 dark:border-white/10">
      <div className="border-b border-white/15 px-6 py-4 dark:border-white/10">
        <h2 className="wg-heading-section">Complaints</h2>
        <p className="mt-1 text-xs text-wg-muted">SLA timers, escalation, refunds (mock).</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-sm" aria-label={`Complaints SLA refresh ${pulse}`}>
          <thead className="sticky top-0 z-10 bg-wg-surface-elevated/95 text-xs font-bold uppercase tracking-wide text-wg-muted backdrop-blur-md dark:bg-wg-surface-elevated/90">
            <tr className="border-b border-wg-border">
              <th className="whitespace-nowrap px-6 py-3">ID</th>
              <th className="whitespace-nowrap px-4 py-3">Customer</th>
              <th className="min-w-[180px] px-4 py-3">Subject</th>
              <th className="whitespace-nowrap px-4 py-3">Priority</th>
              <th className="whitespace-nowrap px-4 py-3">Status</th>
              <th className="whitespace-nowrap px-4 py-3">SLA</th>
              <th className="whitespace-nowrap px-4 py-3">Escalation</th>
              <th className="whitespace-nowrap px-4 py-3">Refund</th>
              <th className="whitespace-nowrap px-4 py-3">Created</th>
              <th className="whitespace-nowrap px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wg-border/80">
            {rows.map((r) => {
              const sla = formatSlaRemaining(r.slaDueAt);
              return (
              <tr
                key={r.id}
                className="bg-white/[0.02] transition hover:bg-cyan-500/[0.04] dark:bg-transparent dark:hover:bg-cyan-500/[0.06]"
              >
                <td className="whitespace-nowrap px-6 py-3 font-mono text-xs text-wg-muted">{r.id}</td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-wg-text">{r.customer}</td>
                <td className="px-4 py-3 text-wg-text">{r.subject}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Pill className={PRIORITY_STYLES[r.priority] || PRIORITY_STYLES.medium}>{r.priority}</Pill>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Pill className={STATUS_STYLES[r.status] || STATUS_STYLES.open}>{r.status.replace(/_/g, ' ')}</Pill>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={cn(
                      'text-xs font-bold tabular-nums',
                      sla.overdue ? 'text-rose-600 dark:text-rose-400' : 'text-wg-text',
                    )}
                  >
                    {sla.text}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Pill className={ESCALATION_STYLES[r.escalationStage] || ESCALATION_STYLES.L1}>{r.escalationStage || 'L1'}</Pill>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Pill className={REFUND_STYLES[r.refundStatus] || REFUND_STYLES.none}>{r.refundStatus || 'none'}</Pill>
                </td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-wg-muted">{formatDateTime(r.createdAt)}</td>
                <td className="whitespace-nowrap px-6 py-3 text-right">
                  <Button type="button" size="sm" variant="outline" onClick={onResolve}>
                    Update
                  </Button>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
