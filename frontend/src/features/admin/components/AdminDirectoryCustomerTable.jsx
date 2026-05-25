import { Fragment, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Copy, Eye, MessageSquareWarning, Users } from 'lucide-react';

import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { EmptyState } from '../../../ui/empty-state';
import { cn } from '../../../lib/cn';
import { formatCents, formatDateTime } from '../../../utils/format';

const COMPLAINT = {
  none: 'bg-emerald-500/12 text-emerald-800 dark:text-emerald-200',
  open: 'bg-amber-500/15 text-amber-900 dark:text-amber-100',
  resolved: 'bg-slate-500/12 text-wg-muted',
};

export function AdminDirectoryCustomerTable({ rows, onPreview }) {
  const [expandedId, setExpandedId] = useState(null);

  const copyId = (id) => {
    void navigator.clipboard?.writeText(id);
    toast.success('ID copied (demo)');
  };

  if (!rows?.length) {
    return (
      <Card variant="enterprise" className="p-8">
        <EmptyState icon={Users} title="No customers match" description="Adjust filters or search." />
      </Card>
    );
  }

  const colCount = 9;

  return (
    <Card variant="enterprise" className="wg-admin-accent-revenue min-w-0 overflow-hidden p-0">
      <div className="border-b border-white/10 px-4 py-3 dark:border-white/5">
        <h2 className="wg-heading-section">Customer directory</h2>
        <p className="mt-0.5 text-xs text-wg-muted">Consumer CRM view — loyalty and LTV derived from bookings.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="wg-admin-table-head">
            <tr>
              <th className="wg-admin-table-th w-10" aria-label="Expand" />
              <th className="wg-admin-table-th">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Bookings</th>
              <th className="px-3 py-3">Loyalty</th>
              <th className="px-3 py-3">LTV</th>
              <th className="min-w-[140px] px-3 py-3">Recent activity</th>
              <th className="px-3 py-3">Complaints</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wg-border/70">
            {rows.map((r) => {
              const open = expandedId === r.id;
              return (
                <Fragment key={r.id}>
                  <tr key={r.id} className="bg-white/[0.02] transition hover:bg-cyan-500/[0.05] dark:bg-transparent">
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
                    <td className="px-3 py-2 text-wg-muted">{r.email}</td>
                    <td className="px-3 py-2 tabular-nums font-semibold text-wg-text">{r.bookingsCount}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-indigo-500/12 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-900 dark:text-indigo-100">
                        {r.loyaltyTier}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-semibold tabular-nums text-wg-text">{formatCents(r.lifetimeValueCents)}</td>
                    <td className="px-3 py-2 text-xs text-wg-muted">
                      <span className="line-clamp-2">{r.recentActivityLabel}</span>
                      <span className="mt-0.5 block text-[10px] tabular-nums">{formatDateTime(r.recentActivityAt)}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', COMPLAINT[r.complaintsStatus] || COMPLAINT.none)}>
                        {r.complaintsStatus}
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
                    <tr key={`${r.id}-detail`} className="bg-cyan-500/[0.04] dark:bg-cyan-500/[0.06]">
                      <td colSpan={colCount} className="px-4 py-3 text-xs leading-relaxed text-wg-muted">
                        <p className="font-semibold text-wg-text">Notes</p>
                        <p className="mt-1">{r.notes}</p>
                        <p className="mt-2">
                          <span className="font-bold text-wg-text">Joined</span> {r.joinedAt} ·{' '}
                          <span className="font-bold text-wg-text">Status</span> {r.active ? 'Active' : 'Suspended'}
                        </p>
                        {r.complaintsStatus === 'open' ? (
                          <Link to="/admin/complaints" className="mt-2 inline-flex items-center gap-1 font-bold text-cyan-700 dark:text-cyan-300">
                            <MessageSquareWarning className="size-3.5" aria-hidden />
                            Open complaints queue
                          </Link>
                        ) : null}
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
