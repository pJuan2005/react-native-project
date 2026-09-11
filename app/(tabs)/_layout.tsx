import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const isIos = Platform.OS === 'ios';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4EBA87',
        tabBarInactiveTintColor: '#777777',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8F5E9',
          borderTopWidth: 1,
          height: isIos ? 90 : 74,
          paddingTop: 8,
          paddingBottom: isIos ? 30 : 14,
          elevation: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          lineHeight: 15,
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="locations"
        options={{
          title: 'Địa điểm',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? 'map' : 'map-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="homestays"
        options={{
          title: 'Homestay',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? 'bed' : 'bed-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Đặt phòng',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? 'cart' : 'cart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
