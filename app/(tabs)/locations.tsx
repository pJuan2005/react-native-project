import { ProductImage } from '@/components/product-image';
import { Location, mockLocations } from '@/constants/mockData';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LocationsScreen() {
  const [search, setSearch] = useState('');
  const locations = useMemo(
    () => mockLocations.filter((l) => l.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Khám phá Địa điểm</Text>
          <Text style={styles.subtitle}>Tìm homestay theo từng vùng miền du lịch</Text>
        </View>
        <Pressable style={styles.headerBtn} onPress={() => router.push('/bookings')}>
          <Ionicons name="cart-outline" size={22} color="#4EBA87" />
        </Pressable>
      </View>

      <View style={styles.search}>
        <Ionicons name="search" size={18} color="#4EBA87" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm kiếm địa điểm du lịch..."
          placeholderTextColor="#52B788"
          style={styles.input}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={6}>
            <Ionicons name="close-circle-outline" size={18} color="#88D49E" />
          </Pressable>
        )}
      </View>

      <FlatList
        data={locations}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <LocationCard location={item} />}
      />
    </SafeAreaView>
  );
}

function LocationCard({ location }: { location: Location }) {
  return (
    <Pressable
      style={styles.card}
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
        <Ionicons name="chevron-forward" size={18} color="#D8F3DC" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  subtitle: { marginTop: 1, fontSize: 11, color: '#6B7280' },
  headerBtn: {
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
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#4EBA87',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#2D6A4F', fontWeight: '600' },
  list: { padding: 16, gap: 12, paddingBottom: 30 },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    height: 140,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(78, 186, 135, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  description: { color: '#E2E8F0', fontSize: 11, marginTop: 1 },
  count: { marginTop: 4, fontSize: 11, fontWeight: '700', color: '#A7F3D0' },
});
