import React, { useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/contexts/ThemeContext';

interface MarqueeItem {
  icon: any;
  text: string;
  badge?: string;
  badgeColor?: string;
}

const DEFAULT_ITEMS: MarqueeItem[] = [
  { icon: 'flame', text: 'Đà Lạt giảm 30% mùa hoa', badge: 'HOT', badgeColor: '#EF4444' },
  { icon: 'water', text: 'Phú Quốc - Hồ bơi vô cực sát biển', badge: 'VIP', badgeColor: '#0284C7' },
  { icon: 'sparkles', text: 'Mã WELCOME10 giảm ngay 10%', badge: 'VOUCHER', badgeColor: '#D97706' },
  { icon: 'cloud-outline', text: 'Sa Pa - Săn mây thung lũng Mường Hoa', badge: 'NEW', badgeColor: '#10B981' },
  { icon: 'bulb-outline', text: 'Hội An - Tour đèn lồng & xe đạp miễn phí', badge: 'POPULAR', badgeColor: '#8B5CF6' },
  { icon: 'sunny', text: 'Nha Trang - Biệt thự ngắm hoàng hôn 180°', badge: 'TOP', badgeColor: '#0284C7' },
  { icon: 'star', text: 'Tích +100 điểm thưởng sau mỗi chuyến đi', badge: 'REWARD', badgeColor: '#F59E0B' },
];

export function InfiniteMarquee({
  items = DEFAULT_ITEMS,
  speed = 28,
  reverse = false,
}: {
  items?: MarqueeItem[];
  speed?: number;
  reverse?: boolean;
}) {
  const { isDark, colors } = useAppTheme();
  const isWeb = Platform.OS === 'web';

  // Duplicate items 4 times to ensure seamless infinite loop
  const marqueeItems = [...items, ...items, ...items, ...items];

  // Reanimated UI-thread shared value (Runs directly on native 60/120fps UI Thread, never pauses on theme switch)
  const offset = useSharedValue(0);

  useEffect(() => {
    if (isWeb) return;

    cancelAnimation(offset);
    offset.value = 0;

    const targetDistance = reverse ? 1000 : -1000;
    offset.value = withRepeat(
      withTiming(targetDistance, {
        duration: speed * 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    return () => {
      cancelAnimation(offset);
    };
  }, [speed, reverse, isWeb]);

  // Inject CSS Keyframes on Web for 100% background tab resilience
  useEffect(() => {
    if (isWeb && typeof document !== 'undefined') {
      const styleId = 'infinite-marquee-css-keyframes';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          @keyframes marqueeScrollLeft {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          @keyframes marqueeScrollRight {
            0% { transform: translate3d(-50%, 0, 0); }
            100% { transform: translate3d(0, 0, 0); }
          }
          .marquee-scroll-left {
            animation: marqueeScrollLeft ${speed}s linear infinite !important;
            will-change: transform;
          }
          .marquee-scroll-right {
            animation: marqueeScrollRight ${speed}s linear infinite !important;
            will-change: transform;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, [isWeb, speed]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });

  const containerBg = isDark ? '#1C2541' : '#E0F2FE';
  const containerBorder = isDark ? '#334155' : '#BAE6FD';
  const itemTextColor = isDark ? '#38BDF8' : '#0369A1';
  const iconColor = isDark ? '#38BDF8' : '#0284C7';
  const dotColor = isDark ? '#64748B' : '#7DD3FC';

  return (
    <View style={[styles.container, { backgroundColor: containerBg, borderColor: containerBorder }]}>
      {isWeb ? (
        <View
          // @ts-ignore
          className={reverse ? 'marquee-scroll-right' : 'marquee-scroll-left'}
          style={[
            styles.row,
            {
              // @ts-ignore
              animation: `${reverse ? 'marqueeScrollRight' : 'marqueeScrollLeft'} ${speed}s linear infinite`,
              display: 'flex',
            },
          ]}
        >
          {marqueeItems.map((item, index) => (
            <View key={index} style={styles.itemPill}>
              <Ionicons name={item.icon} size={14} color={iconColor} />
              <Text style={[styles.itemText, { color: itemTextColor }]}>{item.text}</Text>
              {item.badge && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: item.badgeColor || colors.primary },
                  ]}
                >
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <Text style={[styles.dotSeparator, { color: dotColor }]}>•</Text>
            </View>
          ))}
        </View>
      ) : (
        <Animated.View style={[styles.row, animatedStyle]}>
          {marqueeItems.map((item, index) => (
            <View key={index} style={styles.itemPill}>
              <Ionicons name={item.icon} size={14} color={iconColor} />
              <Text style={[styles.itemText, { color: itemTextColor }]}>{item.text}</Text>
              {item.badge && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: item.badgeColor || colors.primary },
                  ]}
                >
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <Text style={[styles.dotSeparator, { color: dotColor }]}>•</Text>
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 3800,
  },
  itemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    flexShrink: 0,
  },
  itemText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  dotSeparator: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '900',
  },
});
