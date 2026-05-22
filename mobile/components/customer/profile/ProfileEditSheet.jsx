import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { CUSTOMER_LAYOUT } from '../../../constants/customerTheme';
import CustomerPrimaryButton from '../ui/CustomerPrimaryButton';

export default function ProfileEditSheet({
  visible,
  fullName: initialName,
  phone: initialPhone,
  email,
  saving,
  onClose,
  onSave,
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.customer;
  const [fullName, setFullName] = useState(initialName || '');
  const [phone, setPhone] = useState(initialPhone || '');

  useEffect(() => {
    if (visible) {
      setFullName(initialName || '');
      setPhone(initialPhone || '');
    }
  }, [visible, initialName, initialPhone]);

  const handleSave = () => {
    onSave({
      full_name: fullName.trim(),
      phone: phone.trim() || null,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: c.surfaceContainerLowest,
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: c.outlineVariant }]} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Personal information</Text>
          <Text style={[styles.sub, { color: theme.text.muted }]}>
            Update your name and phone. Email is managed by your account.
          </Text>

          <Text style={[styles.fieldLabel, { color: theme.text.muted }]}>Full name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your name"
            placeholderTextColor={theme.text.muted}
            style={[
              styles.input,
              {
                color: theme.text.primary,
                borderColor: c.outlineVariant,
                backgroundColor: c.surfaceContainerLow,
              },
            ]}
          />

          <Text style={[styles.fieldLabel, { color: theme.text.muted }]}>Phone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Optional"
            placeholderTextColor={theme.text.muted}
            keyboardType="phone-pad"
            style={[
              styles.input,
              {
                color: theme.text.primary,
                borderColor: c.outlineVariant,
                backgroundColor: c.surfaceContainerLow,
              },
            ]}
          />

          <Text style={[styles.fieldLabel, { color: theme.text.muted }]}>Email</Text>
          <TextInput
            value={email || ''}
            editable={false}
            style={[
              styles.input,
              styles.inputDisabled,
              {
                color: theme.text.muted,
                borderColor: c.outlineVariant,
                backgroundColor: c.surfaceContainer,
              },
            ]}
          />

          <CustomerPrimaryButton
            label={saving ? 'Saving…' : 'Save profile'}
            onPress={handleSave}
            loading={saving}
            disabled={!fullName.trim() || saving}
            style={{ marginTop: 8 }}
          />
          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: theme.text.secondary }]}>Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  keyboard: { justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: CUSTOMER_LAYOUT.card.radiusLg,
    borderTopRightRadius: CUSTOMER_LAYOUT.card.radiusLg,
    paddingHorizontal: CUSTOMER_LAYOUT.screenPadding,
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  sub: { fontSize: 13, fontWeight: '500', marginTop: 6, marginBottom: 18, lineHeight: 19 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  inputDisabled: { opacity: 0.85 },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { fontSize: 15, fontWeight: '600' },
});
