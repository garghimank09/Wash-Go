import { useState } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import {
  ChevronDown,
  Gauge,
  MapPin,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';

import { MembershipCard } from '../../components/MembershipCard';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../lib/useReducedMotion';

const heroContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.04 },
  },
};

const heroItem = (reduced) => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] },
  },
});

const bento = [
  {
    title: 'Book in under a minute',
    body: 'Pick vehicle, package, and arrival window — pricing updates live as you tap.',
    icon: Zap,
    span: 'md:col-span-2',
    tint: 'from-cyan-500/15 to-indigo-600/10',
  },
  {
    title: 'Track every wash',
    body: 'Clear statuses from request to completion, tuned for real ops teams.',
    icon: MapPin,
    span: '',
    tint: 'from-emerald-500/12 to-cyan-500/8',
  },
  {
    title: 'Built for scale',
    body: 'JWT-secured API, role-aware bookings, and room to add maps & streaming later.',
    icon: Shield,
    span: '',
    tint: 'from-indigo-500/12 to-violet-500/8',
  },
  {
    title: 'AI concierge',
    body: 'In-app assistant answers how WashGo works — wire your own models when ready.',
    icon: Sparkles,
    span: 'md:col-span-2',
    tint: 'from-amber-500/12 to-rose-500/8',
  },
];

export function LandingHome() {
  const reduced = useReducedMotion();
  const [buildersOpen, setBuildersOpen] = useState(false);

  return (
    <main className="min-w-0 overflow-x-hidden">
      <section className="relative overflow-hidden border-b border-wg-border py-20 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-90 dark:opacity-100"
          style={{ background: 'var(--wg-mesh), linear-gradient(to bottom, var(--wg-surface-elevated), var(--wg-surface))' }}
        />
        <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-cyan-500/25 blur-3xl dark:bg-cyan-500/15" />
        <div className="pointer-events-none absolute -right-16 top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl dark:bg-indigo-500/12" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <m.div variants={heroContainer} initial="hidden" animate="show" className="max-w-3xl">
            <m.p
              variants={heroItem(reduced)}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/35 bg-wg-surface-elevated/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-700 shadow-sm backdrop-blur-md dark:border-cyan-500/25 dark:bg-white/10 dark:text-cyan-300"
            >
              <Gauge className="size-3.5" strokeWidth={2} aria-hidden />
              On-demand car care
            </m.p>
            <m.h1 variants={heroItem(reduced)} className="wg-hero mt-6 max-w-3xl leading-[1.05]">
              A calmer way to{' '}
              <span className="bg-gradient-to-r from-brand-from to-brand-to bg-clip-text text-transparent">wash & manage</span>{' '}
              your vehicles.
            </m.h1>
            <m.p variants={heroItem(reduced)} className="wg-subtitle mt-6 max-w-2xl">
              WashGo is the driver-first control room: schedule washes, see status, and grow into fleet tools when you
              need them — without clutter.
            </m.p>
            <m.div variants={heroItem(reduced)} className="mt-10 flex min-w-0 flex-wrap gap-3">
              <Link to="/signup">
                <Button size="lg">Get started free</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  I have an account
                </Button>
              </Link>
            </m.div>
          </m.div>
        </div>
      </section>

      <section className="border-b border-wg-border bg-wg-surface-elevated/40 py-10 dark:bg-wg-surface/50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-4 text-center sm:justify-between sm:px-6">
          <div>
            <p className="text-3xl font-black tabular-nums text-wg-text">4.9</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-wg-muted">Demo CSAT</p>
          </div>
          <div>
            <p className="text-3xl font-black tabular-nums text-wg-text">&lt; 60s</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-wg-muted">Target book time</p>
          </div>
          <div>
            <p className="text-3xl font-black tabular-nums text-wg-text">24/7</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-wg-muted">Concierge (AI)</p>
          </div>
          <p className="w-full max-w-xs text-left text-xs text-wg-muted sm:w-auto">
            <span className="rounded-md bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-800 dark:text-amber-200">
              Demo
            </span>{' '}
            Illustrative metrics for investor decks — wire real analytics when live.
          </p>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 space-y-6 px-4 py-20 sm:px-6">
        <div className="text-center">
          <h2 className="wg-title">Everything in one flow</h2>
          <p className="wg-subtitle mx-auto mt-3 max-w-2xl">
            Product patterns inspired by modern mobility and home-services apps — minimal chrome, maximum clarity.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {bento.map((item) => (
            <m.div
              key={item.title}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'rounded-[var(--radius-wg-xl)] border border-wg-border bg-gradient-to-br p-6 shadow-wg-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10',
                item.span,
                item.tint,
              )}
            >
              <item.icon className="size-8 text-cyan-600 dark:text-cyan-400" strokeWidth={1.5} aria-hidden />
              <h3 className="mt-4 text-lg font-bold text-wg-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-wg-muted">{item.body}</p>
            </m.div>
          ))}
        </div>
      </section>

      <section id="plans" className="border-y border-wg-border bg-wg-surface py-20 dark:bg-wg-surface/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="wg-title">Membership preview</h2>
            <p className="wg-subtitle mx-auto mt-3 max-w-xl">
              Shape pricing psychology today — connect billing when your stack is ready.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
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

      <section id="builders" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <Card variant="inset" className="overflow-hidden">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 text-left wg-focus-ring rounded-xl"
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

      <section id="ai" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <m.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-[var(--radius-wg-xl)] border border-wg-border bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-10 text-white shadow-2xl dark:border-white/10"
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

      <section className="bg-gradient-to-r from-cyan-600 to-indigo-700 py-16 text-center text-white">
        <h2 className="text-3xl font-black tracking-tight">Ready when you are</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-cyan-50/95">
          Spin up the stack, invite a design partner, and walk investors through a real booking — end to end.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/signup">
            <Button variant="secondary" size="lg">
              Create free account
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
