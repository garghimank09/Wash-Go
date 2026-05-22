import { Briefcase, Coffee, Radio } from 'lucide-react';

import { cn } from '../../lib/cn';

function AcceptingToggle({ checked, disabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-8 w-[3.25rem] shrink-0 rounded-full border transition-all duration-200 wg-focus-ring',
        disabled && 'cursor-not-allowed opacity-45',
        checked
          ? 'border-emerald-400/50 bg-emerald-500/25 shadow-[0_0_20px_-4px_rgb(16_185_129/0.55)]'
          : 'border-white/20 bg-white/10 dark:border-white/15 dark:bg-white/[0.06]',
      )}
    >
      <span
        className={cn(
          'absolute top-1 size-6 rounded-full bg-white shadow-md transition-all duration-200',
          checked ? 'left-[calc(100%-1.75rem)]' : 'left-1',
        )}
        aria-hidden
      />
    </button>
  );
}

function WorkStatusTab({ active, disabled, icon: Icon, label, sub, tone, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-2.5 text-center transition-all duration-200 wg-focus-ring',
        disabled && 'cursor-not-allowed opacity-45',
        active
          ? cn('shadow-lg ring-2 ring-offset-2 ring-offset-transparent dark:ring-offset-slate-950', tone.active)
          : cn(
              'border-white/15 bg-white/5 text-wg-muted hover:border-white/25 hover:bg-white/10 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]',
            ),
      )}
    >
      <Icon className={cn('size-5', active ? tone.iconActive : 'opacity-70')} strokeWidth={active ? 2.25 : 1.75} aria-hidden />
      <span className={cn('text-sm font-black tracking-tight', active ? tone.textActive : 'text-wg-text')}>{label}</span>
      {active && sub ? <span className={cn('text-[10px] font-bold uppercase tracking-wide', tone.subActive)}>{sub}</span> : null}
    </button>
  );
}

/**
 * Partner availability: accepting toggle + Busy / Break work-status tabs.
 */
export function WasherAvailabilityControls({ av, className }) {
  const disabled = !av.online;
  const acceptingActive = av.acceptingJobs && !av.busy && !av.onBreak;

  const selectBusy = () => {
    if (av.busy) {
      av.setBusy(false);
      if (!av.acceptingJobs) av.setAcceptingJobs(true);
      return;
    }
    av.setBusy(true);
  };

  const selectBreak = () => {
    if (av.onBreak) {
      av.setOnBreak(false);
      if (!av.acceptingJobs) av.setAcceptingJobs(true);
      return;
    }
    av.setOnBreak(true);
  };

  const onAcceptingToggle = (next) => {
    if (next) {
      av.setAcceptingJobs(true);
      if (av.busy) av.setBusy(false);
      if (av.onBreak) av.setOnBreak(false);
    } else {
      av.setAcceptingJobs(false);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 transition-colors',
          acceptingActive
            ? 'border-emerald-400/35 bg-gradient-to-r from-emerald-500/12 via-emerald-500/6 to-transparent dark:from-emerald-500/18'
            : 'border-white/15 bg-white/5 dark:border-white/10 dark:bg-white/[0.04]',
          disabled && 'opacity-50',
        )}
      >
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-black text-wg-text">
            <Radio className={cn('size-4', acceptingActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-wg-muted')} strokeWidth={2} aria-hidden />
            Accepting jobs
          </p>
          <p className="mt-0.5 text-xs text-wg-muted">
            {disabled ? 'Go online to receive offers' : acceptingActive ? 'Live — new offers in your queue' : 'Off — you will not get new offers'}
          </p>
        </div>
        <AcceptingToggle checked={acceptingActive} disabled={disabled} onChange={onAcceptingToggle} />
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-wg-muted">Work status</p>
        <div className="grid grid-cols-2 gap-2">
          <WorkStatusTab
            active={av.busy}
            disabled={disabled}
            icon={Briefcase}
            label="Busy"
            sub="On a job"
            tone={{
              active: 'border-amber-400/45 bg-gradient-to-br from-amber-500/25 to-orange-500/10 ring-amber-400/40',
              iconActive: 'text-amber-700 dark:text-amber-200',
              textActive: 'text-amber-950 dark:text-amber-50',
              subActive: 'text-amber-800/90 dark:text-amber-200/90',
            }}
            onClick={selectBusy}
          />
          <WorkStatusTab
            active={av.onBreak}
            disabled={disabled}
            icon={Coffee}
            label="Break"
            sub="Away"
            tone={{
              active: 'border-indigo-400/40 bg-gradient-to-br from-indigo-500/22 to-violet-500/10 ring-indigo-400/35',
              iconActive: 'text-indigo-700 dark:text-indigo-200',
              textActive: 'text-indigo-950 dark:text-indigo-50',
              subActive: 'text-indigo-800/90 dark:text-indigo-200/90',
            }}
            onClick={selectBreak}
          />
        </div>
      </div>
    </div>
  );
}
