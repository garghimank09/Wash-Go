import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';

import { OTP_LENGTH } from '../../../lib/otpConstants';

const BOX_SIZE = 48;
const GAP = 10;

function OtpCell({ digit, focused, filled, accentColor, idleBg, idleBorder, error, index, textColor }) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.06, { damping: 14, stiffness: 220 });
      glow.value = withTiming(1, { duration: 180 });
    } else if (filled) {
      scale.value = withSpring(1, { damping: 16, stiffness: 200 });
      glow.value = withTiming(0.65, { duration: 200 });
    } else {
      scale.value = withSpring(1, { damping: 18, stiffness: 180 });
      glow.value = withTiming(0, { duration: 220 });
    }
  }, [focused, filled, scale, glow]);

  const animatedBox = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: error
      ? 'rgba(248,113,113,0.9)'
      : focused || filled
        ? accentColor
        : idleBorder,
    backgroundColor: filled
      ? `${accentColor}18`
      : focused
        ? `${accentColor}12`
        : idleBg,
    shadowOpacity: glow.value * 0.35,
    shadowRadius: glow.value * 10,
    elevation: glow.value * 4,
  }));

  return (
    <Animated.View
      style={[
        styles.cell,
        {
          shadowColor: accentColor,
        },
        animatedBox,
      ]}
    >
      <Text
        style={[styles.cellText, { color: filled ? accentColor : textColor }]}
        accessibilityLabel={`Digit ${index + 1}`}
      >
        {digit || ''}
      </Text>
    </Animated.View>
  );
}

/**
 * Premium 6-digit OTP input with paste, autofill, and animated cells.
 */
export default function PremiumOtpInput({
  value,
  onChange,
  onComplete,
  accentColor = '#06b6d4',
  textColor = '#0f172a',
  idleBg = 'rgba(148,163,184,0.12)',
  idleBorder = 'rgba(148,163,184,0.28)',
  error = false,
  disabled = false,
  autoFocus = true,
}) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(autoFocus);
  const shakeX = useSharedValue(0);
  const digits = (value || '').padEnd(OTP_LENGTH, ' ').slice(0, OTP_LENGTH).split('');

  const triggerShake = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 45 }),
      withTiming(10, { duration: 45 }),
      withTiming(-8, { duration: 45 }),
      withTiming(8, { duration: 45 }),
      withTiming(0, { duration: 45 }),
    );
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [shakeX]);

  useEffect(() => {
    if (error) triggerShake();
  }, [error, triggerShake]);

  useEffect(() => {
    if (value.length === OTP_LENGTH) {
      onComplete?.(value);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [value, onComplete]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handleChange = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(cleaned);
    if (cleaned.length > value.length && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const activeIndex = Math.min(value.length, OTP_LENGTH - 1);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} accessibilityRole="none">
      <Animated.View style={[styles.row, rowStyle]}>
        {digits.map((d, i) => (
          <OtpCell
            key={i}
            index={i}
            digit={d.trim() ? d : ''}
            focused={focused && i === activeIndex}
            filled={i < value.length}
            accentColor={accentColor}
            idleBg={idleBg}
            idleBorder={idleBorder}
            error={error}
            textColor={textColor}
          />
        ))}
      </Animated.View>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        maxLength={OTP_LENGTH}
        editable={!disabled}
        autoFocus={autoFocus}
        caretHidden
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.hiddenInput}
        accessibilityLabel="Verification code"
        importantForAutofill="yes"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: GAP,
    marginVertical: 8,
  },
  cell: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
  },
  cellText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#0f172a',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});

export function OtpSuccessBurst({ visible, accentColor }) {
  if (!visible) return null;
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 420 }}
      style={[styles.successRing, { borderColor: `${accentColor}55` }]}
    >
      <MotiView
        from={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 80 }}
      >
        <Text style={[styles.successCheck, { color: accentColor }]}>✓</Text>
      </MotiView>
    </MotiView>
  );
}

Object.assign(styles, StyleSheet.create({
  successRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  successCheck: {
    fontSize: 36,
    fontWeight: '800',
  },
}));
