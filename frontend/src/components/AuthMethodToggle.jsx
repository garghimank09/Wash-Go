import { cn } from '../lib/cn';

/**
 * Switch between email and mobile sign-in / sign-up identifier.
 */
export function AuthMethodToggle({ value, onChange, className = '' }) {
  return (
    <div
      className={cn(
        'flex rounded-xl border border-white/15 bg-white/5 p-1',
        className,
      )}
      role="tablist"
      aria-label="Sign in method"
    >
      {[
        { id: 'email', label: 'Email' },
        { id: 'phone', label: 'Mobile' },
      ].map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          className={cn(
            'flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition',
            value === id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-white/70 hover:text-white',
          )}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
