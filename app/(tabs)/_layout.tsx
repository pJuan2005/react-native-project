import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="locations"
        options={{
          title: 'Địa điểm',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="location-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="homestays"
        options={{
          title: 'Homestay',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Đặt phòng',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="calendar-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="person-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}