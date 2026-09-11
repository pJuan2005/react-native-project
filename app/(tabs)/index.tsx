import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ProductImage } from '@/components/product-image';
import { formatPrice, mockLocations, mockHomestays, Homestay } from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const { userProfile, savedHomestays, toggleSavedHomestay } = useBooking();

  const forYouList = useMemo(
    () =>
      mockHomestays.filter((h) =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.location.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const featuredList = useMemo(() => mockHomestays.filter((h) => h.isFeatured), []);
  const newestList = useMemo(() => mockHomestays.filter((h) => h.isNew), []);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* GREEN TOP APP BAR */}
        <View style={styles.topAppBar}>
          <Pressable style={styles.appBarIconBtn} onPress={() => router.push('/users')}>
            <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.appBarTitle}>HOMESTAY BOOKING</Text>
          <Pressable style={styles.appBarIconBtn} onPress={() => router.push('/bookings')}>
            <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* HERO GREEN DOME CURVE (Phong cách Book Shop) */}
        <View style={styles.heroDomeWrapper}>
          <View style={styles.heroDome}>
            {/* Travel Illustration Graphics */}
            <View style={styles.heroIllustrationBox}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
                }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.heroBadge}>
                <Ionicons name="sparkles" size={14} color="#F59E0B" />
                <Text style={styles.heroBadgeText}>Nghỉ dưỡng 2026</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SEARCH BAR (Tối giản phong cách classic) */}
        <View style={styles.searchSection}>
          <Pressable style={styles.searchBox} onPress={() => router.push('/homestays')}>
            <Ionicons name="search" size={20} color="#4EBA87" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm kiếm homestay..."
              placeholderTextColor="#52B788"
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} hitSlop={6}>
                <Ionicons name="close-circle-outline" size={18} color="#88D49E" />
              </Pressable>
            )}
          </Pressable>
        </View>

        {/* SECTION 1: DÀNH CHO BẠN (Cards phong cách Book Shop) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dành cho bạn</Text>
          <Pressable onPress={() => router.push('/homestays')}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCardsList}>
          {forYouList.slice(0, 5).map((homestay) => {
            const isSaved = savedHomestays.some((s) => s.id === homestay.id);
            return (
              <BookShopCard
                key={homestay.id}
                homestay={homestay}
                isSaved={isSaved}
                onToggleSave={() => {
                  const nowSaved = toggleSavedHomestay(homestay);
                  if (nowSaved) {
                    Alert.alert('Đã lưu yêu thích ❤️', `${homestay.name} đã được thêm vào danh sách yêu thích.`);
                  } else {
                    Alert.alert('Đã bỏ lưu 💔', `${homestay.name} đã được xóa khỏi danh sách yêu thích.`);
                  }
                }}
              />
            );
          })}
        </ScrollView>

        {/* SECTION 2: ĐIỂM ĐẾN PHỔ BIẾN */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Khám phá địa điểm</Text>
          <Pressable onPress={() => router.push('/locations')}>
            <Text style={styles.viewAllText}>Tất cả ({mockLocations.length})</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.locationPillsList}>
          {mockLocations.map((loc) => (
            <Pressable
              key={loc.id}
              style={styles.locationPill}
              onPress={() => router.push({ pathname: '/location/[id]' as any, params: { id: loc.id } })}
            >
              <ProductImage uri={loc.image} style={styles.locThumb} containerStyle={styles.locThumb} />
              <View>
                <Text style={styles.locName}>{loc.name}</Text>
                <Text style={styles.locCount}>{loc.homestayCount} chỗ nghỉ</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* SECTION 3: HOMESTAY NỔI BẬT (Grid 2 cột) */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Homestay nổi bật</Text>
          <Pressable onPress={() => router.push('/homestays')}>
            <Text style={styles.viewAllText}>Xem thêm</Text>
          </Pressable>
        </View>

        <View style={styles.gridContainer}>
          {featuredList.map((homestay) => {
            const isSaved = savedHomestays.some((s) => s.id === homestay.id);
            return (
              <View key={homestay.id} style={styles.gridCardWrapper}>
                <BookShopCard
                  homestay={homestay}
                  isSaved={isSaved}
                  cardWidth="100%"
                  onToggleSave={() => {
                    const nowSaved = toggleSavedHomestay(homestay);
                    if (nowSaved) {
                      Alert.alert('Đã lưu yêu thích ❤️', `${homestay.name} đã được thêm vào danh sách yêu thích.`);
                    } else {
                      Alert.alert('Đã bỏ lưu 💔', `${homestay.name} đã được xóa khỏi danh sách yêu thích.`);
                    }
                  }}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Card phong cách Book Shop cổ điển
function BookShopCard({
  homestay,
  isSaved,
  cardWidth = 165,
  onToggleSave,
}: {
  homestay: Homestay;
  isSaved: boolean;
  cardWidth?: number | string;
  onToggleSave: () => void;
}) {
  return (
    <Pressable
      style={[styles.card, { width: cardWidth as any }]}
      onPress={() => router.push({ pathname: '/homestay/[id]' as any, params: { id: homestay.id } })}
    >
      {/* Image container */}
      <View style={styles.cardImageContainer}>
        <ProductImage uri={homestay.images[0]} style={styles.cardImage} containerStyle={styles.cardImage} />
        {homestay.oldPrice && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleText}>-{Math.round((1 - homestay.price / homestay.oldPrice) * 100)}%</Text>
          </View>
        )}
        <Pressable
          style={[styles.heartIconBtn, isSaved && styles.heartIconBtnSaved]}
          onPress={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          hitSlop={6}
        >
          <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={17} color={isSaved ? '#EF4444' : '#64748B'} />
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.cardBody}>
        <Text numberOfLines={2} style={styles.bookTitle}>
          {homestay.name}
        </Text>
        <Text style={styles.authorSubtitle}>by {homestay.location}</Text>
        <Text style={styles.priceLabel}>
          price: <Text style={styles.priceValue}>{new Intl.NumberFormat('vi-VN').format(homestay.price)} Đ</Text>
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  content: {
    paddingBottom: 30,
  },
  // Top App Bar
  topAppBar: {
    height: 54,
    backgroundColor: '#4EBA87',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  appBarTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  appBarIconBtn: {
    padding: 6,
  },
  // Hero Green Dome Curve
  heroDomeWrapper: {
    backgroundColor: '#F8FAF8',
    overflow: 'hidden',
  },
  heroDome: {
    backgroundColor: '#4EBA87',
    height: 150,
    borderBottomLeftRadius: width / 2,
    borderBottomRightRadius: width / 2,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scaleX: 1.2 }],
    paddingBottom: 10,
  },
  heroIllustrationBox: {
    transform: [{ scaleX: 0.83 }],
    alignItems: 'center',
  },
  heroImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  // Search Bar
  searchSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#4EBA87',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 46,
    width: '100%',
    shadowColor: '#4EBA87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#2D6A4F',
    fontWeight: '600',
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4EBA87',
  },
  // Horizontal List
  horizontalCardsList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 6,
  },
  // Book Shop Card Style
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8F5E9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    backgroundColor: '#E8F5E9',
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  saleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  heartIconBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIconBtnSaved: {
    backgroundColor: '#FEF2F2',
  },
  cardBody: {
    padding: 10,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 18,
    minHeight: 36,
  },
  authorSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 4,
  },
  priceValue: {
    fontWeight: '700',
    color: '#111827',
  },
  // Locations Pills
  locationPillsList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8F3DC',
  },
  locThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  locName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  locCount: {
    fontSize: 10,
    color: '#6B7280',
  },
  // Grid Container
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    rowGap: 12,
  },
  gridCardWrapper: {
    width: '48.5%',
  },
});
