import { MaterialIcons } from '@expo/vector-icons';

export default function AppIcon({ name, size = 24, color, filled = false, style }) {
  const iconName = name.replace(/_/g, '-');
  return (
    <MaterialIcons
      name={iconName}
      size={size}
      color={color}
      style={[{ opacity: filled ? 1 : 1 }, style]}
    />
  );
}
