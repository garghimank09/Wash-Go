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
import { DEBUG_ROLE_LAYOUT } from '../../constants/roleSelectionComposition';
import {
  ROLE_COLORS,
  ROLE_LAYOUT,
  ROLE_PALETTE,
} from '../../constants/roleSelectionTheme';
import { ROLE_EASE, ROLE_MOTION, smoothstep } from '../../constants/roleSelectionMotion';

const ARROW_SIZE = ROLE_LAYOUT.arrow.size;
const ARROW_CUSTOMER = ROLE_COLORS.accentBlue;
const ARROW_PARTNER = ROLE_COLORS.deepBlue;

/**
 * Slide CTA scoped to composition region width — never clips at half-screen.
 */
function SlideArrowGatewayImpl({
  side,
  title,
  subtitle,
  slideProgress,
  oppositeProgress,
  compositionOpacity,
  regionWidth,
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
    () =>
      Math.max(
        56,
        (regionWidth - ARROW_SIZE - ROLE_LAYOUT.composition.horizontalPad * 2) *
          ROLE_MOTION.slide.trackWidthRatio,
      ),
    [regionWidth],
  );

  const threshold = ROLE_MOTION.slide.threshold;
  const resistance = ROLE_MOTION.slide.dragResistance;
  const velocityCommit = ROLE_MOTION.slide.velocityCommit;

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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    onComplete?.();
  }, [onComplete]);

  const pan = useMemo(() => {
    if (reduceMotion) return Gesture.Tap();

    return Gesture.Pan()
      .enabled(!disabled)
      .activeOffsetX(isCustomer ? [6, 9999] : [-9999, -6])
      .failOffsetY([-22, 22])
      .onBegin(() => {
        cancelAnimation(dragX);
        cancelAnimation(slideProgress);
        if (oppositeProgress) {
          oppositeProgress.value = 0;
        }
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
      .onEnd((e) => {
        const velocity = isCustomer ? e.velocityX : -e.velocityX;
        const shouldComplete =
          slideProgress.value >= threshold ||
          (velocity > velocityCommit && slideProgress.value > 0.35);

        if (shouldComplete) {
          const settleMs =
            ROLE_MOTION.duration.slideExpand +
            ROLE_MOTION.delay.navigateAfterSettle;
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
    oppositeProgress,
    reduceMotion,
    resistance,
    slideProgress,
    threshold,
    velocityCommit,
  ]);

  const trackStyle = useAnimatedStyle(() => {
    const fade = compositionOpacity ? compositionOpacity.value : 1;
    return {
      opacity: (0.45 + entryShown.value * 0.4) * fade,
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    const p = slideProgress.value;
    const fade = compositionOpacity ? compositionOpacity.value : 1;
    return {
      opacity: (0.18 + p * 0.45) * fade,
      transform: [{ translateX: -maxDrag * (1 - p) }],
    };
  });

  const knobStyle = useAnimatedStyle(() => {
    const fade = compositionOpacity ? compositionOpacity.value : 1;
    return {
      opacity: entryShown.value * fade,
      transform: [
        { translateX: isCustomer ? dragX.value : maxDrag - dragX.value },
        { translateY: -breath.value * 1 },
      ],
    };
  });

  const hintOpacity = useAnimatedStyle(() => {
    const fade = compositionOpacity ? compositionOpacity.value : 1;
    return {
      opacity: (1 - slideProgress.value) * entryShown.value * fade,
    };
  });

  const trackTint = isCustomer
    ? 'rgba(255, 255, 239, 0.2)'
    : 'rgba(10, 30, 61, 0.1)';
  const fillTint = 'rgba(40, 140, 255, 0.2)';
  const arrowRotate = isCustomer ? undefined : { transform: [{ rotate: '180deg' }] };
  const useBlur = Platform.OS === 'ios';

  const railWidth = maxDrag + ARROW_SIZE;

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
      {useBlur ? (
        <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.knobFillAndroid]} />
      )}
      <ArrowRight
        size={22}
        color={isCustomer ? ARROW_CUSTOMER : ARROW_PARTNER}
        strokeWidth={2.2}
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
          style={styles.knobStatic}
        >
          {knob}
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrap,
        { maxWidth: regionWidth },
        DEBUG_ROLE_LAYOUT && styles.debugCtaWrap,
      ]}
    >
      {textBlock}

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.slideRail, { width: railWidth }]}>
          <Animated.View style={[styles.track, trackStyle]}>
            <View style={[styles.trackBase, { backgroundColor: trackTint }]} />
            <Animated.View
              style={[
                styles.trackFill,
                { backgroundColor: fillTint },
                styles.fillSlideLeft,
                fillStyle,
              ]}
            />
          </Animated.View>

          <Animated.View style={[styles.knobWrap, knobStyle]}>
            {knob}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    width: '100%',
    paddingTop: ROLE_LAYOUT.composition.ctaTopPadding,
  },
  debugCtaWrap: {
    borderWidth: 1,
    borderColor: 'rgba(255, 220, 80, 0.9)',
    backgroundColor: 'rgba(255, 220, 80, 0.06)',
  },
  textBlock: {
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
    maxWidth: '100%',
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.12,
    textAlign: 'center',
    lineHeight: 17,
  },
  slideRail: {
    height: ARROW_SIZE + 28,
    justifyContent: 'center',
    maxWidth: '100%',
    paddingVertical: 10,
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
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 99,
    width: '100%',
  },
  fillSlideLeft: {
    left: 0,
  },
  knobWrap: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knob: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    borderRadius: ARROW_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  knobFillAndroid: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
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
