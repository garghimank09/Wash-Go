import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Clock, Wallet } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getEarningsTokens } from '../../../constants/earningsTheme';
import { formatPayoutCurrency } from '../../../lib/partnerFormatters';
import { usePartnerEarnings } from '../../../context/PartnerEarningsContext';
import { PARTNER_EARNINGS_PERCENT } from '../../../lib/partnerEarnings';
import AnimatedCounter from '../AnimatedCounter';
import CardSurface from '../../ui/CardSurface';

export default function PendingPayoutCard() {
  const { theme, isDark } = useTheme();
  const tokens = getEarningsTokens(isDark);
  const pendingTokens = tokens.pendingCard;
  const { pending, sharePercent } = usePartnerEarnings();
  const pct = sharePercent ?? PARTNER_EARNINGS_PERCENT;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 280, delay: 40 }}
      style={styles.outer}
    >
      <CardSurface
        borderRadius={20}
        backgroundColor={pendingTokens.fill}
        shadow="rim"
        portal="partner"
        style={[styles.card, { borderColor: pendingTokens.border }]}
      >
        <LinearGradient
          pointerEvents="none"
          colors={
            isDark
              ? ['rgba(251,191,36,0.18)', 'rgba(251,191,36,0)']
              : ['rgba(245,158,11,0.10)', 'rgba(245,158,11,0)']
          }
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cornerGlow}
        />
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(251,191,36,0.18)' : 'rgba(245,158,11,0.15)' }]}>
            <Clock size={18} color={isDark ? '#fbbf24' : '#b45309'} strokeWidth={2.4} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.eyebrow, { color: isDark ? '#fcd34d' : '#b45309' }]}>
              Pending weekly payout
            </Text>
            <AnimatedCounter
              value={pending.totalCents}
              duration={650}
              format={(n) => formatPayoutCurrency(n)}
              style={[styles.amount, { color: isDark ? '#fef3c7' : '#78350f' }]}
            />
            <Text style={[styles.sub, { color: isDark ? 'rgba(254,243,199,0.75)' : '#92400e' }]}>
              Your {pct}% share · paid out by WashGo each week
            </Text>
          </View>
          <Wallet size={22} color={isDark ? 'rgba(251,191,36,0.55)' : 'rgba(180,83,9,0.45)'} strokeWidth={1.75} />
        </View>
      </CardSurface>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 20,
    marginTop: 14,
  },
  card: {
    padding: 16,
    borderWidth: 1,
  },
  cornerGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    borderBottomLeftRadius: 120,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 2 },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  amount: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginTop: 2,
  },
  sub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 15,
  },
});
