import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useAppTheme();
  const isIos = Platform.OS === 'ios';

  // Compute exact bottom padding matching device home bar without extra empty space
  const bottomPadding = isIos ? Math.max(insets.bottom, 12) : 8;
  const tabHeight = 52 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? '#64748B' : '#777777',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderTopColor: isDark ? '#334155' : '#E0F2FE',
          borderTopWidth: 1.5,
          height: tabHeight,
          paddingTop: 6,
          paddingBottom: bottomPadding,
          elevation: 8,
          shadowColor: '#0284C7',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.2 : 0.06,
          shadowRadius: 6,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 1,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={20} name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="locations"
        options={{
          title: 'Địa điểm',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={20} name={focused ? 'map' : 'map-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="homestays"
        options={{
          title: 'Homestay',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={20} name={focused ? 'bed' : 'bed-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Đặt phòng',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={20} name={focused ? 'cart' : 'cart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={20} name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
