import { ProductImage } from '@/components/product-image';
import { formatPrice, formatDate } from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function BookingsScreen() {
  const {
    bookings,
    savedHomestays,
    removeFromBooking,
    removeSaved,
    getBookingsTotal,
    completeStayAndReward,
  } = useBooking();

  const total = getBookingsTotal();

  const handleReviewAndReward = (bookingId: string, name: string) => {
    Alert.alert(
      'Đánh giá chuyến đi ⭐',
      `Cảm ơn bạn đã trải nghiệm tại "${name}". Bạn đánh giá chuyến đi thế nào?`,
      [
        {
          text: '5 sao tuyệt vời (+150 điểm)',
          onPress: () => {
            completeStayAndReward(bookingId);
            Alert.alert('Cảm ơn bạn! 🎉', 'Bạn đã nhận được +150 điểm thưởng thành viên vào ví!');
          },
        },
        { text: 'Để sau', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text style={s.title}>Quản lý Đặt phòng</Text>
        <View style={{ width: 28 }} />
      </View>

      {!bookings.length && !savedHomestays.length ? (
        <View style={s.empty}>
          <Ionicons name="calendar-outline" size={60} color="#94A3B8" />
          <Text style={s.emptyTitle}>Chưa có đặt phòng nào</Text>
          <Text style={s.emptyText}>Khám phá các homestay tuyệt vời và đặt chỗ ngay hôm nay.</Text>
          <Pressable style={s.continue} onPress={() => router.push('/homestays')}>
            <Text style={s.continueText}>Khám phá homestay ngay</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={[
            { title: 'Đặt phòng đã xác nhận', data: bookings },
            { title: 'Danh sách yêu thích (Wishlist)', data: savedHomestays },
          ]}
          keyExtractor={(item) => item.title}
          contentContainerStyle={s.contentList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) =>
            item.data.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionTitle}>
                  {item.title} ({item.data.length})
                </Text>
                {item.data.map((booking) => {
                  const key = booking.id + (booking.checkIn || '');
                  return (
                    <View key={key} style={s.item}>
                      <ProductImage
                        uri={booking.homestayImage || booking.images[0]}
                        style={s.image}
                        containerStyle={s.image}
                      />
                      <View style={s.info}>
                        <View style={s.itemTopRow}>
                          <Text numberOfLines={1} style={s.name}>{booking.name}</Text>
                          <Pressable
                            hitSlop={8}
                            onPress={() =>
                              booking.checkIn ? removeFromBooking(key) : removeSaved(booking.id)
                            }
                          >
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                          </Pressable>
                        </View>

                        <Text style={s.location}>📍 {booking.location} • {booking.type}</Text>

                        {booking.checkIn && booking.checkOut && (
                          <Text style={s.dates}>
                            📅 {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} ({booking.nights} đêm) • 👥 {booking.guests} khách
                          </Text>
                        )}

                        {booking.discountAmount ? (
                          <Text style={s.voucherApplied}>
                            🏷️ Đã giảm -{formatPrice(booking.discountAmount)} (Mã: {booking.voucherCode})
                          </Text>
                        ) : null}

                        <View style={s.itemBottomRow}>
                          <Text style={s.price}>
                            {formatPrice(booking.totalPrice || booking.price * booking.quantity)}
                          </Text>

                          {booking.checkIn && (
                            <Pressable
                              style={s.reviewBtn}
                              onPress={() => handleReviewAndReward(booking.id, booking.name)}
                            >
                              <Ionicons name="star" size={12} color="#D97706" />
                              <Text style={s.reviewBtnText}>Đánh giá +150đ</Text>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null
          }
          ListFooterComponent={
            bookings.length > 0 ? (
              <View style={s.summaryCard}>
                <Line label="Tổng giá trị đặt phòng" value={formatPrice(total)} />
                <View style={s.total}>
                  <Text style={s.totalLabel}>Tổng thanh toán</Text>
                  <Text style={s.totalValue}>{formatPrice(total)}</Text>
                </View>
                <Pressable
                  style={s.checkout}
                  onPress={() =>
                    Alert.alert(
                      'Thanh toán',
                      `Xác nhận thanh toán ${formatPrice(total)}. Chức năng tích hợp cổng thanh toán (VNPay/Momo) sẽ được hỗ trợ!`,
                      [{ text: 'Đóng' }]
                    )
                  }
                >
                  <Text style={s.checkoutText}>Tiến hành thanh toán</Text>
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
  return (
    <View style={s.line}>
      <Text style={s.lineLabel}>{label}</Text>
      <Text style={s.lineValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: { padding: 4 },
  title: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  contentList: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 20 },
  emptyTitle: { marginTop: 14, fontSize: 16, fontWeight: '700', color: '#0F172A' },
  emptyText: { marginTop: 6, fontSize: 13, color: '#64748B', textAlign: 'center' },
  continue: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#2563EB',
    borderRadius: 10,
  },
  continueText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  item: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  image: { width: 74, height: 74, borderRadius: 8 },
  info: { flex: 1, justifyContent: 'space-between' },
  itemTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '700', color: '#1E293B', flex: 1, marginRight: 6 },
  location: { fontSize: 11, color: '#64748B', marginTop: 1 },
  dates: { fontSize: 10, color: '#64748B', marginTop: 3 },
  voucherApplied: { fontSize: 10, color: '#16A34A', fontWeight: '600', marginTop: 2 },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reviewBtnText: { fontSize: 10, fontWeight: '700', color: '#B45309' },
  summaryCard: {
    marginTop: 10,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  lineLabel: { color: '#64748B', fontSize: 12 },
  lineValue: { fontWeight: '600', color: '#1E293B', fontSize: 12 },
  total: {
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 6,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#2563EB' },
  checkout: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
