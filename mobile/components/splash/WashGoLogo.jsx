import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { phaseProgress, PHASE, smoothstep } from './splashTimeline';

export default function WashGoLogo({ progress }) {
  const logoStyle = useAnimatedStyle(() => {
    const t = smoothstep(phaseProgress(progress.value, PHASE.logo));
    return {
      opacity: t,
      transform: [{ translateY: (1 - t) * 16 }],
    };
  });

  return (
    <Animated.View style={[styles.wrap, logoStyle]}>
      <View style={styles.wordmark}>
        <Text style={styles.wash}>WASH</Text>
        <Text style={styles.go}>GO</Text>
      </View>
      <Text style={styles.tagline}>Sparkling Clean. Every Time.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 20,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wash: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 4,
    color: '#0F172A',
  },
  go: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 4,
    color: '#06B6D4',
  },
  tagline: {
    marginTop: 8,
    fontSize: 12,
    letterSpacing: 1.2,
    color: '#64748B',
    fontWeight: '500',
  },
});
