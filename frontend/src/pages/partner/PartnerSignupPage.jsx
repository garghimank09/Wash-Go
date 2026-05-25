import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles } from 'lucide-react';

import { PlacesAutocompleteInput } from '../../components/PlacesAutocompleteInput';
import { OtpVerificationFields } from '../../components/OtpVerificationFields';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { GlassPanel } from '../../ui/glass-panel';
import { partnerAuthService } from '../../services/partnerAuthService';
import { getErrorMessage } from '../../services/api';
import {
  validateEmail,
  validateFullName,
  validateIndianPhone10,
  validateOtpCode,
  validatePassword,
  validateServiceArea,
  normalizeIndianPhoneDigits,
} from '../../utils/validators';

export function PartnerSignupPage() {
  const { signupPartner, user, initializing } = usePartnerAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('details');
  const [fullName, setFullName] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [serviceAreaError, setServiceAreaError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpInfo, setOtpInfo] = useState('');
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

  if (user?.role === 'washer') {
    return <Navigate to="/partner" replace />;
  }

  const handleEmailChange = (e) => {
    const next = e.target.value;
    setEmail(next);
    if (emailError) setEmailError(validateEmail(next, { required: true }) ?? '');
  };

  const handlePhoneChange = (e) => {
    const digits = normalizeIndianPhoneDigits(e.target.value);
    setPhone(digits);
    if (phoneError) setPhoneError(validateIndianPhone10(digits, { required: true }) ?? '');
  };

  const submitDetails = async (e) => {
    e.preventDefault();
    setError('');

    const nameErr = validateFullName(fullName);
    const emailErr = validateEmail(email, { required: true });
    const phoneErr = validateIndianPhone10(phone, { required: true });
    const areaErr = validateServiceArea(serviceArea, { required: true });
    const pwErr = validatePassword(password);

    setFullNameError(nameErr ?? '');
    setEmailError(emailErr ?? '');
    setPhoneError(phoneErr ?? '');
    setServiceAreaError(areaErr ?? '');
    setPasswordError(pwErr ?? '');

    const first = nameErr || emailErr || phoneErr || areaErr || pwErr;
    if (first) {
      setError(first);
      return;
    }

    setLoading(true);
    try {
      const res = await partnerAuthService.sendOtp(email.trim().toLowerCase(), 'signup');
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
      await signupPartner({
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName.trim(),
        phone: normalizeIndianPhoneDigits(phone),
        service_area: serviceArea.trim(),
        otp_code: otp.trim(),
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

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    try {
      const res = await partnerAuthService.sendOtp(email.trim().toLowerCase(), 'signup');
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
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Create partner account</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/65">
            {step === 'otp'
              ? 'Verify your work email to finish registration.'
              : 'All fields are required. We will email you a verification code.'}
          </p>
        </div>

        <GlassPanel className="border border-white/10 bg-slate-900/85 p-6 shadow-2xl shadow-emerald-500/10 dark:bg-slate-900/80 sm:p-8">
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-3 text-xs text-emerald-50/90">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-300" strokeWidth={2} aria-hidden />
            <p>
              <span className="font-bold text-emerald-100">Partner-only.</span> Use a dedicated work email — not your customer WashGo login.
            </p>
          </div>

          <form className="space-y-4" onSubmit={step === 'otp' ? submitOtp : submitDetails} noValidate>
            <Input
              label="Full name"
              name="full_name"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (fullNameError) setFullNameError(validateFullName(e.target.value) ?? '');
              }}
              onBlur={() => setFullNameError(validateFullName(fullName) ?? '')}
              error={fullNameError}
              disabled={step === 'otp'}
            />
            <Input
              label="Work email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => setEmailError(validateEmail(email, { required: true }) ?? '')}
              error={emailError}
              disabled={step === 'otp'}
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              required
              maxLength={10}
              placeholder="10-digit mobile"
              value={phone}
              onChange={handlePhoneChange}
              onBlur={() => setPhoneError(validateIndianPhone10(phone, { required: true }) ?? '')}
              error={phoneError}
              disabled={step === 'otp'}
            />
            <PlacesAutocompleteInput
              label="Primary service area"
              name="service_area"
              placeholder="Start typing city or locality…"
              value={serviceArea}
              onChange={(v) => {
                setServiceArea(v);
                if (serviceAreaError) setServiceAreaError(validateServiceArea(v, { required: true }) ?? '');
              }}
              onBlur={() => setServiceAreaError(validateServiceArea(serviceArea, { required: true }) ?? '')}
              error={serviceAreaError}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              passwordToggle
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(validatePassword(e.target.value) ?? '');
              }}
              onBlur={() => setPasswordError(validatePassword(password) ?? '')}
              error={passwordError}
              disabled={step === 'otp'}
            />
            {step === 'otp' ? (
              <OtpVerificationFields
                email={email.trim().toLowerCase()}
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
              {step === 'otp' ? 'Verify & create account' : 'Send verification code'}
            </Button>
            {step === 'otp' ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-white/70"
                onClick={() => {
                  setStep('details');
                  setOtp('');
                  setOtpError('');
                  setError('');
                }}
              >
                Back
              </Button>
            ) : null}
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            Already have access?{' '}
            <Link to="/partner/login" className="font-semibold text-cyan-300 hover:text-emerald-200">
              Partner sign in
            </Link>
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
