import { ProductImage } from '@/components/product-image';
import { formatPrice, Homestay, mockHomestays } from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { API_BASE_URL, fetchWithTimeout } from '@/config/api';
import { useResponsive } from '@/utils/responsive';

export default function HomestaysScreen() {
  const { isDark, colors } = useAppTheme();
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sort, setSort] = useState<'default' | 'price' | 'rating'>('default');
  const { savedHomestays } = useBooking();

  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWithTimeout(`${API_BASE_URL}/api/homestays`, {}, 3000)
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setHomestays(json.data);
        } else {
          setHomestays(mockHomestays);
        }
      })
      .catch(err => {
        console.warn('API Error (falling back to mock data):', err);
        setHomestays(mockHomestays);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredHomestays = useMemo(() => [...homestays].filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchText.trim().toLowerCase()) || h.location.toLowerCase().includes(searchText.trim().toLowerCase());
    const matchesType = selectedType === 'all' || h.type === selectedType;
    return matchesSearch && matchesType;
  }).sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'rating' ? b.rating - a.rating : 0), [homestays, searchText, selectedType, sort]);

  const types = useMemo(() => [...new Set(homestays.map(h => h.type))], [homestays]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderColor: colors.cardBorder }]}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Danh sách Homestay</Text>
          <Text style={styles.subtitle}>Tìm nơi nghỉ dưỡng phù hợp nhất</Text>
        </View>
        <Pressable
          style={[styles.bookingButton, { backgroundColor: isDark ? '#1C2541' : '#F0F9FF', borderColor: colors.border }]}
          onPress={() => router.push('/bookings')}
        >
          <Ionicons name="cart-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={[styles.search, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]}>
        <Ionicons name="search" size={18} color={colors.primary} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Tìm theo tên homestay, địa điểm..."
          placeholderTextColor={isDark ? '#64748B' : '#38BDF8'}
          style={[styles.input, { color: colors.text }]}
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText('')} hitSlop={6}>
            <Ionicons name="close-circle-outline" size={18} color={colors.primary} />
          </Pressable>
        )}
      </View>

      {/* Categories Filter Carousel */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <Filter
            label="Tất cả"
            selected={selectedType === 'all'}
            isDark={isDark}
            colors={colors}
            onPress={() => setSelectedType('all')}
          />
          {types.map((type) => (
            <Filter
              key={type}
              label={type}
              selected={selectedType === type}
              isDark={isDark}
              colors={colors}
              onPress={() => setSelectedType(type)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Sort & Count Row */}
      <View style={styles.sortRow}>
        <Text style={styles.count}>{filteredHomestays.length} homestay sẵn sàng</Text>
        <View style={styles.sortButtons}>
          <Pressable
            style={[
              styles.sortPill,
              { backgroundColor: isDark ? '#1C2541' : '#FFFFFF', borderColor: isDark ? '#334155' : '#BAE6FD' },
              sort === 'price' && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setSort(sort === 'price' ? 'default' : 'price')}
          >
            <Ionicons name="pricetag-outline" size={12} color={sort === 'price' ? '#FFFFFF' : colors.primary} />
            <Text style={[styles.sortPillText, { color: colors.primary }, sort === 'price' && { color: '#FFFFFF' }]}>Giá</Text>
          </Pressable>

          <Pressable
            style={[
              styles.sortPill,
              { backgroundColor: isDark ? '#1C2541' : '#FFFFFF', borderColor: isDark ? '#334155' : '#BAE6FD' },
              sort === 'rating' && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setSort(sort === 'rating' ? 'default' : 'rating')}
          >
            <Ionicons name="star-outline" size={12} color={sort === 'rating' ? '#FFFFFF' : colors.primary} />
            <Text style={[styles.sortPillText, { color: colors.primary }, sort === 'rating' && { color: '#FFFFFF' }]}>Đánh giá</Text>
          </Pressable>
        </View>
      </View>

      {/* List / Loading / Error */}
      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyTitle}>Đang tải dữ liệu...</Text>
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
          <Text style={styles.emptyTitle}>Lỗi kết nối</Text>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHomestays}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <HomestayRow
              homestay={item}
              isSaved={savedHomestays.some(s => s.id === item.id)}
              isDark={isDark}
              colors={colors}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={36} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Không tìm thấy homestay</Text>
              <Text style={styles.emptyText}>Vui lòng thử từ khóa hoặc chọn loại hình khác.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function Filter({
  label,
  selected,
  isDark,
  colors,
  onPress,
}: {
  label: string;
  selected: boolean;
  isDark: boolean;
  colors: any;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filter,
        { backgroundColor: isDark ? '#1C2541' : '#E0F2FE' },
        selected && { backgroundColor: colors.primary },
      ]}
    >
      <Text
        style={[
          styles.filterText,
          { color: isDark ? '#38BDF8' : '#0369A1' },
          selected && { color: '#FFFFFF' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function HomestayRow({
  homestay,
  isSaved,
  isDark,
  colors,
}: {
  homestay: Homestay;
  isSaved: boolean;
  isDark?: boolean;
  colors?: any;
}) {
  const { toggleSavedHomestay } = useBooking();
  const { scale, isSmallDevice, moderateScale } = useResponsive();
  const imgSize = Math.round(Math.min(Math.max(scale(92), 80), 108));

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1C2541' : '#FFFFFF',
          borderColor: isDark ? '#334155' : '#E0F2FE',
        },
      ]}
      onPress={() => router.push({ pathname: '/homestay/[id]' as any, params: { id: homestay.id } })}
    >
      <View style={[styles.imageContainer, { width: imgSize, height: imgSize }]}>
        <ProductImage
          uri={homestay.images[0]}
          style={[styles.image, { width: imgSize, height: imgSize }]}
          containerStyle={[styles.image, { width: imgSize, height: imgSize }]}
        />
        {homestay.oldPrice && (
          <Text style={styles.saleBadge}>
            -{Math.round((1 - homestay.price / homestay.oldPrice) * 100)}%
          </Text>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text numberOfLines={1} style={[styles.name, isDark && { color: '#F8FAFC' }, { fontSize: moderateScale(14) }]}>{homestay.name}</Text>
          <Pressable
            hitSlop={8}
            style={[styles.saveBtn, isSaved && styles.saveBtnSaved]}
            onPress={(event) => {
              event.stopPropagation();
              const nowSaved = toggleSavedHomestay(homestay);
              if (nowSaved) {
                Alert.alert('Đã lưu yêu thích ❤️', `${homestay.name} đã được thêm vào danh sách yêu thích.`);
              } else {
                Alert.alert('Đã bỏ lưu 💔', `${homestay.name} đã được xóa khỏi danh sách yêu thích.`);
              }
            }}>
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={18} color={isSaved ? '#EF4444' : '#64748B'} />
          </Pressable>
        </View>

        <Text style={styles.location}>📍 by {homestay.location} • {homestay.type}</Text>

        <View style={styles.meta}>
          <Ionicons name="star" size={13} color="#F59E0B" />
          <Text style={styles.metaText}>{homestay.rating} ({homestay.reviewCount}) • {homestay.maxGuests} khách</Text>
        </View>

        <View style={styles.amenities}>
          {homestay.amenities.slice(0, 2).map((a, i) => <Text key={i} style={styles.amenityTag}>{a}</Text>)}
          {homestay.amenities.length > 2 && <Text style={styles.amenityTag}>+{homestay.amenities.length - 2}</Text>}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            price: <Text style={[styles.priceValue, isDark && { color: '#38BDF8' }]}>{new Intl.NumberFormat('vi-VN').format(homestay.price)} Đ</Text>
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F0F9FF' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E0F2FE',
  },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 11, color: '#64748B', marginTop: 1 },
  bookingButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  search: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: { flex: 1, marginLeft: 8, fontSize: 14, fontWeight: '600' },
  filterScrollWrapper: {
    height: 40,
    marginBottom: 4,
  },
  filters: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  filter: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: { fontSize: 12, fontWeight: '700' },
  sortRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  sortButtons: { flexDirection: 'row', gap: 6 },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  sortPillText: { fontSize: 11, fontWeight: '600' },
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 24 },
  card: {
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1.5,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: { position: 'relative', width: 100, height: 100, borderRadius: 10, overflow: 'hidden' },
  image: { width: 100, height: 100 },
  saleBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  info: { flex: 1, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 6 },
  saveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnSaved: { backgroundColor: '#FEF2F2' },
  location: { fontSize: 11, color: '#64748B', marginTop: 1 },
  meta: { flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 3 },
  metaText: { fontSize: 11, color: '#64748B' },
  amenities: { marginTop: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  amenityTag: { fontSize: 10, color: '#0369A1', backgroundColor: '#E0F2FE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  priceRow: { marginTop: 4 },
  priceLabel: { fontSize: 11, color: '#475569' },
  priceValue: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { marginTop: 10, fontSize: 15, fontWeight: '600', color: '#334155' },
  emptyText: { marginTop: 4, fontSize: 12, color: '#64748B' },
});
