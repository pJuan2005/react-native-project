import { HomestayRow } from '@/app/(tabs)/homestays';
import { mockLocations, mockHomestays } from '@/constants/mockData';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function LocationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const location = mockLocations.find(c => c.id === id);
  const homestays = mockHomestays.filter(h => h.locationId === id);
  if (!location) return <SafeAreaView style={s.screen}><Text>Không tìm thấy địa điểm.</Text></SafeAreaView>;
  return (
    <SafeAreaView style={s.screen}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></Pressable>
        <Text style={s.title}>Địa điểm</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={homestays}
        keyExtractor={p => p.id}
        ListHeaderComponent={
          <View style={s.hero}>
            <ProductImage uri={location.image} style={s.heroImage} containerStyle={s.heroImage} />
            <View style={s.heroOverlay}>
              <Ionicons name={location.icon} size={34} color="#7C3AED" />
              <Text style={s.name}>{location.name}</Text>
              <Text style={s.description}>{location.description}</Text>
              <Text style={s.count}>{location.homestayCount} homestay</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => <HomestayRow homestay={item} isSaved={false} />}
        contentContainerStyle={s.list}
        ListEmptyComponent={<Text style={s.empty}>Chưa có homestay tại địa điểm này.</Text>}
      />
    </SafeAreaView>
  );
}

import { ProductImage } from '@/components/product-image';

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700' },
  list: { padding: 20, gap: 12, paddingTop: 0 },
  hero: { borderRadius: 18, overflow: 'hidden', marginBottom: 6, position: 'relative', height: 200 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(15, 23, 42, 0.7)', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  name: { fontSize: 24, fontWeight: '700', color: '#FFF', marginTop: 10 },
  description: { color: '#DBEAFE', marginTop: 5 },
  count: { fontWeight: '700', color: '#A5B4FC', marginTop: 12 },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 25 },
});