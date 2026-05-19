import { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { MotiView } from 'moti';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const DROPLET_COUNT = 16;

function buildDroplets() {
  const items = [];
  for (let i = 0; i < DROPLET_COUNT; i += 1) {
    const seed = (i * 97 + 13) % 1000;
    items.push({
      id: i,
      left: ((seed % 85) / 100) * SCREEN_W + SCREEN_W * 0.05,
      top: (((seed * 3) % 70) / 100) * SCREEN_H + SCREEN_H * 0.08,
      size: 3 + (seed % 4),
      delay: 400 + (seed % 600),
      drift: ((seed % 20) - 10) * 0.5,
    });
  }
  return items;
}

export default function DropletField() {
  const droplets = useMemo(() => buildDroplets(), []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {droplets.map((d) => (
        <MotiView
          key={d.id}
          from={{ opacity: 0, translateY: 0 }}
          animate={{ opacity: 0.5, translateY: d.drift }}
          transition={{
            type: 'timing',
            duration: 3200,
            delay: d.delay,
            loop: true,
            repeatReverse: true,
          }}
          style={[
            styles.droplet,
            {
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              borderRadius: d.size / 2,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  droplet: {
    position: 'absolute',
    backgroundColor: 'rgba(34, 211, 238, 0.45)',
  },
});
