import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import AppIcon from './AppIcon';

export default function PickerSheet({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = styles(theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={s.handle} />
        <View style={s.header}>
          <Text style={s.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12} style={s.closeBtn}>
            <AppIcon name="close" size={22} color={theme.text.secondary} />
          </Pressable>
        </View>
        <ScrollView
          style={{ maxHeight: 380 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.list}
        >
          {options.map((opt) => {
            const label = typeof opt === 'string' ? opt : opt.label;
            const key = typeof opt === 'string' ? opt : opt.value ?? opt.label;
            const isActive = value === label || value === key;
            return (
              <Pressable
                key={key}
                onPress={() => {
                  onSelect(label);
                  onClose();
                }}
                style={({ pressed }) => [
                  s.row,
                  isActive && s.rowActive,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[s.rowText, isActive && s.rowTextActive]}>{label}</Text>
                {isActive ? (
                  <AppIcon name="check" size={20} color={theme.accent.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.customer.surfaceContainerLowest,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: 8,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderColor: theme.customer.outlineVariant,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.customer.outlineVariant,
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    title: { fontSize: 16, fontWeight: '800', color: theme.text.primary, letterSpacing: -0.2 },
    closeBtn: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    list: { paddingVertical: 8 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: theme.radius.md,
      marginBottom: 4,
    },
    rowActive: {
      backgroundColor: theme.customer.primaryBg,
    },
    rowText: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.text.primary,
    },
    rowTextActive: {
      color: theme.accent.primary,
      fontWeight: '700',
    },
  });
