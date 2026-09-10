import { ProductImage } from '@/components/product-image';
import { formatPrice, mockLocations, mockHomestays, mockUser, Homestay } from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const { addToBooking } = useBooking();
  const featured = useMemo(() => mockHomestays.filter(h => h.isFeatured && h.name.toLowerCase().includes(search.toLowerCase())).slice(0, 4), [search]);
  const newest = mockHomestays.filter(h => h.isNew).slice(0, 4);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Xin chào, {mockUser.name} 👋</Text>
            <Text style={styles.welcome}>Bạn muốn đi đâu hôm nay?</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerIcon} onPress={() => router.push('/bookings')}>
              <Ionicons name="calendar-outline" size={22} color="#2563EB" />
            </Pressable>
            <Pressable style={styles.profileAvatar} onPress={() => router.push('/users')}>
              <ProductImage uri={mockUser.avatar} style={styles.avatar} containerStyle={styles.avatar} />
            </Pressable>
          </View>
        </View>
        <Pressable style={styles.search} onPress={() => router.push('/homestays')}>
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput value={search} onChangeText={setSearch} placeholder="Tìm kiếm homestay, địa điểm..." placeholderTextColor="#64748B" style={styles.input} />
        </Pressable>
        <View style={styles.banner}>
          <Ionicons name="sparkles" size={34} color="#BFDBFE" />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Ưu đãi đặc biệt</Text>
            <Text style={styles.bannerText}>Giảm đến 30% cho đặt trước</Text>
            <Pressable style={styles.bannerButton} onPress={() => router.push('/homestays')}>
              <Text style={styles.bannerButtonText}>Đặt ngay</Text>
              <Ionicons name="arrow-forward" size={15} color="#1D4ED8" />
            </Pressable>
          </View>
        </View>
        <SectionTitle title="Khám phá theo địa điểm" onPress={() => router.push('/locations')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {mockLocations.map(loc => (
            <Pressable key={loc.id} style={styles.locationCard} onPress={() => router.push({ pathname: '/location/[id]' as any, params: { id: loc.id } })}>
              <ProductImage uri={loc.image} style={styles.locationImage} containerStyle={styles.locationImage} />
              <View style={styles.locationOverlay}>
                <Ionicons name={loc.icon} size={24} color="#7C3AED" />
                <Text style={styles.locationName}>{loc.name}</Text>
                <Text style={styles.locationCount}>{loc.homestayCount} homestay</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
        <SectionTitle title="Homestay nổi bật" onPress={() => router.push('/homestays')} />
        <View style={styles.productGrid}>
          {featured.map(homestay => (
            <HomeHomestay key={homestay.id} homestay={homestay} onAdd={() => {
              addToBooking(homestay);
              Alert.alert('Đã lưu', `${homestay.name} đã được thêm vào danh sách đặt phòng.`);
            }} />
          ))}
        </View>
        <SectionTitle title="Homestay mới" onPress={() => router.push('/homestays')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.newList}>
          {newest.map(homestay => (
            <Pressable key={homestay.id} style={styles.newCard} onPress={() => router.push({ pathname: '/homestay/[id]' as any, params: { id: homestay.id } })}>
              <ProductImage uri={homestay.images[0]} style={styles.newImage} containerStyle={styles.newImage} />
              <Text style={styles.newBadge}>NEW</Text>
              <Text numberOfLines={1} style={styles.newName}>{homestay.name}</Text>
              <Text style={styles.newLocation}>{homestay.location}</Text>
              <Text style={styles.newPrice}>{formatPrice(homestay.price)}/đêm</Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionInline}>{title}</Text>
      <Pressable onPress={onPress}>
        <Text style={styles.all}>Xem tất cả</Text>
      </Pressable>
    </View>
  );
}

function HomeHomestay({ homestay, onAdd }: { homestay: Homestay; onAdd: () => void }) {
  return (
    <Pressable style={styles.productCard} onPress={() => router.push({ pathname: '/homestay/[id]' as any, params: { id: homestay.id } })}>
      <ProductImage uri={homestay.images[0]} style={styles.productImage} containerStyle={styles.productImage} />
      {homestay.oldPrice && <Text style={styles.saleBadge}>Giảm {Math.round((1 - homestay.price / homestay.oldPrice) * 100)}%</Text>}
      <Text numberOfLines={1} style={styles.productName}>{homestay.name}</Text>
      <Text style={styles.productLocation}>{homestay.location}</Text>
      <Text style={styles.productPrice}>{formatPrice(homestay.price)}<Text style={styles.perNight}>/đêm</Text></Text>
      <View style={styles.rating}>
        <Ionicons name="star" size={13} color="#F59E0B" />
        <Text style={styles.ratingText}>{homestay.rating}</Text>
      </View>
      <Pressable style={styles.add} onPress={(e) => { e.stopPropagation(); onAdd() }}>
        <Ionicons name="heart-outline" size={18} color="#EF4444" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingBottom: 32 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#DBEAFE' },
  profileAvatar: { borderRadius: 22, overflow: 'hidden' },
  hello: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  welcome: { fontSize: 12, color: '#64748B', marginTop: 3 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  search: { marginHorizontal: 20, height: 48, paddingHorizontal: 14, borderRadius: 14, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0F172A' },
  banner: { margin: 20, padding: 18, borderRadius: 20, backgroundColor: '#2563EB', flexDirection: 'row', gap: 12 },
  bannerContent: { flex: 1 },
  bannerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  bannerText: { fontSize: 13, color: '#DBEAFE', marginTop: 5, lineHeight: 19 },
  bannerButton: { alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 9, backgroundColor: '#FFF', flexDirection: 'row', gap: 5, alignItems: 'center' },
  bannerButtonText: { fontSize: 12, fontWeight: '700', color: '#1D4ED8' },
  sectionRow: { paddingHorizontal: 20, marginTop: 4, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionInline: { fontSize: 19, fontWeight: '700', color: '#0F172A' },
  all: { fontSize: 13, fontWeight: '600', color: '#2563EB' },
  categoryList: { paddingHorizontal: 20, gap: 11, paddingBottom: 22 },
  locationCard: { width: 160, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  locationImage: { width: 160, height: 110 },
  locationOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, backgroundColor: 'rgba(15, 23, 42, 0.7)', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  locationName: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  locationCount: { fontSize: 11, color: '#DBEAFE', marginTop: 2 },
  productGrid: { paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productCard: { width: '48%', backgroundColor: '#FFF', padding: 10, borderRadius: 16, position: 'relative', elevation: 2, shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 8 },
  productImage: { width: '100%', height: 120, borderRadius: 12 },
  saleBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#EF4444', color: '#FFF', fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  productName: { marginTop: 8, fontSize: 14, fontWeight: '700', color: '#1E293B' },
  productLocation: { fontSize: 12, color: '#64748B', marginTop: 2 },
  productPrice: { marginTop: 6, fontSize: 16, fontWeight: '700', color: '#2563EB' },
  perNight: { fontSize: 12, fontWeight: '400', color: '#64748B' },
  rating: { flexDirection: 'row', gap: 3, alignItems: 'center', marginTop: 6 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#1E293B' },
  add: { position: 'absolute', bottom: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  newList: { paddingHorizontal: 20, gap: 12, paddingBottom: 20 },
  newCard: { width: 200, backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', position: 'relative' },
  newImage: { width: 200, height: 130 },
  newBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#10B981', color: '#FFF', fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  newName: { marginTop: 10, paddingHorizontal: 10, fontSize: 14, fontWeight: '700', color: '#1E293B' },
  newLocation: { paddingHorizontal: 10, marginTop: 2, fontSize: 12, color: '#64748B' },
  newPrice: { paddingHorizontal: 10, marginTop: 4, paddingBottom: 12, fontSize: 15, fontWeight: '700', color: '#2563EB' },
});
