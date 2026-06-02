import { Link } from 'react-router-dom';

import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../lib/demoAccounts';

/**
 * Dev-only hint for seeded demo accounts (backend seed_demo_users).
 */
export function DemoCredentialsPanel({ highlight, onFillDemo }) {
  if (import.meta.env.PROD) return null;

  return (
    <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] p-3 text-xs text-amber-100/90">
      <p className="font-bold text-amber-200">Demo logins (development)</p>
      <p className="mt-1 text-amber-100/75">
        Password for all: <span className="font-mono font-semibold">{DEMO_PASSWORD}</span> — sign in with{' '}
        <span className="font-semibold">mobile only</span> (no SMS OTP).
      </p>
      <ul className="mt-2 space-y-1.5">
        {DEMO_ACCOUNTS.map((row) => {
          const isHighlight = row.label === highlight;
          return (
            <li
              key={row.phone}
              className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${isHighlight ? 'font-semibold text-amber-50' : ''}`}
            >
              <span className="text-amber-200/90">{row.label}:</span>
              <span className="font-mono">{row.phone}</span>
              {!isHighlight ? (
                <span className="text-amber-100/60">
                  — use{' '}
                  <Link to={row.where} className="font-semibold text-amber-200 underline-offset-2 hover:underline">
                    {row.where}
                  </Link>
                </span>
              ) : onFillDemo ? (
                <button
                  type="button"
                  className="rounded-md border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-100 hover:bg-amber-500/25"
                  onClick={() => onFillDemo({ phone: row.phone, password: DEMO_PASSWORD })}
                >
                  Use
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
