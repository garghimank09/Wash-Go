import { useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';

import OtpVerificationView from '../../components/auth/otp/OtpVerificationView';
import { useAuth } from '../../context/AuthContext';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { clearPendingAuthFlow, getPendingAuthFlow } from '../../lib/pendingAuthFlow';
import { authService } from '../../services/authService';
import { partnerAuthService } from '../../services/partnerAuthService';

const FLOW_META = {
  'customer-login': {
    variant: 'customer',
    purpose: 'login',
    purposeLabel: 'sign-in',
    back: '/(auth)/login',
    success: '/(customer)/dashboard',
  },
  'customer-signup': {
    variant: 'customer',
    purpose: 'signup',
    purposeLabel: 'sign-up',
    back: '/(auth)/signup',
    success: '/(customer)/dashboard',
  },
  'partner-login': {
    variant: 'partner',
    purpose: 'login',
    purposeLabel: 'sign-in',
    back: '/(auth)/partner-login',
    success: '/(partner)/home',
  },
  'partner-signup': {
    variant: 'partner',
    purpose: 'signup',
    purposeLabel: 'sign-up',
    back: '/(auth)/partner-signup',
    success: '/(partner)/home',
  },
};

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { login, signup } = useAuth();
  const { loginPartner, signupPartner } = usePartnerAuth();

  const pending = useMemo(() => getPendingAuthFlow(), []);
  const flow = pending?.flow;
  const meta = flow ? FLOW_META[flow] : null;

  useEffect(() => {
    if (!pending || !meta) {
      router.replace('/(auth)/welcome');
    }
  }, [pending, meta, router]);

  if (!pending || !meta) {
    return null;
  }

  const handleBack = () => {
    clearPendingAuthFlow();
    router.replace(meta.back);
  };

  const navigateAfterSuccess = () => {
    clearPendingAuthFlow();
    setTimeout(() => router.replace(meta.success), 520);
  };

  const handleVerify = async (otpCode) => {
    if (flow === 'customer-login') {
      await login(pending.email, pending.password, otpCode);
      navigateAfterSuccess();
      return;
    }
    if (flow === 'customer-signup') {
      await signup({
        ...pending.signupPayload,
        otp_code: otpCode,
      });
      navigateAfterSuccess();
      return;
    }
    if (flow === 'partner-login') {
      await loginPartner(pending.email, pending.password, otpCode);
      navigateAfterSuccess();
      return;
    }
    if (flow === 'partner-signup') {
      await signupPartner({
        ...pending.signupPayload,
        otp_code: otpCode,
      });
      navigateAfterSuccess();
    }
  };

  const handleResend = async () => {
    if (meta.variant === 'partner') {
      return partnerAuthService.sendOtp(pending.email, meta.purpose);
    }
    const roleHint = flow.startsWith('partner') ? 'partner' : 'customer';
    return authService.sendOtp(pending.email, meta.purpose, roleHint);
  };

  const accent =
    meta.variant === 'partner' ? '#10b981' : theme.accent?.primary || '#06b6d4';

  return (
    <OtpVerificationView
      email={pending.email}
      purposeLabel={meta.purposeLabel}
      variant={meta.variant}
      accentColor={accent}
      initialInfoMessage={pending.otpInfo || ''}
      initialCooldownSeconds={pending.resendCooldownSeconds}
      onVerify={handleVerify}
      onResend={handleResend}
      onBack={handleBack}
    />
  );
}
