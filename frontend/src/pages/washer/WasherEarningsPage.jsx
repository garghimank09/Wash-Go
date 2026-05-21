import { useEffect, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { m } from 'framer-motion';
import { Flame, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

import { AnimatedCents } from '../../features/washer/AnimatedCents';
import { usePartnerBookings } from '../../hooks/usePartnerBookings';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { computeWeeklyEarningsSeries } from '../../lib/adminAnalytics';
import { formatCents } from '../../utils/format';
import { Card } from '../../ui/card';

export function WasherEarningsPage() {
  const { items, loading } = usePartnerBookings();
  const chartData = useMemo(() => computeWeeklyEarningsSeries(items || []), [items]);
  const reduced = useReducedMotion();

  const fromApi = useMemo(() => {
    const completed = (items || []).filter((b) => b.status === 'completed');
    const total = completed.reduce((s, b) => s + (Number(b.price_cents) || 0), 0);
    const weekAgo = Date.now() - 7 * 86400000;
    const week = completed.filter((b) => new Date(b.scheduled_at).getTime() >= weekAgo);
    const weekCents = week.reduce((s, b) => s + (Number(b.price_cents) || 0), 0);
    return { lifetimeJobs: completed.length, lifetimeCents: total, weekCents, weekJobs: week.length };
  }, [items]);

  const streakTarget = 5;
  const streakDone = Math.min(streakTarget, fromApi.weekJobs);
  const streakPct = Math.round((streakDone / streakTarget) * 100);

  useEffect(() => {
    if (loading) return;
    if (streakDone < streakTarget) return;
    if (sessionStorage.getItem('washgo:washer:streakMilestoneToast')) return;
    sessionStorage.setItem('washgo:washer:streakMilestoneToast', '1');
    toast.success('Streak target cleared — keep accepting offers to stay in priority dispatch.', {
      duration: 2800,
      icon: '🔥',
    });
  }, [loading, streakDone, streakTarget]);

  useEffect(() => {
    if (loading) return;
    if (fromApi.weekCents < 15000) return;
    if (sessionStorage.getItem('washgo:washer:weekVolumeMilestone')) return;
    sessionStorage.setItem('washgo:washer:weekVolumeMilestone', '1');
    toast.success('Strong week — volume milestone from your completed jobs.', { duration: 2600, icon: '🎯' });
  }, [fromApi.weekCents, loading]);

  return (
    <div className="space-y-5">
      <m.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-wg-text">Earnings</h1>
        <p className="mt-1 text-sm text-wg-muted">Totals and weekly trend from your completed jobs — synced with bookings.</p>
      </m.div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card variant="glass" className="border-white/20 bg-gradient-to-b from-white/40 to-transparent p-4 shadow-lg ring-1 ring-white/15 dark:border-white/10 dark:from-white/[0.06] dark:to-transparent">
          <p className="text-[10px] font-bold uppercase text-wg-muted">This week</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-wg-text">
            {loading ? '—' : <AnimatedCents cents={fromApi.weekCents} />}
          </p>
          <p className="text-xs text-wg-muted">{fromApi.weekJobs} completed jobs in window</p>
        </Card>
        <Card variant="glass" className="border-white/20 bg-gradient-to-b from-white/40 to-transparent p-4 shadow-lg ring-1 ring-white/15 dark:border-white/10 dark:from-white/[0.06] dark:to-transparent">
          <p className="text-[10px] font-bold uppercase text-wg-muted">Lifetime</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-wg-text">
            {loading ? '—' : <AnimatedCents cents={fromApi.lifetimeCents} />}
          </p>
          <p className="text-xs text-wg-muted">{fromApi.lifetimeJobs} completed</p>
        </Card>
      </div>

      <Card variant="glass" className="border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/8 p-4 ring-1 ring-emerald-500/15">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-emerald-900 dark:text-emerald-100">Weekly streak</p>
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
          {streakDone}/{streakTarget} completed this week
        </p>
      </Card>

      <Card variant="glass" className="min-h-[220px] border-white/15 ring-1 ring-white/10 dark:border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="wg-heading-section">Weekly trend</h2>
          <TrendingUp className="size-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="mt-1 text-xs text-wg-muted">Earnings by day from completed jobs.</p>
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
                formatter={(value) => [formatCents(Number(value)), 'Earnings']}
                contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.35)' }}
              />
              <Area type="monotone" dataKey="cents" stroke="rgb(6,182,212)" fill="url(#wgWashEarn)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
