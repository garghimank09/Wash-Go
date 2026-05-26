import { Fragment, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { ChevronDown, ChevronRight, Copy, Eye, Truck } from 'lucide-react';

import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { EmptyState } from '../../../ui/empty-state';
import { cn } from '../../../lib/cn';
import { useReducedMotion } from '../../../lib/useReducedMotion';
import { formatCents } from '../../../utils/format';

const OPS = {
  available: 'bg-emerald-500/12 text-emerald-900 dark:text-emerald-100',
  busy: 'bg-amber-500/15 text-amber-900 dark:text-amber-100',
  off_shift: 'bg-slate-500/12 text-wg-muted',
  suspended: 'bg-rose-500/15 text-rose-900 dark:text-rose-100',
};

export function AdminDirectoryPartnerTable({ rows, onPreview, tickVersion }) {
  const reduced = useReducedMotion();
  const [expandedId, setExpandedId] = useState(null);

  const copyId = (id) => {
    void navigator.clipboard?.writeText(id);
    toast.success('ID copied (demo)');
  };

  if (!rows?.length) {
    return (
      <Card variant="enterprise" className="p-8">
        <EmptyState icon={Truck} title="No partners match" description="Adjust filters or search." />
      </Card>
    );
  }

  const colCount = 10;

  return (
    <Card variant="enterprise" className="wg-admin-accent-partner min-w-0 overflow-hidden p-0">
      <div className="border-b border-white/10 px-4 py-3 dark:border-white/5">
        <h2 className="wg-heading-section">Partner / fleet directory</h2>
        <p className="mt-0.5 text-xs text-wg-muted">Fleet operations view — availability synced from fleet API.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-wg-surface-elevated/95 text-[10px] font-black uppercase tracking-wide text-wg-muted backdrop-blur-md">
            <tr className="border-b border-wg-border">
              <th className="w-10 px-2 py-3" />
              <th className="px-3 py-3">Partner</th>
              <th className="px-3 py-3">Live</th>
              <th className="px-3 py-3">Accept</th>
              <th className="px-3 py-3">Complete</th>
              <th className="px-3 py-3">Trust</th>
              <th className="px-3 py-3">YTD earnings</th>
              <th className="px-3 py-3">Active jobs</th>
              <th className="px-3 py-3">Ops state</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wg-border/70">
            {rows.map((r) => {
              const open = expandedId === r.id;
              return (
                <Fragment key={r.id}>
                  <tr className="bg-white/[0.02] transition hover:bg-emerald-500/[0.05] dark:bg-transparent">
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        aria-expanded={open}
                        className="flex size-9 items-center justify-center rounded-lg text-wg-muted hover:bg-white/10"
                        onClick={() => setExpandedId(open ? null : r.id)}
                      >
                        {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-semibold text-wg-text">{r.fullName}</span>
                      <span className="mt-0.5 block font-mono text-[10px] text-wg-muted">{r.id}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-2">
                        {r.online ? (
                          <m.span
                            key={tickVersion}
                            className="relative flex size-2.5"
                            initial={reduced ? false : { scale: 0.9 }}
                            animate={reduced ? undefined : { scale: [1, 1.15, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            <span className="absolute inset-0 rounded-full bg-emerald-400/50 blur-[2px]" />
                            <span className="relative size-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
                          </m.span>
                        ) : (
                          <span className="size-2.5 rounded-full bg-slate-400/60 ring-2 ring-slate-500/20" />
                        )}
                        <span className="text-xs font-bold text-wg-text">{r.online ? 'Online' : 'Offline'}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2 tabular-nums font-semibold">{r.acceptancePct}%</td>
                    <td className="px-3 py-2 tabular-nums font-semibold">{r.completionPct}%</td>
                    <td className="px-3 py-2 tabular-nums font-semibold">{r.trustScore}</td>
                    <td className="px-3 py-2 font-semibold tabular-nums">{formatCents(r.earningsYtdCents)}</td>
                    <td className="px-3 py-2 tabular-nums">{r.activeJobs}</td>
                    <td className="px-3 py-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', OPS[r.operationalState] || OPS.off_shift)}>
                        {String(r.operationalState).replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button type="button" size="sm" variant="outline" className="gap-1 px-2" onClick={() => onPreview(r)}>
                          <Eye className="size-3.5" aria-hidden />
                          Preview
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="px-2" onClick={() => copyId(r.id)} aria-label="Copy ID">
                          <Copy className="size-3.5" aria-hidden />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {open ? (
                    <tr className="bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06]">
                      <td colSpan={colCount} className="px-4 py-3 text-xs leading-relaxed text-wg-muted">
                        <p>
                          <span className="font-bold text-wg-text">Territory</span> {r.territory}
                        </p>
                        <p className="mt-1 font-semibold text-wg-text">Notes</p>
                        <p className="mt-1">{r.notes}</p>
                        <Link to="/admin/operations" className="mt-2 inline-block font-bold text-cyan-700 dark:text-cyan-300">
                          Open dispatch desk →
                        </Link>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
