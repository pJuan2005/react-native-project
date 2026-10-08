import { ProductImage } from '@/components/product-image';
import { Location, mockLocations } from '@/constants/mockData';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useResponsive } from '@/utils/responsive';
import { PaginationControls } from '@/components/pagination-controls';
import { API_BASE_URL, fetchWithTimeout } from '@/config/api';

const ITEMS_PER_PAGE = 6;

export default function LocationsScreen() {
  const { isDark, colors } = useAppTheme();
  const [search, setSearch] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchWithTimeout(`${API_BASE_URL}/api/locations`, {}, 3000)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: Location[] = json.data.map((l: any) => ({
            id: String(l.id),
            name: l.name,
            description: l.description || '',
            homestayCount: parseInt(l.homestay_count, 10) || parseInt(l.property_count, 10) || 0,
            icon: (l.icon as any) || 'compass-outline',
            image: l.image_url || l.image || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
          }));
          setLocations(mapped);
        } else {
          setLocations(mockLocations);
        }
      })
      .catch((err) => {
        console.warn('API locations fallback to mock data:', err);
        setLocations(mockLocations);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredLocations = useMemo(
    () => locations.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase())),
    [locations, search]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredLocations.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedLocations = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredLocations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLocations, safeCurrentPage]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderColor: colors.cardBorder }]}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Khám phá Địa điểm</Text>
          <Text style={styles.subtitle}>
            {locations.length > 0 ? `${locations.length} vùng miền du lịch hấp dẫn` : 'Tìm homestay theo từng vùng miền du lịch'}
          </Text>
        </View>
        <Pressable
          style={[styles.headerBtn, { backgroundColor: isDark ? '#1C2541' : '#F0F9FF', borderColor: colors.border }]}
          onPress={() => router.push('/bookings')}
        >
          <Ionicons name="cart-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <View style={[styles.search, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]}>
        <Ionicons name="search" size={18} color={colors.primary} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm kiếm địa điểm du lịch..."
          placeholderTextColor={isDark ? '#64748B' : '#38BDF8'}
          style={[styles.input, { color: colors.text }]}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={6}>
            <Ionicons name="close-circle-outline" size={18} color={colors.primary} />
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Đang tải danh sách địa điểm...</Text>
        </View>
      ) : (
        <FlatList
          data={paginatedLocations}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <LocationCard location={item} colors={colors} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="search-outline" size={36} color="#94A3B8" />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Không tìm thấy địa điểm nào phù hợp</Text>
            </View>
          }
          ListFooterComponent={
            <PaginationControls
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={filteredLocations.length}
              pageSize={ITEMS_PER_PAGE}
              itemLabel="địa điểm du lịch"
              onPageChange={setCurrentPage}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

function LocationCard({ location, colors }: { location: Location; colors: any }) {
  const { scale } = useResponsive();
  const cardHeight = Math.round(Math.min(Math.max(scale(136), 125), 160));

  return (
    <Pressable
      style={[styles.card, { height: cardHeight, borderColor: colors.cardBorder }]}
      onPress={() => router.push({ pathname: '/location/[id]' as any, params: { id: location.id } })}
    >
      <ProductImage uri={location.image} style={styles.image} containerStyle={styles.image} />
      <View style={styles.overlay}>
        <View style={styles.iconCircle}>
          <Ionicons name={location.icon} size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{location.name}</Text>
          <Text style={styles.description} numberOfLines={2}>{location.description}</Text>
          <Text style={styles.count}>{location.homestayCount} homestay có sẵn</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#BAE6FD" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 8,
  },
  input: { flex: 1, fontSize: 13 },
  list: { padding: 16, paddingBottom: 32 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 12, marginTop: 10 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 13, marginTop: 10 },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1.5,
    position: 'relative',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(2, 132, 199, 0.45)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  description: { fontSize: 11, color: '#F0F9FF', marginTop: 2, lineHeight: 15 },
  count: { fontSize: 10, color: '#BAE6FD', marginTop: 4, fontWeight: '700' },
});
