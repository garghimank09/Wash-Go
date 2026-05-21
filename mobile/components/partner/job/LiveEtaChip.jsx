import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Timer, Route, TrafficCone } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { formatOptionalNumber } from '../../../lib/partnerFormatters';

function formatEtaMinutes(mins) {
  const n = Number(mins);
  if (mins == null || !Number.isFinite(n)) return '—';
  return String(Math.max(0, Math.round(n)));
}

function formatDistanceKm(km) {
  return formatOptionalNumber(km, { fractionDigits: 1, fallback: '—' });
}

/**
 * Floating ETA / distance chip that sits over the map.
 * Uses opacity-only motion (no scale) so it never jitters during route drift.
 */
export default function LiveEtaChip({ etaMinutes, distanceKm, trafficLevel = 'light' }) {
  const { isDark } = useTheme();
  const shadows = getPartnerShadow(isDark);

  const trafficColor =
    trafficLevel === 'heavy'
      ? '#ef4444'
      : trafficLevel === 'moderate'
        ? '#f59e0b'
        : '#10b981';

  return (
    <MotiView
      from={{ opacity: 0, translateY: 4 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 280 }}
      style={[styles.outer, shadows.soft]}
    >
      <LinearGradient
        colors={isDark ? ['#0e7490', '#1d4ed8'] : ['#06b6d4', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.inner}>
        <View style={styles.item}>
          <Timer size={13} color="#ffffff" strokeWidth={2.4} />
          <Text style={styles.value}>
            {formatEtaMinutes(etaMinutes)}
            <Text style={styles.unit}> min</Text>
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.item}>
          <Route size={13} color="#ffffff" strokeWidth={2.4} />
          <Text style={styles.value}>
            {formatDistanceKm(distanceKm)}
            <Text style={styles.unit}> km</Text>
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.item}>
          <TrafficCone size={13} color={trafficColor} strokeWidth={2.4} />
          <Text style={styles.unit}>
            {trafficLevel === 'heavy'
              ? 'Heavy'
              : trafficLevel === 'moderate'
                ? 'Moderate'
                : 'Light'}
          </Text>
        </View>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 999,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  unit: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.30)',
  },
});
