import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import AppIcon from '../AppIcon';

const ACCENT_BG = {
  cyan: 'rgba(6,182,212,0.12)',
  violet: 'rgba(139,92,246,0.12)',
  amber: 'rgba(245,158,11,0.12)',
  slate: 'rgba(100,116,139,0.12)',
};

export default function RewardBenefitCard({ benefit, onPress }) {
  const { theme } = useTheme();
  const c = theme.customer;
  const bg = ACCENT_BG[benefit.accent] || ACCENT_BG.cyan;

  return (
    <Pressable
      onPress={onPress}
      disabled={benefit.locked}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.surfaceContainerLowest,
          borderColor: benefit.locked ? c.outlineVariant : theme.accent.primary,
          opacity: benefit.locked ? 0.72 : 1,
        },
        pressed && !benefit.locked && { opacity: 0.9 },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: bg }]}>
        <AppIcon
          name={benefit.icon}
          size={22}
          color={benefit.locked ? theme.text.muted : theme.accent.primary}
        />
      </View>
      <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={2}>
        {benefit.title}
      </Text>
      <Text style={[styles.sub, { color: theme.text.muted }]} numberOfLines={2}>
        {benefit.subtitle}
      </Text>
      {benefit.locked ? (
        <View style={[styles.lock, { backgroundColor: c.surfaceContainer }]}>
          <AppIcon name="lock" size={12} color={theme.text.muted} />
          <Text style={[styles.lockText, { color: theme.text.muted }]}>Locked</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 148,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 10,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 13, fontWeight: '800', lineHeight: 17 },
  sub: { fontSize: 11, fontWeight: '500', marginTop: 4, lineHeight: 15 },
  lock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockText: { fontSize: 10, fontWeight: '700' },
});
