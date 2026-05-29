import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { OtpVerificationFields } from '../components/OtpVerificationFields';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../context/AuthContext';
import { defaultAppPathForRole } from '../lib/appPaths';
import { authService } from '../services/authService';
import { getErrorMessage } from '../services/api';
import {
  validateEmail,
  validateFullName,
  validateIndianPhone10,
  validateOtpCode,
  validatePassword,
  normalizeIndianPhoneDigits,
} from '../utils/validators';

export function SignupPage() {
  const { signup, user } = useAuth();
  const [step, setStep] = useState('details');
  const [fullName, setFullName] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpInfo, setOtpInfo] = useState('');
  const [otpDestination, setOtpDestination] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  if (user) return <Navigate to={defaultAppPathForRole(user)} replace />;

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

  const sendSignupOtp = async () => {
    const res = await authService.sendOtp({
      email: email.trim().toLowerCase(),
      phone: normalizeIndianPhoneDigits(phone),
      purpose: 'signup',
      roleHint: 'customer',
    });
    setOtpDestination(res.delivery_target || '');
    setOtpInfo(res.message || 'Check your phone for the code.');
    setStep('otp');
  };

  const submitDetails = async (e) => {
    e.preventDefault();
    setError('');

    const nameErr = validateFullName(fullName);
    const emailErr = validateEmail(email, { required: true });
    const phoneErr = validateIndianPhone10(phone, { required: true });
    const pwErr = validatePassword(password);

    setFullNameError(nameErr ?? '');
    setEmailError(emailErr ?? '');
    setPhoneError(phoneErr ?? '');
    setPasswordError(pwErr ?? '');

    const first = nameErr || emailErr || phoneErr || pwErr;
    if (first) {
      setError(first);
      return;
    }

    setLoading(true);
    try {
      await sendSignupOtp();
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
      await signup({
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName.trim(),
        phone: normalizeIndianPhoneDigits(phone),
        otp_code: otp.trim(),
      });
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
      const res = await authService.sendOtp({
        email: email.trim().toLowerCase(),
        phone: normalizeIndianPhoneDigits(phone),
        purpose: 'signup',
        roleHint: 'customer',
      });
      setOtpDestination(res.delivery_target || otpDestination);
      setOtpInfo(res.message || 'A new code was sent to your phone.');
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
      <h1 className="text-2xl font-black tracking-tight text-white">Create account</h1>
      <p className="mt-1 text-sm text-white/65">
        {step === 'otp'
          ? 'Enter the code we sent to your mobile.'
          : 'All fields are required. We will text a verification code to your phone.'}
      </p>
      <form className="mt-8 space-y-4" onSubmit={step === 'otp' ? submitOtp : submitDetails} noValidate>
        <Input
          label="Full name"
          name="full_name"
          autoComplete="name"
          required
          placeholder="Your name"
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
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@email.com"
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
            destination={otpDestination || `+91 •••••${phone.slice(-4)}`}
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
      <p className="mt-6 text-center text-sm text-white/65">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300">
          Log in
        </Link>
      </p>
    </div>
  );
}
