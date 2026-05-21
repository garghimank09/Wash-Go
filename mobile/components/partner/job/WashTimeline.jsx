import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Activity, Check } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { getJobTokens } from '../../../constants/jobTheme';
import { JOB_PHASES, PHASE_INDEX, relativeTime } from '../../../lib/jobPhases';

/**
 * Vertical timeline of job stages. Past stages get a tick + timestamp, the
 * active stage gets a soft pulse ring, and pending stages render dim.
 */
export default function WashTimeline({ phase, events }) {
  const { theme, isDark } = useTheme();
  const shadows = getPartnerShadow(isDark);
  const tokens = getJobTokens(isDark).timeline;

  const currentIndex = PHASE_INDEX[phase] ?? 0;

  const stages = useMemo(() => {
    return JOB_PHASES.map((p, idx) => {
      const event = events?.find((e) => e.phase === p.id);
      const status = idx < currentIndex ? 'done' : idx === currentIndex ? 'active' : 'pending';
      return {
        id: p.id,
        label: p.label,
        status,
        at: event?.at,
      };
    });
  }, [events, currentIndex]);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 260 }}
      style={[
        styles.card,
        {
          backgroundColor: theme.customer.surfaceContainerLowest,
          borderColor: theme.customer.outlineVariant,
        },
        shadows.rim,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.headerIcon, { backgroundColor: theme.customer.primaryBg }]}>
          <Activity size={14} color={theme.accent.primary} strokeWidth={2.4} />
        </View>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Live wash timeline
        </Text>
        <View style={{ flex: 1 }} />
        <Text style={[styles.meta, { color: theme.text.muted }]}>
          {currentIndex + 1} / {stages.length}
        </Text>
      </View>

      <View style={styles.timeline}>
        {stages.map((stage, idx) => {
          const isLast = idx === stages.length - 1;
          return (
            <View key={stage.id} style={styles.row}>
              <View style={styles.spineCol}>
                {!isLast ? (
                  <View
                    style={[
                      styles.spine,
                      {
                        backgroundColor:
                          stage.status === 'done' ? tokens.activeSpine : tokens.spine,
                      },
                    ]}
                  />
                ) : null}
                {stage.status === 'active' ? (
                  <View style={styles.activeDotWrap}>
                    <MotiView
                      from={{ opacity: 0.2 }}
                      animate={{ opacity: 0.6 }}
                      transition={{
                        type: 'timing',
                        duration: 1600,
                        loop: true,
                        repeatReverse: true,
                      }}
                      style={[
                        styles.pulseRing,
                        { backgroundColor: tokens.activeRing },
                      ]}
                    />
                    <View
                      style={[
                        styles.activeDot,
                        { backgroundColor: tokens.activeDot, borderColor: '#ffffff' },
                      ]}
                    />
                  </View>
                ) : stage.status === 'done' ? (
                  <View style={[styles.doneDot, { backgroundColor: tokens.doneDot }]}>
                    <Check size={11} color="#ffffff" strokeWidth={3} />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.pendingDot,
                      {
                        backgroundColor: tokens.pendingDot,
                        borderColor: tokens.pendingRing,
                      },
                    ]}
                  />
                )}
              </View>

              <View style={styles.textCol}>
                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        stage.status === 'pending' ? theme.text.muted : theme.text.primary,
                      fontWeight: stage.status === 'active' ? '800' : '700',
                    },
                  ]}
                >
                  {stage.label}
                </Text>
                {stage.at ? (
                  <Text style={[styles.time, { color: theme.text.muted }]}>
                    {relativeTime(stage.at)}
                  </Text>
                ) : (
                  <Text style={[styles.time, { color: theme.text.muted, opacity: 0.7 }]}>
                    {stage.status === 'active' ? 'In progress' : 'Pending'}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </MotiView>
  );
}

const SPINE_OFFSET = 26;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  meta: { fontSize: 11, fontWeight: '700' },
  timeline: { paddingLeft: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingBottom: 12,
  },
  spineCol: {
    width: SPINE_OFFSET,
    alignItems: 'center',
    position: 'relative',
    paddingTop: 2,
  },
  spine: {
    position: 'absolute',
    top: 14,
    bottom: -12,
    left: SPINE_OFFSET / 2 - 1,
    width: 2,
    borderRadius: 1,
  },
  activeDotWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  doneDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  textCol: { flex: 1, gap: 1, paddingTop: 1 },
  label: { fontSize: 13, letterSpacing: -0.1 },
  time: { fontSize: 11, fontWeight: '600' },
});
