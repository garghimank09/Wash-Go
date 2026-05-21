import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { CUSTOMER_LAYOUT, getCustomerShadow } from '../../../constants/customerTheme';

export default function CustomerCard({ children, style, active, padding = 16 }) {
  const { theme, isDark } = useTheme();
  const shadows = getCustomerShadow(isDark);

  return (
    <View
      style={[
        styles.card,
        shadows.rim,
        {
          backgroundColor: theme.customer.surfaceContainerLowest,
          borderColor: active ? theme.accent.primary : theme.customer.outlineVariant,
          borderWidth: active ? 1.5 : 1,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: CUSTOMER_LAYOUT.card.radius,
    overflow: 'hidden',
  },
});
