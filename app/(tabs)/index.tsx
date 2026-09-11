import { ProductImage } from '@/components/product-image';
import { formatPrice, mockLocations, mockHomestays, mockUser, Homestay } from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const { userProfile, addToBooking, savedHomestays, removeFromBooking } = useBooking();

  const featured = useMemo(
    () => mockHomestays.filter(h => h.isFeatured && h.name.toLowerCase().includes(search.toLowerCase())).slice(0, 4),
    [search]
  );
  const newest = mockHomestays.filter(h => h.isNew).slice(0, 4);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Xin chào, {userProfile.name} 👋</Text>
            <Text style={styles.welcome}>Tìm homestay lý tưởng cho chuyến đi của bạn</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerIcon} onPress={() => router.push('/bookings')}>
              <Ionicons name="calendar-outline" size={20} color="#2563EB" />
            </Pressable>
            <Pressable style={styles.profileAvatar} onPress={() => router.push('/users')}>
              <ProductImage uri={userProfile.avatar} style={styles.avatar} containerStyle={styles.avatar} />
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <Pressable style={styles.search} onPress={() => router.push('/homestays')}>
          <Ionicons name="search-outline" size={19} color="#64748B" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm kiếm homestay, điểm đến..."
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
        </Pressable>

        {/* Banner Promotion */}
        <View style={styles.banner}>
          <View style={styles.bannerIconCircle}>
            <Ionicons name="sparkles" size={24} color="#2563EB" />
          </View>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Ưu đãi mùa du lịch 🎉</Text>
            <Text style={styles.bannerText}>Giảm ngay 30% cho kỳ nghỉ cuối tuần</Text>
            <Pressable style={styles.bannerButton} onPress={() => router.push('/homestays')}>
              <Text style={styles.bannerButtonText}>Khám phá ngay</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Section: Locations */}
        <SectionTitle title="Điểm đến phổ biến" onPress={() => router.push('/locations')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {mockLocations.map(loc => (
            <Pressable
              key={loc.id}
              style={styles.locationCard}
              onPress={() => router.push({ pathname: '/location/[id]' as any, params: { id: loc.id } })}>
              <ProductImage uri={loc.image} style={styles.locationImage} containerStyle={styles.locationImage} />
              <View style={styles.locationOverlay}>
                <Ionicons name={loc.icon} size={18} color="#FFFFFF" />
                <Text style={styles.locationName}>{loc.name}</Text>
                <Text style={styles.locationCount}>{loc.homestayCount} chỗ nghỉ</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Section: Featured Homestays */}
        <SectionTitle title="Homestay nổi bật" onPress={() => router.push('/homestays')} />
        <View style={styles.productGrid}>
          {featured.map(homestay => {
            const isSaved = savedHomestays.some(s => s.id === homestay.id);
            return (
              <HomeHomestay
                key={homestay.id}
                homestay={homestay}
                isSaved={isSaved}
                onToggleSave={() => {
                  if (isSaved) {
                    removeFromBooking(homestay.id);
                  } else {
                    addToBooking(homestay);
                    Alert.alert('Đã lưu', `${homestay.name} đã được thêm vào danh sách yêu thích.`);
                  }
                }}
              />
            );
          })}
        </View>

        {/* Section: New Arrivals */}
        <SectionTitle title="Mới ra mắt" onPress={() => router.push('/homestays')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.newList}>
          {newest.map(homestay => (
            <Pressable
              key={homestay.id}
              style={styles.newCard}
              onPress={() => router.push({ pathname: '/homestay/[id]' as any, params: { id: homestay.id } })}>
              <ProductImage uri={homestay.images[0]} style={styles.newImage} containerStyle={styles.newImage} />
              <Text style={styles.newBadge}>MỚI</Text>
              <View style={styles.newInfo}>
                <Text numberOfLines={1} style={styles.newName}>{homestay.name}</Text>
                <Text style={styles.newLocation}>📍 {homestay.location}</Text>
                <Text style={styles.newPrice}>{formatPrice(homestay.price)}<Text style={styles.perNight}>/đêm</Text></Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionInline}>{title}</Text>
      <Pressable onPress={onPress} hitSlop={8}>
        <Text style={styles.all}>Xem tất cả</Text>
      </Pressable>
    </View>
  );
}

function HomeHomestay({
  homestay,
  isSaved,
  onToggleSave,
}: {
  homestay: Homestay;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <Pressable
      style={styles.productCard}
      onPress={() => router.push({ pathname: '/homestay/[id]' as any, params: { id: homestay.id } })}>
      <View style={styles.productImageWrapper}>
        <ProductImage uri={homestay.images[0]} style={styles.productImage} containerStyle={styles.productImage} />
        {homestay.oldPrice && (
          <Text style={styles.saleBadge}>
            -{Math.round((1 - homestay.price / homestay.oldPrice) * 100)}%
          </Text>
        )}
        <Pressable
          style={[styles.heartBtn, isSaved && styles.heartBtnActive]}
          onPress={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}>
          <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={18} color={isSaved ? '#EF4444' : '#475569'} />
        </Pressable>
      </View>
      <View style={styles.productContent}>
        <Text numberOfLines={1} style={styles.productName}>{homestay.name}</Text>
        <Text style={styles.productLocation}>📍 {homestay.location} • {homestay.type}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{formatPrice(homestay.price)}</Text>
          <Text style={styles.perNight}>/đêm</Text>
        </View>
        <View style={styles.rating}>
          <Ionicons name="star" size={13} color="#F59E0B" />
          <Text style={styles.ratingText}>{homestay.rating} ({homestay.reviewCount})</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingBottom: 24 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  profileAvatar: { borderRadius: 21, overflow: 'hidden', borderWidth: 1.5, borderColor: '#BFDBFE' },
  hello: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  welcome: { fontSize: 12, color: '#64748B', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 12,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: '#0F172A' },
  banner: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1E40AF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: { flex: 1 },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  bannerText: { fontSize: 12, color: '#BFDBFE', marginTop: 3 },
  bannerButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  bannerButtonText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  sectionRow: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionInline: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  all: { fontSize: 12, fontWeight: '600', color: '#2563EB' },
  categoryList: { paddingHorizontal: 16, gap: 10, paddingBottom: 16 },
  locationCard: {
    width: 140,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#CBD5E1',
  },
  locationImage: { width: 140, height: 100 },
  locationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  locationName: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  locationCount: { fontSize: 10, color: '#E2E8F0', marginTop: 1 },
  productGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  productCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productImageWrapper: { position: 'relative', width: '100%', height: 110 },
  productImage: { width: '100%', height: 110 },
  saleBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtnActive: { backgroundColor: '#FEF2F2' },
  productContent: { padding: 8 },
  productName: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  productLocation: { fontSize: 11, color: '#64748B', marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  productPrice: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  perNight: { fontSize: 11, fontWeight: '400', color: '#64748B' },
  rating: { flexDirection: 'row', gap: 3, alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  newList: { paddingHorizontal: 16, gap: 10, paddingBottom: 16 },
  newCard: {
    width: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  newImage: { width: 170, height: 100 },
  newBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  newInfo: { padding: 8 },
  newName: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  newLocation: { marginTop: 2, fontSize: 11, color: '#64748B' },
  newPrice: { marginTop: 4, fontSize: 13, fontWeight: '700', color: '#2563EB' },
});
