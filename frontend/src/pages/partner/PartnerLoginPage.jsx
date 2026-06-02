import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles } from 'lucide-react';

import { DemoCredentialsPanel } from '../../components/DemoCredentialsPanel';
import { ForgotPasswordForm } from '../../components/ForgotPasswordForm';
import { OtpVerificationFields } from '../../components/OtpVerificationFields';
import { useAuth } from '../../context/AuthContext';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { GlassPanel } from '../../ui/glass-panel';
import {
  ADMIN_LOGIN_ONLY_MESSAGE,
  CUSTOMER_LOGIN_ONLY_MESSAGE,
  isPartnerDemoPhone,
} from '../../lib/demoAccounts';
import { clearCustomerSession, isBlockedAdminPortalPhone } from '../../lib/adminLoginGuard';
import { isBlockedCustomerOnPartnerPortal } from '../../lib/partnerLoginGuard';
import { authService } from '../../services/authService';
import { partnerAuthService } from '../../services/partnerAuthService';
import { getErrorMessage } from '../../services/api';
import { normalizeIndianPhoneDigits, validateIndianPhone10, validateOtpCode } from '../../utils/validators';

export function PartnerLoginPage() {
  const { refreshUser, user: customerUser } = useAuth();
  const { loginPartner, user, initializing } = usePartnerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/partner';

  const [view, setView] = useState('login');
  const [step, setStep] = useState('credentials');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpInfo, setOtpInfo] = useState('');
  const [otpDestination, setOtpDestination] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  if (initializing) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm font-medium text-white/70">Checking partner session…</p>
      </div>
    );
  }

  if (customerUser?.role === 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.role === 'washer') {
    return <Navigate to="/partner" replace />;
  }

  const normalizedPhone = normalizeIndianPhoneDigits(phone);
  const demoAccount = isPartnerDemoPhone(normalizedPhone);

  const rejectAdminOnThisPortal = () => {
    setError(ADMIN_LOGIN_ONLY_MESSAGE);
  };

  const resetAnySession = () => {
    authService.clearSession();
    partnerAuthService.clearSession();
  };

  const safeFrom =
    typeof from === 'string' && from.startsWith('/partner') && from !== '/partner/login'
      ? from
      : '/partner';

  const submitCredentials = async (e) => {
    e.preventDefault();
    setError('');
    const pErr = validateIndianPhone10(phone, { required: true });
    setPhoneError(pErr ?? '');
    if (pErr) {
      setError(pErr);
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (isBlockedAdminPortalPhone(normalizedPhone)) {
      rejectAdminOnThisPortal();
      return;
    }
    if (isBlockedCustomerOnPartnerPortal(normalizedPhone)) {
      setError(CUSTOMER_LOGIN_ONLY_MESSAGE);
      return;
    }
    setLoading(true);
    try {
      if (demoAccount) {
        await loginPartner({ phone: normalizedPhone, password });
        navigate(safeFrom, { replace: true });
        return;
      }
      const res = await partnerAuthService.sendOtp({ phone: normalizedPhone, purpose: 'login' });
      setOtpDestination(res.delivery_target || '');
      setOtpInfo(res.message || 'Check your phone for the code.');
      setStep('otp');
    } catch (err) {
      if (err?.message === 'ADMIN_ROLE') {
        clearCustomerSession(authService);
        await refreshUser();
        rejectAdminOnThisPortal();
        return;
      }
      if (err?.message === 'PARTNER_ROLE') {
        setError('This portal is for approved WashGo partners only.');
        return;
      }
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setError('');
    const otpErr = validateOtpCode(otp);
    setOtpError(otpErr ?? '');
    if (otpErr) {
      setError(otpErr);
      return;
    }
    setLoading(true);
    try {
      await loginPartner({ phone: normalizedPhone, password, otpCode: otp.trim() });
      navigate(safeFrom, { replace: true });
    } catch (err) {
      if (err?.message === 'ADMIN_ROLE') {
        clearCustomerSession(authService);
        await refreshUser();
        rejectAdminOnThisPortal();
        return;
      }
      if (err?.message === 'PARTNER_ROLE') {
        setError('This portal is for approved WashGo partners only.');
        return;
      }
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    try {
      const res = await partnerAuthService.sendOtp({ phone: normalizedPhone, purpose: 'login' });
      setOtpDestination(res.delivery_target || otpDestination);
      setOtpInfo(res.message || 'A new code was sent.');
      setOtp('');
      setOtpError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResendLoading(false);
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
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {view === 'forgot' ? 'Reset password' : 'Field console'}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/65">
            {view === 'forgot'
              ? 'Reset with your registered mobile.'
              : step === 'otp'
                ? 'Enter the SMS verification code.'
                : 'Sign in with mobile + password.'}
          </p>
        </div>

        <GlassPanel className="border border-white/10 bg-slate-900/85 p-6 shadow-2xl shadow-emerald-500/10 dark:bg-slate-900/80 sm:p-8">
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-3 text-xs text-emerald-50/90">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-300" strokeWidth={2} aria-hidden />
            <p>
              <span className="font-bold text-emerald-100">Partner accounts only.</span> Customer bookings use the main app.
            </p>
          </div>

          {view === 'forgot' ? (
            <ForgotPasswordForm
              sendOtp={partnerAuthService.sendOtp}
              resetPassword={partnerAuthService.resetPassword}
              mutedClassName="text-white/70"
              onBack={() => setView('login')}
              onSuccess={() => {
                setView('login');
                setStep('credentials');
                setError('');
                setOtp('');
              }}
            />
          ) : (
            <form className="space-y-4" onSubmit={step === 'otp' ? submitOtp : submitCredentials} noValidate>
              <Input
                label="Mobile number"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                placeholder="10-digit mobile"
                value={phone}
                onChange={(e) => {
                  const digits = normalizeIndianPhoneDigits(e.target.value);
                  setPhone(digits);
                  if (phoneError) setPhoneError(validateIndianPhone10(digits, { required: true }) ?? '');
                }}
                onBlur={() => setPhoneError(validateIndianPhone10(phone, { required: true }) ?? '')}
                error={phoneError}
                disabled={step === 'otp'}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                passwordToggle
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={step === 'otp'}
              />
              {step === 'credentials' ? (
                <p className="text-right">
                  <button
                    type="button"
                    className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                    onClick={() => {
                      setView('forgot');
                      setError('');
                    }}
                  >
                    Forgot password?
                  </button>
                </p>
              ) : null}
              {step === 'otp' ? (
                <OtpVerificationFields
                  destination={otpDestination}
                  otp={otp}
                  onOtpChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(v);
                    if (otpError) setOtpError(validateOtpCode(v) ?? '');
                  }}
                  otpError={otpError}
                  onOtpBlur={() => setOtpError(validateOtpCode(otp) ?? '')}
                  onResend={() => void handleResend()}
                  resendLoading={resendLoading}
                  infoMessage={otpInfo}
                  mutedClassName="text-white/70"
                />
              ) : null}
              {error ? <p className="text-sm text-rose-400">{error}</p> : null}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-900/30"
                loading={loading}
              >
                {step === 'otp' ? 'Verify & enter console' : 'Continue'}
              </Button>
              {step === 'otp' ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-white/70"
                  onClick={() => {
                    setStep('credentials');
                    setOtp('');
                    setOtpError('');
                    setError('');
                  }}
                >
                  Back
                </Button>
              ) : null}
            </form>
          )}

          {view === 'login' ? (
            <>
              <p className="mt-6 text-center text-sm text-white/60">
                New partner?{' '}
                <Link to="/partner/signup" className="font-semibold text-emerald-300 hover:text-emerald-200">
                  Create account
                </Link>
              </p>
              <p className="mt-3 text-center text-sm text-white/60">
                Booking a wash?{' '}
                <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200" onClick={resetAnySession}>
                  Customer sign in
                </Link>
              </p>
            </>
          ) : null}
        </GlassPanel>

        <DemoCredentialsPanel
          highlight="Partner"
          onFillDemo={({ phone: demoPhone, password: demoPassword }) => {
            setPhone(demoPhone);
            setPassword(demoPassword);
            setPhoneError('');
            setError('');
            setStep('credentials');
          }}
        />
        <p className="mt-4 text-center text-sm text-white/55">
          WashGo admin?{' '}
          <Link to="/admin/login" className="font-semibold text-indigo-300 hover:text-indigo-200" onClick={resetAnySession}>
            Admin console sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
