import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import {
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

/**
 * AnimatedCounter — counts from 0 (or `from`) to `value` over `duration` ms.
 * `format(n)` controls display; default is integer.
 */
export default function AnimatedCounter({
  value,
  from = 0,
  duration = 900,
  style,
  format,
  prefix = '',
  suffix = '',
}) {
  const sv = useSharedValue(from);
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    sv.value = from;
    sv.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, from, duration, sv]);

  useAnimatedReaction(
    () => sv.value,
    (current) => {
      runOnJS(setDisplay)(current);
    },
    [sv]
  );

  const text = format ? format(display) : Math.round(display).toLocaleString();
  return (
    <Text style={style} numberOfLines={1}>
      {prefix}
      {text}
      {suffix}
    </Text>
  );
}
