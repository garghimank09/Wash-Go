import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { phaseProgress, PHASE, smoothstep } from './splashTimeline';
import SedanGraphic from './SedanGraphic';

const CAR_WIDTH = 300;
const CAR_HEIGHT = 150;

export default function CarReveal({ progress }) {
  const carStyle = useAnimatedStyle(() => {
    const t = smoothstep(phaseProgress(progress.value, PHASE.carReveal));
    return {
      opacity: t,
      transform: [
        { scale: 0.85 + t * 0.15 },
        { translateY: (1 - t) * 12 },
      ],
    };
  });

  return (
    <Animated.View style={[styles.wrap, carStyle]}>
      <SedanGraphic width={CAR_WIDTH} height={CAR_HEIGHT} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
});
