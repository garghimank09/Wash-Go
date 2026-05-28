import { useState } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';

import { MembershipCard } from '../../../components/MembershipCard';
import { useMembershipPlans } from '../../../hooks/useMembershipPlans';
import { formatInrPerMonth } from '../../../lib/formatInr';
import { MarketingSectionHeader } from './MarketingSectionHeader';
import { WASH_PACKAGES } from './premiumContent';
import { useReducedMotion } from '../../../lib/useReducedMotion';
import { cn } from '../../../lib/cn';
import { Button } from '../../../ui/button';

export function PremiumPricingSection() {
  const reduced = useReducedMotion();
  const [billing, setBilling] = useState('onetime');
  const { items: membershipPlans, loading: plansLoading } = useMembershipPlans();

  return (
    <section id="pricing" className="wg-premium-section wg-premium-section-alt scroll-mt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MarketingSectionHeader
          eyebrow="Pricing"
          title="Transparent packages & memberships"
          subtitle="One-time washes by service type, or subscribe for bundled credits — switch anytime."
        />

        <div className="mt-8 flex justify-center">
          <div className="wg-premium-glass inline-flex rounded-full p-1">
            <button
              type="button"
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition',
                billing === 'onetime' ? 'bg-wg-text text-white shadow' : 'text-wg-muted',
              )}
              onClick={() => setBilling('onetime')}
            >
              One-time wash
            </button>
            <button
              type="button"
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition',
                billing === 'membership' ? 'bg-wg-text text-white shadow' : 'text-wg-muted',
              )}
              onClick={() => setBilling('membership')}
            >
              Membership
            </button>
          </div>
        </div>

        {billing === 'onetime' ? (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {WASH_PACKAGES.map((pkg, i) => (
              <m.div
                key={pkg.slug}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  'wg-premium-glass relative flex flex-col rounded-2xl p-6 transition hover:-translate-y-1',
                  pkg.popular && 'ring-2 ring-cyan-500/40 shadow-[0_0_60px_rgb(34_211_238/0.15)]',
                )}
              >
                {pkg.popular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-3 py-0.5 text-[10px] font-bold uppercase text-white">
                    Most popular
                  </span>
                ) : null}
                <p className="text-xs font-bold uppercase tracking-wider text-wg-muted">{pkg.priceLabel}</p>
                <h3 className="mt-2 text-xl font-black text-wg-text">{pkg.name}</h3>
                <p className="mt-2 text-sm text-wg-muted">{pkg.desc}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-wg-text">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-cyan-500">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/booking" className="mt-6 block">
                  <Button className={cn('w-full', pkg.popular && 'wg-premium-cta')}>Book now</Button>
                </Link>
              </m.div>
            ))}
          </div>
        ) : (
          <div id="plans" className="mt-12 grid gap-6 md:grid-cols-3">
            {plansLoading ? (
              <p className="col-span-full text-center text-sm text-wg-muted">Loading membership plans…</p>
            ) : membershipPlans.length === 0 ? (
              <p className="col-span-full text-center text-sm text-wg-muted">Plans coming soon.</p>
            ) : (
              membershipPlans.map((plan) => (
                <MembershipCard
                  key={plan.slug}
                  planSlug={plan.slug}
                  title={plan.name}
                  price={formatInrPerMonth(plan.price_cents, plan.currency)}
                  highlighted={plan.is_popular}
                  perks={plan.features}
                />
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
