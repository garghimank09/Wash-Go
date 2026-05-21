import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { getCustomerShadow } from '../../constants/customerTheme';
import AppIcon from './AppIcon';

export default function StepHeader({ title, step, onBack, right }) {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const shadows = getCustomerShadow(isDark);

  const handleBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.customer.surface,
          borderBottomColor: theme.customer.outlineVariant,
        },
      ]}
    >
      <Pressable
        onPress={handleBack}
        style={({ pressed }) => [
          styles.backBtn,
          {
            backgroundColor: theme.customer.surfaceContainerLowest,
            borderColor: theme.customer.outlineVariant,
          },
          shadows.rim,
          pressed && { opacity: 0.9 },
        ]}
        hitSlop={12}
      >
        <AppIcon name="arrow-back" size={22} color={theme.text.primary} />
      </Pressable>
      <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>
        {step ? (
          <View style={[styles.stepPill, { backgroundColor: theme.customer.primaryBg }]}>
            <Text style={[styles.stepText, { color: theme.accent.primary }]}>{step}</Text>
          </View>
        ) : (
          right || <View style={{ width: 40 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  right: { minWidth: 40, alignItems: 'flex-end' },
  stepPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  stepText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
