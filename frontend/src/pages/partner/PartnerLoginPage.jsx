import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles } from 'lucide-react';

import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { GlassPanel } from '../../ui/glass-panel';
import { getErrorMessage } from '../../services/api';
import { isValidEmail } from '../../utils/validators';

export function PartnerLoginPage() {
  const { loginPartner, user, initializing } = usePartnerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/partner';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (initializing) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm font-medium text-white/70">Checking partner session…</p>
      </div>
    );
  }

  if (user?.role === 'washer') {
    return <Navigate to="/partner" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) {
      setError('Enter a valid email');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    setLoading(true);
    try {
      await loginPartner(email.trim(), password);
      const safeFrom =
        typeof from === 'string' && from.startsWith('/partner') && from !== '/partner/login' ? from : '/partner';
      navigate(safeFrom, { replace: true });
    } catch (err) {
      if (err?.message === 'PARTNER_ROLE') {
        setError('This portal is for approved WashGo partners only. Use the customer app to book washes.');
        return;
      }
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-slate-950 px-4 py-10 sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          background:
            'radial-gradient(ellipse 90% 55% at 50% -15%, rgba(16,185,129,0.38), transparent), radial-gradient(ellipse 55% 45% at 100% 10%, rgba(99,102,241,0.28), transparent), radial-gradient(ellipse 50% 40% at 0% 80%, rgba(6,182,212,0.2), transparent)',
        }}
      />
      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-8 text-center sm:mb-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-1 ring-white/10">
            <ShieldCheck className="size-8 text-emerald-300" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-200/90">WashGo Partner</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Field console</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/65">
            Sign in to manage jobs, availability, and payouts. Built for pros on the move — fast, focused, mobile-first.
          </p>
        </div>

        <GlassPanel className="border border-white/10 bg-slate-900/85 p-6 shadow-2xl shadow-emerald-500/10 dark:bg-slate-900/80 sm:p-8">
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-3 text-xs text-emerald-50/90">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-300" strokeWidth={2} aria-hidden />
            <p>
              <span className="font-bold text-emerald-100">Partner accounts only.</span> Customer bookings and garage tools stay in the main WashGo app — this space is separate by design.
            </p>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <Input
              label="Work email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              passwordToggle
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
            <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-900/30" loading={loading}>
              Enter partner console
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            New partner?{' '}
            <Link to="/partner/signup" className="font-semibold text-emerald-300 hover:text-emerald-200">
              Create account
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-white/60">
            Booking a wash?{' '}
            <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
              Customer sign in
            </Link>
          </p>
        </GlassPanel>

        <p className="mt-8 text-center text-[11px] text-white/40">
          Same secure WashGo authentication — isolated session for partners.
        </p>
      </div>
    </div>
  );
}
