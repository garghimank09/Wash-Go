import { Pressable, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getCardSurfaceStyle } from '../../lib/cardSurfaceStyle';

/**
 * Clipped card container with platform-safe shadow (iOS) or hairline border (Android).
 */
export default function CardSurface({
  children,
  style,
  borderRadius = 22,
  backgroundColor,
  shadow = 'soft',
  portal = 'customer',
  onPress,
  disabled = false,
  withBorder = true,
  accessibilityLabel,
}) {
  const { theme, isDark } = useTheme();

  const surfaceStyle = getCardSurfaceStyle(theme, {
    borderRadius,
    backgroundColor,
    shadow,
    portal,
    isDark,
    withBorder,
  });

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [surfaceStyle, style, pressed && { opacity: 0.94 }]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[surfaceStyle, style]}>{children}</View>;
}
