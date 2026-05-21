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

/** Subtle micro-droplets — luxury water studio, not oversized bubbles. */
const DROPLETS = [
  { x: 0.18, y: 0.22, s: 3, d: 0 },
  { x: 0.42, y: 0.38, s: 2, d: 400 },
  { x: 0.68, y: 0.28, s: 4, d: 800 },
  { x: 0.32, y: 0.52, s: 2, d: 1200 },
  { x: 0.55, y: 0.48, s: 3, d: 600 },
  { x: 0.78, y: 0.42, s: 2, d: 1500 },
  { x: 0.24, y: 0.62, s: 3, d: 2000 },
  { x: 0.62, y: 0.58, s: 2, d: 900 },
];

function Droplet({ config, parallax, reduceMotion, panelW, panelH }) {
  const phase = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    phase.value = withDelay(
      config.d,
      withRepeat(
        withTiming(1, {
          duration: ROLE_MOTION.duration.ambientLoop + config.d,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
        true,
      ),
    );
  }, [config, phase, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.12 + phase.value * 0.22,
    transform: [
      { translateY: -phase.value * 10 },
      { translateX: parallax ? parallax.value * 8 * (config.x - 0.5) : 0 },
    ],
  }));

  const left = panelW * config.x;
  const top = panelH * config.y;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.droplet,
        {
          left,
          top,
          width: config.s,
          height: config.s,
          borderRadius: config.s / 2,
          backgroundColor: ROLE_PALETTE.customer.droplet,
        },
        style,
      ]}
    />
  );
}

function AmbientDropletLayerImpl({ parallax, reduceMotion, width, height, intensity }) {
  const items = useMemo(() => DROPLETS, []);
  const ready = width > 0 && height > 0;

  // Hooks must run every render — never return before useAnimatedStyle.
  const layerOpacity = useAnimatedStyle(() => ({
    opacity: 0.18 + (intensity ? intensity.value * 0.22 : 0),
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, layerOpacity]}>
      {ready
        ? items.map((config, i) => (
            <Droplet
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
  droplet: {
    position: 'absolute',
  },
});

const AmbientDropletLayer = memo(AmbientDropletLayerImpl);
export default AmbientDropletLayer;
