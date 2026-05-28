import { useNavigate } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';

import { formatInrPerMonth } from '../../lib/formatInr';
import { cn } from '../../lib/cn';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

export function MembershipPlanPicker({
  plans,
  loading,
  currentPlanSlug = null,
  onSelectPlan,
}) {
  const navigate = useNavigate();

  const handleSelect = (plan) => {
    if (currentPlanSlug === plan.slug) return;
    if (onSelectPlan) {
      onSelectPlan(plan);
      return;
    }
    navigate(`/membership/subscribe/${plan.slug}`);
  };

  if (loading) {
    return <p className="text-sm text-wg-muted">Loading plans…</p>;
  }

  if (!plans?.length) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-wg-muted">No membership plans available right now.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => {
        const isCurrent = currentPlanSlug === plan.slug;
        const isPopular = plan.is_popular;

        return (
          <Card
            key={plan.slug}
            variant={isPopular ? 'glass' : 'default'}
            className={cn(
              'relative flex flex-col p-5 transition',
              isPopular && 'ring-1 ring-cyan-500/30',
              isCurrent && 'ring-2 ring-emerald-500/40',
            )}
          >
            {isPopular ? (
              <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-brand-from to-brand-to px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
                Popular
              </span>
            ) : null}
            {isCurrent ? (
              <span className="absolute -top-2.5 left-4 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-100">
                Current plan
              </span>
            ) : null}

            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-from/20 to-brand-to/20 text-cyan-700 dark:text-cyan-300">
                <Sparkles className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="text-lg font-bold text-wg-text">{plan.name}</h3>
            </div>

            <p className="mt-2 text-2xl font-black text-wg-text">
              {formatInrPerMonth(plan.price_cents, plan.currency)}
              <span className="text-sm font-semibold text-wg-muted">/mo</span>
            </p>

            {plan.description ? (
              <p className="mt-2 text-sm text-wg-muted">{plan.description}</p>
            ) : null}

            <ul className="mt-4 flex-1 space-y-2 text-sm text-wg-text">
              {(plan.features || []).map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-cyan-600 dark:text-cyan-400" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>

            {plan.washes_included ? (
              <p className="mt-3 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                {plan.washes_included} washes included per month
              </p>
            ) : null}

            <Button
              type="button"
              className="mt-5 w-full"
              variant={isCurrent ? 'outline' : isPopular ? 'default' : 'secondary'}
              disabled={isCurrent}
              onClick={() => handleSelect(plan)}
            >
              {isCurrent ? 'Your current plan' : currentPlanSlug ? 'Switch to this plan' : 'Choose plan'}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
