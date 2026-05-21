import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { CUSTOMER_LAYOUT } from '../../../constants/customerTheme';
import AppIcon from '../AppIcon';

export default function CustomerEmptyState({
  icon = 'inbox',
  title,
  body,
  action,
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: theme.customer.primaryBg }]}>
        <AppIcon name={icon} size={32} color={theme.accent.primary} />
      </View>
      <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
      {body ? (
        <Text style={[styles.body, { color: theme.text.secondary }]}>{body}</Text>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: CUSTOMER_LAYOUT.screenPadding + 12,
    paddingVertical: 40,
    gap: 10,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  body: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
  },
  action: {
    marginTop: 12,
    width: '100%',
    maxWidth: 280,
  },
});
