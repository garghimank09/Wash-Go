import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles } from 'lucide-react';

import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { GlassPanel } from '../../ui/glass-panel';
import { getErrorMessage } from '../../services/api';
import { isValidEmail, validatePassword } from '../../utils/validators';

export function PartnerSignupPage() {
  const { signupPartner, user, initializing } = usePartnerAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceArea, setServiceArea] = useState('');
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
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email');
      return;
    }
    const pwErr = validatePassword(password);
    if (pwErr) {
      setError(pwErr);
      return;
    }
    setLoading(true);
    try {
      await signupPartner({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        service_area: serviceArea.trim() || null,
      });
      navigate('/partner', { replace: true });
    } catch (err) {
      if (err?.message === 'PARTNER_ROLE') {
        setError('Account could not be activated as a partner. Contact support.');
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
            'var(--wg-mesh), radial-gradient(ellipse 90% 55% at 50% -15%, rgba(16,185,129,0.28), transparent), radial-gradient(ellipse 55% 45% at 100% 10%, rgba(99,102,241,0.18), transparent)',
        }}
      />
      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-8 text-center sm:mb-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-1 ring-white/10">
            <ShieldCheck className="size-8 text-emerald-300" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-200/90">WashGo Partner</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Create partner account</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/65">
            Join as an approved field operator. One account for the partner console — separate from customer bookings.
          </p>
        </div>

        <GlassPanel className="border border-white/10 bg-slate-900/85 p-6 shadow-2xl shadow-emerald-500/10 dark:bg-slate-900/80 sm:p-8">
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-3 text-xs text-emerald-50/90">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-300" strokeWidth={2} aria-hidden />
            <p>
              <span className="font-bold text-emerald-100">Partner-only.</span> If you already use WashGo as a customer with this email, sign in there or use a different work email.
            </p>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <Input label="Full name" name="full_name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input
              label="Work email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input label="Phone (optional)" name="phone" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input
              label="Primary service area (optional)"
              name="service_area"
              id="service_area"
              placeholder="e.g. Downtown, Westside"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              passwordToggle
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
            <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-900/30" loading={loading}>
              Create partner account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            Already have access?{' '}
            <Link to="/partner/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
              Partner sign in
            </Link>
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
