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

  // Đảm bảo đủ chiều cao hiển thị trọn vẹn cả Icon và Text nhãn, không bị che/cắt trên mọi thiết bị & web:
  // - Trên Web / Android / iOS không Home bar: đệm đáy 10px, tổng chiều cao 68px
  // - Trên iOS có Home bar (insets.bottom > 0, thường 34px): đệm đáy = insets.bottom, tổng chiều cao = 58 + insets.bottom (~92px)
  const isNativeIos = Platform.OS === 'ios';
  const bottomInset = insets.bottom > 0 ? insets.bottom : (isNativeIos ? 24 : 10);
  const tabHeight = 58 + bottomInset;

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
          paddingTop: 8,
          paddingBottom: bottomInset,
          elevation: 8,
          shadowColor: '#0284C7',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.2 : 0.06,
          shadowRadius: 6,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '700',
          marginTop: 2,
          marginBottom: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={21} name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="locations"
        options={{
          title: 'Địa điểm',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={21} name={focused ? 'map' : 'map-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="homestays"
        options={{
          title: 'Homestay',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={21} name={focused ? 'bed' : 'bed-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Đặt phòng',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={21} name={focused ? 'cart' : 'cart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={21} name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
