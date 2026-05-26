import { m } from 'framer-motion';

export function WasherJobSkeleton() {
  return (
    <div className="space-y-5 pb-44">
      <div className="h-4 w-24 animate-pulse rounded-lg bg-wg-border/80 dark:bg-white/10" />
      <div className="h-8 w-48 animate-pulse rounded-lg bg-wg-border/80 dark:bg-white/10" />
      <div className="grid gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-10">
        <div className="order-2 space-y-4 xl:order-1">
          <m.div
            className="h-80 animate-pulse rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900"
            animate={{ opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-40 animate-pulse rounded-2xl bg-wg-border/50 dark:bg-white/5" />
            <div className="h-40 animate-pulse rounded-2xl bg-wg-border/50 dark:bg-white/5" />
          </div>
        </div>
        <div className="order-1 h-64 animate-pulse rounded-2xl bg-wg-border/50 dark:bg-white/5 xl:order-2 xl:h-80" />
      </div>
    </div>
  );
}
