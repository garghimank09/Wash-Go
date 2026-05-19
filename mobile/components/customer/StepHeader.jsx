import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import AppIcon from './AppIcon';

export default function StepHeader({ title, step, onBack, right }) {
  const { theme } = useTheme();
  const router = useRouter();
  const s = styles(theme);

  const handleBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  };

  return (
    <View style={s.wrap}>
      <Pressable onPress={handleBack} style={s.backBtn} hitSlop={12}>
        <AppIcon name="arrow-back" size={24} color={theme.text.primary} />
      </Pressable>
      <Text style={s.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={s.right}>
        {step ? (
          <View style={s.stepPill}>
            <Text style={s.stepText}>{step}</Text>
          </View>
        ) : (
          right || <View style={{ width: 24 }} />
        )}
      </View>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 8,
      backgroundColor: theme.customer.surface,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      color: theme.text.primary,
      letterSpacing: -0.3,
    },
    right: { minWidth: 40, alignItems: 'flex-end' },
    stepPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: theme.radius.full,
      backgroundColor: theme.customer.primaryBg,
    },
    stepText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.accent.primary,
      letterSpacing: 0.3,
    },
  });
