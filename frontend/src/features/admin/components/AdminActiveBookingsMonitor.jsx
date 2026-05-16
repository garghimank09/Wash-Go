import { Link } from 'react-router-dom';
import { MapPin, Radio } from 'lucide-react';

import { Card } from '../../../ui/card';
import { cn } from '../../../lib/cn';
import { StatusPill } from '../../../ui/status-pill';
import { AdminDataSourceBadge } from './AdminDataSourceBadge';

export function AdminActiveBookingsMonitor({ rows, liveCount = 0, loading = false }) {
  const list = rows || [];
  const hasLive = liveCount > 0;

  return (
    <Card variant="glass" className="min-w-0 border-l-4 border-l-indigo-500/55 border-white/20 p-0 dark:border-white/10">
      <div className="border-b border-white/10 px-4 py-3 dark:border-white/5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="wg-heading-section">Active bookings monitor</h2>
              {hasLive ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-800 dark:text-emerald-200">
                  <Radio className="size-3" aria-hidden />
                  Live · {liveCount}
                </span>
              ) : (
                <AdminDataSourceBadge source="demo" />
              )}
            </div>
            <p className="mt-0.5 text-xs text-wg-muted">
              {hasLive
                ? 'Synced from bookings API (SSE ~4s). Demo rows tagged when shown as samples.'
                : 'Sample rows until active bookings exist in the API.'}
            </p>
          </div>
          <Link to="/admin/operations" className="text-xs font-bold text-cyan-700 dark:text-cyan-300">
            Open desk →
          </Link>
        </div>
      </div>
      <div className="max-h-[220px] overflow-y-auto">
        {loading && !list.length ? (
          <p className="px-4 py-8 text-center text-xs text-wg-muted">Loading active jobs…</p>
        ) : !list.length ? (
          <p className="px-4 py-8 text-center text-xs text-wg-muted">No active bookings in the queue.</p>
        ) : (
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="sticky top-0 z-10 bg-wg-surface-elevated/95 text-[10px] font-bold uppercase tracking-wide text-wg-muted backdrop-blur-md">
              <tr className="border-b border-wg-border">
                <th className="px-4 py-2">ID</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Washer</th>
                <th className="px-3 py-2">Phase</th>
                <th className="px-3 py-2">Zone</th>
                <th className="px-3 py-2">ETA slip</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-4 py-2">Src</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wg-border/60">
              {list.map((r) => (
                <tr key={`${r.source}-${r.id}`} className="bg-white/[0.02] dark:bg-transparent">
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-wg-muted">{r.id}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-semibold text-wg-text">{r.customer}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-wg-muted">{r.washer}</td>
                  <td className="px-3 py-2 text-wg-text">{r.phase}</td>
                  <td className="px-3 py-2 text-wg-muted">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3 shrink-0 text-cyan-600 dark:text-cyan-400" strokeWidth={2} aria-hidden />
                      {r.zone}
                    </span>
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    <span
                      className={cn(
                        'font-semibold',
                        r.etaSlipMinutes > 0 ? 'text-amber-800 dark:text-amber-200' : 'text-wg-muted',
                      )}
                    >
                      {r.etaSlipMinutes > 0 ? `+${r.etaSlipMinutes}m` : '—'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    <AdminDataSourceBadge source={r.source || 'live'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
