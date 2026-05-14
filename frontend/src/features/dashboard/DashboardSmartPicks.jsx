import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Sparkles } from 'lucide-react';

import { Card } from '../../ui/card';

const ACTIVE = ['pending', 'confirmed', 'in_progress'];

/** Lightweight, demo-safe “smart” suggestions from real list + counts only. */
export function DashboardSmartPicks({ items, completedCount, carCount }) {
  const picks = useMemo(() => {
    const hasActive = (items || []).some((b) => ACTIVE.includes(b.status));
    const out = [];
    if (carCount === 0) {
      out.push({
        title: 'Save your first vehicle',
        body: 'Plate and paint type carry into every booking for fewer taps at checkout.',
        to: '/cars',
      });
    }
    if (!hasActive && completedCount > 0) {
      out.push({
        title: 'Rebook in one flow',
        body: 'Your last service address stays on file — pick a new time without retyping.',
        to: '/booking',
      });
    }
    if (completedCount >= 3) {
      out.push({
        title: 'Try a deeper gloss pass',
        body: 'After a few washes, premium sealant keeps rain beading longer between visits.',
        to: '/booking',
      });
    }
    if (!out.length) {
      out.push({
        title: 'Stack exterior + interior',
        body: 'Book both in one visit when pollen or commute grime spikes — crews batch the prep.',
        to: '/booking',
      });
    }
    return out.slice(0, 3);
  }, [items, completedCount, carCount]);

  return (
    <Card
      variant="glass"
      className="min-w-0 border-violet-500/15 bg-gradient-to-br from-violet-500/8 via-wg-surface-elevated/95 to-cyan-500/6 transition hover:ring-1 hover:ring-violet-400/20 dark:border-violet-500/10"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-700 dark:text-violet-200">
          <Lightbulb className="size-4" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h2 className="wg-heading-section">Smart picks for you</h2>
          <p className="text-xs text-wg-muted">Based on your garage and wash history.</p>
        </div>
      </div>
      <ul className="mt-4 space-y-3">
        {picks.map((p) => (
          <li key={p.title}>
            <Link
              to={p.to}
              className="group block rounded-xl border border-white/20 bg-white/30 p-3 transition hover:border-cyan-500/30 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <p className="flex items-center gap-1.5 text-sm font-bold text-wg-text">
                <Sparkles className="size-3.5 text-cyan-600 opacity-80 dark:text-cyan-400" strokeWidth={2} aria-hidden />
                {p.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-wg-muted group-hover:text-wg-text">{p.body}</p>
              <span className="mt-2 inline-block text-[11px] font-bold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                Open →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
