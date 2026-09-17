import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  colors: {
    background: string;
    cardBackground: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryDark: string;
    primaryLight: string;
    border: string;
    cardBorder: string;
    inputBg: string;
    headerBg: string;
  };
};

const THEME_STORAGE_KEY = '@homestay_theme_mode_v1';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  // Load saved theme from AsyncStorage (survives app reload / kill / device reboot)
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          setThemeModeState(saved as ThemeMode);
        }
      } catch (e) {
        console.warn('Error reading theme mode from AsyncStorage:', e);
      }
    })();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Error saving theme mode to AsyncStorage:', e);
    }
  };

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

  const colors = isDark
    ? {
        background: '#0B132B',
        cardBackground: '#1C2541',
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        primary: '#38BDF8',
        primaryDark: '#0284C7',
        primaryLight: '#1E3A8A',
        border: '#334155',
        cardBorder: '#334155',
        inputBg: '#1E293B',
        headerBg: '#0F172A',
      }
    : {
        background: '#F0F9FF',
        cardBackground: '#FFFFFF',
        text: '#0F172A',
        textSecondary: '#64748B',
        primary: '#0284C7',
        primaryDark: '#0369A1',
        primaryLight: '#E0F2FE',
        border: '#BAE6FD',
        cardBorder: '#E0F2FE',
        inputBg: '#FFFFFF',
        headerBg: '#FFFFFF',
      };

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within ThemeProvider');
  return context;
}
