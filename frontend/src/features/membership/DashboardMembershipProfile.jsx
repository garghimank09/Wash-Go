import { Link } from 'react-router-dom';
import { Droplets, Sparkles } from 'lucide-react';

import { formatInrPerMonth } from '../../lib/formatInr';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

function formatEndsAt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DashboardMembershipProfile({ membership, loading }) {
  if (loading) {
    return (
      <Card variant="inset" className="p-5">
        <p className="text-sm text-wg-muted">Loading membership…</p>
      </Card>
    );
  }

  if (!membership) {
    return (
      <Card variant="inset" className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-wg-muted">Membership</p>
          <h3 className="mt-1 text-lg font-bold text-wg-text">Save with a monthly plan</h3>
          <p className="mt-1 text-sm text-wg-muted">Bundle washes and track credits in your profile.</p>
        </div>
        <Button asChild variant="secondary" className="shrink-0">
          <Link to="/#plans">View plans</Link>
        </Button>
      </Card>
    );
  }

  const used = Math.max(0, membership.washes_included - membership.washes_remaining);
  const pct =
    membership.washes_included > 0
      ? Math.round((membership.washes_remaining / membership.washes_included) * 100)
      : 0;

  return (
    <Card
      variant="inset"
      className="overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-500/8 via-wg-surface-elevated to-brand-to/5 p-5 dark:from-cyan-500/5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from to-brand-to text-white shadow">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-wg-muted">Your plan</p>
            <h3 className="text-lg font-bold text-wg-text">{membership.plan_name}</h3>
            <p className="text-sm text-wg-muted">
              {formatInrPerMonth(membership.price_cents, membership.currency)} · renews {formatEndsAt(membership.ends_at)}
            </p>
          </div>
        </div>
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link to="/profile">Profile</Link>
        </Button>
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between gap-2">
          <div className="flex items-center gap-2">
            <Droplets className="size-5 text-cyan-600 dark:text-cyan-400" aria-hidden />
            <span className="text-2xl font-black text-wg-text">{membership.washes_remaining}</span>
            <span className="pb-0.5 text-sm text-wg-muted">
              washes left <span className="text-wg-muted/70">of {membership.washes_included}</span>
            </span>
          </div>
          <span className="text-xs font-semibold text-wg-muted">{used} used this cycle</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-wg-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-from to-brand-to transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
