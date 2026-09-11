import { ProductImage } from '@/components/product-image';
import { formatPrice, Homestay, mockHomestays } from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import API_BASE_URL from '@/src/config/api';

export default function HomestaysScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sort, setSort] = useState<'default' | 'price' | 'rating'>('default');
  const { savedHomestays } = useBooking();

  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/homestays`)
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
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Danh sách Homestay</Text>
          <Text style={styles.subtitle}>Tìm nơi nghỉ dưỡng phù hợp nhất</Text>
        </View>
        <Pressable style={styles.bookingButton} onPress={() => router.push('/bookings')}>
          <Ionicons name="cart-outline" size={22} color="#4EBA87" />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.search}>
        <Ionicons name="search" size={18} color="#4EBA87" />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Tìm theo tên homestay, địa điểm..."
          placeholderTextColor="#52B788"
          style={styles.input}
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText('')} hitSlop={6}>
            <Ionicons name="close-circle-outline" size={18} color="#88D49E" />
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
            onPress={() => setSelectedType('all')}
          />
          {types.map((type) => (
            <Filter
              key={type}
              label={type}
              selected={selectedType === type}
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
            style={[styles.sortPill, sort === 'price' && styles.sortPillActive]}
            onPress={() => setSort(sort === 'price' ? 'default' : 'price')}
          >
            <Ionicons name="pricetag-outline" size={12} color={sort === 'price' ? '#FFFFFF' : '#4EBA87'} />
            <Text style={[styles.sortPillText, sort === 'price' && styles.sortPillTextActive]}>Giá</Text>
          </Pressable>

          <Pressable
            style={[styles.sortPill, sort === 'rating' && styles.sortPillActive]}
            onPress={() => setSort(sort === 'rating' ? 'default' : 'rating')}
          >
            <Ionicons name="star-outline" size={12} color={sort === 'rating' ? '#FFFFFF' : '#4EBA87'} />
            <Text style={[styles.sortPillText, sort === 'rating' && styles.sortPillTextActive]}>Đánh giá</Text>
          </Pressable>
        </View>
      </View>

      {/* List / Loading / Error */}
      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#4EBA87" />
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
          renderItem={({ item }) => <HomestayRow homestay={item} isSaved={savedHomestays.some(s => s.id === item.id)} />}
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

function Filter({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.filter, selected && styles.filterSelected]}>
      <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function HomestayRow({ homestay, isSaved }: { homestay: Homestay; isSaved: boolean }) {
  const { toggleSavedHomestay } = useBooking();

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: '/homestay/[id]' as any, params: { id: homestay.id } })}
    >
      <View style={styles.imageContainer}>
        <ProductImage uri={homestay.images[0]} style={styles.image} containerStyle={styles.image} />
        {homestay.oldPrice && (
          <Text style={styles.saleBadge}>
            -{Math.round((1 - homestay.price / homestay.oldPrice) * 100)}%
          </Text>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text numberOfLines={1} style={styles.name}>{homestay.name}</Text>
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
            price: <Text style={styles.priceValue}>{new Intl.NumberFormat('vi-VN').format(homestay.price)} Đ</Text>
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAF8' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E8F5E9',
  },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  bookingButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#4EBA87',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#2D6A4F', fontWeight: '600' },
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
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSelected: { backgroundColor: '#4EBA87' },
  filterText: { fontSize: 12, fontWeight: '700', color: '#2D6A4F' },
  filterTextSelected: { color: '#FFFFFF' },
  sortRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  sortButtons: { flexDirection: 'row', gap: 6 },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8F3DC',
  },
  sortPillActive: {
    backgroundColor: '#4EBA87',
    borderColor: '#4EBA87',
  },
  sortPillText: { fontSize: 11, fontWeight: '600', color: '#2D6A4F' },
  sortPillTextActive: { color: '#FFFFFF' },
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
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
  name: { fontSize: 14, fontWeight: '700', color: '#1F2937', flex: 1, marginRight: 6 },
  saveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnSaved: { backgroundColor: '#FEF2F2' },
  location: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  meta: { flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 3 },
  metaText: { fontSize: 11, color: '#6B7280' },
  amenities: { marginTop: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  amenityTag: { fontSize: 10, color: '#2D6A4F', backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  priceRow: { marginTop: 4 },
  priceLabel: { fontSize: 12, color: '#4B5563' },
  priceValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { marginTop: 10, fontSize: 15, fontWeight: '600', color: '#334155' },
  emptyText: { marginTop: 4, fontSize: 12, color: '#64748B' },
});
