import { useEffect, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { m } from 'framer-motion';
import { Flame, Lightbulb, MapPin, Sparkles, TrendingUp, Unlock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

import { AnimatedCents } from '../../features/washer/AnimatedCents';
import { usePartnerBookings } from '../../hooks/usePartnerBookings';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { hashString } from '../../lib/partnerFieldDemo';
import { INCENTIVES_DEMO, weeklyEarningsDemoSeries } from '../../features/washer/mock/earningsDemo';
import { formatCents } from '../../utils/format';
import { Card } from '../../ui/card';
import { cn } from '../../lib/cn';

export function WasherEarningsPage() {
  const { items, loading } = usePartnerBookings();
  const chartData = weeklyEarningsDemoSeries();
  const reduced = useReducedMotion();

  const fromApi = useMemo(() => {
    const completed = (items || []).filter((b) => b.status === 'completed');
    const total = completed.reduce((s, b) => s + (Number(b.price_cents) || 0), 0);
    // eslint-disable-next-line react-hooks/purity -- rolling 7-day window from "now"
    const weekAgo = Date.now() - 7 * 86400000;
    const week = completed.filter((b) => new Date(b.scheduled_at).getTime() >= weekAgo);
    const weekCents = week.reduce((s, b) => s + (Number(b.price_cents) || 0), 0);
    return { lifetimeJobs: completed.length, lifetimeCents: total, weekCents, weekJobs: week.length };
  }, [items]);

  const demoBoost = 3200;
  const displayWeek = fromApi.weekCents + demoBoost;
  const streakTarget = 5;
  const streakDone = Math.min(streakTarget, fromApi.weekJobs + 2);
  const streakPct = Math.round((streakDone / streakTarget) * 100);

  const opsInsight = useMemo(() => {
    const h = hashString(String(displayWeek));
    const lines = [
      'Your on-peak windows line up with Marina demand — short acceptance latency is compounding.',
      'Route compression is strong this week; tight QC photos lift trust score in dispatch.',
      'Volume pacing above cohort median — streak incentive is one strong afternoon away.',
    ];
    return lines[h % lines.length];
  }, [displayWeek]);

  useEffect(() => {
    if (loading) return;
    if (streakDone < streakTarget) return;
    if (sessionStorage.getItem('washgo:washer:streakMilestoneToast')) return;
    sessionStorage.setItem('washgo:washer:streakMilestoneToast', '1');
    toast.success('Streak target cleared — priority dispatch tier active (demo).', { duration: 2800, icon: '🔥' });
  }, [loading, streakDone, streakTarget]);

  useEffect(() => {
    if (loading) return;
    if (displayWeek < 15000) return;
    if (sessionStorage.getItem('washgo:washer:weekVolumeMilestone')) return;
    sessionStorage.setItem('washgo:washer:weekVolumeMilestone', '1');
    toast.success('Week volume milestone — bonus lane unlocked (demo).', { duration: 2600, icon: '🎯' });
  }, [displayWeek, loading]);

  return (
    <div className="space-y-5">
      <m.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-wg-text">Earnings</h1>
        <p className="mt-1 text-sm text-wg-muted">Live counters + surge psychology — blends API totals with investor-safe demo lift.</p>
      </m.div>

      <Card variant="glass" className="overflow-hidden border-amber-400/25 bg-gradient-to-br from-amber-500/12 via-rose-500/8 to-transparent p-4 ring-1 ring-amber-400/15 dark:from-amber-500/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-amber-900 dark:text-amber-100">
              <Zap className="size-3.5" strokeWidth={2} aria-hidden />
              Peak demand · surge zone
            </p>
            <p className="mt-1 text-sm font-bold text-wg-text">SOMA / Mission · +$3–$6 per job</p>
            <p className="mt-1 text-xs text-wg-muted">Demand index high — stay online for stacked offers.</p>
          </div>
          <m.span
            className="shrink-0 rounded-full bg-amber-500/25 px-2 py-1 text-[10px] font-black uppercase text-amber-950 dark:text-amber-50"
            animate={reduced ? undefined : { opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            Live
          </m.span>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card variant="glass" className="border-white/20 bg-gradient-to-b from-white/40 to-transparent p-4 shadow-lg ring-1 ring-white/15 dark:border-white/10 dark:from-white/[0.06] dark:to-transparent">
          <p className="text-[10px] font-bold uppercase text-wg-muted">This week (API + demo lift)</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-wg-text">
            {loading ? '—' : <AnimatedCents cents={displayWeek} />}
          </p>
          <p className="text-xs text-wg-muted">{fromApi.weekJobs} completed jobs in window</p>
        </Card>
        <Card variant="glass" className="border-white/20 bg-gradient-to-b from-white/40 to-transparent p-4 shadow-lg ring-1 ring-white/15 dark:border-white/10 dark:from-white/[0.06] dark:to-transparent">
          <p className="text-[10px] font-bold uppercase text-wg-muted">Lifetime (API)</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-wg-text">
            {loading ? '—' : <AnimatedCents cents={fromApi.lifetimeCents} />}
          </p>
          <p className="text-xs text-wg-muted">{fromApi.lifetimeJobs} completed</p>
        </Card>
      </div>

      <Card variant="glass" className="border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/8 p-4 ring-1 ring-emerald-500/15">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-emerald-900 dark:text-emerald-100">Streak unlock</p>
            <p className="mt-0.5 text-sm font-bold text-wg-text">Priority offers after {streakTarget} completes this week</p>
          </div>
          <Flame className="size-8 text-orange-500" strokeWidth={1.5} aria-hidden />
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <m.div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400"
            initial={false}
            animate={{ width: `${streakPct}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          />
        </div>
        <p className="mt-2 text-xs font-semibold text-wg-muted">
          {streakDone}/{streakTarget} toward streak bonus (demo progression).
        </p>
      </Card>

      <m.div
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
      >
        <Card variant="glass" className="flex items-start gap-3 border-cyan-500/20 bg-gradient-to-r from-cyan-500/8 to-transparent p-4 dark:border-cyan-500/10">
          <Lightbulb className="mt-0.5 size-5 shrink-0 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-wg-muted">Operational insight</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-wg-text">{opsInsight}</p>
          </div>
        </Card>
      </m.div>

      <m.div
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 32, delay: reduced ? 0 : 0.05 }}
      >
        <Card variant="glass" className="flex items-start gap-3 border-violet-500/25 bg-violet-500/8 p-4 dark:border-violet-500/15">
          <Unlock className="mt-0.5 size-5 shrink-0 text-violet-600 dark:text-violet-300" strokeWidth={1.75} aria-hidden />
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-wg-muted">Incentive window</p>
            <p className="mt-1 text-sm font-bold text-wg-text">Express detail add-on unlocks at 6 completes / week</p>
            <p className="mt-1 text-xs text-wg-muted">Demo progression — shows how layered unlocks feel in partner apps.</p>
          </div>
        </Card>
      </m.div>

      <Card variant="glass" className="min-h-[220px] border-white/15 ring-1 ring-white/10 dark:border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="wg-heading-section">Weekly trend</h2>
          <TrendingUp className="size-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="mt-1 text-xs text-wg-muted">Operational curve — blends with your roster when bookings land.</p>
        <div className="mt-4 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="wgWashEarn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(6,182,212)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="rgb(6,182,212)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-wg-border/60" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--wg-muted, #64748b)" />
              <YAxis hide domain={['dataMin - 2000', 'dataMax + 2000']} />
              <Tooltip
                formatter={(value) => [formatCents(Number(value), 'USD'), 'Volume']}
                contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.35)' }}
              />
              <Area type="monotone" dataKey="cents" stroke="rgb(6,182,212)" fill="url(#wgWashEarn)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card variant="glass" className="flex items-start gap-3 border-indigo-500/20 bg-indigo-500/8 p-4 dark:border-indigo-500/15">
        <MapPin className="mt-0.5 size-5 shrink-0 text-indigo-600 dark:text-indigo-300" strokeWidth={1.75} aria-hidden />
        <div>
          <p className="text-sm font-black text-wg-text">Incentive zone · Marina</p>
          <p className="mt-1 text-xs text-wg-muted">Extra +$5 on deluxe+ packages · auto-applied in dispatch (demo).</p>
        </div>
      </Card>

      <div>
        <h2 className="text-sm font-black uppercase tracking-[0.14em] text-wg-muted">Incentives</h2>
        <ul className="mt-3 space-y-2">
          {INCENTIVES_DEMO.map((x) => (
            <li key={x.id}>
              <Card
                variant="glass"
                className={cn(
                  'border-white/10 shadow-md ring-1 ring-white/10 transition hover:shadow-lg dark:ring-white/5',
                  x.highlight && 'border-cyan-500/30 bg-gradient-to-r from-cyan-500/12 to-indigo-500/8',
                )}
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 size-4 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
                  <div>
                    <p className="font-bold text-wg-text">{x.title}</p>
                    <p className="mt-1 text-xs text-wg-muted">{x.body}</p>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
