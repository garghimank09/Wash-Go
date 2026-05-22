import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useTheme } from '../../../context/ThemeContext';
import { CUSTOMER_LAYOUT } from '../../../constants/customerTheme';

const TIER_COLORS = {
  silver: ['#94a3b8', '#cbd5e1'],
  gold: ['#b45309', '#fbbf24'],
  platinum: ['#312e81', '#818cf8'],
};

export default function RewardTierProgress({ tier }) {
  const { theme } = useTheme();
  const c = theme.customer;
  const colors = TIER_COLORS[tier.id] || TIER_COLORS.gold;
  const pct = Math.round((tier.progress || 0) * 100);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surfaceContainerLowest, borderColor: c.outlineVariant },
      ]}
    >
      <View style={styles.header}>
        <LinearGradient colors={colors} style={styles.badge}>
          <Text style={styles.badgeText}>{tier.label}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text.primary }]}>Member tier</Text>
          <Text style={[styles.sub, { color: theme.text.muted }]}>
            {tier.pointsToNext} pts to {tier.nextTier}
          </Text>
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: c.outlineVariant }]}>
        <MotiView
          from={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'timing', duration: 700, delay: 150 }}
        >
          <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fill} />
        </MotiView>
      </View>

      <View style={styles.tierRow}>
        {tier.tiers.map((t) => {
          const active = t.id === tier.id;
          const done = tier.tiers.findIndex((x) => x.id === tier.id) >= tier.tiers.findIndex((x) => x.id === t.id);
          return (
            <View key={t.id} style={styles.tierItem}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: active || done ? theme.accent.primary : c.outlineVariant,
                    opacity: active ? 1 : done ? 0.6 : 0.35,
                  },
                ]}
              />
              <Text
                style={[
                  styles.tierLabel,
                  { color: active ? theme.text.primary : theme.text.muted },
                ]}
              >
                {t.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: CUSTOMER_LAYOUT.card.radius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  title: { fontSize: 15, fontWeight: '800' },
  sub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  tierItem: { alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  tierLabel: { fontSize: 10, fontWeight: '700' },
});
