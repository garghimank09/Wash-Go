import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/cn';

export function MembershipCard({ title, price, perks, highlighted, planSlug }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const slug = planSlug || 'gleam';
  const subscribePath = `/membership/subscribe/${slug}`;

  const handleJoin = () => {
    if (!user) {
      navigate('/login', { state: { from: subscribePath } });
      return;
    }
    if (user.role !== 'customer') {
      navigate('/dashboard');
      return;
    }
    navigate(subscribePath);
  };

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-[var(--radius-wg-xl)] border p-6 transition duration-300',
        highlighted
          ? 'border-cyan-500/35 bg-gradient-to-b from-cyan-500/12 via-wg-surface-elevated/90 to-brand-to/10 shadow-wg-card hover:-translate-y-0.5 hover:shadow-lg dark:from-cyan-500/10 dark:via-wg-surface-elevated/50'
          : 'border-wg-border bg-wg-surface-elevated/90 shadow-wg-card hover:-translate-y-0.5 hover:shadow-md dark:bg-wg-surface-elevated/60',
      )}
    >
      {highlighted ? (
        <span className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-brand-from to-brand-to px-3 py-0.5 text-xs font-bold text-white shadow">
          Popular
        </span>
      ) : null}
      <h3 className="text-lg font-bold text-wg-text">{title}</h3>
      <p className="mt-2 text-3xl font-black text-wg-text">
        {price}
        <span className="text-base font-semibold text-wg-muted">/mo</span>
      </p>
      <ul className="mt-4 flex flex-1 flex-col gap-2.5 text-sm text-wg-muted">
        {perks.map((p) => (
          <li key={p} className="flex gap-2 text-wg-text/90">
            <Check className="mt-0.5 size-4 shrink-0 text-cyan-600 dark:text-cyan-400" strokeWidth={2.5} aria-hidden />
            {p}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-6 w-full rounded-xl border border-wg-border bg-wg-surface/80 py-2.5 text-sm font-semibold text-wg-text transition hover:bg-wg-surface dark:bg-white/[0.04] dark:hover:bg-white/[0.07] wg-focus-ring"
        onClick={handleJoin}
      >
        {user ? 'Choose plan' : 'Get started'}
      </button>
    </div>
  );
}
