import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import {
  CheckCircle2,
  LayoutGrid,
  MapPin,
  Navigation,
  Shield,
  Smartphone,
  Sparkles,
  Truck,
  Waves,
} from 'lucide-react';

import { Button } from '../../ui/button';
import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { MarketingHoverCard } from './MarketingHoverCard';
import { MarketingReveal } from './MarketingReveal';

function PreviewChrome({ eyebrow, title, badge, accent, children }) {
  const ring =
    accent === 'emerald'
      ? 'from-emerald-500/20 via-teal-500/10 to-transparent'
      : accent === 'slate'
        ? 'from-slate-500/15 via-indigo-500/10 to-transparent'
        : 'from-cyan-500/20 via-indigo-500/10 to-transparent';

  return (
    <div className="wg-marketing-preview-window relative">
      <div
        className={cn(
          'pointer-events-none absolute -inset-px rounded-[1.35rem] bg-gradient-to-br opacity-60 blur-sm transition-opacity duration-500 group-hover:opacity-100',
          ring,
        )}
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-[1.25rem] border border-white/25 bg-gradient-to-b from-wg-surface-elevated/98 to-wg-surface-elevated/85 shadow-xl backdrop-blur-xl dark:border-white/12 dark:from-slate-900/95 dark:to-slate-950/90">
        <div className="flex items-center justify-between gap-2 border-b border-white/15 bg-white/[0.04] px-4 py-3 dark:border-white/8">
          <div className="flex min-w-0 items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-rose-400/90" aria-hidden />
            <span className="size-2 shrink-0 rounded-full bg-amber-400/90" aria-hidden />
            <span className="size-2 shrink-0 rounded-full bg-emerald-400/90" aria-hidden />
            <span className="ml-1 truncate text-[11px] font-semibold text-wg-muted">{eyebrow}</span>
          </div>
          <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-wg-muted">
            {badge}
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-sm font-bold tracking-tight text-wg-text">{title}</p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function CustomerPreviewUI() {
  return (
    <PreviewChrome eyebrow="washgo.app · preview" title="Your bookings" badge="Preview" accent="cyan">
      <div className="flex gap-3">
        <div className="hidden w-20 shrink-0 space-y-1.5 sm:block">
          {['Home', 'Bookings', 'Garage'].map((item, i) => (
            <div
              key={item}
              className={cn(
                'rounded-lg px-2 py-1.5 text-[10px] font-semibold',
                i === 1 ? 'bg-cyan-500/15 text-cyan-900 dark:text-cyan-100' : 'text-wg-muted',
              )}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="rounded-xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 to-emerald-500/5 p-3 ring-1 ring-cyan-500/10">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-cyan-800 dark:text-cyan-200">Today</p>
                <p className="mt-0.5 text-sm font-bold text-wg-text">Premium exterior</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-wg-muted">
                  <MapPin className="size-3" aria-hidden />
                  Your driveway · 2:00 PM
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black text-emerald-800 dark:text-emerald-100">
                <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                Live
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: 'Booked', on: false },
              { label: 'Assigned', on: false },
              { label: 'In progress', on: true },
            ].map((s) => (
              <div
                key={s.label}
                className={cn(
                  'rounded-lg py-2 text-center text-[9px] font-bold leading-tight',
                  s.on ? 'bg-cyan-500/20 text-cyan-950 dark:text-cyan-50' : 'bg-white/50 text-wg-muted dark:bg-white/5',
                )}
              >
                {s.label}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 dark:bg-white/[0.04]">
            <Navigation className="size-4 text-cyan-600 dark:text-cyan-400" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-wg-text">Jordan · 4.9★</p>
              <p className="text-[10px] text-wg-muted">En route · ~12 min</p>
            </div>
          </div>
        </div>
      </div>
    </PreviewChrome>
  );
}

function PartnerPreviewUI() {
  return (
    <PreviewChrome eyebrow="partner · preview" title="Field workflow" badge="Preview" accent="emerald">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-200">Next job</p>
            <p className="truncate text-sm font-bold text-wg-text">Marina · Deluxe wash</p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-900 dark:text-emerald-100">
            ACTIVE
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/12 bg-white/[0.04] p-3 text-center dark:bg-white/[0.03]">
            <p className="text-xl font-black tabular-nums text-wg-text">3</p>
            <p className="text-[10px] font-semibold text-wg-muted">Jobs today</p>
          </div>
          <div className="rounded-xl border border-white/12 bg-white/[0.04] p-3 text-center dark:bg-white/[0.03]">
            <p className="text-xl font-black tabular-nums text-wg-text">$186</p>
            <p className="text-[10px] font-semibold text-wg-muted">Week earnings</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['Route', 'Photos', 'Complete'].map((t, i) => (
            <div
              key={t}
              className={cn(
                'flex-1 rounded-lg py-2 text-center text-[9px] font-bold',
                i === 0 ? 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-100' : 'bg-white/40 text-wg-muted dark:bg-white/5',
              )}
            >
              {t}
            </div>
          ))}
        </div>
        <div className="h-14 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/8 to-teal-500/10 ring-1 ring-white/15">
          <div className="flex h-full items-end gap-1 px-3 pb-2">
            {[40, 55, 48, 70, 62, 80, 74].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-600/50 to-cyan-400/40"
                style={{ height: `${h}%` }}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>
    </PreviewChrome>
  );
}

function OperationsPreviewUI() {
  return (
    <PreviewChrome
      eyebrow="operations · preview"
      title="Coordination overview"
      badge="Internal preview"
      accent="slate"
    >
      <div className="space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: '23', l: 'Active' },
            { v: '4', l: 'Queue' },
            { v: '38', l: 'Online' },
          ].map((k) => (
            <div
              key={k.l}
              className="rounded-xl border border-indigo-500/15 bg-indigo-500/[0.06] px-2 py-2 text-center"
            >
              <p className="text-base font-black tabular-nums text-wg-text">{k.v}</p>
              <p className="text-[9px] font-bold uppercase tracking-wide text-wg-muted">{k.l}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {[
            { t: 'Dispatch · 2 unassigned >45m', tone: 'amber' },
            { t: 'Fleet rebalance · Marina +3', tone: 'cyan' },
          ].map((row) => (
            <div
              key={row.t}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[10px] font-medium',
                row.tone === 'amber'
                  ? 'border-amber-500/20 bg-amber-500/[0.06] text-wg-text'
                  : 'border-cyan-500/15 bg-cyan-500/[0.05] text-wg-text',
              )}
            >
              <Sparkles className="size-3 shrink-0 opacity-70" aria-hidden />
              {row.t}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 dark:bg-white/[0.04]">
          <span className="text-[10px] font-semibold text-wg-muted">Illustrative ops snapshot</span>
          <Shield className="size-3.5 text-wg-muted" aria-hidden />
        </div>
      </div>
    </PreviewChrome>
  );
}

const PANELS = [
  {
    label: 'Customer experience',
    icon: Smartphone,
    body: 'Book at your driveway, manage vehicles, and follow every wash with calm, clear status updates.',
    preview: CustomerPreviewUI,
    chip: 'Booking & tracking',
    chipClass: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-900 dark:text-cyan-100',
  },
  {
    label: 'Partner workflow',
    icon: Truck,
    body: 'Field partners see jobs, routes, and earnings in a workflow built for mobile washers on the move.',
    preview: PartnerPreviewUI,
    chip: 'Jobs & routes',
    chipClass: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100',
  },
  {
    label: 'Operations preview',
    icon: LayoutGrid,
    body: 'Behind the scenes, teams coordinate dispatch, fleet health, and service quality — not a public dashboard.',
    preview: OperationsPreviewUI,
    chip: 'Coordination only',
    chipClass: 'border-slate-500/25 bg-slate-500/10 text-wg-muted',
  },
];

export function ProductShowcaseSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="experience"
      className="wg-marketing-section-glow relative scroll-mt-20 overflow-hidden border-y border-wg-border/80 py-14 sm:py-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-500/[0.04] via-transparent to-emerald-500/[0.05]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <MarketingReveal className="text-center">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">
            <Waves className="size-3.5" strokeWidth={2} aria-hidden />
            Connected platform
          </p>
          <h2 className="wg-title mt-3 text-balance">One platform. Every experience connected.</h2>
          <p className="wg-subtitle mx-auto mt-4 max-w-2xl text-base leading-relaxed">
            A guided preview of how WashGo connects{' '}
            <span className="font-semibold text-wg-text">customer booking</span>,{' '}
            <span className="font-semibold text-wg-text">partner field operations</span>, and{' '}
            <span className="font-semibold text-wg-text">dispatch coordination</span> — without exposing internal
            systems.
          </p>
        </MarketingReveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-6">
          {PANELS.map((panel, i) => (
            <m.div
              key={panel.label}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-48px' }}
              transition={{ delay: reduced ? 0 : i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="group flex min-w-0 flex-col"
            >
              <MarketingHoverCard className="flex-1">
                <panel.preview />
              </MarketingHoverCard>
              <div className="mt-5 flex items-start gap-3 px-0.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-brand-from/15 to-brand-to/10 text-cyan-700 shadow-sm transition duration-300 group-hover:scale-105 dark:text-cyan-300">
                  <panel.icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold tracking-tight text-wg-text">{panel.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-wg-muted">{panel.body}</p>
                  <span
                    className={cn(
                      'mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
                      panel.chipClass,
                    )}
                  >
                    <CheckCircle2 className="size-3 opacity-80" aria-hidden />
                    {panel.chip}
                  </span>
                </div>
              </div>
            </m.div>
          ))}
        </div>

        <MarketingReveal className="mt-12 text-center" delay={0.1}>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-wg-muted">
            Screens above are product previews for storytelling. Customer accounts sign up below; partner and operations
            surfaces are provisioned separately.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link to="/signup">
              <Button size="lg" className="wg-marketing-cta-shimmer relative overflow-hidden">
                Get started as a customer
              </Button>
            </Link>
            <Link
              to="/partner/signup"
              className="text-sm font-semibold text-wg-muted transition hover:text-cyan-600 dark:hover:text-cyan-400 wg-focus-ring rounded-lg px-2 py-1"
            >
              Partner with WashGo →
            </Link>
          </div>
        </MarketingReveal>
      </div>
    </section>
  );
}
