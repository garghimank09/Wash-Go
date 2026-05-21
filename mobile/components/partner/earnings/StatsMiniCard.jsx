import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import {
  CheckCircle2,
  Percent,
  Activity,
  Star,
} from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { usePartnerEarnings } from '../../../context/PartnerEarningsContext';
import AnimatedCounter from '../AnimatedCounter';

function buildCards(isDark, stats) {
  return [
    {
      key: 'completedJobs',
      label: 'Completed jobs',
      value: stats.completedJobs ?? 0,
      icon: CheckCircle2,
      suffix: '',
      pad: false,
      accent: isDark ? '#34d399' : '#047857',
      accentBg: isDark ? 'rgba(52,211,153,0.18)' : 'rgba(16,185,129,0.14)',
      cornerGradient: isDark
        ? ['rgba(52,211,153,0.22)', 'rgba(52,211,153,0)']
        : ['rgba(16,185,129,0.18)', 'rgba(16,185,129,0)'],
    },
    {
      key: 'acceptanceRate',
      label: 'Acceptance rate',
      value: stats.acceptanceRate,
      icon: Percent,
      suffix: stats.acceptanceRate == null ? '' : '%',
      pad: false,
      placeholder: stats.acceptanceRate == null ? '—' : null,
      accent: isDark ? '#22d3ee' : '#0e7490',
      accentBg: isDark ? 'rgba(34,211,238,0.16)' : 'rgba(6,182,212,0.12)',
      cornerGradient: isDark
        ? ['rgba(34,211,238,0.20)', 'rgba(34,211,238,0)']
        : ['rgba(6,182,212,0.16)', 'rgba(6,182,212,0)'],
    },
    {
      key: 'activeJobs',
      label: 'Active jobs',
      value: stats.activeJobs ?? 0,
      icon: Activity,
      suffix: '',
      pad: true,
      accent: isDark ? '#fbbf24' : '#b45309',
      accentBg: isDark ? 'rgba(251,191,36,0.18)' : 'rgba(245,158,11,0.14)',
      cornerGradient: isDark
        ? ['rgba(251,191,36,0.22)', 'rgba(251,191,36,0)']
        : ['rgba(245,158,11,0.18)', 'rgba(245,158,11,0)'],
    },
    {
      key: 'averageRating',
      label: 'Average rating',
      value: stats.averageRating,
      icon: Star,
      suffix: '',
      pad: false,
      isFloat: true,
      placeholder: stats.averageRating == null ? '—' : null,
      accent: isDark ? '#a5b4fc' : '#4338ca',
      accentBg: isDark ? 'rgba(165,180,252,0.18)' : 'rgba(99,102,241,0.14)',
      cornerGradient: isDark
        ? ['rgba(165,180,252,0.22)', 'rgba(165,180,252,0)']
        : ['rgba(99,102,241,0.16)', 'rgba(99,102,241,0)'],
    },
  ];
}

function formatValue(card, n) {
  if (card.isFloat) return Number(n).toFixed(1);
  if (card.pad) return String(Math.round(n)).padStart(2, '0');
  return String(Math.round(n));
}

export default function StatsMiniCard() {
  const { theme, isDark } = useTheme();
  const shadows = getPartnerShadow(isDark);
  const { stats } = usePartnerEarnings();
  const cards = buildCards(isDark, stats);

  return (
    <View style={styles.grid}>
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <MotiView
            key={c.key}
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 260, delay: 40 + i * 35 }}
            style={styles.cell}
          >
            <Pressable
              onPress={() =>
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
              }
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: theme.customer.surfaceContainerLowest,
                  borderColor: theme.customer.outlineVariant,
                },
                shadows.rim,
                pressed && { opacity: 0.94 },
              ]}
            >
              <LinearGradient
                colors={c.cornerGradient}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.cornerAccent}
                pointerEvents="none"
              />
              <View style={[styles.iconWrap, { backgroundColor: c.accentBg }]}>
                <Icon size={18} color={c.accent} strokeWidth={2.4} />
              </View>
              <Text style={[styles.label, { color: theme.text.secondary }]}>
                {c.label}
              </Text>
              {c.placeholder ? (
                <Text style={[styles.value, { color: theme.text.primary }]}>
                  {c.placeholder}
                </Text>
              ) : (
                <AnimatedCounter
                  value={c.value ?? 0}
                  duration={650}
                  format={(n) => formatValue(c, n)}
                  suffix={c.suffix}
                  style={[styles.value, { color: theme.text.primary }]}
                />
              )}
            </Pressable>
          </MotiView>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 18,
    gap: 12,
  },
  cell: {
    width: '48%',
    flexGrow: 1,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    overflow: 'hidden',
    minHeight: 116,
  },
  cornerAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 90,
    height: 90,
    borderBottomLeftRadius: 90,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  label: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  value: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
});
