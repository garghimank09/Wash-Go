import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeContext';

const ToastContext = createContext(null);

const TONES = {
  info: {
    bgLight: '#0f172a',
    bgDark: '#e2e8f0',
    fgLight: '#f8fafc',
    fgDark: '#0f172a',
  },
  success: {
    bgLight: '#065f46',
    bgDark: '#34d399',
    fgLight: '#ecfdf5',
    fgDark: '#022c22',
  },
  error: {
    bgLight: '#7f1d1d',
    bgDark: '#fca5a5',
    fgLight: '#fef2f2',
    fgDark: '#450a0a',
  },
};

const DEFAULT_DURATION_MS = 3200;

let toastSeed = 0;
const nextId = () => {
  toastSeed += 1;
  return toastSeed;
};

/**
 * Minimal toast system. Renders at most one toast at a time at the bottom of
 * the screen with the opacity-and-translate motion that the rest of the
 * partner UI uses (no bouncy springs).
 */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const show = useCallback((message, options = {}) => {
    if (!message) return null;
    const id = nextId();
    const tone = options.tone || 'info';
    const duration = options.duration ?? DEFAULT_DURATION_MS;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ id, message: String(message), tone });
    timeoutRef.current = setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
      timeoutRef.current = null;
    }, duration);
    return id;
  }, []);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const value = useMemo(
    () => ({
      show,
      dismiss,
      success: (msg, opts) => show(msg, { ...opts, tone: 'success' }),
      error: (msg, opts) => show(msg, { ...opts, tone: 'error' }),
      info: (msg, opts) => show(msg, { ...opts, tone: 'info' }),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toast={toast} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toast }) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  if (!toast) return null;

  const palette = TONES[toast.tone] || TONES.info;
  const bg = isDark ? palette.bgDark : palette.bgLight;
  const fg = isDark ? palette.fgDark : palette.fgLight;

  return (
    <View pointerEvents="none" style={[styles.viewport, { bottom: insets.bottom + 28 }]}>
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: 12 }}
        transition={{ type: 'timing', duration: 200 }}
        style={[styles.toast, { backgroundColor: bg }]}
      >
        <Text style={[styles.text, { color: fg }]} numberOfLines={3}>
          {toast.message}
        </Text>
      </MotiView>
    </View>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  toast: {
    maxWidth: 380,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
    textAlign: 'center',
  },
});
