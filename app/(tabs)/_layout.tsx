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

  // Đảm bảo đủ chiều cao hiển thị trọn vẹn cả Icon và Text nhãn, không bao giờ bị cắt hay che mất:
  // - Trên iOS có Home Indicator (insets.bottom ~ 34px): thêm padding đệm đáy tránh thanh gạt iOS
  // - Trên Web / Android (insets.bottom = 0): chiều cao 60px chuẩn gọn gàng, đệm đáy 4px
  const isIos = Platform.OS === 'ios';
  const bottomInset = insets.bottom > 0 ? insets.bottom : (isIos ? 24 : 0);
  const tabHeight = 60 + bottomInset;

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
          paddingTop: 4,
          paddingBottom: insets.bottom > 0 ? insets.bottom - 4 : (isIos ? 16 : 4),
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
          fontSize: 11,
          fontWeight: '700',
          lineHeight: 14,
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
