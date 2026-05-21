import { memo, useCallback, useEffect, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ArrowRight } from 'lucide-react-native';
import { ROLE_COLORS, ROLE_PALETTE, ROLE_LAYOUT, ROLE_SHADOW } from '../../constants/roleSelectionTheme';
import { ROLE_EASE, ROLE_MOTION, smoothstep } from '../../constants/roleSelectionMotion';

const ARROW_SIZE = ROLE_LAYOUT.arrow.size;
const ARROW_COLOR = ROLE_COLORS.accentBlue;
const KNOB_FILL = 'rgba(255, 255, 239, 0.94)';
const KNOB_RING = 'rgba(40, 140, 255, 0.35)';

/**
 * Slide-to-enter CTA: side-specific title/subtitle colors per brand spec.
 */
function SlideArrowGatewayImpl({
  side,
  title,
  subtitle,
  slideProgress,
  panelWidth,
  reduceMotion = false,
  onComplete,
  entryDelay = 0,
  disabled = false,
  resetKey = 0,
}) {
  const isCustomer = side === 'customer';
  const palette = isCustomer ? ROLE_PALETTE.customer : ROLE_PALETTE.partner;
  const dragX = useSharedValue(0);
  const breath = useSharedValue(0);
  const entryShown = useSharedValue(reduceMotion ? 1 : 0);

  const maxDrag = useMemo(
    () => Math.max(68, (panelWidth || 0) * ROLE_MOTION.slide.trackWidthRatio),
    [panelWidth],
  );

  const threshold = ROLE_MOTION.slide.threshold;
  const resistance = ROLE_MOTION.slide.dragResistance;

  useEffect(() => {
    cancelAnimation(dragX);
    cancelAnimation(slideProgress);
    dragX.value = 0;
    slideProgress.value = 0;
  }, [resetKey, dragX, slideProgress]);

  useEffect(() => {
    if (reduceMotion) {
      entryShown.value = 1;
      return;
    }
    entryShown.value = withDelay(
      entryDelay,
      withTiming(1, { duration: 480, easing: ROLE_EASE }),
    );
    breath.value = withRepeat(
      withTiming(1, {
        duration: ROLE_MOTION.duration.arrowBreath,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [breath, entryDelay, entryShown, reduceMotion]);

  const commitNavigation = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onComplete?.();
  }, [onComplete]);

  const pan = useMemo(() => {
    if (reduceMotion) return Gesture.Tap();

    return Gesture.Pan()
      .enabled(!disabled)
      .activeOffsetX(isCustomer ? 10 : -10)
      .failOffsetY([-18, 18])
      .onBegin(() => {
        cancelAnimation(dragX);
        cancelAnimation(slideProgress);
      })
      .onUpdate((e) => {
        const raw = isCustomer ? e.translationX : -e.translationX;
        const clamped = Math.max(0, Math.min(maxDrag, raw));
        dragX.value = clamped;
        if (maxDrag <= 0) {
          slideProgress.value = 0;
          return;
        }
        const linear = clamped / maxDrag;
        const resisted = Math.pow(linear, resistance);
        slideProgress.value = smoothstep(resisted);
      })
      .onEnd(() => {
        if (slideProgress.value >= threshold) {
          const settleMs =
            ROLE_MOTION.duration.slideExpand + ROLE_MOTION.delay.navigateAfterSettle;
          dragX.value = withTiming(maxDrag, {
            duration: ROLE_MOTION.duration.slideExpand,
            easing: ROLE_EASE,
          });
          slideProgress.value = withTiming(
            1,
            { duration: settleMs, easing: ROLE_EASE },
            (finished) => {
              if (finished) runOnJS(commitNavigation)();
            },
          );
        } else {
          dragX.value = withTiming(0, {
            duration: ROLE_MOTION.duration.slideSnapBack,
            easing: ROLE_EASE,
          });
          slideProgress.value = withTiming(0, {
            duration: ROLE_MOTION.duration.slideSnapBack,
            easing: ROLE_EASE,
          });
        }
      });
  }, [
    commitNavigation,
    disabled,
    dragX,
    isCustomer,
    maxDrag,
    reduceMotion,
    resistance,
    slideProgress,
    threshold,
  ]);

  const trackStyle = useAnimatedStyle(() => ({
    opacity: 0.38 + entryShown.value * 0.5,
    transform: [{ scaleX: 0.94 + entryShown.value * 0.06 }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: maxDrag * slideProgress.value + ARROW_SIZE * 0.48,
    opacity: 0.22 + slideProgress.value * 0.58,
    alignSelf: isCustomer ? 'flex-start' : 'flex-end',
  }));

  const knobStyle = useAnimatedStyle(() => ({
    opacity: entryShown.value,
    transform: [
      { translateX: isCustomer ? dragX.value : maxDrag - dragX.value },
      { translateY: -breath.value * 2.5 },
      { scale: 1 + slideProgress.value * 0.035 },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.38 + breath.value * 0.22 + slideProgress.value * 0.4,
    transform: [{ scale: 1.08 + slideProgress.value * 0.12 }],
  }));

  const hintOpacity = useAnimatedStyle(() => ({
    opacity: (1 - slideProgress.value) * entryShown.value,
  }));

  const shadow = isCustomer ? ROLE_SHADOW.arrowCustomer : ROLE_SHADOW.arrowPartner;
  const trackTint = isCustomer
    ? 'rgba(255, 255, 239, 0.2)'
    : 'rgba(10, 30, 61, 0.1)';
  const fillTint = 'rgba(40, 140, 255, 0.28)';
  const arrowRotate = isCustomer ? undefined : { transform: [{ rotate: '180deg' }] };

  const textBlock = (
    <Animated.View style={[styles.textBlock, hintOpacity]}>
      <Text style={[styles.title, { color: palette.title }]} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: palette.subtitle }]} numberOfLines={1}>
        {subtitle}
      </Text>
    </Animated.View>
  );

  const knob = (
    <View style={styles.knob}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFill} />
      ) : null}
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.knobFill,
          { backgroundColor: KNOB_FILL, borderColor: KNOB_RING },
        ]}
      />
      <ArrowRight
        size={22}
        color={ARROW_COLOR}
        strokeWidth={2.8}
        style={arrowRotate}
      />
    </View>
  );

  if (reduceMotion) {
    return (
      <View style={styles.wrap}>
        {textBlock}
        <Pressable
          onPress={commitNavigation}
          accessibilityRole="button"
          accessibilityLabel={`${title}, ${subtitle}`}
          style={[styles.knobStatic, shadow]}
        >
          {knob}
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {textBlock}

      <View style={[styles.slideRail, { width: maxDrag + ARROW_SIZE }]}>
        <Animated.View style={[styles.track, trackStyle]}>
          <View style={[styles.trackBase, { backgroundColor: trackTint }]} />
          <Animated.View style={[styles.trackFill, { backgroundColor: fillTint }, fillStyle]} />
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.knobWrap, knobStyle, shadow]}>
            <Animated.View style={[styles.knobGlow, glowStyle]}>
              <View style={[styles.glowDisc, { backgroundColor: 'rgba(40, 140, 255, 0.35)' }]} />
            </Animated.View>
            {knob}
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    width: '100%',
    minHeight: ARROW_SIZE + 72,
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
  textBlock: {
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.15,
    textAlign: 'center',
    lineHeight: 18,
  },
  slideRail: {
    height: ARROW_SIZE + 8,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ARROW_SIZE / 2 - ROLE_LAYOUT.arrow.trackHeight / 2,
    height: ROLE_LAYOUT.arrow.trackHeight,
    borderRadius: 99,
    overflow: 'hidden',
  },
  trackBase: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 99,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 99,
  },
  knobWrap: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knobGlow: {
    position: 'absolute',
    width: ARROW_SIZE * 1.55,
    height: ARROW_SIZE * 1.55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowDisc: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    opacity: 0.6,
  },
  knob: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    borderRadius: ARROW_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  knobFill: {
    borderRadius: 999,
    borderWidth: 1.5,
  },
  knobStatic: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    borderRadius: ARROW_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const SlideArrowGateway = memo(SlideArrowGatewayImpl);
export default SlideArrowGateway;
