import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import {
  TrendingUp,
  MapPin,
  Sparkles,
  Clock4,
} from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { getInsightPalette } from '../../../constants/scheduleTheme';

/** Static partner-side tips. These are educational guidance, not data. */
const SCHEDULE_INSIGHTS = [
  {
    id: 'sins-1',
    key: 'surge',
    icon: 'TrendingUp',
    title: 'Stay online during peak windows',
    body: 'Weekend evenings see the highest demand and best payouts.',
  },
  {
    id: 'sins-2',
    key: 'zone',
    icon: 'MapPin',
    title: 'Cluster nearby bookings',
    body: 'Accepting jobs in the same area cuts drive time between washes.',
  },
  {
    id: 'sins-3',
    key: 'pace',
    icon: 'Sparkles',
    title: 'Capture proof photos consistently',
    body: 'Before / after photos help dispatch resolve any post-job disputes quickly.',
  },
];

const ICONS = {
  TrendingUp,
  MapPin,
  Sparkles,
  Clock4,
};

export default function ScheduleInsightCard() {
  const { theme, isDark } = useTheme();
  const shadows = getPartnerShadow(isDark);

  return (
    <View style={styles.outer}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Smart insights
        </Text>
        <Text style={[styles.sectionMeta, { color: theme.text.secondary }]}>
          Tips for partners
        </Text>
      </View>

      <View style={styles.list}>
        {SCHEDULE_INSIGHTS.map((insight, i) => {
          const tokens = getInsightPalette(insight.key, isDark);
          const Icon = ICONS[insight.icon] || Sparkles;
          return (
            <MotiView
              key={insight.id}
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 260, delay: 60 + i * 40 }}
            >
              <Pressable
                onPress={() =>
                  Haptics.selectionAsync().catch(() => {})
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
                <View style={[styles.iconWrap, { backgroundColor: tokens.bg }]}>
                  <Icon size={18} color={tokens.fg} strokeWidth={2.4} />
                </View>
                <View style={styles.textCol}>
                  <Text style={[styles.title, { color: theme.text.primary }]}>
                    {insight.title}
                  </Text>
                  <Text style={[styles.body, { color: theme.text.secondary }]}>
                    {insight.body}
                  </Text>
                </View>
              </Pressable>
            </MotiView>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  sectionMeta: { fontSize: 12, fontWeight: '600' },
  list: { gap: 10 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  body: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
});
