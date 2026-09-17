import { HomestayRow } from '@/app/(tabs)/homestays';
import { mockLocations, mockHomestays } from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { ProductImage } from '@/components/product-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function LocationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark, colors } = useAppTheme();
  const { savedHomestays } = useBooking();

  const location = mockLocations.find((c) => c.id === id);
  const homestays = mockHomestays.filter((h) => h.locationId === id);

  if (!location) {
    return (
      <SafeAreaView style={[s.screen, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <Text style={[s.empty, { color: colors.textSecondary }]}>Không tìm thấy địa điểm.</Text>
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
            isDark={isDark}
            colors={colors}
          />
        )}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={[s.empty, { color: colors.textSecondary }]}>Chưa có homestay tại địa điểm này.</Text>}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
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
  title: { fontSize: 16, fontWeight: '800' },
  list: { padding: 16, gap: 10, paddingTop: 12 },
  hero: { borderRadius: 16, overflow: 'hidden', marginBottom: 6, position: 'relative', height: 180 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(3, 105, 161, 0.72)',
  },
  name: { fontSize: 20, fontWeight: '800', color: '#FFF', marginTop: 6 },
  description: { color: '#E0F2FE', marginTop: 2, fontSize: 12 },
  count: { fontWeight: '700', color: '#BAE6FD', marginTop: 8, fontSize: 11 },
  empty: { textAlign: 'center', marginTop: 30, fontSize: 13 },
});
