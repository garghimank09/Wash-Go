import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
export function SignupScreen() {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signup({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      });
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
          <Text style={styles.title}>Create your WashGo account</Text>
          <Text style={styles.sub}>Customers get instant access to bookings and future AI features.</Text>
          <Input label="Full name" value={fullName} onChangeText={setFullName} containerStyle={styles.field} />
          <Input
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            containerStyle={styles.field}
          />
          <Input label="Phone (optional)" keyboardType="phone-pad" value={phone} onChangeText={setPhone} containerStyle={styles.field} />
          <Input label="Password" secureTextEntry value={password} onChangeText={setPassword} containerStyle={styles.field} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Sign up" onPress={onSubmit} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { padding: spacing.xl, paddingTop: spacing.lg },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  sub: { marginTop: spacing.sm, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.md },
});
