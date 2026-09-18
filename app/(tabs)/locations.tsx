import { ProductImage } from '@/components/product-image';
import { Location, mockLocations } from '@/constants/mockData';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useResponsive } from '@/utils/responsive';

export default function LocationsScreen() {
  const { isDark, colors } = useAppTheme();
  const [search, setSearch] = useState('');
  const locations = useMemo(
    () => mockLocations.filter((l) => l.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderColor: colors.cardBorder }]}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Khám phá Địa điểm</Text>
          <Text style={styles.subtitle}>Tìm homestay theo từng vùng miền du lịch</Text>
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

      <FlatList
        data={locations}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <LocationCard location={item} colors={colors} />}
      />
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
          <Text style={styles.description}>{location.description}</Text>
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
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { marginTop: 1, fontSize: 11, color: '#64748B' },
  headerBtn: {
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
  list: { padding: 16, gap: 12, paddingBottom: 30 },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    height: 140,
    borderWidth: 1.5,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  image: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: 'rgba(3, 105, 161, 0.72)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(2, 132, 199, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  description: { color: '#E0F2FE', fontSize: 11, marginTop: 1 },
  count: { marginTop: 4, fontSize: 11, fontWeight: '700', color: '#BAE6FD' },
});
