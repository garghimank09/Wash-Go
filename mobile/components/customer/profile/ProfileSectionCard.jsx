import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { CUSTOMER_LAYOUT } from '../../../constants/customerTheme';
import CardSurface from '../../ui/CardSurface';

export default function ProfileSectionCard({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
  style,
}) {
  const { theme } = useTheme();
  const c = theme.customer;

  return (
    <CardSurface
      borderRadius={CUSTOMER_LAYOUT.card.radius}
      backgroundColor={c.surfaceContainerLowest}
      shadow="soft"
      portal="customer"
      style={style}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.text.muted }]}>{subtitle}</Text>
          ) : null}
        </View>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} hitSlop={8} style={({ pressed }) => pressed && { opacity: 0.7 }}>
            <Text style={[styles.action, { color: theme.accent.primary }]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={[styles.body, { borderTopColor: c.outlineVariant }]}>{children}</View>
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
    lineHeight: 17,
  },
  action: {
    fontSize: 13,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
