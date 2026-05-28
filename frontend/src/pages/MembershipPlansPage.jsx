import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { MembershipPlanPicker } from '../features/membership/MembershipPlanPicker';
import { useMyMembership } from '../hooks/useMyMembership';
import { useMembershipPlans } from '../hooks/useMembershipPlans';
import { Button } from '../ui/button';

export function MembershipPlansPage() {
  const { membership, loading: membershipLoading } = useMyMembership();
  const { items: plans, loading: plansLoading } = useMembershipPlans();

  const isUpgrade = !membership;
  const title = isUpgrade ? 'Upgrade your plan' : 'Change your plan';
  const subtitle = isUpgrade
    ? 'Pick a monthly bundle — pay once (demo) and washes appear on your dashboard instantly.'
    : `You're on ${membership.plan_name}. Select a different plan to switch — your current plan ends when you confirm checkout.`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 gap-1.5 px-0">
          <Link to={membership ? '/dashboard' : '/profile'}>
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Link>
        </Button>
        <p className="text-xs font-bold uppercase tracking-wide text-wg-muted">Membership</p>
        <h1 className="wg-title mt-1">{title}</h1>
        <p className="wg-subtitle mt-2 max-w-2xl">{subtitle}</p>
      </div>

      {!membershipLoading && !membership ? (
        <p className="rounded-xl border border-dashed border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-sm text-wg-muted">
          You're on <span className="font-semibold text-wg-text">pay-as-you-go</span> — no monthly plan yet.
          Choose Spark, Gleam, or Apex Fleet to save on regular washes.
        </p>
      ) : null}

      <MembershipPlanPicker
        plans={plans}
        loading={plansLoading || membershipLoading}
        currentPlanSlug={membership?.plan_slug ?? null}
      />
    </div>
  );
}
