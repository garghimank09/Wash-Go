import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@washgo_add_vehicle_draft';
const STEP_ORDER = ['intro', 'details', 'review'];

const initialForm = {
  make: '',
  model: '',
  year: '',
  license_plate: '',
  color: '',
};

const AddVehicleContext = createContext(null);

export function AddVehicleProvider({ children }) {
  const [form, setForm] = useState(initialForm);
  const [lastStep, setLastStepState] = useState('intro');
  const [hydrated, setHydrated] = useState(false);
  const writeTimeout = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            if (parsed.form) {
              setForm({ ...initialForm, ...parsed.form });
            }
            if (parsed.lastStep && STEP_ORDER.includes(parsed.lastStep)) {
              setLastStepState(parsed.lastStep);
            }
          }
        } catch {
          // ignore malformed drafts
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  const persist = useCallback((nextForm, nextStep) => {
    if (writeTimeout.current) clearTimeout(writeTimeout.current);
    writeTimeout.current = setTimeout(() => {
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ form: nextForm, lastStep: nextStep })
      ).catch(() => {});
    }, 200);
  }, []);

  const setField = useCallback(
    (field, value) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        persist(next, lastStep);
        return next;
      });
    },
    [lastStep, persist]
  );

  const setLastStep = useCallback(
    (step) => {
      if (!STEP_ORDER.includes(step)) return;
      setLastStepState(step);
      setForm((prev) => {
        persist(prev, step);
        return prev;
      });
    },
    [persist]
  );

  const reset = useCallback(() => {
    setForm(initialForm);
    setLastStepState('intro');
    if (writeTimeout.current) clearTimeout(writeTimeout.current);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const hasDraft = useMemo(() => {
    return (
      hydrated &&
      Boolean(
        form.make ||
          form.model ||
          form.year ||
          form.license_plate ||
          form.color
      )
    );
  }, [form, hydrated]);

  const value = useMemo(
    () => ({ form, setField, lastStep, setLastStep, reset, hasDraft, hydrated }),
    [form, setField, lastStep, setLastStep, reset, hasDraft, hydrated]
  );

  return (
    <AddVehicleContext.Provider value={value}>
      {children}
    </AddVehicleContext.Provider>
  );
}

export function useAddVehicle() {
  const ctx = useContext(AddVehicleContext);
  if (!ctx) {
    throw new Error('useAddVehicle must be used within AddVehicleProvider');
  }
  return ctx;
}
