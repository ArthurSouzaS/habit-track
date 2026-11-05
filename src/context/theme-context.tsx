import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { Colors, type ColorSchemeName, type ThemeColors } from '@/constants/theme';
import { loadThemePreference, saveThemePreference, type ThemePreference } from '@/storage/storage';

interface ThemeContextValue {
  preference: ThemePreference;
  scheme: ColorSchemeName;
  colors: ThemeColors;
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    loadThemePreference().then(setPreferenceState);
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const scheme: ColorSchemeName =
      preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
    return {
      preference,
      scheme,
      colors: Colors[scheme],
      setPreference: (pref) => {
        setPreferenceState(pref);
        saveThemePreference(pref).catch(() => {});
      },
    };
  }, [preference, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme precisa estar dentro de <AppThemeProvider>');
  return ctx;
}
