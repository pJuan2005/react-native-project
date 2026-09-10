import { ProductImage } from '@/components/product-image';
import { formatPrice, formatDate } from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function BookingsScreen() {
  const { bookings, savedHomestays, removeFromBooking, removeSaved, getBookingsTotal } = useBooking();
  const total = getBookingsTotal();

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></Pressable>
        <Text style={s.title}>Đặt phòng của tôi</Text>
        <View style={{ width: 24 }} />
      </View>
      {!bookings.length && !savedHomestays.length ? (
        <View style={s.empty}>
          <Ionicons name="calendar-outline" size={66} color="#94A3B8" />
          <Text style={s.emptyTitle}>Chưa có đặt phòng nào</Text>
          <Text style={s.emptyText}>Hãy tìm homestay phù hợp và đặt ngay hôm nay.</Text>
          <Pressable style={s.continue} onPress={() => router.push('/homestays')}>
            <Text style={s.continueText}>Khám phá homestay</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={[{ title: 'Đặt phòng đã xác nhận', data: bookings }, { title: 'Đã lưu (Wishlist)', data: savedHomestays }]}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) =>
            item.data.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionTitle}>{item.title} ({item.data.length})</Text>
                <FlatList
                  data={item.data}
                  keyExtractor={(i) => i.id + (i.checkIn || '')}
                  renderItem={({ item: booking }) => (
                    <View style={s.item}>
                      <ProductImage uri={booking.homestayImage || booking.images[0]} style={s.image} containerStyle={s.image} />
                      <View style={s.info}>
                        <Text style={s.name}>{booking.name}</Text>
                        <Text style={s.location}>{booking.location} • {booking.type}</Text>
                        {booking.checkIn && booking.checkOut && (
                          <Text style={s.dates}>
                            <Ionicons name="calendar-outline" size={14} color="#64748B" />
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} ({booking.nights} đêm)
                          </Text>
                        )}
                        {booking.guests && (
                          <Text style={s.dates}>
                            <Ionicons name="people-outline" size={14} color="#64748B" />
                            {booking.guests} khách
                          </Text>
                        )}
                        <Text style={s.price}>{formatPrice(booking.totalPrice || booking.price * booking.quantity)}</Text>
                      </View>
                      <Pressable onPress={() => booking.checkIn ? removeFromBooking(booking.id + (booking.checkIn || '')) : removeSaved(booking.id)}>
                        <Ionicons name="trash-outline" size={21} color="#DC2626" />
                      </Pressable>
                    </View>
                  )}
                  ListEmptyComponent={null}
                />
              </View>
            ) : null
          }
          ListFooterComponent={
            bookings.length > 0 ? (
              <View style={s.summary}>
                <Line label="Tổng đặt phòng" value={formatPrice(total)} />
                <View style={s.total}>
                  <Text style={s.totalLabel}>Tổng cộng</Text>
                  <Text style={s.totalValue}>{formatPrice(total)}</Text>
                </View>
                <Pressable style={s.checkout} onPress={() => Alert.alert('Thanh toán', 'Chức năng thanh toán đang được phát triển.')}>
                  <Text style={s.checkoutText}>Thanh toán ({formatPrice(total)})</Text>
                </Pressable>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return <View style={s.line}><Text style={s.lineLabel}>{label}</Text><Text style={s.lineValue}>{value}</Text></View>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: '700', color: '#0F172A' },
  emptyText: { marginTop: 8, fontSize: 14, color: '#64748B', textAlign: 'center' },
  continue: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 14, backgroundColor: '#2563EB', borderRadius: 12 },
  continueText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  item: { backgroundColor: '#FFF', borderRadius: 16, padding: 12, flexDirection: 'row', gap: 12, marginBottom: 12, elevation: 2, shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 8 },
  image: { width: 80, height: 90, borderRadius: 12 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  location: { fontSize: 12, color: '#64748B', marginTop: 2 },
  dates: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  price: { marginTop: 8, fontSize: 15, fontWeight: '700', color: '#2563EB' },
  summary: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E2E8F0' },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  lineLabel: { color: '#475569' },
  lineValue: { fontWeight: '600', color: '#1E293B' },
  total: { borderTopWidth: 1, borderColor: '#E2E8F0', marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#2563EB' },
  checkout: { marginTop: 16, padding: 16, backgroundColor: '#2563EB', borderRadius: 12, alignItems: 'center' },
  checkoutText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
