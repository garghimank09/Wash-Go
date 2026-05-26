import { useState, useEffect } from 'react';
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
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { validateSignup, formatPhoneInput } from '../../lib/authValidation';
import { isDemoEmail } from '../../lib/demoAccounts';
import { OTP_RESEND_COOLDOWN_SECONDS } from '../../lib/otpConstants';
import { setPendingAuthFlow } from '../../lib/pendingAuthFlow';
import { authService } from '../../services/authService';
import AppIcon from '../../components/customer/AppIcon';
import CustomerPrimaryButton from '../../components/customer/ui/CustomerPrimaryButton';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';

export default function Signup() {
  const { theme } = useTheme();
  const router = useRouter();
  const { signup, isAuthenticated, initializing } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!initializing && isAuthenticated) {
      router.replace('/(customer)/dashboard');
    }
  }, [initializing, isAuthenticated, router]);

  const handleSignup = async () => {
    const { ok, errors } = validateSignup({
      full_name: fullName,
      email,
      password,
      phone,
    });
    setFieldErrors(errors);
    if (!ok) return;

    const normalizedEmail = email.trim().toLowerCase();
    const payload = {
      full_name: fullName.trim(),
      email: normalizedEmail,
      password,
        phone: phone.trim() ? formatPhoneInput(phone) : null,
    };

    setError('');
    setLoading(true);
    try {
      if (isDemoEmail(normalizedEmail)) {
        await signup(payload);
        router.replace('/(customer)/dashboard');
        return;
      }
      const res = await authService.sendOtp(normalizedEmail, 'signup', 'customer');
      setPendingAuthFlow({
        flow: 'customer-signup',
        email: normalizedEmail,
        signupPayload: payload,
        otpInfo: res.message || 'Check your email for the code.',
        resendCooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
      });
      router.push('/(auth)/verify-otp');
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const s = styles(theme);
  const c = theme.customer;

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
          <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
            <AppIcon name="arrow-back" size={22} color={theme.text.primary} />
          </Pressable>

          <View style={s.header}>
            <Text style={s.logo}>
              Wash<Text style={s.logoAccent}>Go</Text>
            </Text>
            <Text style={s.tagline}>CUSTOMER</Text>
          </View>

          <View style={s.card}>
            <Text style={s.title}>Create account</Text>
            <Text style={s.subtitle}>Join WashGo and keep your car spotless</Text>

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
                style={[s.input, fieldErrors.full_name && s.inputError]}
                placeholder="Jane Doe"
                placeholderTextColor={theme.text.muted}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                editable={!loading}
              />
              {fieldErrors.full_name ? (
                <Text style={s.fieldError}>{fieldErrors.full_name}</Text>
              ) : null}
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>
                Email <Text style={s.required}>*</Text>
              </Text>
              <TextInput
                style={[s.input, fieldErrors.email && s.inputError]}
                placeholder="you@example.com"
                placeholderTextColor={theme.text.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {fieldErrors.email ? (
                <Text style={s.fieldError}>{fieldErrors.email}</Text>
              ) : null}
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>
                Phone <Text style={s.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={[s.input, fieldErrors.phone && s.inputError]}
                placeholder="10-digit mobile"
                placeholderTextColor={theme.text.muted}
                value={phone}
                onChangeText={(v) => {
                  setPhone(formatPhoneInput(v));
                  if (fieldErrors.phone) setFieldErrors((e) => ({ ...e, phone: null }));
                }}
                keyboardType="number-pad"
                maxLength={10}
                editable={!loading}
              />
              {fieldErrors.phone ? (
                <Text style={s.fieldError}>{fieldErrors.phone}</Text>
              ) : null}
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>
                Password <Text style={s.required}>*</Text>
              </Text>
              <View style={s.passwordRow}>
                <TextInput
                  style={[s.input, { flex: 1 }, fieldErrors.password && s.inputError]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.text.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={s.eyeBtn}
                >
                  <Text style={s.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
              {fieldErrors.password ? (
                <Text style={s.fieldError}>{fieldErrors.password}</Text>
              ) : (
                <Text style={s.hint}>
                  At least 8 characters with a letter and a number
                </Text>
              )}
            </View>

            <CustomerPrimaryButton
              label="Send verification code"
              onPress={handleSignup}
              loading={loading}
              disabled={loading}
            />
          </View>

          <TouchableOpacity
            style={s.loginLink}
            onPress={() => router.replace('/(auth)/login')}
            disabled={loading}
          >
            <Text style={s.loginLinkText}>
              Already have an account?{' '}
              <Text style={s.loginLinkAccent}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    scroll: {
      flexGrow: 1,
      padding: 24,
      paddingTop: 8,
    },
    backBtn: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    header: {
      alignItems: 'center',
      marginBottom: 28,
    },
    logo: {
      fontSize: 36,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -1,
    },
    logoAccent: { color: theme.accent.primary },
    tagline: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.text.muted,
      letterSpacing: 3,
      marginTop: 4,
    },
    card: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      padding: 24,
      ...theme.shadow.md,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 4,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 24,
    },
    errorBox: {
      backgroundColor: 'rgba(220,38,38,0.08)',
      borderRadius: theme.radius.md,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      fontSize: 13,
      color: c.error,
      fontWeight: '600',
    },
    inputGroup: { marginBottom: 16 },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text.secondary,
      marginBottom: 6,
    },
    required: { color: c.error },
    optional: { color: theme.text.muted, fontWeight: '400' },
    input: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      borderRadius: theme.radius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.text.primary,
    },
    inputError: { borderColor: c.error },
    fieldError: {
      fontSize: 12,
      color: c.error,
      marginTop: 4,
      fontWeight: '500',
    },
    hint: {
      fontSize: 11,
      color: theme.text.muted,
      marginTop: 4,
    },
    passwordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    eyeBtn: { paddingHorizontal: 12, paddingVertical: 12 },
    eyeText: {
      fontSize: 13,
      color: theme.accent.primary,
      fontWeight: '600',
    },
    primaryBtn: {
      backgroundColor: theme.accent.primary,
      borderRadius: theme.radius.full,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    btnDisabled: { opacity: 0.6 },
    primaryBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.button.primary.text,
    },
    loginLink: {
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 16,
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
};
