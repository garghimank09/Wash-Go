import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';

/**
 * Inline error when `GET /bookings/{id}` fails — matches web job error state with mobile polish.
 */
export default function JobLoadError({ message, onRetry, loading = false }) {
  const { theme, isDark } = useTheme();
  const shadows = getPartnerShadow(isDark);

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.customer.surfaceContainerLowest,
          borderColor: theme.customer.outlineVariant,
        },
        shadows.soft,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: 'rgba(248,113,113,0.12)' }]}>
        <AlertCircle size={28} color={theme.customer.error} strokeWidth={2.2} />
      </View>
      <Text style={[styles.title, { color: theme.text.primary }]}>Could not load job</Text>
      <Text style={[styles.message, { color: theme.text.secondary }]}>
        {message || 'Check your connection and try again.'}
      </Text>
      <Pressable
        onPress={onRetry}
        disabled={loading}
        style={({ pressed }) => [
          styles.retryBtn,
          { backgroundColor: theme.accent.primary },
          (pressed || loading) && { opacity: 0.88 },
        ]}
      >
        <RefreshCw size={16} color="#fff" strokeWidth={2.4} />
        <Text style={styles.retryText}>{loading ? 'Retrying…' : 'Try again'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  message: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
