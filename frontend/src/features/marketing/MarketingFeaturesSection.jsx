import { m } from 'framer-motion';
import { Calendar, MapPin, MessageCircle, Shield, Sparkles, Zap } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { MarketingFeatureBentoCard } from './MarketingFeatureBentoCard';
import { MarketingReveal } from './MarketingReveal';

const BENTO = [
  {
    title: 'Book in under a minute',
    titlePrefix: 'Book in ',
    titleHighlight: 'under a minute',
    titleSuffix: '',
    titleGradient: 'from-cyan-600 to-emerald-500 dark:from-cyan-400 dark:to-emerald-400',
    body: 'Choose your vehicle, package, and arrival window — pricing updates calmly as you go.',
    icon: Zap,
    span: 'md:col-span-2',
    microLabel: 'Booking',
    visual: 'book',
    tint: 'from-cyan-100/80 via-sky-50/50 to-indigo-50/40 dark:from-cyan-500/12 dark:via-sky-500/6 dark:to-indigo-600/8',
    surface: 'from-wg-surface-elevated/95 to-cyan-50/30 dark:to-cyan-950/20',
    glow: 'bg-cyan-400/25',
    iconWrap: 'group-hover:shadow-[0_0_24px_-4px_rgba(34,211,238,0.45)]',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    title: 'Track every wash',
    titlePrefix: 'Track ',
    titleHighlight: 'every wash',
    titleSuffix: '',
    titleGradient: 'from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400',
    body: 'Follow status from request to completion — the same clarity customers see in the app.',
    icon: MapPin,
    span: '',
    microLabel: 'Live tracking',
    visual: 'track',
    tint: 'from-emerald-50/90 via-mint-50/40 to-cyan-50/30 dark:from-emerald-500/10 dark:via-teal-500/6 dark:to-cyan-500/5',
    surface: 'from-wg-surface-elevated/95 to-emerald-50/25 dark:to-emerald-950/15',
    glow: 'bg-emerald-400/20',
    iconWrap: 'group-hover:shadow-[0_0_24px_-4px_rgba(52,211,153,0.4)]',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Trusted & secure',
    titlePrefix: 'Trusted & ',
    titleHighlight: 'secure',
    titleSuffix: '',
    titleGradient: 'from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400',
    body: 'Role-aware access and protected APIs — built to scale with maps and streaming when you are ready.',
    icon: Shield,
    span: '',
    microLabel: 'Trust layer',
    visual: 'secure',
    tint: 'from-indigo-50/90 via-violet-50/40 to-slate-50/30 dark:from-indigo-500/10 dark:via-violet-500/6 dark:to-slate-800/10',
    surface: 'from-wg-surface-elevated/95 to-indigo-50/20 dark:to-indigo-950/15',
    glow: 'bg-indigo-400/18',
    iconWrap: 'group-hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.35)]',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    title: 'Scheduling that fits life',
    titlePrefix: 'Scheduling that ',
    titleHighlight: 'fits life',
    titleSuffix: '',
    titleGradient: 'from-amber-600 to-orange-500 dark:from-amber-400 dark:to-orange-300',
    body: 'Morning, lunch, or evening slots — designed around real driveway routines.',
    icon: Calendar,
    span: '',
    microLabel: 'Your rhythm',
    visual: 'schedule',
    tint: 'from-amber-50/80 via-orange-50/30 to-rose-50/20 dark:from-amber-500/8 dark:via-orange-500/5 dark:to-rose-500/5',
    surface: 'from-wg-surface-elevated/95 to-amber-50/20 dark:to-amber-950/10',
    glow: 'bg-amber-400/15',
    iconWrap: 'group-hover:shadow-[0_0_20px_-4px_rgba(251,191,36,0.35)]',
    iconColor: 'text-amber-700 dark:text-amber-300',
  },
  {
    title: 'AI concierge',
    titlePrefix: '',
    titleHighlight: 'AI concierge',
    titleSuffix: '',
    titleGradient: 'from-violet-600 via-fuchsia-500 to-cyan-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400',
    body: 'In-app guidance answers how WashGo works — ready for your models when the data plane is.',
    icon: Sparkles,
    span: 'md:col-span-2',
    microLabel: 'Assistant',
    visual: 'ai',
    tint: 'from-violet-50/80 via-fuchsia-50/30 to-cyan-50/40 dark:from-violet-500/10 dark:via-fuchsia-500/6 dark:to-cyan-500/8',
    surface: 'from-wg-surface-elevated/95 to-violet-50/25 dark:to-violet-950/15',
    glow: 'bg-violet-400/18',
    iconWrap: 'group-hover:shadow-[0_0_24px_-4px_rgba(167,139,250,0.4)]',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    title: 'Support when you need it',
    titlePrefix: 'Support when ',
    titleHighlight: 'you need it',
    titleSuffix: '',
    titleGradient: 'from-cyan-600 to-sky-500 dark:from-cyan-400 dark:to-sky-400',
    body: 'Clear paths for customers, partners, and ops — fewer surprises, calmer resolutions.',
    icon: MessageCircle,
    span: 'md:col-span-2 lg:col-span-1',
    microLabel: 'Comms',
    visual: 'support',
    tint: 'from-sky-50/90 via-cyan-50/40 to-slate-50/30 dark:from-sky-500/8 dark:via-cyan-500/6 dark:to-slate-800/8',
    surface: 'from-wg-surface-elevated/95 to-sky-50/30 dark:to-sky-950/15',
    glow: 'bg-sky-400/20',
    iconWrap: 'group-hover:shadow-[0_0_20px_-4px_rgba(56,189,248,0.35)]',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
];

export function MarketingFeaturesSection() {
  const reduced = useReducedMotion();

  return (
    <section id="features" className="relative scroll-mt-20 overflow-hidden py-14 sm:py-16">
      {/* Ambient section mesh */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-500/[0.05] via-wg-surface to-emerald-500/[0.04] dark:from-cyan-500/[0.03] dark:via-wg-surface dark:to-emerald-500/[0.02]"
        aria-hidden
      />
      {!reduced ? (
        <>
          <div
            className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-400/15 blur-[100px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-emerald-400/12 blur-[90px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-400/8 blur-[80px]"
            aria-hidden
          />
        </>
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgb(186 230 253 / 0.35), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgb(167 243 208 / 0.2), transparent 50%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <MarketingReveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700/90 dark:text-cyan-300/90">
            Product flow
          </p>
          <h2 className="wg-title mt-3">Everything in one flow</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-wg-muted">
            A calm, connected journey from{' '}
            <span className="font-semibold text-wg-text">booking</span> to{' '}
            <span className="font-semibold text-wg-text">tracking</span> — eco-minded mobility for doorstep car care.
          </p>
        </MarketingReveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {BENTO.map((item, i) => (
            <m.div
              key={item.title}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-48px' }}
              transition={{ delay: reduced ? 0 : i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={item.span}
            >
              <MarketingFeatureBentoCard item={item} />
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
