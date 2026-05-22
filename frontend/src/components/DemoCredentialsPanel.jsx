const DEMO_ROWS = [
  { label: 'Admin', email: 'admin@washgo.demo', where: '/login' },
  { label: 'Customer', email: 'customer@washgo.demo', where: '/login' },
  { label: 'Partner', email: 'partner@washgo.demo', where: '/partner/login' },
];

const DEMO_PASSWORD = 'Demo1234';

/**
 * Dev-only hint for seeded accounts (backend seed_demo_users).
 */
export function DemoCredentialsPanel({ highlight }) {
  if (import.meta.env.PROD) return null;

  return (
    <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] p-3 text-xs text-amber-100/90">
      <p className="font-bold text-amber-200">Demo logins (development)</p>
      <p className="mt-1 text-amber-100/75">
        Password for all: <span className="font-mono font-semibold">{DEMO_PASSWORD}</span> — no email OTP required.
      </p>
      <ul className="mt-2 space-y-1.5">
        {DEMO_ROWS.map((row) => (
          <li key={row.email} className={row.label === highlight ? 'font-semibold text-amber-50' : ''}>
            <span className="text-amber-200/90">{row.label}:</span>{' '}
            <span className="font-mono">{row.email}</span>
            {row.label !== highlight ? (
              <span className="text-amber-100/60"> — use {row.where}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
