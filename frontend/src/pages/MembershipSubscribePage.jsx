import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';

import { MembershipPlanPicker } from '../features/membership/MembershipPlanPicker';
import { useMyMembership } from '../hooks/useMyMembership';
import { useMembershipPlans } from '../hooks/useMembershipPlans';
import { formatInrPerMonth } from '../lib/formatInr';
import { dispatchMembershipSync } from '../lib/membershipSyncEvents';
import { dispatchNotificationsSync } from '../lib/notificationSyncEvents';
import { membershipService } from '../services/membershipService';
import { getErrorMessage } from '../services/api';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export function MembershipSubscribePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { items: plans, loading: plansLoading } = useMembershipPlans();
  const { membership, loading: membershipLoading } = useMyMembership();
  const [paying, setPaying] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const plan = useMemo(() => plans.find((p) => p.slug === slug), [plans, slug]);
  const isPlanChange = Boolean(membership && membership.plan_slug !== slug);
  const isSamePlan = Boolean(membership && membership.plan_slug === slug);

  const handleDemoPay = async () => {
    if (!slug || isSamePlan) return;
    setPaying(true);
    try {
      await membershipService.subscribe(slug);
      dispatchMembershipSync();
      dispatchNotificationsSync({ source: 'membership' });
      toast.success(
        isPlanChange
          ? `Switched to ${plan?.name ?? 'your new plan'} — washes refreshed.`
          : 'Membership activated — washes added to your dashboard.',
      );
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  if (plansLoading || membershipLoading) {
    return <p className="text-sm text-wg-muted">Loading plan…</p>;
  }

  if (!plan) {
    return (
      <Card className="p-6 text-center">
        <p className="text-wg-text">Plan not found.</p>
        <Button asChild className="mt-4" variant="secondary">
          <Link to="/membership/plans">Browse plans</Link>
        </Button>
      </Card>
    );
  }

  if (showPicker) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={() => setShowPicker(false)}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to checkout
        </Button>
        <MembershipPlanPicker plans={plans} loading={false} currentPlanSlug={membership?.plan_slug ?? null} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 gap-1.5 px-0">
          <Link to="/membership/plans">
            <ArrowLeft className="size-4" aria-hidden />
            All plans
          </Link>
        </Button>
        <p className="text-xs font-bold uppercase tracking-wide text-wg-muted">
          {isPlanChange ? 'Change plan · checkout (demo)' : 'Checkout (demo)'}
        </p>
        <h1 className="wg-title mt-1">{plan.name}</h1>
        <p className="wg-subtitle mt-2">{plan.description || 'Monthly membership'}</p>
      </div>

      {membership && isPlanChange ? (
        <Card className="border-amber-500/25 bg-amber-500/8 p-4 text-sm text-wg-text">
          <p className="font-semibold">Switching from {membership.plan_name}</p>
          <p className="mt-1 text-wg-muted">
            Demo checkout replaces your active plan. You'll get a fresh wash balance for{' '}
            {plan.washes_included} washes this cycle.
          </p>
        </Card>
      ) : null}

      {isSamePlan ? (
        <Card className="border-emerald-500/25 bg-emerald-500/8 p-4 text-sm">
          <p className="font-semibold text-wg-text">This is already your current plan.</p>
          <Button asChild className="mt-3" variant="secondary" size="sm">
            <Link to="/membership/plans">Pick a different plan</Link>
          </Button>
        </Card>
      ) : null}

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
          Demo payment only — no card is charged. Confirming activates your plan and updates washes on your
          dashboard and profile.
        </p>
      </Card>

      {!isSamePlan ? (
        <Button type="button" className="w-full gap-2" disabled={paying} onClick={handleDemoPay}>
          <CreditCard className="size-4" aria-hidden />
          {paying
            ? 'Processing…'
            : isPlanChange
              ? `Pay & switch plan (demo)`
              : 'Pay & activate (demo)'}
        </Button>
      ) : null}

      <Button type="button" variant="outline" className="w-full" onClick={() => setShowPicker(true)}>
        Compare other plans
      </Button>

      <Button asChild variant="ghost" className="w-full">
        <Link to="/dashboard">Cancel</Link>
      </Button>
    </div>
  );
}
