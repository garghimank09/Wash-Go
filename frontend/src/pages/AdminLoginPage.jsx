import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

import { DemoCredentialsPanel } from '../components/DemoCredentialsPanel';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { OtpVerificationFields } from '../components/OtpVerificationFields';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../context/AuthContext';
import { canAccessAdmin } from '../lib/canAccessAdmin';
import { isDemoPhone } from '../lib/demoAccounts';
import { resolvePostLoginPath } from '../lib/appPaths';
import { authService } from '../services/authService';
import { getErrorMessage } from '../services/api';
import { normalizeIndianPhoneDigits, validateIndianPhone10, validateOtpCode } from '../utils/validators';

export function AdminLoginPage() {
  const { login, user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin';

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

  if (user && canAccessAdmin(user)) {
    return <Navigate to={resolvePostLoginPath(user, from)} replace />;
  }

  const normalizedPhone = normalizeIndianPhoneDigits(phone);
  const demoAccount = isDemoPhone(normalizedPhone);

  const finishLogin = async (me) => {
    if (!canAccessAdmin(me)) {
      authService.clearSession();
      await refreshUser();
      setError('This account does not have admin console access.');
      return;
    }
    navigate(resolvePostLoginPath(me, from), { replace: true });
  };

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
    setLoading(true);
    try {
      if (demoAccount) {
        const me = await login({ phone: normalizedPhone, password });
        await finishLogin(me);
        return;
      }
      const res = await authService.sendOtp({ phone: normalizedPhone, purpose: 'login', roleHint: 'admin' });
      setOtpDestination(res.delivery_target || '');
      setOtpInfo(res.message || 'Check your phone for the code.');
      setStep('otp');
    } catch (err) {
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
      const me = await login({ phone: normalizedPhone, password, otpCode: otp.trim() });
      await finishLogin(me);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    try {
      const res = await authService.sendOtp({ phone: normalizedPhone, purpose: 'login', roleHint: 'admin' });
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
    <div>
      <div className="mb-2 flex items-center gap-2 text-indigo-300">
        <Shield className="size-6" strokeWidth={1.75} aria-hidden />
        <span className="text-xs font-bold uppercase tracking-[0.2em]">Admin console</span>
      </div>
      <h1 className="text-2xl font-black tracking-tight text-white">
        {view === 'forgot' ? 'Reset password' : 'Admin sign in'}
      </h1>
      <p className="mt-1 text-sm text-white/65">
        {view === 'forgot'
          ? 'Reset with your registered mobile.'
          : step === 'otp'
            ? 'Enter the SMS verification code.'
            : 'Operations console — mobile sign-in only.'}
      </p>

      {view === 'forgot' ? (
        <div className="mt-8">
          <ForgotPasswordForm
            sendOtp={(opts) => authService.sendOtp({ ...opts, roleHint: 'admin' })}
            resetPassword={authService.resetPassword}
            onBack={() => setView('login')}
            onSuccess={() => {
              setView('login');
              setStep('credentials');
              setError('');
              setOtp('');
            }}
          />
        </div>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={step === 'otp' ? submitOtp : submitCredentials} noValidate>
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
                className="text-sm font-semibold text-indigo-300 hover:text-indigo-200"
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
            />
          ) : null}
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <Button type="submit" className="w-full" loading={loading}>
            {step === 'otp' ? 'Verify & sign in' : 'Continue'}
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
          <p className="mt-6 text-center text-sm text-white/55">
            Customer?{' '}
            <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300">
              Customer sign in
            </Link>
            {' · '}
            <Link to="/partner/login" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Partner sign in
            </Link>
          </p>
          <DemoCredentialsPanel
            highlight="Admin"
            onFillDemo={({ phone: demoPhone, password: demoPassword }) => {
              setPhone(demoPhone);
              setPassword(demoPassword);
              setPhoneError('');
              setError('');
              setStep('credentials');
            }}
          />
        </>
      ) : null}
    </div>
  );
}
