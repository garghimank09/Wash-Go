import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
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
 * Panel backgrounds: photographic base (left/right assets) with soft
 * gradient overlays for depth, floor blend, and slide intensity.
 */
function AnimatedBackgroundImpl({ side, intensity, entry, reduceMotion = false }) {
  const isCustomer = side === 'customer';
  const photo = isCustomer ? LEFT_BG : RIGHT_BG;
  const drift = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    drift.value = withRepeat(
      withTiming(1, {
        duration: ROLE_MOTION.duration.ambientLoop,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [drift, reduceMotion]);

  const photoStyle = useAnimatedStyle(() => {
    const p = intensity ? intensity.value : 0;
    const driftY = drift.value * 4 - 2;
    return {
      transform: [{ translateY: driftY }, { scale: 1 + p * 0.03 }],
    };
  });

  const bloomStyle = useAnimatedStyle(() => {
    const p = intensity ? intensity.value : 0;
    return {
      opacity: 0.25 + p * 0.35,
    };
  });

  const entryStyle = useAnimatedStyle(() => {
    const e = entry ? entry.value : 1;
    return { opacity: interpolate(e, [0, 1], [0, 1]) };
  });

  const floorColors = isCustomer
    ? ROLE_GRADIENTS.customerFloor
    : ROLE_GRADIENTS.partnerFloor;

  const edgeBlend = isCustomer
    ? ['transparent', 'rgba(10, 30, 61, 0.12)', 'rgba(10, 30, 61, 0.45)']
    : ['transparent', 'rgba(255, 255, 255, 0.08)', 'rgba(212, 236, 252, 0.35)'];

  const centerWash = isCustomer
    ? ['rgba(10, 30, 61, 0.08)', 'transparent', 'rgba(43, 156, 255, 0.06)']
    : ['rgba(255, 255, 255, 0.12)', 'transparent', 'rgba(43, 156, 255, 0.05)'];

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, entryStyle]}>
      <Animated.View style={[StyleSheet.absoluteFill, photoStyle]}>
        <Image
          source={photo}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition={isCustomer ? 'left center' : 'right center'}
          transition={400}
          priority="high"
        />
      </Animated.View>

      <LinearGradient
        colors={centerWash}
        start={{ x: isCustomer ? 0 : 1, y: 0.3 }}
        end={{ x: isCustomer ? 1 : 0, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[StyleSheet.absoluteFill, bloomStyle]}>
        <LinearGradient
          colors={isCustomer ? ROLE_GRADIENTS.customerBloom : ROLE_GRADIENTS.partnerBloom}
          start={{ x: 0.5, y: 0.2 }}
          end={{ x: 0.5, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <LinearGradient
        colors={floorColors}
        locations={[0, 0.4, 0.7, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.floorBand}
      />

      <LinearGradient
        colors={edgeBlend}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Seam blend toward panel outer edge */}
      <LinearGradient
        colors={
          isCustomer
            ? ['transparent', 'rgba(10, 30, 61, 0.22)']
            : ['rgba(10, 30, 61, 0.18)', 'transparent']
        }
        start={{ x: isCustomer ? 1 : 0, y: 0.5 }}
        end={{ x: isCustomer ? 0 : 1, y: 0.5 }}
        style={[styles.seamBlend, isCustomer ? styles.seamRight : styles.seamLeft]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floorBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '52%',
  },
  seamBlend: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '30%',
  },
  seamRight: {
    right: 0,
  },
  seamLeft: {
    left: 0,
  },
});

const AnimatedBackground = memo(AnimatedBackgroundImpl);
export default AnimatedBackground;
