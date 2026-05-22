import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useTheme } from '../../../context/ThemeContext';
import { getCustomerGradients, getCustomerShadow } from '../../../constants/customerTheme';
import AppIcon from '../AppIcon';

function formatPoints(n) {
  return new Intl.NumberFormat('en-IN').format(n);
}

export default function RewardPointsCard({ points }) {
  const { theme, isDark } = useTheme();
  const gradients = getCustomerGradients(isDark);
  const shadows = getCustomerShadow(isDark);

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 400 }}
      style={[styles.wrap, shadows.glow(gradients.ctaGlow)]}
    >
      <LinearGradient
        colors={['#0c4a6e', '#06b6d4', '#22d3ee']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.glowOrb} />
        <Text style={styles.kicker}>Your balance</Text>
        <View style={styles.pointsRow}>
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 120 }}
          >
            <Text style={styles.points}>{formatPoints(points)}</Text>
          </MotiView>
          <Text style={styles.unit}>WashPoints</Text>
        </View>
        <Text style={styles.hint}>Earn on every wash · Redeem exclusive perks</Text>
        <View style={styles.chip}>
          <AppIcon name="trending-up" size={14} color="#fff" />
          <Text style={styles.chipText}>+120 pts this month</Text>
        </View>
      </LinearGradient>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 26, overflow: 'hidden' },
  gradient: {
    padding: 22,
    minHeight: 160,
    justifyContent: 'flex-end',
  },
  glowOrb: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 6,
  },
  points: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1.5,
  },
  unit: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  chipText: { fontSize: 11, fontWeight: '700', color: '#fff' },
});
