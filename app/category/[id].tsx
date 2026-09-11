import { HomestayRow } from '@/app/(tabs)/homestays';
import { mockLocations, mockHomestays } from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { ProductImage } from '@/components/product-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function LocationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { savedHomestays } = useBooking();

  const location = mockLocations.find((c) => c.id === id);
  const homestays = mockHomestays.filter((h) => h.locationId === id);

  if (!location) {
    return (
      <SafeAreaView style={s.screen}>
        <Text style={s.empty}>Không tìm thấy địa điểm.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={s.title}>{location.name}</Text>
        <View style={{ width: 22 }} />
      </View>
      <FlatList
        data={homestays}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={
          <View style={s.hero}>
            <ProductImage uri={location.image} style={s.heroImage} containerStyle={s.heroImage} />
            <View style={s.heroOverlay}>
              <Ionicons name={location.icon} size={28} color="#FFFFFF" />
              <Text style={s.name}>{location.name}</Text>
              <Text style={s.description}>{location.description}</Text>
              <Text style={s.count}>{location.homestayCount} homestay có sẵn</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <HomestayRow
            homestay={item}
            isSaved={savedHomestays.some((s) => s.id === item.id)}
          />
        )}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={s.empty}>Chưa có homestay tại địa điểm này.</Text>}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAF8' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E8F5E9',
  },
  title: { fontSize: 16, fontWeight: '800', color: '#111827' },
  list: { padding: 16, gap: 10, paddingTop: 12 },
  hero: { borderRadius: 16, overflow: 'hidden', marginBottom: 6, position: 'relative', height: 180 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  name: { fontSize: 20, fontWeight: '800', color: '#FFF', marginTop: 6 },
  description: { color: '#E2E8F0', marginTop: 2, fontSize: 12 },
  count: { fontWeight: '700', color: '#A7F3D0', marginTop: 8, fontSize: 11 },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 30, fontSize: 13 },
});
