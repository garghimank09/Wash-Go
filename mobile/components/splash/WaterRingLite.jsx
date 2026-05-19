import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { phaseProgress, PHASE, smoothstep } from './splashTimeline';

const RING_SIZE =
  Math.min(Dimensions.get('window').width, Dimensions.get('window').height) * 0.48;

export default function WaterRingLite({ progress }) {
  const ringStyle = useAnimatedStyle(() => {
    const form = smoothstep(phaseProgress(progress.value, PHASE.ringForm));
    const complete = smoothstep(phaseProgress(progress.value, PHASE.ringComplete));
    return {
      opacity: 0.2 + form * 0.7 + complete * 0.1,
      transform: [
        { rotate: `${progress.value * 360}deg` },
        { scale: 0.88 + form * 0.12 },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    const form = smoothstep(phaseProgress(progress.value, PHASE.ringForm));
    return {
      opacity: 0.08 + form * 0.2,
      transform: [{ scale: 0.9 + form * 0.15 }],
    };
  });

  const rippleStyle = useAnimatedStyle(() => {
    const t = smoothstep(phaseProgress(progress.value, PHASE.ringComplete));
    return {
      opacity: (1 - t) * 0.12,
      transform: [{ scale: 0.95 + t * 0.2 }],
    };
  });

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.glow, glowStyle]} />
      <Animated.View style={[styles.ripple, rippleStyle]} />
      <Animated.View style={[styles.ring, ringStyle]} />
      <Animated.View style={[styles.ringHighlight, ringStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: RING_SIZE * 1.1,
    height: RING_SIZE * 1.1,
    borderRadius: RING_SIZE,
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
  },
  ripple: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 4,
    borderColor: '#06B6D4',
    backgroundColor: 'transparent',
  },
  ringHighlight: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'transparent',
  },
});
