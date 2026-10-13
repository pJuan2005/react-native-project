import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import 'react-native-reanimated';

// Bỏ qua các lỗi crash không mong muốn từ Chrome Extension trình duyệt bên thứ 3 (ví dụ 200.js / M_ID)
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event: any) => {
    const reason = event.reason;
    const str = String((reason && (reason.stack || reason.message)) || reason || '');
    if (str.includes('chrome-extension://') || str.includes('M_ID')) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  }, true);

  window.addEventListener('error', (event: any) => {
    const filename = event.filename || '';
    const message = String(event.message || '');
    const stack = event.error ? String(event.error.stack || '') : '';
    if (
      filename.includes('chrome-extension://') ||
      message.includes('M_ID') ||
      stack.includes('chrome-extension://')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  }, true);
}

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { BookingProvider } from '@/contexts/BookingContext';
import { ThemeProvider, useAppTheme } from '@/contexts/ThemeContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function NavigationGate() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark, colors } = useAppTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main tabs if already authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="homestay/[id]" />
        <Stack.Screen name="location/[id]" />
        <Stack.Screen name="bookings" />
        <Stack.Screen name="wallet" />
        <Stack.Screen name="bank-accounts" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="dispute/[id]" />
        <Stack.Screen name="disputes" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'auto'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BookingProvider>
          <NavigationGate />
        </BookingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
