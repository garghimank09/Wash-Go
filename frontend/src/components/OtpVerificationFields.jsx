import { Mail } from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

/**
 * OTP step shown after credentials are validated and a code was sent.
 */
export function OtpVerificationFields({
  email,
  otp,
  onOtpChange,
  otpError,
  onOtpBlur,
  onResend,
  resendLoading,
  infoMessage,
  mutedClassName = 'text-white/65',
}) {
  return (
    <div className="space-y-4 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] p-4">
      <div className="flex items-start gap-2 text-sm">
        <Mail className="mt-0.5 size-4 shrink-0 text-cyan-400" strokeWidth={1.75} aria-hidden />
        <p className={mutedClassName}>
          We sent a 6-digit code to <span className="font-semibold text-white">{email}</span>.
          {infoMessage ? ` ${infoMessage}` : ''}
        </p>
      </div>
      <Input
        label="Verification code"
        name="otp_code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        required
        maxLength={6}
        placeholder="000000"
        value={otp}
        onChange={onOtpChange}
        onBlur={onOtpBlur}
        error={otpError}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-cyan-400 hover:text-cyan-300"
        disabled={resendLoading}
        loading={resendLoading}
        onClick={onResend}
      >
        Resend code
      </Button>
    </div>
  );
}
