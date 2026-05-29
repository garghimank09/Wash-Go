import { useState } from 'react';

import { OtpVerificationFields } from './OtpVerificationFields';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { isDemoPhone } from '../lib/demoAccounts';
import { getErrorMessage } from '../services/api';
import {
  normalizeIndianPhoneDigits,
  validateIndianPhone10,
  validateOtpCode,
  validatePassword,
} from '../utils/validators';

/**
 * Forgot password: mobile → SMS OTP → new password.
 */
export function ForgotPasswordForm({
  sendOtp,
  resetPassword,
  onBack,
  onSuccess,
  mutedClassName = 'text-white/65',
}) {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpInfo, setOtpInfo] = useState('');
  const [otpDestination, setOtpDestination] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const normalizedPhone = normalizeIndianPhoneDigits(phone);

  const sendResetOtp = async () => {
    if (isDemoPhone(normalizedPhone)) {
      throw new Error('Demo accounts cannot reset password. Use Demo1234.');
    }
    const res = await sendOtp({ phone: normalizedPhone, purpose: 'password_reset' });
    setOtpDestination(res.delivery_target || '');
    setOtpInfo(res.message || 'Check your phone for the reset code.');
    setStep('reset');
  };

  const submitPhone = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const pErr = validateIndianPhone10(phone, { required: true });
    setPhoneError(pErr ?? '');
    if (pErr) {
      setError(pErr);
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
    const matchErr = newPassword !== confirmPassword ? 'Passwords do not match' : null;

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
        phone: normalizedPhone,
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
      const res = await sendOtp({ phone: normalizedPhone, purpose: 'password_reset' });
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

  if (step === 'phone') {
    return (
      <form className="space-y-4" onSubmit={submitPhone} noValidate>
        <p className={`text-sm ${mutedClassName}`}>
          Enter your registered 10-digit mobile. We will text you a code to reset your password.
        </p>
        <Input
          label="Mobile number"
          name="reset_phone"
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
        Enter the code sent to{' '}
        <span className="font-semibold text-white">{otpDestination || 'your phone'}</span> and choose a new
        password.
      </p>
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
          setStep('phone');
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
