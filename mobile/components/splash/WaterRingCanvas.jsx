import { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse } from 'react-native-svg';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { phaseProgress, PHASE, smoothstep } from './splashTimeline';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const PARTICLE_COUNT = 20;

function buildParticles(cx, cy, radius) {
  const items = [];
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
    const dist = radius * (0.55 + (i % 5) * 0.08);
    items.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      r: 1.5 + (i % 3),
    });
  }
  return items;
}

export default function WaterRingCanvas({ progress, centerX, centerY }) {
  const radius = Math.min(SCREEN_W, centerY) * 0.24;
  const circumference = 2 * Math.PI * radius;

  const particles = useMemo(
    () => buildParticles(centerX, centerY, radius),
    [centerX, centerY, radius]
  );

  const ringProps = useAnimatedProps(() => {
    const t = smoothstep(phaseProgress(progress.value, PHASE.ringForm));
    const complete = smoothstep(phaseProgress(progress.value, PHASE.ringComplete));
    return {
      strokeDashoffset: circumference * (1 - t),
      opacity: 0.35 + t * 0.5 + complete * 0.15,
    };
  });

  const rippleProps = useAnimatedProps(() => {
    const t = smoothstep(phaseProgress(progress.value, PHASE.ringComplete));
    return {
      r: radius * (0.92 + t * 0.22),
      opacity: (1 - t) * 0.14,
    };
  });

  const glowProps = useAnimatedProps(() => {
    const form = smoothstep(phaseProgress(progress.value, PHASE.ringForm));
    return { opacity: 0.1 + form * 0.22 };
  });

  const floorProps = useAnimatedProps(() => {
    const car = smoothstep(phaseProgress(progress.value, PHASE.carReveal));
    return { opacity: car * 0.35 };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={SCREEN_W} height={SCREEN_H}>
        <AnimatedEllipse
          cx={centerX}
          cy={centerY + radius * 0.75}
          rx={radius * 1.15}
          ry={radius * 0.35}
          fill="rgba(148, 163, 184, 0.2)"
          animatedProps={floorProps}
        />

        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          r={radius * 1.08}
          fill="rgba(34, 211, 238, 0.25)"
          animatedProps={glowProps}
        />

        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="rgba(6, 182, 212, 0.12)"
          animatedProps={rippleProps}
        />

        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          r={radius}
          stroke="#06B6D4"
          strokeWidth={4.5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={ringProps}
        />

        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          r={radius}
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={ringProps}
        />

        {particles.map((p, i) => (
          <Circle
            key={`mist-${i}`}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill="rgba(224, 242, 254, 0.85)"
            opacity={0.35}
          />
        ))}
      </Svg>
    </View>
  );
}
