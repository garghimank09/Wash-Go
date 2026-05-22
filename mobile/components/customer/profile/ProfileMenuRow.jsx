import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import AppIcon from '../AppIcon';

export default function ProfileMenuRow({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  destructive = false,
  toggle,
  toggleValue,
  onToggleChange,
  last = false,
}) {
  const { theme } = useTheme();
  const c = theme.customer;

  const content = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: c.primaryBg }]}>
        <AppIcon
          name={icon}
          size={18}
          color={destructive ? theme.status.error : theme.accent.primary}
        />
      </View>
      <View style={styles.mid}>
        <Text
          style={[
            styles.label,
            { color: destructive ? theme.status.error : theme.text.primary },
          ]}
        >
          {label}
        </Text>
        {value ? (
          <Text style={[styles.value, { color: theme.text.muted }]} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
      </View>
      {toggle != null ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggleChange}
          trackColor={{ false: c.outlineVariant, true: theme.accent.primary }}
          thumbColor="#fff"
        />
      ) : showChevron && onPress ? (
        <AppIcon name="chevron-right" size={20} color={theme.text.muted} />
      ) : null}
    </>
  );

  if (onPress && !toggle) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.outlineVariant },
          pressed && { opacity: 0.88 },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.outlineVariant },
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mid: { flex: 1, gap: 2 },
  label: { fontSize: 15, fontWeight: '600' },
  value: { fontSize: 12, fontWeight: '500' },
});
