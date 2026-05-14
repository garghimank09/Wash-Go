import { m } from 'framer-motion';
import { CloudRain, Droplets, Sun } from 'lucide-react';

import { Card } from '../../ui/card';
import { useReducedMotion } from '../../lib/useReducedMotion';

const TIPS = [
  {
    key: 'dry',
    Icon: Sun,
    title: 'Dry climate weeks',
    body: 'Dust builds faster on paint — a mid-week rinse keeps gloss longer between full washes.',
  },
  {
    key: 'wet',
    Icon: CloudRain,
    title: 'After rain',
    body: 'Road film etches fastest when wet. Schedule within 48h of heavy rain for best results.',
  },
  {
    key: 'interior',
    Icon: Droplets,
    title: 'Interior air',
    body: 'Vacuum floor mats monthly; cabin filters trap pollen that clings to glass edges.',
  },
];

export function DashboardVehicleCareTips() {
  const reduced = useReducedMotion();

  return (
    <Card variant="glass" className="min-w-0">
      <h2 className="wg-heading-section">Vehicle care tips</h2>
      <p className="mt-1 text-xs text-wg-muted">Short reads tailored to how most WashGo drivers use their cars.</p>
      <ul className="mt-4 space-y-3">
        {TIPS.map((t, i) => (
          <m.li
            key={t.key}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.06 }}
            className="flex gap-3 rounded-xl border border-white/20 bg-white/35 p-3 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-from/15 to-brand-to/15 text-cyan-700 dark:text-cyan-300">
              <t.Icon className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-sm font-bold text-wg-text">{t.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-wg-muted">{t.body}</p>
            </div>
          </m.li>
        ))}
      </ul>
    </Card>
  );
}
