import { CreditCard } from 'lucide-react';

import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { EmptyState } from '../../../ui/empty-state';
import { formatCents } from '../../../utils/format';

export function AdminMembershipPlansTable({ rows, onEdit, onDeactivate }) {
  if (!rows?.length) {
    return (
      <Card variant="glass" className="min-w-0 p-8">
        <EmptyState
          icon={CreditCard}
          title="No membership plans"
          description="Create plans shown on the landing page membership preview."
        />
      </Card>
    );
  }

  return (
    <Card variant="glass" className="min-w-0 overflow-hidden border-white/35 p-0 dark:border-white/10">
      <div className="border-b border-white/15 px-6 py-4 dark:border-white/10">
        <h2 className="wg-heading-section">Membership plans</h2>
        <p className="mt-1 text-xs text-wg-muted">Landing page shows active plans only (prices in ₹).</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-wg-surface-elevated/95 text-xs font-bold uppercase tracking-wide text-wg-muted backdrop-blur-md">
            <tr className="border-b border-wg-border">
              <th className="px-6 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3 text-right">Price / mo</th>
              <th className="px-4 py-3">Features</th>
              <th className="px-4 py-3">Popular</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wg-border/80">
            {rows.map((r) => (
              <tr
                key={r.slug}
                className="bg-white/[0.02] transition hover:bg-cyan-500/[0.04] dark:bg-transparent dark:hover:bg-cyan-500/[0.06]"
              >
                <td className="px-6 py-3 font-semibold text-wg-text">{r.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-wg-muted">{r.slug}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-wg-text">
                  {formatCents(r.price_cents, r.currency)}
                </td>
                <td className="px-4 py-3 text-wg-muted">{r.features?.length ?? 0}</td>
                <td className="px-4 py-3 text-wg-muted">{r.is_popular ? 'Yes' : '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      r.is_active
                        ? 'text-xs font-bold text-emerald-600 dark:text-emerald-400'
                        : 'text-xs font-bold text-wg-muted'
                    }
                  >
                    {r.is_active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => onEdit(r)}>
                      Edit
                    </Button>
                    {r.is_active ? (
                      <Button type="button" size="sm" variant="outline" onClick={() => onDeactivate(r)}>
                        Deactivate
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
