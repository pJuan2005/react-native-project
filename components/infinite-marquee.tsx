import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const isWeb = Platform.OS === 'web';
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Duplicate items 4 times to ensure seamless infinite loop
  const marqueeItems = [...items, ...items, ...items, ...items];

  useEffect(() => {
    if (isWeb) return; // Web uses CSS keyframes for 100% uninterrupted animation

    const startAnimation = () => {
      animatedValue.setValue(0);
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: reverse ? 1 : -1,
          duration: speed * 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    startAnimation();
  }, [animatedValue, speed, reverse, isWeb]);

  // Inject CSS Keyframes on Web so it NEVER pauses even when switching browser tabs
  useEffect(() => {
    if (isWeb && typeof document !== 'undefined') {
      const styleId = 'infinite-marquee-styles';
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
          .marquee-left {
            animation: marqueeScrollLeft ${speed}s linear infinite !important;
            will-change: transform;
          }
          .marquee-right {
            animation: marqueeScrollRight ${speed}s linear infinite !important;
            will-change: transform;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, [isWeb, speed]);

  const translateX = animatedValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-1200, 0, 1200],
  });

  return (
    <View style={styles.container}>
      {isWeb ? (
        <View
          // @ts-ignore
          className={reverse ? 'marquee-right' : 'marquee-left'}
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
              <Ionicons name={item.icon} size={14} color="#0284C7" />
              <Text style={styles.itemText}>{item.text}</Text>
              {item.badge && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: item.badgeColor || '#0284C7' },
                  ]}
                >
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <Text style={styles.dotSeparator}>•</Text>
            </View>
          ))}
        </View>
      ) : (
        <Animated.View
          style={[
            styles.row,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {marqueeItems.map((item, index) => (
            <View key={index} style={styles.itemPill}>
              <Ionicons name={item.icon} size={14} color="#0284C7" />
              <Text style={styles.itemText}>{item.text}</Text>
              {item.badge && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: item.badgeColor || '#0284C7' },
                  ]}
                >
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <Text style={styles.dotSeparator}>•</Text>
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
    backgroundColor: '#E0F2FE',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#BAE6FD',
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
    color: '#0369A1',
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
    color: '#7DD3FC',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '900',
  },
});
