import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ROLE_PALETTE } from '../../constants/roleSelectionTheme';
import { ROLE_MOTION } from '../../constants/roleSelectionMotion';

/** Soft atmospheric mist + micro cyan sparks — no oversized blobs. */
const PARTICLES = [
  { x: 0.72, y: 0.2, s: 48, kind: 'mist', d: 0 },
  { x: 0.28, y: 0.34, s: 36, kind: 'mist', d: 700 },
  { x: 0.58, y: 0.46, s: 42, kind: 'mist', d: 1400 },
  { x: 0.38, y: 0.24, s: 3, kind: 'spark', d: 200 },
  { x: 0.52, y: 0.38, s: 2, kind: 'spark', d: 900 },
  { x: 0.66, y: 0.32, s: 3, kind: 'spark', d: 1600 },
  { x: 0.44, y: 0.52, s: 2, kind: 'spark', d: 1100 },
];

function Particle({ config, parallax, reduceMotion, panelW, panelH }) {
  const phase = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    phase.value = withDelay(
      config.d,
      withRepeat(
        withTiming(1, {
          duration: ROLE_MOTION.duration.ambientLoop + config.d * 0.8,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
        true,
      ),
    );
  }, [config, phase, reduceMotion]);

  const isMist = config.kind === 'mist';
  const style = useAnimatedStyle(() => ({
    opacity: isMist
      ? 0.08 + phase.value * 0.14
      : 0.25 + phase.value * 0.35,
    transform: [
      { translateY: isMist ? -phase.value * 6 : -phase.value * 12 },
      { translateX: parallax ? -parallax.value * 6 * (config.x - 0.5) : 0 },
      { scale: isMist ? 0.96 + phase.value * 0.08 : 1 },
    ],
  }));

  const bg = isMist ? ROLE_PALETTE.partner.mist : ROLE_PALETTE.partner.spark;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: panelW * config.x - config.s / 2,
          top: panelH * config.y,
          width: config.s,
          height: config.s,
          borderRadius: config.s / 2,
          backgroundColor: bg,
        },
        style,
      ]}
    />
  );
}

function AmbientMistLayerImpl({ parallax, reduceMotion, width, height, intensity }) {
  const items = useMemo(() => PARTICLES, []);
  const ready = width > 0 && height > 0;

  // Hooks must run every render — never return before useAnimatedStyle.
  const layerOpacity = useAnimatedStyle(() => ({
    opacity: 0.2 + (intensity ? intensity.value * 0.25 : 0),
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, layerOpacity]}>
      {ready
        ? items.map((config, i) => (
            <Particle
              key={i}
              config={config}
              parallax={parallax}
              reduceMotion={reduceMotion}
              panelW={width}
              panelH={height}
            />
          ))
        : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});

const AmbientMistLayer = memo(AmbientMistLayerImpl);
export default AmbientMistLayer;
