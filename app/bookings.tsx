import { ProductImage } from '@/components/product-image';
import { formatPrice, formatDate } from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingsScreen() {
  const {
    bookings,
    savedHomestays,
    removeFromBooking,
    removeSaved,
    getBookingsTotal,
    completeStayAndReward,
  } = useBooking();

  const [activeTab, setActiveTab] = useState<'bookings' | 'wishlist'>('bookings');
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
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text style={s.title}>
          {activeTab === 'bookings' ? 'Đặt phòng của tôi' : 'Danh sách yêu thích'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Segmented Tab Switcher - Ocean Blue */}
      <View style={s.tabContainer}>
        <Pressable
          style={[s.tabButton, activeTab === 'bookings' && s.tabButtonActive]}
          onPress={() => setActiveTab('bookings')}
        >
          <Ionicons
            name={activeTab === 'bookings' ? 'cart' : 'cart-outline'}
            size={16}
            color={activeTab === 'bookings' ? '#FFFFFF' : '#0369A1'}
          />
          <Text style={[s.tabText, activeTab === 'bookings' && s.tabTextActive]}>
            Phòng đã đặt ({bookings.length})
          </Text>
        </Pressable>

        <Pressable
          style={[s.tabButton, activeTab === 'wishlist' && s.tabButtonActive]}
          onPress={() => setActiveTab('wishlist')}
        >
          <Ionicons
            name={activeTab === 'wishlist' ? 'heart' : 'heart-outline'}
            size={16}
            color={activeTab === 'wishlist' ? '#FFFFFF' : '#EF4444'}
          />
          <Text style={[s.tabText, activeTab === 'wishlist' && s.tabTextActive]}>
            Yêu thích ({savedHomestays.length})
          </Text>
        </Pressable>
      </View>

      {/* TAB 1: CONFIRMED BOOKINGS */}
      {activeTab === 'bookings' && (
        <>
          {bookings.length === 0 ? (
            <View style={s.empty}>
              <View style={s.emptyIconCircle}>
                <Ionicons name="cart-outline" size={38} color="#0284C7" />
              </View>
              <Text style={s.emptyTitle}>Chưa có đặt phòng nào</Text>
              <Text style={s.emptyText}>Khám phá các homestay tuyệt vời và đặt chỗ ngay hôm nay.</Text>
              <Pressable style={s.continue} onPress={() => router.push('/homestays')}>
                <Text style={s.continueText}>Khám phá homestay</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={bookings}
              keyExtractor={(item) => item.id + (item.checkIn || '')}
              contentContainerStyle={s.contentList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: booking }) => {
                const key = booking.id + (booking.checkIn || '');
                return (
                  <View style={s.bookingCard}>
                    <ProductImage
                      uri={booking.homestayImage || booking.images[0]}
                      style={s.bookingImage}
                      containerStyle={s.bookingImage}
                    />
                    <View style={s.info}>
                      <View style={s.itemTopRow}>
                        <Text numberOfLines={1} style={s.name}>{booking.name}</Text>
                        <Pressable hitSlop={8} onPress={() => removeFromBooking(key)}>
                          <Ionicons name="trash-outline" size={17} color="#EF4444" />
                        </Pressable>
                      </View>

                      <Text style={s.location}>📍 by {booking.location} • {booking.type}</Text>

                      {booking.checkIn && booking.checkOut && (
                        <Text style={s.dates}>
                          📅 {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} ({booking.nights} đêm) • 👥 {booking.guests} khách
                        </Text>
                      )}

                      {booking.discountAmount ? (
                        <Text style={s.voucherApplied}>
                          🏷️ Đã giảm -{formatPrice(booking.discountAmount)} ({booking.voucherCode})
                        </Text>
                      ) : null}

                      <View style={s.itemBottomRow}>
                        <Text style={s.priceLabel}>
                          price: <Text style={s.priceValue}>{new Intl.NumberFormat('vi-VN').format(booking.totalPrice || booking.price * booking.quantity)} Đ</Text>
                        </Text>

                        <Pressable
                          style={s.reviewBtn}
                          onPress={() => handleReviewAndReward(booking.id, booking.name)}
                        >
                          <Ionicons name="star" size={12} color="#D97706" />
                          <Text style={s.reviewBtnText}>Đánh giá +150đ</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              }}
              ListFooterComponent={
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
              }
            />
          )}
        </>
      )}

      {/* TAB 2: WISHLIST (DANH SÁCH YÊU THÍCH) */}
      {activeTab === 'wishlist' && (
        <>
          {savedHomestays.length === 0 ? (
            <View style={s.empty}>
              <View style={[s.emptyIconCircle, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="heart-outline" size={38} color="#EF4444" />
              </View>
              <Text style={s.emptyTitle}>Chưa có homestay yêu thích</Text>
              <Text style={s.emptyText}>Nhấn vào biểu tượng trái tim ở các homestay để lưu lại xem sau.</Text>
              <Pressable style={s.continue} onPress={() => router.push('/homestays')}>
                <Text style={s.continueText}>Tìm homestay yêu thích</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={savedHomestays}
              keyExtractor={(item) => item.id}
              contentContainerStyle={s.contentList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: homestay }) => (
                <Pressable
                  style={s.wishlistCard}
                  onPress={() => router.push({ pathname: '/homestay/[id]' as any, params: { id: homestay.id } })}
                >
                  <ProductImage
                    uri={homestay.images[0]}
                    style={s.wishlistImage}
                    containerStyle={s.wishlistImage}
                  />
                  <View style={s.info}>
                    <View style={s.itemTopRow}>
                      <Text numberOfLines={1} style={s.name}>{homestay.name}</Text>
                      <Pressable
                        hitSlop={8}
                        onPress={(e) => {
                          e.stopPropagation();
                          removeSaved(homestay.id);
                        }}
                      >
                        <Ionicons name="heart" size={20} color="#EF4444" />
                      </Pressable>
                    </View>

                    <Text style={s.location}>📍 by {homestay.location} • {homestay.type}</Text>

                    <View style={s.ratingRow}>
                      <Ionicons name="star" size={13} color="#F59E0B" />
                      <Text style={s.ratingText}>
                        {homestay.rating} ({homestay.reviewCount} đánh giá)
                      </Text>
                    </View>

                    <View style={s.wishlistBottomRow}>
                      <Text style={s.priceLabel}>
                        price: <Text style={s.priceValue}>{new Intl.NumberFormat('vi-VN').format(homestay.price)} Đ</Text>
                      </Text>
                      <Pressable
                        style={s.bookNowSmallBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          router.push({ pathname: '/homestay/[id]' as any, params: { id: homestay.id } });
                        }}
                      >
                        <Text style={s.bookNowSmallText}>Đặt ngay</Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              )}
            />
          )}
        </>
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
  screen: { flex: 1, backgroundColor: '#F0F9FF' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E0F2FE',
  },
  backBtn: { padding: 4 },
  title: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 25,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 22,
  },
  tabButtonActive: {
    backgroundColor: '#0284C7',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  contentList: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 20 },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { marginTop: 14, fontSize: 16, fontWeight: '800', color: '#0F172A' },
  emptyText: { marginTop: 4, fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18 },
  continue: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#0284C7',
    borderRadius: 20,
  },
  continueText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  wishlistCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  bookingImage: { width: 74, height: 74, borderRadius: 8 },
  wishlistImage: { width: 80, height: 80, borderRadius: 8 },
  info: { flex: 1, justifyContent: 'space-between' },
  itemTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 6 },
  location: { fontSize: 11, color: '#64748B', marginTop: 1 },
  dates: { fontSize: 10, color: '#64748B', marginTop: 2 },
  voucherApplied: { fontSize: 10, color: '#0284C7', fontWeight: '600', marginTop: 2 },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  wishlistBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: 11, color: '#475569', fontWeight: '500' },
  priceLabel: { fontSize: 11, color: '#475569' },
  priceValue: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
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
  bookNowSmallBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  bookNowSmallText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  summaryCard: {
    marginTop: 10,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
  },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  lineLabel: { color: '#64748B', fontSize: 12 },
  lineValue: { fontWeight: '600', color: '#0F172A', fontSize: 12 },
  total: {
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 6,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#0284C7' },
  checkout: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#0284C7',
    borderRadius: 22,
    alignItems: 'center',
  },
  checkoutText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
