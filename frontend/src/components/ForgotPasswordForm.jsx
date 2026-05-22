import { useState } from 'react';

import { OtpVerificationFields } from './OtpVerificationFields';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { isDemoEmail } from '../lib/demoAccounts';
import { getErrorMessage } from '../services/api';
import {
  isValidEmail,
  validateEmail,
  validateOtpCode,
  validatePassword,
} from '../utils/validators';

/**
 * Forgot password: email → OTP email → new password.
 * @param {{ sendOtp: Function, resetPassword: Function, roleHint: string, onBack: () => void, onSuccess: () => void, mutedClassName?: string }} props
 */
export function ForgotPasswordForm({
  sendOtp,
  resetPassword,
  roleHint = 'customer',
  onBack,
  onSuccess,
  mutedClassName = 'text-white/65',
}) {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpInfo, setOtpInfo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();

  const sendResetOtp = async () => {
    if (isDemoEmail(normalizedEmail)) {
      throw new Error('Demo accounts cannot reset password. Use Demo1234.');
    }
    const res = await sendOtp(normalizedEmail, 'password_reset', roleHint);
    setOtpInfo(res.message || 'Check your email for the reset code.');
    setStep('reset');
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const emailErr = validateEmail(email, { required: true });
    if (emailErr || !isValidEmail(email)) {
      setError(emailErr || 'Enter a valid email');
      return;
    }
    setLoading(true);
    try {
      await sendResetOtp();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const otpErr = validateOtpCode(otp);
    const pwErr = validatePassword(newPassword);
    const matchErr =
      newPassword !== confirmPassword ? 'Passwords do not match' : null;

    setOtpError(otpErr ?? '');
    setPasswordError(pwErr ?? '');
    setConfirmError(matchErr ?? '');

    const first = otpErr || pwErr || matchErr;
    if (first) {
      setError(first);
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        email: normalizedEmail,
        otp_code: otp.trim(),
        new_password: newPassword,
      });
      setSuccess(res.message || 'Password updated. You can sign in now.');
      setTimeout(() => onSuccess?.(), 1500);
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
      const res = await sendOtp(normalizedEmail, 'password_reset', roleHint);
      setOtpInfo(res.message || 'A new code was sent.');
      setOtp('');
      setOtpError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <form className="space-y-4" onSubmit={submitEmail} noValidate>
        <p className={`text-sm ${mutedClassName}`}>
          Enter your account email. We will send a 6-digit code to reset your password.
        </p>
        <Input
          label="Email"
          name="reset_email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <Button type="submit" className="w-full" loading={loading}>
          Send reset code
        </Button>
        <Button type="button" variant="ghost" size="sm" className="w-full text-white/70" onClick={onBack}>
          Back to sign in
        </Button>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={submitReset} noValidate>
      <p className={`text-sm ${mutedClassName}`}>
        Enter the code we sent to <span className="font-semibold text-white">{normalizedEmail}</span> and choose a new
        password.
      </p>
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
        mutedClassName={mutedClassName}
      />
      <Input
        label="New password"
        name="new_password"
        type="password"
        autoComplete="new-password"
        passwordToggle
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.target.value);
          if (passwordError) setPasswordError(validatePassword(e.target.value) ?? '');
        }}
        onBlur={() => setPasswordError(validatePassword(newPassword) ?? '')}
        error={passwordError}
      />
      <Input
        label="Confirm new password"
        name="confirm_password"
        type="password"
        autoComplete="new-password"
        passwordToggle
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (confirmError && e.target.value === newPassword) setConfirmError('');
        }}
        onBlur={() =>
          setConfirmError(newPassword !== confirmPassword ? 'Passwords do not match' : '')
        }
        error={confirmError}
      />
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-400">{success}</p> : null}
      <Button type="submit" className="w-full" loading={loading} disabled={Boolean(success)}>
        Update password
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full text-white/70"
        onClick={() => {
          setStep('email');
          setOtp('');
          setOtpError('');
          setError('');
          setSuccess('');
        }}
      >
        Back
      </Button>
    </form>
  );
}
