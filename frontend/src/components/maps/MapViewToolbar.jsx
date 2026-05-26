import { Box, Layers, Mountain } from 'lucide-react';

import { cn } from '../../lib/cn';

const MODES = [
  { id: '2d', label: '2D', Icon: Layers },
  { id: '3d', label: '3D', Icon: Mountain },
  { id: 'satellite', label: 'Satellite', Icon: Box },
  { id: 'hybrid', label: 'Hybrid', Icon: Box },
];

/** Map / Satellite / Hybrid + 2D / 3D tilt controls for Google Maps picker. */
export function MapViewToolbar({ viewMode, onViewModeChange, className }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1 rounded-xl border border-wg-border/80 bg-wg-surface-elevated/95 p-1 shadow-sm backdrop-blur-md dark:border-white/10',
        className,
      )}
      role="group"
      aria-label="Map view"
    >
      {MODES.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onViewModeChange(id)}
          className={cn(
            'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition',
            viewMode === id
              ? 'bg-cyan-600 text-white shadow-sm dark:bg-cyan-500'
              : 'text-wg-muted hover:bg-wg-border/40 hover:text-wg-text',
          )}
        >
          <Icon className="size-3" strokeWidth={2} aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

/** @returns {{ mapTypeId: string, tilt: number }} */
export function mapOptionsForViewMode(viewMode) {
  switch (viewMode) {
    case '3d':
      return { mapTypeId: 'roadmap', tilt: 45 };
    case 'satellite':
      return { mapTypeId: 'satellite', tilt: 0 };
    case 'hybrid':
      return { mapTypeId: 'hybrid', tilt: 0 };
    case '2d':
    default:
      return { mapTypeId: 'roadmap', tilt: 0 };
  }
}
