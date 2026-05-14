import { Fragment, useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronRight, Copy, Eye, Shield } from 'lucide-react';

import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { EmptyState } from '../../../ui/empty-state';
import { cn } from '../../../lib/cn';
import { formatDateTime } from '../../../utils/format';

const ROLE_LABEL = {
  super_admin: 'Super admin',
  ops: 'Operations',
};

const ACCESS = {
  production: 'bg-emerald-500/12 text-emerald-900 dark:text-emerald-100',
  staging: 'bg-violet-500/12 text-violet-900 dark:text-violet-100',
};

const ACTIVITY = {
  active: 'bg-cyan-500/12 text-cyan-900 dark:text-cyan-100',
  away: 'bg-slate-500/12 text-wg-muted',
};

export function AdminDirectoryStaffTable({ rows, onPreview }) {
  const [expandedId, setExpandedId] = useState(null);

  const copyId = (id) => {
    void navigator.clipboard?.writeText(id);
    toast.success('ID copied (demo)');
  };

  if (!rows?.length) {
    return (
      <Card variant="glass" className="p-8">
        <EmptyState icon={Shield} title="No staff match" description="Adjust filters or search." />
      </Card>
    );
  }

  const colCount = 8;

  return (
    <Card variant="glass" className="min-w-0 overflow-hidden border-l-4 border-l-violet-500/60 border-white/20 p-0 dark:border-white/10">
      <div className="border-b border-white/10 px-4 py-3 dark:border-white/5">
        <h2 className="wg-heading-section">Internal admin directory</h2>
        <p className="mt-0.5 text-xs text-wg-muted">Enterprise IAM preview — permissions and access planes (mock).</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-wg-surface-elevated/95 text-[10px] font-black uppercase tracking-wide text-wg-muted backdrop-blur-md">
            <tr className="border-b border-wg-border">
              <th className="w-10 px-2 py-3" />
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Role</th>
              <th className="min-w-[200px] px-3 py-3">Permissions</th>
              <th className="px-3 py-3">Access</th>
              <th className="px-3 py-3">Activity</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wg-border/70">
            {rows.map((r) => {
              const open = expandedId === r.id;
              return (
                <Fragment key={r.id}>
                  <tr className="bg-white/[0.02] transition hover:bg-violet-500/[0.06] dark:bg-transparent">
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
                    <td className="px-3 py-2 text-xs font-bold text-wg-text">{ROLE_LABEL[r.staffRole] || r.staffRole}</td>
                    <td className="px-3 py-2 text-xs text-wg-muted">{r.permissionsSummary}</td>
                    <td className="px-3 py-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', ACCESS[r.operationalAccess] || ACCESS.staging)}>
                        {r.operationalAccess}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', ACTIVITY[r.activityState] || ACTIVITY.away)}>
                        {r.activityState}
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
                    <tr className="bg-violet-500/[0.05] dark:bg-violet-500/[0.08]">
                      <td colSpan={colCount} className="px-4 py-3 text-xs leading-relaxed text-wg-muted">
                        <p>
                          <span className="font-bold text-wg-text">Last login</span> {formatDateTime(r.lastLoginAt)}
                        </p>
                        <p className="mt-1 font-semibold text-wg-text">Notes</p>
                        <p className="mt-1">{r.notes}</p>
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
