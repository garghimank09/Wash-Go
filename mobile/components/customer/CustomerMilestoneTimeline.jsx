import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';
import {
  buildCustomerMilestoneTimeline,
  deriveCustomerMilestone,
} from '../../lib/customerServiceMilestones';
import AppIcon from './AppIcon';

const MILESTONE_ICONS = {
  payment_received: 'payments',
  awaiting_acceptance: 'hourglass-empty',
  washer_accepted: 'verified',
  heading_to_you: 'directions-car',
  arrived_onsite: 'place',
  awaiting_arrival_approval: 'fact-check',
  arrival_approved: 'thumb-up',
  wash_in_progress: 'local-car-wash',
  completed: 'task-alt',
};

/**
 * Premium live service timeline driven by booking.service_phase (web parity).
 */
export default function CustomerMilestoneTimeline({ booking, tracking }) {
  const { theme } = useTheme();
  const milestone = deriveCustomerMilestone(booking, tracking);
  const steps = buildCustomerMilestoneTimeline(milestone);
  const cancelled = milestone === 'cancelled';
  const prevCurrentRef = useRef(null);

  useEffect(() => {
    const current = steps.find((s) => s.isCurrent)?.key;
    if (current && current !== prevCurrentRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    prevCurrentRef.current = current;
  }, [steps]);

  if (!steps.length) return null;

  return (
    <View style={styles.wrap}>
      {steps.map((step, idx) => (
        <MilestoneRow
          key={step.key}
          step={step}
          isLast={idx === steps.length - 1}
          theme={theme}
        />
      ))}
      {cancelled ? (
        <View style={[styles.cancelBox, { backgroundColor: 'rgba(220,38,38,0.08)' }]}>
          <AppIcon name="cancel" size={16} color={theme.customer.error} />
          <Text style={[styles.cancelText, { color: theme.customer.error }]}>
            This booking was cancelled
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function MilestoneRow({ step, isLast, theme }) {
  const c = theme.customer;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!step.isCurrent) return undefined;
    pulse.setValue(1);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [step.isCurrent, pulse]);

  const dotColor = step.done
    ? '#10b981'
    : step.isCurrent
      ? theme.accent.primary
      : c.surfaceContainerLow;
  const iconName = MILESTONE_ICONS[step.key] || 'radio-button-unchecked';

  return (
    <View style={styles.row}>
      <View style={styles.iconCol}>
        <Animated.View
          style={[
            styles.dot,
            {
              backgroundColor: dotColor,
              borderColor: step.done || step.isCurrent ? dotColor : c.outlineVariant,
              opacity: step.isCurrent ? pulse : 1,
              shadowColor: step.isCurrent ? theme.accent.primary : 'transparent',
              shadowOpacity: step.isCurrent ? 0.45 : 0,
              shadowRadius: step.isCurrent ? 8 : 0,
            },
          ]}
        >
          <AppIcon
            name={iconName}
            size={14}
            color={step.done || step.isCurrent ? theme.button.primary.text : theme.text.muted}
          />
        </Animated.View>
        {!isLast ? (
          <View
            style={[
              styles.connector,
              { backgroundColor: step.done ? '#10b981' : c.outlineVariant },
            ]}
          />
        ) : null}
      </View>
      <View style={styles.labelCol}>
        <View style={styles.labelRow}>
          <Text
            style={[
              styles.label,
              {
                color: step.isCurrent ? theme.text.primary : theme.text.secondary,
                fontWeight: step.isCurrent ? '800' : '600',
              },
            ]}
          >
            {step.label}
          </Text>
          {step.isCurrent ? (
            <View style={[styles.liveChip, { backgroundColor: `${theme.accent.primary}22` }]}>
              <View style={[styles.liveDot, { backgroundColor: theme.accent.primary }]} />
              <Text style={[styles.liveText, { color: theme.accent.dark }]}>LIVE</Text>
            </View>
          ) : null}
        </View>
        <Text
          style={[
            styles.statusLabel,
            {
              color: step.done ? '#047857' : step.isCurrent ? theme.accent.primary : theme.text.muted,
            },
          ]}
        >
          {step.statusLabel}
        </Text>
        {step.isCurrent && step.subCheckpoints?.length ? (
          <View style={styles.subList}>
            {step.subCheckpoints.slice(0, 3).map((line) => (
              <Text key={line} style={[styles.subLine, { color: theme.text.muted }]}>
                • {line}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 8 },
  row: { flexDirection: 'row' },
  iconCol: { width: 36, alignItems: 'center' },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  connector: { width: 2, flex: 1, marginVertical: 4, minHeight: 20 },
  labelCol: { flex: 1, marginLeft: 12, paddingBottom: 18 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  label: { fontSize: 14, flex: 1 },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  statusLabel: { fontSize: 12, marginTop: 3, fontWeight: '600' },
  subList: { marginTop: 8, gap: 3 },
  subLine: { fontSize: 11, lineHeight: 16 },
  cancelBox: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: CUSTOMER_LAYOUT.card.radiusSm,
  },
  cancelText: { fontSize: 13, fontWeight: '600' },
});
