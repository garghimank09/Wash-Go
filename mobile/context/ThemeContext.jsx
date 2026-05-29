import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../constants/theme';
import {
  isValidThemePreference,
  loadThemePreference,
  saveThemePreference,
} from '../lib/themePreferenceStore';

const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  themePreference: 'system',
  themeScope: { portal: null, userId: null },
  setThemePreference: () => {},
  setThemeScope: () => {},
});

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState('system');
  const [themeScope, setThemeScopeState] = useState({
    portal: null,
    userId: null,
  });
  const [isScopeReady, setIsScopeReady] = useState(false);
  const scopeKeyRef = useRef('');
  const themeScopeRef = useRef({ portal: null, userId: null });

  const setThemeScope = useCallback(async (portal, userId) => {
    const nextKey =
      portal && userId != null && userId !== ''
        ? `${portal}:${userId}`
        : '';

    if (nextKey === scopeKeyRef.current) return;
    scopeKeyRef.current = nextKey;

    const scope = { portal: portal ?? null, userId: userId ?? null };
    themeScopeRef.current = scope;
    setThemeScopeState(scope);

    if (!portal || userId == null || userId === '') {
      setThemePreferenceState('system');
      setIsScopeReady(true);
      return;
    }

    const saved = await loadThemePreference(portal, userId);
    setThemePreferenceState(saved);
    setIsScopeReady(true);
  }, []);

  const setThemePreference = useCallback(
    async (preference) => {
      if (!isValidThemePreference(preference)) return;

      setThemePreferenceState(preference);

      const { portal, userId } = themeScopeRef.current;
      if (portal && userId) {
        await saveThemePreference(portal, userId, preference);
      }
    },
    [],
  );

  const isDark =
    themePreference === 'system'
      ? systemColorScheme === 'dark'
      : themePreference === 'dark';

  const theme = isScopeReady
    ? isDark
      ? darkTheme
      : lightTheme
    : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: isScopeReady ? isDark : false,
        themePreference,
        themeScope,
        setThemePreference,
        setThemeScope,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
