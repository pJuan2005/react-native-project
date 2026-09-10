import { ProductImage } from '@/components/product-image';
import { Location, mockLocations } from '@/constants/mockData';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LocationsScreen() {
  const [search, setSearch] = useState('');
  const locations = useMemo(() => mockLocations.filter(l => l.name.toLowerCase().includes(search.toLowerCase())), [search]);
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Địa điểm</Text>
          <Text style={styles.subtitle}>Khám phá homestay theo vùng miền</Text>
        </View>
      </View>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={20} color="#64748B" />
        <TextInput value={search} onChangeText={setSearch} placeholder="Tìm kiếm địa điểm..." placeholderTextColor="#64748B" style={styles.input} />
      </View>
      <FlatList data={locations} keyExtractor={i => i.id} contentContainerStyle={styles.list} renderItem={({ item }) => <LocationCard location={item} />} />
    </SafeAreaView>
  );
}

function LocationCard({ location }: { location: Location }) {
  return (
    <Pressable style={styles.card} onPress={() => router.push({ pathname: '/location/[id]' as any, params: { id: location.id } })}>
      <ProductImage uri={location.image} style={styles.image} containerStyle={styles.image} />
      <View style={styles.overlay}>
        <Ionicons name={location.icon} size={28} color="#7C3AED" />
        <Text style={styles.name}>{location.name}</Text>
        <Text style={styles.description}>{location.description}</Text>
        <Text style={styles.count}>{location.homestayCount} homestay</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, paddingBottom: 14 },
  title: { fontSize: 27, fontWeight: '700', color: '#0F172A' },
  subtitle: { marginTop: 3, fontSize: 13, color: '#64748B' },
  search: { marginHorizontal: 20, height: 48, paddingHorizontal: 14, borderRadius: 14, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0F172A' },
  list: { padding: 20, gap: 12, paddingBottom: 30 },
  card: { borderRadius: 16, overflow: 'hidden', position: 'relative', height: 140 },
  image: { width: '100%', height: '100%' },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(15, 23, 42, 0.7)', flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  description: { color: '#DBEAFE', marginTop: 2 },
  count: { marginTop: 6, fontSize: 12, fontWeight: '600', color: '#A5B4FC' },
});
