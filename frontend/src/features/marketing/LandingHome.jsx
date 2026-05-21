import { useState } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';

import { MembershipCard } from '../../components/MembershipCard';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { EcoTrustSection } from './EcoTrustSection';
import { HowItWorksSection } from './HowItWorksSection';
import { MarketingFeaturesSection } from './MarketingFeaturesSection';
import { MarketingHero } from './MarketingHero';
import { MarketingStatsStrip } from './MarketingStatsStrip';
import { ProductShowcaseSection } from './ProductShowcaseSection';
import { WhyWashGoSection } from './WhyWashGoSection';

export function LandingHome() {
  const reduced = useReducedMotion();
  const [buildersOpen, setBuildersOpen] = useState(false);

  return (
    <main className="min-w-0 overflow-x-hidden">
      <MarketingHero />
      <MarketingStatsStrip />
      <WhyWashGoSection />
      <HowItWorksSection />
      <EcoTrustSection />
      <ProductShowcaseSection />
      <MarketingFeaturesSection />

      <section id="plans" className="scroll-mt-20 border-y border-wg-border bg-gradient-to-b from-wg-surface via-wg-surface-elevated/30 to-wg-surface py-14 dark:via-wg-surface/50 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="wg-title">Membership preview</h2>
            <p className="wg-subtitle mx-auto mt-3 max-w-xl text-base">
              Shape pricing psychology today — connect billing when your stack is ready.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <MembershipCard
              title="Spark"
              price="$19"
              perks={['2 washes / month', 'Standard scheduling', 'Email support']}
            />
            <MembershipCard
              title="Gleam"
              price="$39"
              highlighted
              perks={['5 washes / month', 'Priority washers', 'In-app AI summaries']}
            />
            <MembershipCard
              title="Apex Fleet"
              price="$99"
              perks={['12 washes / month', 'Dedicated account manager', 'Fleet analytics']}
            />
          </div>
        </div>
      </section>

      <section id="builders" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-14">
        <Card variant="inset" className="overflow-hidden">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 rounded-xl text-left wg-focus-ring"
            onClick={() => setBuildersOpen((o) => !o)}
            aria-expanded={buildersOpen}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-wg-muted">For builders</p>
              <h3 className="mt-1 text-lg font-bold text-wg-text">FastAPI, Postgres, and a clean React shell</h3>
              <p className="mt-1 text-sm text-wg-muted">Implementation notes for your engineering review.</p>
            </div>
            <ChevronDown
              className={cn('size-6 shrink-0 text-wg-muted transition-transform', buildersOpen && 'rotate-180')}
              strokeWidth={1.75}
              aria-hidden
            />
          </button>
          {buildersOpen ? (
            <div className="mt-6 border-t border-wg-border pt-6 text-sm leading-relaxed text-wg-muted">
              <p>
                Every screen maps to your WashGo API: JWT auth, cars, pricing estimates, bookings, and assistant chat.
                Swap placeholders for production payments, push, and live maps without redesigning the customer journey.
              </p>
              <ul className="mt-4 list-inside list-disc space-y-2">
                <li>Structured booking payloads for future automations</li>
                <li>Role-aware booking lists for customers, washers, and admins</li>
                <li>Room for WebSockets, webhooks, and observability hooks</li>
              </ul>
            </div>
          ) : null}
        </Card>
      </section>

      <section id="ai" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-14 sm:px-6 sm:pb-16">
        <m.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-[var(--radius-wg-xl)] border border-wg-border bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-8 text-white shadow-2xl transition duration-500 hover:shadow-cyan-500/10 sm:p-10 dark:border-white/10"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
              <Sparkles className="size-3.5" aria-hidden />
              AI-ready
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Concierge today, copilots tomorrow</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              The in-app assistant uses your configured model provider. Add vision and damage workflows when your data
              plane is ready — the UI already reserves space for richer storytelling.
            </p>
            <div className="mt-8">
              <Link to="/signup">
                <Button size="md">Open the app</Button>
              </Link>
            </div>
          </div>
        </m.div>
      </section>
    </main>
  );
}
