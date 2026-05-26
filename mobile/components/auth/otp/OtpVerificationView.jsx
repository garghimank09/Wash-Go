import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Mail, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PremiumOtpInput, { OtpSuccessBurst } from './PremiumOtpInput';
import { useOtpResendTimer } from '../../../hooks/useOtpResendTimer';
import { validateOtpCode } from '../../../lib/authValidation';
import { OTP_RESEND_COOLDOWN_SECONDS } from '../../../lib/otpConstants';
import AppIcon from '../../customer/AppIcon';
import CustomerPrimaryButton from '../../customer/ui/CustomerPrimaryButton';

/**
 * Premium OTP verification UI — shared across customer & partner flows.
 */
export default function OtpVerificationView({
  email,
  purposeLabel = 'verification',
  variant = 'customer',
  accentColor,
  onVerify,
  onResend,
  onBack,
  initialInfoMessage = '',
  initialCooldownSeconds = OTP_RESEND_COOLDOWN_SECONDS,
}) {
  const insets = useSafeAreaInsets();
  const isPartner = variant === 'partner';
  const accent = accentColor || (isPartner ? '#10b981' : '#06b6d4');

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [infoMessage, setInfoMessage] = useState(initialInfoMessage);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendPulse, setResendPulse] = useState(false);
  const [success, setSuccess] = useState(false);

  const { canResend, countdownLabel, restart } = useOtpResendTimer(initialCooldownSeconds);

  const palette = isPartner
    ? {
        bg: ['#0f172a', '#134e4a', '#0f172a'],
        card: 'rgba(15,23,42,0.92)',
        text: '#f8fafc',
        muted: 'rgba(248,250,252,0.65)',
        idleBg: 'rgba(255,255,255,0.06)',
        idleBorder: 'rgba(255,255,255,0.14)',
        cellText: '#f8fafc',
      }
    : {
        bg: ['#f8fafc', '#ecfeff', '#f0f9ff'],
        card: 'rgba(255,255,255,0.94)',
        text: '#0f172a',
        muted: '#64748b',
        idleBg: 'rgba(148,163,184,0.12)',
        idleBorder: 'rgba(148,163,184,0.28)',
        cellText: '#0f172a',
      };

  const runVerify = async (code) => {
    const err = validateOtpCode(code);
    setOtpError(err || '');
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setVerifying(true);
    try {
      await onVerify(code.trim());
      setSuccess(true);
    } catch (e) {
      setError(e?.message || 'Verification failed');
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  const handleVerify = () => runVerify(otp);

  const handleAutoComplete = (code) => {
    setOtp(code);
    if (!verifying && code.length === 6) {
      void runVerify(code);
    }
  };

  const handleResend = useCallback(async () => {
    if (!canResend || resendLoading) return;
    setResendLoading(true);
    setError('');
    setOtpError('');
    try {
      const res = await onResend();
      setInfoMessage(res?.message || 'A new code was sent to your email.');
      setOtp('');
      restart(OTP_RESEND_COOLDOWN_SECONDS);
      setResendPulse(true);
      setTimeout(() => setResendPulse(false), 600);
    } catch (e) {
      setError(e?.message || 'Could not resend code');
    } finally {
      setResendLoading(false);
    }
  }, [canResend, resendLoading, onResend, restart]);

  return (
    <LinearGradient colors={palette.bg} style={styles.fill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <KeyboardAvoidingView
        style={[styles.fill, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back">
            <AppIcon name="arrow-back" size={22} color={palette.text} />
          </Pressable>

          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 480 }}
            style={styles.hero}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${accent}22`, borderColor: `${accent}44` }]}>
              {success ? (
                <OtpSuccessBurst visible accentColor={accent} />
              ) : isPartner ? (
                <ShieldCheck size={32} color={accent} strokeWidth={1.75} />
              ) : (
                <Mail size={32} color={accent} strokeWidth={1.75} />
              )}
            </View>
            <Text style={[styles.title, { color: palette.text }]}>
              {success ? 'Verified' : 'Check your email'}
            </Text>
            <Text style={[styles.subtitle, { color: palette.muted }]}>
              {success
                ? 'Taking you to your dashboard…'
                : `Enter the ${purposeLabel} code we sent to`}
            </Text>
            {!success ? (
              <Text style={[styles.email, { color: accent }]} numberOfLines={2}>
                {email}
              </Text>
            ) : null}
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 24 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 520, delay: 80 }}
            style={[styles.card, { backgroundColor: palette.card }]}
          >
            {!success ? (
              <>
                <PremiumOtpInput
                  value={otp}
                  onChange={(v) => {
                    setOtp(v);
                    if (otpError) setOtpError(validateOtpCode(v) || '');
                    if (error) setError('');
                  }}
                  onComplete={handleAutoComplete}
                  accentColor={accent}
                  idleBg={palette.idleBg}
                  idleBorder={palette.idleBorder}
                  textColor={palette.cellText}
                  error={Boolean(otpError || error)}
                  disabled={verifying}
                />

                {otpError ? <Text style={styles.inlineError}>{otpError}</Text> : null}
                {error && !otpError ? <Text style={styles.inlineError}>{error}</Text> : null}
                {infoMessage && !error ? (
                  <Text style={[styles.info, { color: palette.muted }]}>{infoMessage}</Text>
                ) : null}

                <CustomerPrimaryButton
                  label="Verify & continue"
                  onPress={handleVerify}
                  loading={verifying}
                  disabled={verifying || otp.length < 6}
                  style={{ marginTop: 20 }}
                />

                <View style={styles.resendRow}>
                  {canResend ? (
                    <Pressable
                      onPress={() => void handleResend()}
                      disabled={resendLoading}
                      style={({ pressed }) => [styles.resendBtn, pressed && { opacity: 0.7 }]}
                    >
                      {resendLoading ? (
                        <ActivityIndicator size="small" color={accent} />
                      ) : (
                        <MotiView
                          animate={{ scale: resendPulse ? 1.04 : 1 }}
                          transition={{ type: 'timing', duration: 200 }}
                        >
                          <Text style={[styles.resendActive, { color: accent }]}>Resend code</Text>
                        </MotiView>
                      )}
                    </Pressable>
                  ) : (
                    <Text style={[styles.resendWait, { color: palette.muted }]}>
                      Resend code in {countdownLabel}
                    </Text>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.successBody}>
                <ActivityIndicator color={accent} style={{ marginTop: 8 }} />
              </View>
            )}
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
  },
  email: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: { elevation: 6 },
    }),
  },
  inlineError: {
    fontSize: 13,
    color: '#f87171',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  info: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 22,
    minHeight: 28,
  },
  resendWait: {
    fontSize: 14,
    fontWeight: '600',
  },
  resendBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendActive: {
    fontSize: 15,
    fontWeight: '700',
  },
  successBody: {
    alignItems: 'center',
    paddingVertical: 24,
  },
});
