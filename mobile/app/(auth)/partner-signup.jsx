import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { goBackToRoleSelection } from '../../lib/authNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { formatPhoneInput } from '../../lib/authValidation';
import { isDemoEmail } from '../../lib/demoAccounts';
import { OTP_RESEND_COOLDOWN_SECONDS } from '../../lib/otpConstants';
import { setPendingAuthFlow } from '../../lib/pendingAuthFlow';
import { partnerAuthService } from '../../services/partnerAuthService';

export default function PartnerSignup() {
  const { theme } = useTheme();
  const router = useRouter();
  const { signupPartner } = usePartnerAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    const payload = {
      full_name: fullName.trim(),
      email: normalizedEmail,
      password,
        phone: phone.trim() ? formatPhoneInput(phone) : null,
      service_area: serviceArea.trim() || null,
    };

    setError('');
    setLoading(true);
    try {
      if (isDemoEmail(normalizedEmail)) {
        await signupPartner(payload);
        router.replace('/(partner)/home');
        return;
      }
      const res = await partnerAuthService.sendOtp(normalizedEmail, 'signup');
      setPendingAuthFlow({
        flow: 'partner-signup',
        email: normalizedEmail,
        signupPayload: payload,
        otpInfo: res.message || 'Check your email for the code.',
        resendCooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
      });
      router.push('/(auth)/verify-otp');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const s = styles(theme);

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.header}>
            <TouchableOpacity onPress={() => goBackToRoleSelection(router)} style={s.backBtn}>
              <Text style={s.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={s.logo}>
              Wash<Text style={s.logoAccent}>Go</Text>
            </Text>
            <View style={s.partnerBadge}>
              <Text style={s.partnerBadgeText}>PARTNER</Text>
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.title}>Become a partner</Text>
            <Text style={s.subtitle}>
              Register to start taking wash jobs in your area
            </Text>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={s.inputGroup}>
              <Text style={s.label}>
                Full name <Text style={s.required}>*</Text>
              </Text>
              <TextInput
                style={s.input}
                placeholder="Raj Kumar"
                placeholderTextColor={theme.text.muted}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>
                Work email <Text style={s.required}>*</Text>
              </Text>
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor={theme.text.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>
                Phone <Text style={s.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={s.input}
                placeholder="10-digit mobile"
                placeholderTextColor={theme.text.muted}
                value={phone}
                onChangeText={(v) => setPhone(formatPhoneInput(v))}
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>
                Service area <Text style={s.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={s.input}
                placeholder="e.g. South Delhi, Gurugram"
                placeholderTextColor={theme.text.muted}
                value={serviceArea}
                onChangeText={setServiceArea}
                autoCapitalize="words"
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>
                Password <Text style={s.required}>*</Text>
              </Text>
              <View style={s.passwordRow}>
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.text.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={s.eyeBtn}
                >
                  <Text style={s.eyeText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[s.primaryBtn, loading && s.btnDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.button.primary.text} />
              ) : (
                <Text style={s.primaryBtnText}>Send verification code</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={s.loginLink}
            onPress={() => router.replace('/(auth)/partner-login')}
          >
            <Text style={s.loginLinkText}>
              Already registered?{' '}
              <Text style={s.loginLinkAccent}>Partner sign in →</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background.secondary,
    },
    scroll: {
      flexGrow: 1,
      padding: 24,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    backBtn: {
      alignSelf: 'flex-start',
      marginBottom: 16,
    },
    backText: {
      fontSize: 14,
      color: theme.accent.primary,
      fontWeight: '600',
    },
    logo: {
      fontSize: 36,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -1,
    },
    logoAccent: {
      color: theme.accent.primary,
    },
    partnerBadge: {
      backgroundColor: theme.accent.light,
      borderRadius: theme.radius.full,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginTop: 8,
    },
    partnerBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.accent.primary,
      letterSpacing: 3,
    },
    card: {
      backgroundColor: theme.card.background,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.border.light,
      padding: 24,
      ...theme.shadow.md,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 24,
    },
    errorBox: {
      backgroundColor: theme.badge.error.background,
      borderRadius: theme.radius.sm,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      fontSize: 13,
      color: theme.badge.error.text,
      fontWeight: '500',
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text.secondary,
      marginBottom: 6,
    },
    required: {
      color: theme.badge.error.text,
    },
    optional: {
      color: theme.text.muted,
      fontWeight: '400',
    },
    input: {
      backgroundColor: theme.background.secondary,
      borderWidth: 1,
      borderColor: theme.border.light,
      borderRadius: theme.radius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.text.primary,
    },
    passwordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    eyeBtn: {
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    eyeText: {
      fontSize: 13,
      color: theme.accent.primary,
      fontWeight: '600',
    },
    primaryBtn: {
      backgroundColor: theme.button.primary.background,
      borderRadius: theme.radius.md,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    btnDisabled: {
      opacity: 0.6,
    },
    primaryBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.button.primary.text,
    },
    loginLink: {
      alignItems: 'center',
      marginTop: 24,
    },
    loginLinkText: {
      fontSize: 13,
      color: theme.text.secondary,
    },
    loginLinkAccent: {
      color: theme.accent.primary,
      fontWeight: '600',
    },
  });