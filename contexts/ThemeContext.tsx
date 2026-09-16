import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

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
  };
};

const THEME_STORAGE_KEY = 'HOMESTAY_THEME_MODE';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  // Load saved theme from localStorage on Web
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          setThemeModeState(saved);
        }
      }
    } catch (e) {
      console.warn('Error reading theme mode from storage:', e);
    }
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(THEME_STORAGE_KEY, mode);
      }
    } catch (e) {
      console.warn('Error saving theme mode to storage:', e);
    }
  };

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

  const colors = isDark
    ? {
        background: '#0F172A',
        cardBackground: '#1E293B',
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        primary: '#38BDF8',
        primaryDark: '#0284C7',
        primaryLight: '#082F49',
        border: '#334155',
        cardBorder: '#334155',
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
