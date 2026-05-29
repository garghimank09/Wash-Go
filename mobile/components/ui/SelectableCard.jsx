import { Platform, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getSelectableCardStyle } from '../../lib/selectableCardStyle';

/**
 * Pressable card with Android-safe selected styling (solid fill, no scale).
 */
export default function SelectableCard({
  selected = false,
  onPress,
  children,
  style,
  contentStyle,
  borderRadius = 18,
  disabled = false,
  error = false,
  accessibilityLabel,
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={accessibilityLabel}
      android_ripple={
        Platform.OS === 'android'
          ? getSelectableCardStyle(theme, { selected, borderRadius }).androidRipple
          : undefined
      }
      style={({ pressed }) => [
        getSelectableCardStyle(theme, { selected, pressed, error, borderRadius }).container,
        style,
        contentStyle,
      ]}
    >
      {children}
    </Pressable>
  );
}
