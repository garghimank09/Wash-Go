import { Fragment, useMemo } from 'react';

import { Card } from '../../../ui/card';
import { cn } from '../../../lib/cn';

export function AdminHeatmap({ matrix, dayLabels, hourLabels }) {
  const max = useMemo(() => Math.max(1, ...matrix.flat()), [matrix]);

  return (
    <Card variant="glass" className="min-w-0 border-white/35 dark:border-white/10">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="wg-heading-section">Operational heatmap</h2>
          <p className="mt-1 text-xs text-wg-muted">Relative booking demand by weekday and 2-hour block (mock).</p>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="inline-block min-w-[640px]">
          <div
            className="grid gap-y-0.5"
            style={{ gridTemplateColumns: `72px repeat(${hourLabels.length}, minmax(0,1fr))` }}
          >
            <div />
            {hourLabels.map((h) => (
              <div key={h} className="px-0.5 pb-1 text-center text-[9px] font-bold uppercase tracking-wide text-wg-muted">
                {h}
              </div>
            ))}
            {matrix.map((row, di) => (
              <Fragment key={dayLabels[di]}>
                <div className="flex items-center py-0.5 pr-2 text-xs font-bold text-wg-muted">{dayLabels[di]}</div>
                {row.map((cell, hi) => {
                  const intensity = cell / max;
                  return (
                    <div
                      key={`${di}-${hi}`}
                      className={cn(
                        'm-0.5 aspect-square min-h-[18px] rounded-md border border-white/10 transition hover:ring-1 hover:ring-cyan-400/40',
                        'dark:border-white/5',
                      )}
                      style={{
                        backgroundColor: `rgb(6 182 212 / ${0.08 + intensity * 0.55})`,
                        boxShadow: intensity > 0.55 ? '0 0 12px rgb(34 211 238 / 0.25)' : undefined,
                      }}
                      title={`${dayLabels[di]} ${hourLabels[hi]}: ${cell} jobs`}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
