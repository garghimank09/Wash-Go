import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';
import AppIcon from './AppIcon';

const STEPS = [
  { key: 'searching', label: 'Finding washer', icon: 'search' },
  { key: 'awaiting_acceptance', label: 'Awaiting acceptance', icon: 'hourglass-empty' },
  { key: 'accepted', label: 'Washer accepted', icon: 'verified' },
  { key: 'on_the_way', label: 'On the way', icon: 'directions-car' },
  { key: 'in_progress', label: 'Wash in progress', icon: 'local-car-wash' },
  { key: 'completed', label: 'Completed', icon: 'task-alt' },
];

// Phases that map to a discrete timeline step (skip awaiting_acceptance display
// merging it under searching to keep the timeline tight; show all 5 steps).
const DISPLAY_STEPS = [
  { key: 'searching', label: 'Finding washer', icon: 'search' },
  { key: 'accepted', label: 'Washer accepted', icon: 'verified' },
  { key: 'on_the_way', label: 'On the way', icon: 'directions-car' },
  { key: 'in_progress', label: 'Wash in progress', icon: 'local-car-wash' },
  { key: 'completed', label: 'Completed', icon: 'task-alt' },
];

const PHASE_INDEX = {
  searching: 0,
  awaiting_acceptance: 0,
  accepted: 1,
  on_the_way: 2,
  in_progress: 3,
  completed: 4,
};

export default function ServiceTimeline({ phase }) {
  const { theme } = useTheme();
  const c = theme.customer;
  const s = styles(theme);
  const cancelled = phase === 'cancelled';
  const activeIdx = cancelled ? -1 : PHASE_INDEX[phase] ?? 0;

  return (
    <View style={s.wrap}>
      {DISPLAY_STEPS.map((step, idx) => {
        const isCompleted = !cancelled && idx < activeIdx;
        const isActive = !cancelled && idx === activeIdx;
        const isLast = idx === DISPLAY_STEPS.length - 1;
        return (
          <TimelineRow
            key={step.key}
            step={step}
            isCompleted={isCompleted}
            isActive={isActive}
            isLast={isLast}
            theme={theme}
          />
        );
      })}
      {cancelled ? (
        <View style={s.cancelBox}>
          <AppIcon name="cancel" size={16} color={c.error} />
          <Text style={s.cancelText}>This booking was cancelled</Text>
        </View>
      ) : null}
    </View>
  );
}

function TimelineRow({ step, isCompleted, isActive, isLast, theme }) {
  const c = theme.customer;
  const s = styles(theme);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) return undefined;
    pulse.setValue(1);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isActive, pulse]);

  const dotColor = isCompleted
    ? '#10b981'
    : isActive
    ? theme.accent.primary
    : c.surfaceContainerLow;
  const connectorColor = isCompleted ? '#10b981' : c.outlineVariant;
  const iconColor = isCompleted || isActive ? theme.button.primary.text : theme.text.muted;
  const labelColor = isActive ? theme.text.primary : theme.text.secondary;

  return (
    <View style={s.row}>
      <View style={s.iconCol}>
        <Animated.View
          style={[
            s.dot,
            {
              backgroundColor: dotColor,
              borderColor: isCompleted || isActive ? dotColor : c.outlineVariant,
              opacity: isActive ? pulse : 1,
            },
          ]}
        >
          <AppIcon name={step.icon} size={14} color={iconColor} />
        </Animated.View>
        {!isLast ? (
          <View style={[s.connector, { backgroundColor: connectorColor }]} />
        ) : null}
      </View>
      <View style={s.labelCol}>
        <Text
          style={[
            s.label,
            { color: labelColor, fontWeight: isActive ? '700' : '600' },
          ]}
        >
          {step.label}
        </Text>
        {isActive ? <Text style={s.activeNote}>In progress</Text> : null}
        {isCompleted ? <Text style={s.doneNote}>Done</Text> : null}
      </View>
    </View>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    wrap: { paddingVertical: 8 },
    row: { flexDirection: 'row', alignItems: 'stretch' },
    iconCol: { width: 32, alignItems: 'center' },
    dot: {
      width: 32,
      height: 32,
      borderRadius: CUSTOMER_LAYOUT.card.radiusSm,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    connector: { width: 2, flex: 1, marginVertical: 4 },
    labelCol: { flex: 1, marginLeft: 14, paddingBottom: 20 },
    label: { fontSize: 14 },
    activeNote: {
      fontSize: 11,
      color: theme.accent.primary,
      marginTop: 2,
      fontWeight: '600',
    },
    doneNote: {
      fontSize: 11,
      color: '#047857',
      marginTop: 2,
      fontWeight: '600',
    },
    cancelBox: {
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: theme.radius.md,
      backgroundColor: 'rgba(220,38,38,0.08)',
    },
    cancelText: { fontSize: 13, color: c.error, fontWeight: '600' },
  });
};

export { STEPS };
