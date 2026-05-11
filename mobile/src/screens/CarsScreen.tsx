import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Loader } from '../components/Loader';
import { carsApi } from '../services/carsApi';
import { getApiErrorMessage } from '../services/api';
import type { Car } from '../types/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function CarsScreen() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [formErr, setFormErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await carsApi.list();
      setCars(data);
    } catch {
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onAdd = async () => {
    setFormErr(null);
    setSaving(true);
    try {
      const y = year.trim() ? parseInt(year, 10) : undefined;
      if (year.trim() && Number.isNaN(y)) {
        setFormErr('Year must be a number');
        setSaving(false);
        return;
      }
      await carsApi.create({
        make: make.trim(),
        model: model.trim(),
        year: y ?? null,
        license_plate: plate.trim(),
        color: color.trim() || null,
      });
      setMake('');
      setModel('');
      setYear('');
      setPlate('');
      setColor('');
      setModal(false);
      await load();
    } catch (e) {
      setFormErr(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (car: Car) => {
    Alert.alert('Remove car', `Delete ${car.make} ${car.model} (${car.license_plate})?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await carsApi.delete(car.id);
            await load();
          } catch (e) {
            Alert.alert('Could not delete', getApiErrorMessage(e));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <View style={styles.headerRow}>
        <Text style={styles.count}>{cars.length} vehicle{cars.length === 1 ? '' : 's'}</Text>
        <Pressable onPress={() => setModal(true)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add car</Text>
        </Pressable>
      </View>
      {loading ? (
        <Loader />
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={cars}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No cars yet. Add your first ride.</Text>}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>
                    {item.make} {item.model}
                  </Text>
                  <Text style={styles.meta}>
                    {item.license_plate}
                    {item.year ? ` · ${item.year}` : ''}
                    {item.color ? ` · ${item.color}` : ''}
                  </Text>
                </View>
                <Pressable onPress={() => onDelete(item)} hitSlop={12}>
                  <Text style={styles.delete}>Remove</Text>
                </Pressable>
              </View>
            </Card>
          )}
        />
      )}

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add vehicle</Text>
            <Input label="Make" value={make} onChangeText={setMake} containerStyle={styles.field} />
            <Input label="Model" value={model} onChangeText={setModel} containerStyle={styles.field} />
            <Input label="Year (optional)" keyboardType="number-pad" value={year} onChangeText={setYear} containerStyle={styles.field} />
            <Input label="License plate" autoCapitalize="characters" value={plate} onChangeText={setPlate} containerStyle={styles.field} />
            <Input label="Color (optional)" value={color} onChangeText={setColor} containerStyle={styles.field} />
            {formErr ? <Text style={styles.formErr}>{formErr}</Text> : null}
            <View style={styles.modalActions}>
              <Button title="Save vehicle" onPress={onAdd} loading={saving} />
              <View style={{ height: spacing.sm }} />
              <Button title="Cancel" variant="ghost" onPress={() => setModal(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  count: { color: colors.textMuted, fontWeight: '600' },
  addBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtnText: { color: colors.primary, fontWeight: '700' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  meta: { marginTop: 4, color: colors.textMuted, fontSize: 14 },
  delete: { color: colors.danger, fontWeight: '700', fontSize: 14 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  field: { marginBottom: spacing.sm },
  formErr: { color: colors.danger, marginBottom: spacing.sm },
  modalActions: { marginTop: spacing.md },
});
