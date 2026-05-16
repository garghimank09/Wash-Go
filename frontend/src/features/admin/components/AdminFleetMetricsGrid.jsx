import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Award, Clock, MapPin } from 'lucide-react';

import { Card } from '../../../ui/card';
import { cn } from '../../../lib/cn';
import { ChartMeasuredContainer } from '../../dashboard/ChartMeasuredContainer';
import { useReducedMotion } from '../../../lib/useReducedMotion';
import { formatCents } from '../../../utils/format';

function sparkData(trend7d) {
  const t = trend7d || [];
  return t.map((v, i) => ({ i: String(i + 1), v }));
}

function yDomain(trend7d) {
  const t = trend7d || [];
  if (!t.length) return [0, 1];
  const lo = Math.min(...t);
  const hi = Math.max(...t);
  if (hi === lo) return [Math.max(0, lo - 1), hi + 1];
  const pad = Math.max((hi - lo) * 0.12, 0.5);
  return [lo - pad, hi + pad];
}

function ProfileMetric({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 dark:bg-white/[0.03]">
      <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">{label}</p>
      <p className="mt-1 text-lg font-black tabular-nums leading-none text-wg-text">{value}</p>
      {sub ? <p className="mt-0.5 text-[10px] text-wg-muted">{sub}</p> : null}
    </div>
  );
}

export function AdminFleetMetricsGrid({ washers }) {
  const reduced = useReducedMotion();
  const list = washers || [];
  const avgUtil = list.length ? Math.round(list.reduce((s, w) => s + (w.utilizationPct ?? 0), 0) / list.length) : 0;
  const avgAccept = list.length ? Math.round(list.reduce((s, w) => s + (w.acceptancePct ?? 0), 0) / list.length) : 0;
  const avgTrust = list.length ? Math.round(list.reduce((s, w) => s + (w.trustScore ?? 0), 0) / list.length) : 0;
  const completes7d = list.reduce((s, w) => s + (w.completed7d ?? 0), 0);

  return (
    <Card variant="glass" className="min-w-0 border-l-4 border-l-teal-500/50 border-white/20 p-5 dark:border-white/10">
      <h2 className="wg-heading-section">Fleet utilization</h2>
      <p className="mt-1 text-xs text-wg-muted">Network aggregates from live fleet API (SSE-synced).</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3.5 dark:bg-white/[0.04]">
          <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Avg utilization</p>
          <p className="mt-1.5 text-2xl font-black tabular-nums text-wg-text">{avgUtil}%</p>
        </div>
        <div className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3.5 dark:bg-white/[0.04]">
          <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Avg acceptance</p>
          <p className="mt-1.5 text-2xl font-black tabular-nums text-wg-text">{avgAccept}%</p>
        </div>
        <div className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3.5 dark:bg-white/[0.04]">
          <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Avg trust score</p>
          <p className="mt-1.5 text-2xl font-black tabular-nums text-wg-text">{avgTrust}</p>
        </div>
        <div className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3.5 dark:bg-white/[0.04]">
          <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Completes (7d)</p>
          <p className="mt-1.5 text-2xl font-black tabular-nums text-wg-text">{completes7d}</p>
        </div>
      </div>

      <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.12em] text-wg-muted">Operator roster</p>
      <div className="relative mt-3 min-w-0">
        <div className="-mx-1 flex gap-5 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:thin]">
          {list.map((w) => {
            const chartData = sparkData(w.trend7d);
            const [y0, y1] = yDomain(w.trend7d);
            return (
              <article
                key={w.id}
                className={cn(
                  'flex w-[min(100%,288px)] shrink-0 snap-start flex-col rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.06] to-black/[0.02] p-5 shadow-sm dark:from-white/[0.05] dark:to-white/[0.02]',
                  'min-h-[320px]',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black leading-snug tracking-tight text-wg-text [overflow-wrap:anywhere]">{w.name}</h3>
                    {w.region ? (
                      <p className="mt-2 flex items-start gap-1.5 text-xs font-medium leading-snug text-wg-muted">
                        <MapPin className="mt-0.5 size-3.5 shrink-0 text-teal-600/90 dark:text-teal-400/90" strokeWidth={2} aria-hidden />
                        <span>{w.region}</span>
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {w.active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-900 dark:text-emerald-100">
                        {!reduced ? (
                          <span className="relative flex size-1.5">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                            <span className="relative size-1.5 rounded-full bg-emerald-500" />
                          </span>
                        ) : (
                          <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                        )}
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-slate-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-wg-muted">
                        <Clock className="size-3" aria-hidden />
                        Offline
                      </span>
                    )}
                    {w.topBadge ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-950 dark:text-amber-100">
                        <Award className="size-3 shrink-0" aria-hidden />
                        {w.topBadge}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 grid flex-1 grid-cols-2 gap-3">
                  <ProfileMetric label="Utilization" value={`${w.utilizationPct ?? '—'}%`} />
                  <ProfileMetric label="Acceptance" value={`${w.acceptancePct ?? '—'}%`} />
                  <ProfileMetric label="Trust" value={w.trustScore != null ? String(w.trustScore) : '—'} />
                  <ProfileMetric
                    label="CSAT"
                    value={w.rating != null ? Number(w.rating).toFixed(1) : '—'}
                    sub="Avg rating"
                  />
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 dark:bg-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Week earnings</p>
                  <p className="mt-1 text-xl font-black tabular-nums text-wg-text">
                    {w.revenue7dCents ? formatCents(w.revenue7dCents) : '—'}
                  </p>
                </div>

                <div className="mt-auto flex min-h-[96px] flex-col pt-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-wg-muted">7-day job trend</p>
                  <ChartMeasuredContainer className="h-24 w-full min-w-0 flex-1">
                    {({ width, height }) => (
                      <ResponsiveContainer width={width} height={height} minWidth={0} minHeight={0}>
                        <LineChart data={chartData} margin={{ top: 6, right: 10, left: 0, bottom: 4 }}>
                          <XAxis dataKey="i" hide />
                          <YAxis hide domain={[y0, y1]} />
                          <Tooltip
                            cursor={{ stroke: 'rgba(6,182,212,0.25)', strokeWidth: 1 }}
                            contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)' }}
                            formatter={(v) => [v, 'Jobs / day']}
                          />
                          <Line
                            type="monotone"
                            dataKey="v"
                            stroke="rgb(13,148,136)"
                            strokeWidth={2.75}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0, fill: 'rgb(6,182,212)' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </ChartMeasuredContainer>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
