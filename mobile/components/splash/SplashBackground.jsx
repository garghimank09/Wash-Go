import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { phaseProgress, PHASE, smoothstep } from './splashTimeline';

export default function SplashBackground({ progress, centerY }) {
  const glowStyle = useAnimatedStyle(() => {
    const ringT = smoothstep(phaseProgress(progress.value, PHASE.ringForm));
    const completeT = smoothstep(phaseProgress(progress.value, PHASE.ringComplete));
    const opacity = ringT * 0.3 + completeT * 0.2;
    const scale = 0.85 + ringT * 0.2;
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#FFFFFF', '#E0F2FE', '#F0F9FF']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[
          styles.glowWrap,
          { top: centerY - 120 },
          glowStyle,
        ]}
      >
        <View style={styles.glowCore} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  glowWrap: {
    position: 'absolute',
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: 'hidden',
  },
  glowCore: {
    flex: 1,
    backgroundColor: 'rgba(6, 182, 212, 0.18)',
    borderRadius: 140,
  },
});
