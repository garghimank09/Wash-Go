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
import { validateLogin } from '../../lib/authValidation';
import AppIcon from '../../components/customer/AppIcon';
import CustomerPrimaryButton from '../../components/customer/ui/CustomerPrimaryButton';
import CustomerGhostButton from '../../components/customer/ui/CustomerGhostButton';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';

export default function Login() {
  const { theme } = useTheme();
  const router = useRouter();
  const { login, isAuthenticated, initializing } = useAuth();
  const [email, setEmail] = useState('');
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

  const handleLogin = async () => {
    const { ok, errors } = validateLogin({ email, password });
    setFieldErrors(errors);
    if (!ok) return;

    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(customer)/dashboard');
    } catch (err) {
      setError(err.message || 'Sign in failed');
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
            <Text style={s.title}>Welcome back</Text>
            <Text style={s.subtitle}>Sign in to your account</Text>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={s.inputGroup}>
              <Text style={s.label}>Email</Text>
              <TextInput
                style={[s.input, fieldErrors.email && s.inputError]}
                placeholder="you@example.com"
                placeholderTextColor={theme.text.muted}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (fieldErrors.email) setFieldErrors((e) => ({ ...e, email: null }));
                }}
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
              <View style={s.labelRow}>
                <Text style={s.label}>Password</Text>
                <Pressable
                  onPress={() => router.push('/(auth)/forgot-password')}
                  hitSlop={8}
                >
                  <Text style={s.forgotLink}>Forgot password?</Text>
                </Pressable>
              </View>
              <View style={s.passwordRow}>
                <TextInput
                  style={[s.input, { flex: 1 }, fieldErrors.password && s.inputError]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.text.muted}
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    if (fieldErrors.password) setFieldErrors((e) => ({ ...e, password: null }));
                  }}
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
              ) : null}
            </View>

            <CustomerPrimaryButton
              label="Sign in"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
            />

            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>or</Text>
              <View style={s.dividerLine} />
            </View>

            <CustomerGhostButton
              label="Create an account"
              onPress={() => router.push('/(auth)/signup')}
              disabled={loading}
            />
          </View>
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
      borderRadius: CUSTOMER_LAYOUT.card.radiusLg,
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
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text.secondary,
    },
    forgotLink: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.accent.primary,
    },
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
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.outlineVariant,
    },
    dividerText: { fontSize: 13, color: theme.text.muted },
    ghostBtn: {
      backgroundColor: c.surfaceContainerLow,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      borderRadius: theme.radius.full,
      paddingVertical: 14,
      alignItems: 'center',
    },
    ghostBtnText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
    },
  });
};
