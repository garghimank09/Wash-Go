import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.sub}>Sign in to manage washes, cars, and AI insights.</Text>
          <Input
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            containerStyle={styles.field}
          />
          <Input
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            containerStyle={styles.field}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Sign in" onPress={onSubmit} loading={loading} />
          <Pressable onPress={() => navigation.navigate('Signup')} style={styles.linkWrap}>
            <Text style={styles.link}>New to WashGo? <Text style={styles.linkBold}>Create an account</Text></Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { padding: spacing.xl, paddingTop: spacing.lg },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  sub: { marginTop: spacing.sm, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.xl },
  field: { marginBottom: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.md },
  linkWrap: { marginTop: spacing.xl, alignItems: 'center' },
  link: { color: colors.textMuted, fontSize: 15 },
  linkBold: { color: colors.primary, fontWeight: '700' },
});
