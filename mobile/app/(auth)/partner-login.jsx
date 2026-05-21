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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { usePartnerAuth } from '../../context/PartnerAuthContext';

export default function PartnerLogin() {
  const { theme } = useTheme();
  const router = useRouter();
  const { loginPartner } = usePartnerAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginPartner(email, password);
      router.replace('/(partner)/home');
    } catch (err) {
      setError(err.message);
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
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
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
            <Text style={s.title}>Partner sign in</Text>
            <Text style={s.subtitle}>Access your washer dashboard</Text>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={s.inputGroup}>
              <Text style={s.label}>Work email</Text>
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
              <Text style={s.label}>Password</Text>
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
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.button.primary.text} />
              ) : (
                <Text style={s.primaryBtnText}>Sign in as partner</Text>
              )}
            </TouchableOpacity>

            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>or</Text>
              <View style={s.dividerLine} />
            </View>

            <TouchableOpacity
              style={s.ghostBtn}
              onPress={() => router.push('/(auth)/partner-signup')}
            >
              <Text style={s.ghostBtnText}>Register as a partner</Text>
            </TouchableOpacity>
          </View>
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
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.border.light,
    },
    dividerText: {
      fontSize: 13,
      color: theme.text.muted,
    },
    ghostBtn: {
      backgroundColor: theme.button.ghost.background,
      borderWidth: 1,
      borderColor: theme.button.ghost.border,
      borderRadius: theme.radius.md,
      paddingVertical: 14,
      alignItems: 'center',
    },
    ghostBtnText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.button.ghost.text,
    },
  });