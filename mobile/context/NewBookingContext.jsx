import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@washgo_new_booking_draft';
const STEP_ORDER = ['vehicle', 'package', 'schedule', 'review'];

const initialForm = {
  carId: null,
  packageId: 'super_deluxe',
  vehicleSize: 'sedan',
  address: '',
  latitude: null,
  longitude: null,
  scheduledAt: null,
  priceCents: null,
  currency: 'INR',
};

const NewBookingContext = createContext(null);

export function NewBookingProvider({ children }) {
  const [form, setForm] = useState(initialForm);
  const [lastStep, setLastStepState] = useState('vehicle');
  const [hydrated, setHydrated] = useState(false);
  const writeTimeout = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            if (parsed.form) setForm({ ...initialForm, ...parsed.form });
            if (parsed.lastStep && STEP_ORDER.includes(parsed.lastStep)) {
              setLastStepState(parsed.lastStep);
            }
          }
        } catch {
          // malformed draft — ignore
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

  const setFields = useCallback(
    (patch) => {
      setForm((prev) => {
        const next = { ...prev, ...patch };
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
    setLastStepState('vehicle');
    if (writeTimeout.current) clearTimeout(writeTimeout.current);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const hasDraft = useMemo(() => {
    if (!hydrated) return false;
    return Boolean(
      form.carId ||
        form.address ||
        form.scheduledAt ||
        (form.packageId && form.packageId !== 'super_deluxe') ||
        (form.vehicleSize && form.vehicleSize !== 'sedan') ||
        form.latitude != null ||
        form.longitude != null
    );
  }, [form, hydrated]);

  const value = useMemo(
    () => ({
      form,
      setField,
      setFields,
      lastStep,
      setLastStep,
      reset,
      hasDraft,
      hydrated,
    }),
    [form, setField, setFields, lastStep, setLastStep, reset, hasDraft, hydrated]
  );

  return (
    <NewBookingContext.Provider value={value}>
      {children}
    </NewBookingContext.Provider>
  );
}

export function useNewBooking() {
  const ctx = useContext(NewBookingContext);
  if (!ctx) {
    throw new Error('useNewBooking must be used within NewBookingProvider');
  }
  return ctx;
}

export const NEW_BOOKING_STEPS = STEP_ORDER;
