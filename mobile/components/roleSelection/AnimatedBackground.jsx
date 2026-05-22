import { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { ROLE_GRADIENTS } from '../../constants/roleSelectionTheme';
import { ROLE_MOTION } from '../../constants/roleSelectionMotion';

const LEFT_BG = require('../../assets/leftsideBackground.png');
const RIGHT_BG = require('../../assets/rightsideBackground.png');

/**
 * Panel background — reduced gradient stack to avoid compositing bands during slide.
 */
function AnimatedBackgroundImpl({
  side,
  intensity,
  entry,
  reduceMotion = false,
  isDragging = false,
}) {
  const isCustomer = side === 'customer';
  const photo = isCustomer ? LEFT_BG : RIGHT_BG;
  const drift = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || isDragging) return;
    drift.value = withRepeat(
      withTiming(1, {
        duration: ROLE_MOTION.duration.ambientLoop,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [drift, reduceMotion, isDragging]);

  const photoStyle = useAnimatedStyle(() => {
    const driftY = reduceMotion || isDragging ? 0 : drift.value * 3 - 1.5;
    return {
      transform: [{ translateY: driftY }],
    };
  });

  const bloomStyle = useAnimatedStyle(() => {
    const p = intensity ? intensity.value : 0;
    return {
      opacity: 0.18 + p * 0.22,
    };
  });

  const entryStyle = useAnimatedStyle(() => {
    const e = entry ? entry.value : 1;
    return { opacity: interpolate(e, [0, 1], [0, 1]) };
  });

  const floorColors = isCustomer
    ? ROLE_GRADIENTS.customerFloor
    : ROLE_GRADIENTS.partnerFloor;

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.backgroundLayer, entryStyle]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, photoStyle]}>
        <Image
          source={photo}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition={isCustomer ? 'left center' : 'right center'}
          transition={0}
          cachePolicy="memory-disk"
          recyclingKey={isCustomer ? 'bg-left' : 'bg-right'}
          priority="high"
        />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, bloomStyle]}>
        <LinearGradient
          colors={
            isCustomer ? ROLE_GRADIENTS.customerBloom : ROLE_GRADIENTS.partnerBloom
          }
          start={{ x: 0.5, y: 0.15 }}
          end={{ x: 0.5, y: 0.95 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <LinearGradient
        colors={floorColors}
        locations={[0, 0.45, 0.75, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.floorBand}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backgroundLayer: {
    zIndex: 1,
  },
  floorBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '48%',
  },
});

const AnimatedBackground = memo(AnimatedBackgroundImpl);
export default AnimatedBackground;
