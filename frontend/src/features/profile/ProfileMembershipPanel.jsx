import { Link } from 'react-router-dom';
import { Check, Droplets } from 'lucide-react';

import { useMyMembership } from '../../hooks/useMyMembership';
import { formatInrPerMonth } from '../../lib/formatInr';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

function formatEndsAt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ProfileMembershipPanel() {
  const { membership, loading, error, reload } = useMyMembership();

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-wg-muted">Membership</h2>
          <p className="mt-1 text-sm text-wg-muted">Monthly wash credits and plan perks.</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => reload()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {loading ? (
        <p className="mt-4 text-sm text-wg-muted">Loading membership…</p>
      ) : membership ? (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from to-brand-to text-white">
                <Droplets className="size-6" aria-hidden />
              </span>
              <div>
                <p className="text-3xl font-black text-wg-text">{membership.washes_remaining}</p>
                <p className="text-sm text-wg-muted">
                  washes remaining of {membership.washes_included}
                </p>
              </div>
            </div>
            <div className="min-w-[140px] flex-1">
              <p className="font-bold text-wg-text">{membership.plan_name}</p>
              <p className="text-sm text-wg-muted">
                {formatInrPerMonth(membership.price_cents, membership.currency)} · active until{' '}
                {formatEndsAt(membership.ends_at)}
              </p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-wg-text">
            {membership.features.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-cyan-600" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
          <Button asChild variant="secondary">
            <Link to="/#plans">Change plan</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-wg-muted">You do not have an active membership yet.</p>
          <Button asChild>
            <Link to="/#plans">Browse plans</Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
