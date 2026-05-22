import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CreditCard, ShieldCheck } from 'lucide-react';

import { useMembershipPlans } from '../hooks/useMembershipPlans';
import { formatInrPerMonth } from '../lib/formatInr';
import { dispatchNotificationsSync } from '../lib/notificationSyncEvents';
import { membershipService } from '../services/membershipService';
import { getErrorMessage } from '../services/api';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export function MembershipSubscribePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { items: plans, loading: plansLoading } = useMembershipPlans();
  const [paying, setPaying] = useState(false);

  const plan = useMemo(() => plans.find((p) => p.slug === slug), [plans, slug]);

  const handleDemoPay = async () => {
    if (!slug) return;
    setPaying(true);
    try {
      await membershipService.subscribe(slug);
      dispatchNotificationsSync({ source: 'membership' });
      toast.success('Membership activated — washes added to your profile.');
      navigate('/profile', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  if (plansLoading) {
    return <p className="text-sm text-wg-muted">Loading plan…</p>;
  }

  if (!plan) {
    return (
      <Card className="p-6 text-center">
        <p className="text-wg-text">Plan not found.</p>
        <Button asChild className="mt-4" variant="secondary">
          <Link to="/#plans">Back to plans</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-wg-muted">Checkout (demo)</p>
        <h1 className="wg-title mt-1">{plan.name}</h1>
        <p className="wg-subtitle mt-2">{plan.description || 'Monthly membership'}</p>
      </div>

      <Card className="space-y-4 p-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-wg-muted">Due today</span>
          <span className="text-2xl font-black text-wg-text">
            {formatInrPerMonth(plan.price_cents, plan.currency)}
          </span>
        </div>
        <ul className="space-y-2 border-t border-wg-border pt-4 text-sm text-wg-text">
          {plan.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        {plan.washes_included ? (
          <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
            Includes {plan.washes_included} washes this billing cycle
          </p>
        ) : null}
      </Card>

      <Card className="flex gap-3 border-dashed p-4 text-sm text-wg-muted">
        <ShieldCheck className="size-5 shrink-0 text-emerald-600" aria-hidden />
        <p>
          Demo payment only — no card is charged. Confirming activates your plan and shows washes
          remaining on your profile.
        </p>
      </Card>

      <Button
        type="button"
        className="w-full gap-2"
        disabled={paying}
        onClick={handleDemoPay}
      >
        <CreditCard className="size-4" aria-hidden />
        {paying ? 'Processing…' : 'Pay & activate (demo)'}
      </Button>

      <Button asChild variant="ghost" className="w-full">
        <Link to="/dashboard">Cancel</Link>
      </Button>
    </div>
  );
}
