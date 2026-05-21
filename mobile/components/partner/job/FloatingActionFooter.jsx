import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ArrowRight, Phone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { getJobTokens } from '../../../constants/jobTheme';
import { findPhase } from '../../../lib/jobPhases';

const PARTNER_EASE = Easing.bezier(0.25, 0.1, 0.25, 1);
export const FLOATING_FOOTER_BASE_HEIGHT = 92;

/**
 * Sticky bottom action area. CTA label + behaviour comes from current phase.
 * Visual: gradient pill, soft glow, blurred glass backdrop.
 *
 * Avoids springs entirely — every transition is a timing curve.
 */
export default function FloatingActionFooter({
  phase,
  disabled,
  disabledReason,
  loading,
  onPrimary,
  onCall,
  callDisabled = false,
}) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const shadows = getPartnerShadow(isDark);
  const tokens = getJobTokens(isDark).footer;
  const phaseInfo = findPhase(phase);

  const enabled = !disabled && !loading;
  const canCall = !callDisabled;

  const opacity = useSharedValue(enabled ? 1 : 0.65);
  useEffect(() => {
    opacity.value = withTiming(enabled ? 1 : 0.65, { duration: 220, easing: PARTNER_EASE });
  }, [enabled, opacity]);
  const ctaStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const handlePrimary = () => {
    if (!enabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPrimary?.();
  };

  const handleCall = () => {
    if (!canCall) return;
    Haptics.selectionAsync().catch(() => {});
    onCall?.();
  };

  return (
    <View
      style={[
        styles.outer,
        { paddingBottom: Math.max(insets.bottom, 14) },
      ]}
    >
      <View pointerEvents="none" style={[StyleSheet.absoluteFill]}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={isDark ? 34 : 38}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: tokens.surface }]} />
        <View
          style={[
            styles.topBorder,
            { backgroundColor: tokens.border },
          ]}
        />
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 260 }}
        style={styles.row}
      >
        <Animated.View style={[styles.primaryWrap, ctaStyle]}>
          <Pressable
            onPress={handlePrimary}
            disabled={!enabled}
            style={({ pressed }) => [
              styles.primary,
              shadows.glow(tokens.glow),
              pressed && enabled && { opacity: 0.96 },
            ]}
            accessibilityLabel={phaseInfo.ctaLabel}
          >
            <LinearGradient
              colors={enabled ? tokens.gradient : tokens.disabledGradient}
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
            <View style={styles.primaryInner}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.primaryLabel} numberOfLines={1}>
                    {phaseInfo.ctaLabel}
                  </Text>
                  <View style={styles.arrowWrap}>
                    <ArrowRight size={18} color="#ffffff" strokeWidth={2.4} />
                  </View>
                </>
              )}
            </View>
          </Pressable>
          {disabled && disabledReason ? (
            <Text
              style={[styles.disabledHint, { color: theme.text.muted }]}
              numberOfLines={1}
            >
              {disabledReason}
            </Text>
          ) : null}
        </Animated.View>

        <Pressable
          onPress={handleCall}
          disabled={!canCall}
          hitSlop={8}
          style={({ pressed }) => [
            styles.secondaryBtn,
            { backgroundColor: tokens.secondaryBg },
            !canCall && { opacity: 0.45 },
            pressed && canCall && { opacity: 0.92 },
          ]}
          accessibilityLabel="Call customer"
          accessibilityState={{ disabled: !canCall }}
        >
          <Phone size={16} color={tokens.secondaryFg} strokeWidth={2.4} />
        </Pressable>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 14,
    paddingHorizontal: 14,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryWrap: {
    flex: 1,
    gap: 4,
  },
  primary: {
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    position: 'relative',
  },
  primaryInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 10,
  },
  primaryLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
    flex: 1,
  },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledHint: {
    fontSize: 11,
    fontWeight: '600',
    paddingLeft: 6,
  },
});
