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
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
  FadeIn,
} from 'react-native-reanimated';
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
        {/* HERO BANNER - OCEAN BLUE & BACKGROUND PHONG CẢNH DU LỊCH */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
            }}
            style={styles.heroBackground}
            imageStyle={styles.heroBackgroundImage}
          >
            {/* Ocean Blue Overlay */}
            <View style={styles.heroOverlay}>
              {/* Top Bar Navigation */}
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

                <Pressable
                  style={styles.cartIconBtn}
                  onPress={() => router.push('/bookings')}
                  hitSlop={6}
                >
                  <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Brand Title & Ocean Theme */}
              <View style={styles.sloganBox}>
                <View style={styles.oceanBadge}>
                  <Ionicons name="water" size={13} color="#0284C7" />
                  <Text style={styles.oceanBadgeText}>Nghỉ dưỡng biển & sinh thái 2026</Text>
                </View>
                <Text style={styles.sloganTitle}>HOMESTAY BOOKING</Text>
                <Text style={styles.sloganSub}>Trải nghiệm không gian sống và kỳ nghỉ trong lành</Text>
              </View>

              {/* Search Bar in Hero */}
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#0284C7" />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Tìm kiếm homestay, địa điểm..."
                  placeholderTextColor="#0284C7"
                  style={styles.searchInput}
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch('')} hitSlop={6}>
                    <Ionicons name="close-circle-outline" size={18} color="#0284C7" />
                  </Pressable>
                )}
              </View>
            </View>
          </ImageBackground>
        </Animated.View>

        {/* PROMOTION / DISCOUNT CAMPAIGN BANNER */}
        <Animated.View entering={FadeInUp.delay(150).duration(600)} style={styles.promoBannerContainer}>
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
            }}
            style={styles.promoBanner}
            imageStyle={styles.promoBannerImage}
          >
            <View style={styles.promoOverlay}>
              <View style={styles.promoTag}>
                <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                <Text style={styles.promoTagText}>ƯU ĐÃI NGHỈ DƯỠNG BIỂN</Text>
              </View>
              <Text style={styles.promoHeading}>Giảm tới 30% Đặt Sớm 🎉</Text>
              <Text style={styles.promoSub}>
                Nhập mã <Text style={styles.promoCode}>WELCOME10</Text> giảm thêm 10% cho thành viên
              </Text>
              <Pressable
                style={styles.promoBtn}
                onPress={() => router.push('/homestays')}
              >
                <Text style={styles.promoBtnText}>Đặt phòng ngay</Text>
                <Ionicons name="arrow-forward" size={13} color="#0369A1" />
              </Pressable>
            </View>
          </ImageBackground>
        </Animated.View>

        {/* SECTION 1: DÀNH CHO BẠN */}
        <Animated.View entering={FadeInRight.delay(250).duration(600)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dành cho bạn</Text>
            <Pressable onPress={() => router.push('/homestays')} hitSlop={6}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalCardsList}
          >
            {forYouList.slice(0, 5).map((homestay, index) => {
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
        </Animated.View>

        {/* SECTION 2: KHÁM PHÁ ĐỊA ĐIỂM */}
        <Animated.View entering={FadeInUp.delay(350).duration(600)}>
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Khám phá địa điểm</Text>
            <Pressable onPress={() => router.push('/locations')} hitSlop={6}>
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
        </Animated.View>

        {/* SECTION 3: HOMESTAY NỔI BẬT (Grid 2 cột) */}
        <Animated.View entering={FadeInUp.delay(450).duration(600)}>
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Homestay nổi bật</Text>
            <Pressable onPress={() => router.push('/homestays')} hitSlop={6}>
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
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Card phong cách Book Shop cổ điển với tone Xanh Biển + Trắng
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
          <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={16} color={isSaved ? '#EF4444' : '#64748B'} />
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
    backgroundColor: '#F0F9FF',
  },
  content: {
    paddingBottom: 28,
  },
  // Hero Banner Background - Ocean Blue
  heroBackground: {
    width: '100%',
    backgroundColor: '#0369A1',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
  },
  heroBackgroundImage: {
    opacity: 0.35,
  },
  heroOverlay: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: 'rgba(3, 105, 161, 0.78)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  avatarBorder: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subGreetingText: {
    fontSize: 11,
    color: '#E0F2FE',
    marginTop: 1,
  },
  cartIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sloganBox: {
    alignItems: 'center',
    marginBottom: 14,
  },
  oceanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  oceanBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369A1',
  },
  sloganTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  sloganSub: {
    fontSize: 11,
    color: '#E0F2FE',
    marginTop: 2,
    textAlign: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 44,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0369A1',
    fontWeight: '600',
  },
  // Promotion Banner
  promoBannerContainer: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  promoBanner: {
    width: '100%',
    backgroundColor: '#075985',
  },
  promoBannerImage: {
    opacity: 0.45,
  },
  promoOverlay: {
    padding: 14,
    backgroundColor: 'rgba(7, 89, 133, 0.75)',
  },
  promoTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    marginBottom: 5,
  },
  promoTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  promoHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  promoSub: {
    fontSize: 11,
    color: '#E0F2FE',
    marginTop: 2,
  },
  promoCode: {
    fontWeight: '800',
    color: '#FDE047',
  },
  promoBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  promoBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0369A1',
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  // Horizontal List
  horizontalCardsList: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 4,
  },
  // Book Shop Card Style
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    height: 130,
    backgroundColor: '#E0F2FE',
  },
  cardImage: {
    width: '100%',
    height: 130,
  },
  saleBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  saleText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  heartIconBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIconBtnSaved: {
    backgroundColor: '#FEF2F2',
  },
  cardBody: {
    padding: 9,
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 16,
    minHeight: 32,
  },
  authorSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
  },
  priceLabel: {
    fontSize: 10,
    color: '#475569',
    marginTop: 3,
  },
  priceValue: {
    fontWeight: '700',
    color: '#0F172A',
  },
  // Locations Pills
  locationPillsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  locThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  locName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  locCount: {
    fontSize: 9,
    color: '#64748B',
  },
  // Grid Container
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    rowGap: 10,
  },
  gridCardWrapper: {
    width: '48.5%',
  },
});
