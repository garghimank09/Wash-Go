import { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const DROPLET_COUNT = 12;

function buildDroplets() {
  const items = [];
  for (let i = 0; i < DROPLET_COUNT; i += 1) {
    const seed = (i * 97 + 13) % 1000;
    items.push({
      id: i,
      left: ((seed % 85) / 100) * SCREEN_W + SCREEN_W * 0.05,
      top: (((seed * 3) % 70) / 100) * SCREEN_H + SCREEN_H * 0.08,
      size: 3 + (seed % 3),
      opacity: 0.25 + (seed % 30) / 100,
    });
  }
  return items;
}

export default function StaticDropletField() {
  const droplets = useMemo(() => buildDroplets(), []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {droplets.map((d) => (
        <View
          key={d.id}
          style={[
            styles.droplet,
            {
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              borderRadius: d.size / 2,
              opacity: d.opacity,
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
    backgroundColor: 'rgba(34, 211, 238, 0.5)',
  },
});
