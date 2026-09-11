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
          // Fallback sang mock data nếu DB chưa có dữ liệu
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
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Homestay</Text>
          <Text style={styles.subtitle}>Tìm kiếm chỗ nghỉ lý tưởng</Text>
        </View>
        <Pressable style={styles.bookingButton} onPress={() => router.push('/bookings')}>
          <Ionicons name="calendar-outline" size={23} color="#2563EB" />
        </Pressable>
      </View>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={20} color="#64748B" />
        <TextInput value={searchText} onChangeText={setSearchText} placeholder="Tìm homestay, địa điểm..." placeholderTextColor="#64748B" style={styles.input} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <Filter label="Loại" selected={selectedType === 'all'} onPress={() => setSelectedType('all')} />
        {types.map((type) => (
          <Filter key={type} label={type} selected={selectedType === type} onPress={() => setSelectedType(type)} />
        ))}
      </ScrollView>
      <View style={styles.sortRow}>
        <Text style={styles.count}>{filteredHomestays.length} homestay</Text>
        <View style={styles.sortButtons}>
          <Filter label="Giá" selected={sort === 'price'} onPress={() => setSort(sort === 'price' ? 'default' : 'price')} />
          <Filter label="Rating" selected={sort === 'rating'} onPress={() => setSort(sort === 'rating' ? 'default' : 'rating')} />
        </View>
      </View>
      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.emptyTitle}>Đang tải dữ liệu...</Text>
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
          <Text style={styles.emptyTitle}>Lỗi</Text>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHomestays}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <HomestayRow homestay={item} isSaved={savedHomestays.some(s => s.id === item.id)} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Chưa có homestay</Text>
              <Text style={styles.emptyText}>Thử thay đổi từ khóa hoặc bộ lọc.</Text>
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
  const { addToBooking, removeFromBooking } = useBooking();
  const available = true;

  return (
    <Pressable style={styles.card} onPress={() => router.push({ pathname: '/homestay/[id]' as any, params: { id: homestay.id } })}>
      <ProductImage uri={homestay.images[0]} style={styles.image} containerStyle={styles.image} />
      {homestay.oldPrice && <Text style={styles.saleBadge}>Giảm {Math.round((1 - homestay.price / homestay.oldPrice) * 100)}%</Text>}
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>{homestay.name}</Text>
        <Text style={styles.location}>{homestay.location} • {homestay.type}</Text>
        <Text style={styles.price}>{formatPrice(homestay.price)}<Text style={styles.perNight}>/đêm</Text></Text>
        <View style={styles.meta}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.metaText}>{homestay.rating} · {homestay.reviewCount} đánh giá · {homestay.maxGuests} khách · {homestay.bedrooms} PN</Text>
        </View>
        <View style={styles.amenities}>
          {homestay.amenities.slice(0, 3).map((a, i) => <Text key={i} style={styles.amenityTag}>{a}</Text>)}
          {homestay.amenities.length > 3 && <Text style={styles.amenityTag}>+{homestay.amenities.length - 3} nữa</Text>}
        </View>
      </View>
      <Pressable hitSlop={8} style={[styles.saveBtn, isSaved && styles.saveBtnSaved]} onPress={(event) => { event.stopPropagation(); if (isSaved) removeFromBooking(homestay.id); else { addToBooking(homestay); Alert.alert('Đã lưu', `${homestay.name} đã được thêm vào danh sách.`); } }}>
        <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color={isSaved ? '#EF4444' : '#475569'} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 27, fontWeight: '700', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 3 },
  bookingButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  search: { marginHorizontal: 20, height: 48, paddingHorizontal: 14, backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0F172A' },
  filters: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  filter: { height: 36, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 18, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  filterSelected: { backgroundColor: '#2563EB' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#334155', lineHeight: 20 },
  filterTextSelected: { color: '#FFF' },
  sortRow: { paddingHorizontal: 20, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  count: { fontSize: 13, color: '#64748B' },
  sortButtons: { flexDirection: 'row', gap: 7 },
  list: { padding: 20, gap: 12, paddingBottom: 32 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 12, flexDirection: 'row', gap: 12, elevation: 2, shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 8, position: 'relative' },
  image: { width: 100, height: 110, borderRadius: 12 },
  saleBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#EF4444', color: '#FFF', fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, zIndex: 1 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  location: { marginTop: 3, fontSize: 12, color: '#64748B' },
  price: { marginTop: 5, fontSize: 15, fontWeight: '700', color: '#2563EB' },
  perNight: { fontSize: 12, fontWeight: '400', color: '#64748B' },
  meta: { flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' },
  metaText: { fontSize: 12, color: '#64748B' },
  amenities: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  amenityTag: { fontSize: 10, color: '#2563EB', backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  saveBtn: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, zIndex: 2 },
  saveBtnSaved: { backgroundColor: '#FEF2F2' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#334155' },
  emptyText: { marginTop: 4, color: '#64748B' },
});
