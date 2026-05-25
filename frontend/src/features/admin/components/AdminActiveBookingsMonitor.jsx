import { Link } from 'react-router-dom';
import { MapPin, Radio } from 'lucide-react';

import { Card } from '../../../ui/card';
import { cn } from '../../../lib/cn';
import { StatusPill } from '../../../ui/status-pill';
export function AdminActiveBookingsMonitor({ rows, liveCount = 0, loading = false }) {
  const list = rows || [];

  return (
    <Card variant="enterprise" className="wg-admin-accent-ops min-w-0 p-0">
      <div className="border-b border-white/10 px-4 py-3 dark:border-white/5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="wg-heading-section">Active bookings monitor</h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-800 dark:text-emerald-200">
                <Radio className="size-3" aria-hidden />
                Live · {liveCount}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-wg-muted">Synced from bookings API (SSE ~4s).</p>
          </div>
          <Link to="/admin/operations" className="text-xs font-bold text-cyan-700 dark:text-cyan-300">
            Open desk →
          </Link>
        </div>
      </div>
      <div className="max-h-[min(220px,40vh)] overflow-y-auto">
        {loading && !list.length ? (
          <p className="px-4 py-8 text-center text-xs text-wg-muted">Loading active jobs…</p>
        ) : !list.length ? (
          <p className="px-4 py-8 text-center text-xs text-wg-muted">No active bookings in the queue.</p>
        ) : (
          <table className="wg-admin-table min-w-[560px] text-xs">
            <thead className="wg-admin-table-head">
              <tr>
                <th className="wg-admin-table-th">ID</th>
                <th className="wg-admin-table-th">Customer</th>
                <th className="wg-admin-table-th">Washer</th>
                <th className="wg-admin-table-th">Phase</th>
                <th className="wg-admin-table-th">Zone</th>
                <th className="wg-admin-table-th">ETA slip</th>
                <th className="wg-admin-table-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.rawId || r.id} className="wg-admin-table-row">
                  <td className="wg-admin-table-td whitespace-nowrap font-mono text-wg-muted">{r.id}</td>
                  <td className="wg-admin-table-td whitespace-nowrap font-semibold">{r.customer}</td>
                  <td className="wg-admin-table-td whitespace-nowrap text-wg-muted">{r.washer}</td>
                  <td className="wg-admin-table-td text-wg-text">{r.phase}</td>
                  <td className="wg-admin-table-td text-wg-muted">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3 shrink-0 text-cyan-600 dark:text-cyan-400" strokeWidth={2} aria-hidden />
                      {r.zone}
                    </span>
                  </td>
                  <td className="wg-admin-table-td tabular-nums">
                    <span
                      className={cn(
                        'font-semibold',
                        r.etaSlipMinutes > 0 ? 'text-amber-800 dark:text-amber-200' : 'text-wg-muted',
                      )}
                    >
                      {r.etaSlipMinutes > 0 ? `+${r.etaSlipMinutes}m` : '—'}
                    </span>
                  </td>
                  <td className="wg-admin-table-td whitespace-nowrap">
                    <StatusPill status={r.status} />
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
