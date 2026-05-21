import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getEarningsTokens } from '../../../constants/earningsTheme';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { formatPayoutCurrency, formatPercent } from '../../../lib/partnerFormatters';
import { usePartnerEarnings } from '../../../context/PartnerEarningsContext';
import AnimatedCounter from '../AnimatedCounter';
import MiniSparkline from './MiniSparkline';

export default function EarningsHeroCard() {
  const { isDark } = useTheme();
  const tokens = getEarningsTokens(isDark);
  const shadows = getPartnerShadow(isDark);
  const { thisWeek, weeklySeries } = usePartnerEarnings();
  const seriesValues = weeklySeries.map((d) => d.cents);
  const isPositive = (thisWeek.growthPct ?? 0) >= 0;
  const Trend = isPositive ? TrendingUp : TrendingDown;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 280 }}
      style={styles.outer}
    >
      <View style={[styles.card, shadows.soft]}>
        <LinearGradient
          colors={tokens.hero.gradient}
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
          <View style={styles.topRow}>
            <Text style={styles.eyebrow}>This week earnings</Text>
            <View style={styles.growthChip}>
              <Trend size={12} color="#ffffff" strokeWidth={2.6} />
              <Text style={styles.growthText}>
                {formatPercent(thisWeek.growthPct ?? 0, { fractionDigits: 1 })}
              </Text>
            </View>
          </View>

          <View style={styles.amountRow}>
            <AnimatedCounter
              value={thisWeek.totalCents}
              duration={700}
              format={(n) => formatPayoutCurrency(n)}
              style={styles.amount}
            />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Jobs</Text>
              <Text style={styles.metaValue}>{thisWeek.jobs}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Best day</Text>
              <Text style={styles.metaValue}>{thisWeek.bestDay}</Text>
            </View>
            <View style={styles.sparkWrap}>
              <MiniSparkline
                values={seriesValues}
                width={104}
                height={32}
                stroke="#ffffff"
                fillTop="rgba(255,255,255,0.40)"
                fillBottom="rgba(255,255,255,0)"
                strokeWidth={1.6}
                gradientId="hero-spark"
              />
            </View>
          </View>
        </View>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 20,
    marginTop: 14,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  inner: {
    padding: 20,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.85)',
  },
  growthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  growthText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  amount: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaCol: { gap: 2 },
  metaLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  metaValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  metaDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.30)',
  },
  sparkWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
