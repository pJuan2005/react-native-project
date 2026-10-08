import { HomestayRow } from '@/app/(tabs)/homestays';
import { mockLocations, mockHomestays, Location, Homestay } from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { ProductImage } from '@/components/product-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PaginationControls } from '@/components/pagination-controls';
import { API_BASE_URL, fetchWithTimeout } from '@/config/api';

const ITEMS_PER_PAGE = 6;

export default function LocationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark, colors } = useAppTheme();
  const { savedHomestays } = useBooking();

  const [location, setLocation] = useState<Location | null>(null);
  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // Fetch location details from API
    fetchWithTimeout(`${API_BASE_URL}/api/locations/${id}`, {}, 3000)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const lData = json.data;
          const mappedLoc: Location = {
            id: String(lData.id),
            name: lData.name,
            description: lData.description || '',
            homestayCount: parseInt(lData.homestay_count, 10) || parseInt(lData.property_count, 10) || 0,
            icon: (lData.icon as any) || 'compass-outline',
            image: lData.image_url || lData.image || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
          };
          setLocation(mappedLoc);

          if (Array.isArray(lData.properties) && lData.properties.length > 0) {
            setHomestays(lData.properties);
          } else if (Array.isArray(lData.homestays) && lData.homestays.length > 0) {
            setHomestays(lData.homestays);
          } else {
            const fb = mockHomestays.filter((h) => String(h.locationId) === String(id));
            setHomestays(fb);
          }
        } else {
          fallbackLocal();
        }
      })
      .catch((err) => {
        console.warn('API location detail fallback:', err);
        fallbackLocal();
      })
      .finally(() => setLoading(false));

    function fallbackLocal() {
      const loc = mockLocations.find((c) => String(c.id) === String(id)) || null;
      setLocation(loc);
      const hs = mockHomestays.filter((h) => String(h.locationId) === String(id));
      setHomestays(hs);
    }
  }, [id]);

  const totalPages = Math.max(1, Math.ceil(homestays.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedHomestays = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return homestays.slice(start, start + ITEMS_PER_PAGE);
  }, [homestays, safeCurrentPage]);

  if (loading) {
    return (
      <SafeAreaView style={[s.screen, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={s.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, fontSize: 13, color: colors.textSecondary }}>Đang tải địa điểm...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!location) {
    return (
      <SafeAreaView style={[s.screen, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={s.centerBox}>
          <Ionicons name="alert-circle-outline" size={42} color="#EF4444" />
          <Text style={[s.empty, { color: colors.textSecondary }]}>Không tìm thấy địa điểm.</Text>
          <Pressable style={[s.backActionBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Quay lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[s.header, { backgroundColor: colors.headerBg, borderColor: colors.cardBorder }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[s.title, { color: colors.text }]}>{location.name}</Text>
        <Pressable onPress={() => router.push('/bookings')} hitSlop={8}>
          <Ionicons name="cart-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>
      <FlatList
        data={paginatedHomestays}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={
          <View style={s.hero}>
            <ProductImage uri={location.image} style={s.heroImage} containerStyle={s.heroImage} />
            <View style={s.heroOverlay}>
              <Ionicons name={location.icon} size={28} color="#FFFFFF" />
              <Text style={s.name}>{location.name}</Text>
              <Text style={s.description}>{location.description}</Text>
              <Text style={s.count}>{location.homestayCount || homestays.length} homestay có sẵn</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <HomestayRow
            homestay={item}
            isSaved={savedHomestays.some((s) => s.id === item.id)}
            isDark={isDark}
            colors={colors}
          />
        )}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={[s.empty, { color: colors.textSecondary }]}>Chưa có homestay tại địa điểm này.</Text>}
        ListFooterComponent={
          <PaginationControls
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={homestays.length}
            pageSize={ITEMS_PER_PAGE}
            itemLabel="chỗ nghỉ"
            onPageChange={setCurrentPage}
          />
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  backActionBtn: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  title: { fontSize: 16, fontWeight: '800' },
  hero: {
    position: 'relative',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(2, 132, 199, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  name: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginTop: 4 },
  description: { fontSize: 13, color: '#F0F9FF', textAlign: 'center', marginTop: 4, lineHeight: 17 },
  count: { fontSize: 11, color: '#BAE6FD', marginTop: 6, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 32 },
  empty: { textAlign: 'center', marginTop: 32, fontSize: 13 },
});
