import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  ImageBackground,
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
import { mockLocations, mockHomestays, Homestay } from '@/constants/mockData';
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
        {/* HERO BANNER VỚI ẢNH BACKGROUND */}
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80',
          }}
          style={styles.heroBackground}
          imageStyle={styles.heroBackgroundImage}
        >
          {/* Overlay Gradient Soft Green/Dark */}
          <View style={styles.heroOverlay}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <View style={styles.userInfoRow}>
                <Pressable style={styles.avatarBorder} onPress={() => router.push('/users')}>
                  <ProductImage
                    uri={userProfile.avatar}
                    style={styles.headerAvatar}
                    containerStyle={styles.headerAvatar}
                  />
                </Pressable>
                <View>
                  <Text style={styles.greetingText}>Xin chào, {userProfile.name} 👋</Text>
                  <Text style={styles.subGreetingText}>Tìm homestay lý tưởng của bạn</Text>
                </View>
              </View>

              <Pressable style={styles.cartIconBtn} onPress={() => router.push('/bookings')}>
                <Ionicons name="cart-outline" size={22} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Slogan */}
            <View style={styles.sloganBox}>
              <Text style={styles.sloganTitle}>HOMESTAY BOOKING</Text>
              <Text style={styles.sloganSub}>Trải nghiệm không gian sống và văn hóa bản địa</Text>
            </View>

            {/* Search Bar in Hero */}
            <Pressable style={styles.searchBox} onPress={() => router.push('/homestays')}>
              <Ionicons name="search" size={18} color="#4EBA87" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Tìm kiếm homestay, địa điểm..."
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
        </ImageBackground>

        {/* PROMOTION / DISCOUNT CAMPAIGN BANNER */}
        <View style={styles.promoBannerContainer}>
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
            }}
            style={styles.promoBanner}
            imageStyle={styles.promoBannerImage}
          >
            <View style={styles.promoOverlay}>
              <View style={styles.promoTag}>
                <Ionicons name="sparkles" size={13} color="#FFFFFF" />
                <Text style={styles.promoTagText}>ƯU ĐÃI NGHỈ DƯỠNG</Text>
              </View>
              <Text style={styles.promoHeading}>Giảm tới 30% Đặt Trước 🎉</Text>
              <Text style={styles.promoSub}>
                Nhập mã <Text style={styles.promoCode}>WELCOME10</Text> giảm thêm 10% cho khách mới
              </Text>
              <Pressable style={styles.promoBtn} onPress={() => router.push('/homestays')}>
                <Text style={styles.promoBtnText}>Đặt phòng ngay</Text>
                <Ionicons name="arrow-forward" size={14} color="#2D6A4F" />
              </Pressable>
            </View>
          </ImageBackground>
        </View>

        {/* SECTION 1: DÀNH CHO BẠN (Phong cách Book Shop) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dành cho bạn</Text>
          <Pressable onPress={() => router.push('/homestays')}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCardsList}
        >
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

        {/* SECTION 2: KHÁM PHÁ ĐỊA ĐIỂM */}
        <View style={[styles.sectionHeader, { marginTop: 22 }]}>
          <Text style={styles.sectionTitle}>Khám phá địa điểm</Text>
          <Pressable onPress={() => router.push('/locations')}>
            <Text style={styles.viewAllText}>Tất cả ({mockLocations.length})</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.locationPillsList}
        >
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
        <View style={[styles.sectionHeader, { marginTop: 22 }]}>
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
  // Hero Banner Background
  heroBackground: {
    width: '100%',
    backgroundColor: '#2D6A4F',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  heroBackgroundImage: {
    opacity: 0.35,
  },
  heroOverlay: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: 'rgba(45, 106, 79, 0.75)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBorder: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greetingText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subGreetingText: {
    fontSize: 11,
    color: '#D8F3DC',
    marginTop: 1,
  },
  cartIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sloganBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sloganTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  sloganSub: {
    fontSize: 12,
    color: '#D8F3DC',
    marginTop: 3,
    textAlign: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 46,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#2D6A4F',
    fontWeight: '600',
  },
  // Promotion Banner
  promoBannerContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  promoBanner: {
    width: '100%',
    backgroundColor: '#1B4332',
  },
  promoBannerImage: {
    opacity: 0.45,
  },
  promoOverlay: {
    padding: 16,
    backgroundColor: 'rgba(27, 67, 50, 0.75)',
  },
  promoTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4EBA87',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  promoTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  promoHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  promoSub: {
    fontSize: 12,
    color: '#D8F3DC',
    marginTop: 3,
  },
  promoCode: {
    fontWeight: '800',
    color: '#FFE066',
  },
  promoBtn: {
    alignSelf: 'flex-start',
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  promoBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2D6A4F',
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4EBA87',
  },
  // Horizontal List
  horizontalCardsList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
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
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    height: 135,
    backgroundColor: '#E8F5E9',
  },
  cardImage: {
    width: '100%',
    height: 135,
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
