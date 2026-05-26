import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { DemoCredentialsPanel } from '../components/DemoCredentialsPanel';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { OtpVerificationFields } from '../components/OtpVerificationFields';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../context/AuthContext';
import { isDemoEmail } from '../lib/demoAccounts';
import { resolvePostLoginPath } from '../lib/appPaths';
import { authService } from '../services/authService';
import { getErrorMessage } from '../services/api';
import { isValidEmail, validateOtpCode } from '../utils/validators';

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [view, setView] = useState('login');
  const [step, setStep] = useState('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpInfo, setOtpInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user) return <Navigate to={resolvePostLoginPath(user, from)} replace />;

  const normalizedEmail = email.trim().toLowerCase();
  const demoAccount = isDemoEmail(normalizedEmail);

  const submitCredentials = async (e) => {
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
      if (demoAccount) {
        const me = await login(normalizedEmail, password);
        navigate(resolvePostLoginPath(me, from), { replace: true });
        return;
      }
      const res = await authService.sendOtp(normalizedEmail, 'login', 'customer');
      setOtpInfo(res.message || 'Check your email for the code.');
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
      const me = await login(normalizedEmail, password, otp.trim());
      navigate(resolvePostLoginPath(me, from), { replace: true });
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
      const res = await authService.sendOtp(normalizedEmail, 'login', demoAccount ? 'admin' : 'customer');
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
      <h1 className="text-2xl font-black tracking-tight text-white">
        {view === 'forgot' ? 'Reset password' : 'Sign in'}
      </h1>
      <p className="mt-1 text-sm text-white/65">
        {view === 'forgot'
          ? 'We will email you a verification code.'
          : step === 'otp'
            ? 'Enter the verification code we emailed you.'
            : 'Welcome back to WashGo.'}
      </p>

      {view === 'forgot' ? (
        <div className="mt-8">
          <ForgotPasswordForm
            sendOtp={authService.sendOtp}
            resetPassword={authService.resetPassword}
            roleHint="customer"
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
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
                className="text-sm font-semibold text-cyan-400 hover:text-cyan-300"
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
              email={normalizedEmail}
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
          <p className="mt-6 text-center text-sm text-white/65">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-cyan-400 hover:text-cyan-300">
              Create an account
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-white/55">
            Approved WashGo partner?{' '}
            <Link to="/partner/login" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Partner sign in
            </Link>
          </p>
          <DemoCredentialsPanel highlight="Admin" />
          <p className="mt-2 text-center text-[11px] text-white/45">
            Demo accounts skip email verification. Admin & customer use this page.
          </p>
        </>
      ) : null}
    </div>
  );
}
