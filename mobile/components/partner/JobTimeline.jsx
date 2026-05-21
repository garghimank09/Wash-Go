import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import {
  Clock,
  CheckCircle2,
  CircleX,
  PlayCircle,
  CalendarCheck,
  Search,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

const PHASE_META = {
  light: {
    completed: { fg: '#047857', bg: 'rgba(16,185,129,0.14)', icon: CheckCircle2, label: 'Completed' },
    cancelled: { fg: '#c2410c', bg: 'rgba(248,113,113,0.14)', icon: CircleX, label: 'Cancelled' },
    in_progress: { fg: '#7c3aed', bg: 'rgba(124,58,237,0.14)', icon: PlayCircle, label: 'In progress' },
    accepted: { fg: '#4338ca', bg: 'rgba(99,102,241,0.14)', icon: CalendarCheck, label: 'Scheduled' },
    on_the_way: { fg: '#0891b2', bg: 'rgba(6,182,212,0.16)', icon: Clock, label: 'On the way' },
    searching: { fg: '#b45309', bg: 'rgba(245,158,11,0.14)', icon: Search, label: 'Searching' },
  },
  dark: {
    completed: { fg: '#34d399', bg: 'rgba(52,211,153,0.18)', icon: CheckCircle2, label: 'Completed' },
    cancelled: { fg: '#fb923c', bg: 'rgba(251,146,60,0.18)', icon: CircleX, label: 'Cancelled' },
    in_progress: { fg: '#c4b5fd', bg: 'rgba(167,139,250,0.18)', icon: PlayCircle, label: 'In progress' },
    accepted: { fg: '#a5b4fc', bg: 'rgba(129,140,248,0.18)', icon: CalendarCheck, label: 'Scheduled' },
    on_the_way: { fg: '#22d3ee', bg: 'rgba(34,211,238,0.18)', icon: Clock, label: 'On the way' },
    searching: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.18)', icon: Search, label: 'Searching' },
  },
};

export default function JobTimeline({ items = [] }) {
  const { theme, isDark } = useTheme();
  const palette = isDark ? PHASE_META.dark : PHASE_META.light;

  if (!items.length) {
    return (
      <View style={styles.wrap}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text.primary }]}>Today’s timeline</Text>
        </View>
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: theme.customer.surfaceContainerLowest,
              borderColor: theme.customer.outlineVariant,
            },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
            No jobs scheduled today
          </Text>
          <Text style={[styles.emptyBody, { color: theme.text.secondary }]}>
            New bookings will land here automatically when they’re assigned.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Today’s timeline</Text>
        <Text style={[styles.count, { color: theme.text.secondary }]}>
          {items.length} {items.length === 1 ? 'job' : 'jobs'}
        </Text>
      </View>

      <View style={styles.timeline}>
        <View
          pointerEvents="none"
          style={[
            styles.spine,
            { backgroundColor: theme.customer.outlineVariant },
          ]}
        />
        {items.map((item, i) => {
          const meta = palette[item.phase] || palette.accepted;
          const Icon = meta.icon;
          return (
            <MotiView
              key={item.id}
              from={{ opacity: 0, translateX: -4 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 240, delay: 35 * i }}
              style={styles.row}
            >
              <View style={styles.spineCol}>
                <View
                  style={[
                    styles.node,
                    {
                      backgroundColor: meta.bg,
                      borderColor: meta.fg,
                    },
                  ]}
                >
                  <Icon size={12} color={meta.fg} strokeWidth={2.4} />
                </View>
              </View>
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.customer.surfaceContainerLowest,
                    borderColor: theme.customer.outlineVariant,
                  },
                ]}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.time, { color: theme.text.secondary }]}>
                    {item.time}
                  </Text>
                  <View style={[styles.chip, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.chipText, { color: meta.fg }]}>{meta.label}</Text>
                  </View>
                </View>
                <Text style={[styles.label, { color: theme.text.primary }]} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={[styles.customer, { color: theme.text.secondary }]} numberOfLines={1}>
                  {item.customer}
                </Text>
              </View>
            </MotiView>
          );
        })}
      </View>
    </View>
  );
}

const SPINE_OFFSET = 18;

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginTop: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  count: { fontSize: 12, fontWeight: '600' },
  timeline: { position: 'relative' },
  spine: {
    position: 'absolute',
    top: 12,
    bottom: 12,
    left: SPINE_OFFSET - 1,
    width: 2,
    borderRadius: 1,
  },
  row: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  spineCol: {
    width: SPINE_OFFSET * 2,
    alignItems: 'center',
    paddingTop: 14,
  },
  node: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  chipText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.2 },
  label: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  customer: { fontSize: 12, fontWeight: '500' },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 4,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  emptyBody: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
});
