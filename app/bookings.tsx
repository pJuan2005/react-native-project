import { ProductImage } from '@/components/product-image';
import { formatPrice, formatDate } from '@/constants/mockData';
import { useBooking, BookingItem } from '@/contexts/BookingContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function BookingsScreen() {
  const { isDark, colors } = useAppTheme();
  const {
    bookings,
    savedHomestays,
    removeFromBooking,
    removeSaved,
    getBookingsTotal,
    completeStayAndReward,
  } = useBooking();

  const [activeTab, setActiveTab] = useState<'bookings' | 'wishlist'>('bookings');
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<BookingItem | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<BookingItem | null>(null);

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

  const handleConfirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    const key = bookingToCancel.id + (bookingToCancel.checkIn || '');
    const dbId = bookingToCancel.bookingId || bookingToCancel.id;

    await removeFromBooking(key, dbId);
    setBookingToCancel(null);
    if (selectedBookingDetail?.id === bookingToCancel.id) {
      setSelectedBookingDetail(null);
    }
    Alert.alert('Đã hủy đặt phòng', `Đơn đặt phòng "${bookingToCancel.name}" đã được hủy thành công.`);
  };

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.headerBg, borderColor: colors.cardBorder }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[s.title, { color: colors.text }]}>
          {activeTab === 'bookings' ? 'Đặt phòng của tôi' : 'Danh sách yêu thích'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Segmented Tab Switcher - Ocean Blue */}
      <View style={[s.tabContainer, { backgroundColor: isDark ? '#1C2541' : '#E0F2FE' }]}>
        <Pressable
          style={[s.tabButton, activeTab === 'bookings' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('bookings')}
        >
          <Ionicons
            name={activeTab === 'bookings' ? 'cart' : 'cart-outline'}
            size={16}
            color={activeTab === 'bookings' ? '#FFFFFF' : isDark ? '#38BDF8' : '#0369A1'}
          />
          <Text style={[s.tabText, { color: isDark ? '#38BDF8' : '#0369A1' }, activeTab === 'bookings' && { color: '#FFFFFF' }]}>
            Phòng đã đặt ({bookings.length})
          </Text>
        </Pressable>

        <Pressable
          style={[s.tabButton, activeTab === 'wishlist' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('wishlist')}
        >
          <Ionicons
            name={activeTab === 'wishlist' ? 'heart' : 'heart-outline'}
            size={16}
            color={activeTab === 'wishlist' ? '#FFFFFF' : '#EF4444'}
          />
          <Text style={[s.tabText, { color: isDark ? '#38BDF8' : '#0369A1' }, activeTab === 'wishlist' && { color: '#FFFFFF' }]}>
            Yêu thích ({savedHomestays.length})
          </Text>
        </Pressable>
      </View>

      {/* TAB 1: CONFIRMED BOOKINGS */}
      {activeTab === 'bookings' && (
        <>
          {bookings.length === 0 ? (
            <View style={s.empty}>
              <View style={[s.emptyIconCircle, { backgroundColor: isDark ? '#1C2541' : '#E0F2FE' }]}>
                <Ionicons name="cart-outline" size={38} color={colors.primary} />
              </View>
              <Text style={[s.emptyTitle, { color: colors.text }]}>Chưa có đặt phòng nào</Text>
              <Text style={s.emptyText}>Khám phá các homestay tuyệt vời và đặt chỗ ngay hôm nay.</Text>
              <Pressable style={[s.continue, { backgroundColor: colors.primary }]} onPress={() => router.push('/homestays')}>
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
                return (
                  <Pressable
                    style={[s.bookingCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}
                    onPress={() => setSelectedBookingDetail(booking)}
                  >
                    <ProductImage
                      uri={booking.homestayImage || booking.images[0]}
                      style={s.bookingImage}
                      containerStyle={s.bookingImage}
                    />
                    <View style={s.info}>
                      <View style={s.itemTopRow}>
                        <Text numberOfLines={1} style={[s.name, { color: colors.text }]}>{booking.name}</Text>
                        <Pressable
                          hitSlop={8}
                          onPress={(e) => {
                            e.stopPropagation();
                            setBookingToCancel(booking);
                          }}
                        >
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
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
                          price: <Text style={[s.priceValue, isDark && { color: '#38BDF8' }]}>{new Intl.NumberFormat('vi-VN').format(booking.totalPrice || booking.price * booking.quantity)} Đ</Text>
                        </Text>

                        <Pressable
                          style={s.reviewBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleReviewAndReward(booking.bookingId || booking.id, booking.name);
                          }}
                        >
                          <Ionicons name="star" size={12} color="#D97706" />
                          <Text style={s.reviewBtnText}>Đánh giá +150đ</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                );
              }}
              ListFooterComponent={
                <View style={[s.summaryCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                  <Line label="Tổng giá trị đặt phòng" value={formatPrice(total)} isDark={isDark} />
                  <View style={s.total}>
                    <Text style={[s.totalLabel, { color: colors.text }]}>Tổng thanh toán</Text>
                    <Text style={[s.totalValue, { color: colors.primary }]}>{formatPrice(total)}</Text>
                  </View>
                  <Pressable
                    style={[s.checkout, { backgroundColor: colors.primary }]}
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
              <View style={[s.emptyIconCircle, { backgroundColor: isDark ? '#31141B' : '#FEF2F2' }]}>
                <Ionicons name="heart-outline" size={38} color="#EF4444" />
              </View>
              <Text style={[s.emptyTitle, { color: colors.text }]}>Chưa có homestay yêu thích</Text>
              <Text style={s.emptyText}>Nhấn vào biểu tượng trái tim ở các homestay để lưu lại xem sau.</Text>
              <Pressable style={[s.continue, { backgroundColor: colors.primary }]} onPress={() => router.push('/homestays')}>
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
                  style={[s.wishlistCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}
                  onPress={() => router.push({ pathname: '/homestay/[id]' as any, params: { id: homestay.id } })}
                >
                  <ProductImage
                    uri={homestay.images[0]}
                    style={s.wishlistImage}
                    containerStyle={s.wishlistImage}
                  />
                  <View style={s.info}>
                    <View style={s.itemTopRow}>
                      <Text numberOfLines={1} style={[s.name, { color: colors.text }]}>{homestay.name}</Text>
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
                        price: <Text style={[s.priceValue, isDark && { color: '#38BDF8' }]}>{new Intl.NumberFormat('vi-VN').format(homestay.price)} Đ</Text>
                      </Text>
                      <Pressable
                        style={[s.bookNowSmallBtn, { backgroundColor: colors.primary }]}
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

      {/* MODAL 1: CHI TIẾT ĐƠN ĐẶT PHÒNG */}
      <Modal
        visible={!!selectedBookingDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBookingDetail(null)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.detailModalCard, { backgroundColor: isDark ? '#1C2541' : '#FFFFFF' }]}>
            {/* Modal Header */}
            <View style={[s.detailModalHeader, { borderBottomColor: colors.cardBorder }]}>
              <View>
                <Text style={[s.detailModalTitle, { color: colors.text }]}>Chi tiết đơn đặt phòng</Text>
                <Text style={[s.detailModalSubtitle, { color: colors.primary }]}>
                  Mã đơn: {selectedBookingDetail?.bookingCode || 'BK2026' + selectedBookingDetail?.id}
                </Text>
              </View>
              <Pressable onPress={() => setSelectedBookingDetail(null)} hitSlop={8}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {/* Homestay Card Preview */}
              <View style={[s.detailPreviewRow, { backgroundColor: isDark ? '#0B132B' : '#F0F9FF', borderColor: colors.cardBorder }]}>
                <ProductImage
                  uri={selectedBookingDetail?.homestayImage || selectedBookingDetail?.images?.[0] || ''}
                  style={s.detailThumb}
                  containerStyle={s.detailThumb}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[s.detailHsName, { color: colors.text }]}>{selectedBookingDetail?.name}</Text>
                  <Text style={s.detailHsMeta}>📍 {selectedBookingDetail?.location} • {selectedBookingDetail?.type}</Text>
                  <View style={s.statusBadge}>
                    <Ionicons name="shield-checkmark" size={12} color="#15803D" />
                    <Text style={s.statusBadgeText}>
                      {selectedBookingDetail?.status === 'confirmed' ? 'Đã xác nhận đặt phòng' : 'Chờ xác nhận'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Receipt Lines */}
              <View style={[s.receiptBox, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.cardBorder }]}>
                <DetailLine label="Ngày nhận phòng" value={formatDate(selectedBookingDetail?.checkIn || '')} isDark={isDark} />
                <DetailLine label="Ngày trả phòng" value={formatDate(selectedBookingDetail?.checkOut || '')} isDark={isDark} />
                <DetailLine label="Số đêm lưu trú" value={`${selectedBookingDetail?.nights || 1} đêm`} isDark={isDark} />
                <DetailLine label="Số lượng khách" value={`${selectedBookingDetail?.guests || 2} người`} isDark={isDark} />
                <DetailLine
                  label="Giá mỗi đêm"
                  value={formatPrice(selectedBookingDetail?.price || 0)}
                  isDark={isDark}
                />
                {selectedBookingDetail?.discountAmount ? (
                  <DetailLine
                    label="Voucher áp dụng"
                    value={`-${formatPrice(selectedBookingDetail.discountAmount)} (${selectedBookingDetail.voucherCode || 'Ưu đãi'})`}
                    isGreen
                    isDark={isDark}
                  />
                ) : null}
                <View style={[s.totalRow, { borderTopColor: colors.cardBorder }]}>
                  <Text style={[s.totalRowLabel, { color: colors.text }]}>Tổng thanh toán:</Text>
                  <Text style={[s.totalRowValue, { color: colors.primary }]}>
                    {formatPrice(selectedBookingDetail?.totalPrice || (selectedBookingDetail?.price || 0) * (selectedBookingDetail?.quantity || 1))}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={s.detailModalActions}>
              <Pressable
                style={[s.viewHomestayBtn, { backgroundColor: isDark ? '#0B132B' : '#E0F2FE' }]}
                onPress={() => {
                  const hsId = selectedBookingDetail?.id;
                  setSelectedBookingDetail(null);
                  if (hsId) {
                    router.push({ pathname: '/homestay/[id]' as any, params: { id: hsId } });
                  }
                }}
              >
                <Ionicons name="eye-outline" size={16} color={colors.primary} />
                <Text style={[s.viewHomestayText, { color: colors.primary }]}>Xem Homestay</Text>
              </Pressable>

              <Pressable
                style={s.cancelBookingBtn}
                onPress={() => {
                  if (selectedBookingDetail) {
                    setBookingToCancel(selectedBookingDetail);
                  }
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                <Text style={s.cancelBookingText}>Hủy đặt phòng</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: XÁC NHẬN HỦY ĐƠN ĐẶT PHÒNG */}
      <Modal
        visible={!!bookingToCancel}
        transparent
        animationType="fade"
        onRequestClose={() => setBookingToCancel(null)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setBookingToCancel(null)}>
          <Pressable style={[s.confirmCancelBox, { backgroundColor: isDark ? '#1C2541' : '#FFFFFF' }]} onPress={(e) => e.stopPropagation()}>
            <View style={s.cancelWarningIcon}>
              <Ionicons name="alert-circle" size={36} color="#DC2626" />
            </View>

            <Text style={[s.cancelWarningTitle, { color: colors.text }]}>Xác nhận hủy đặt phòng?</Text>
            <Text style={s.cancelWarningDesc}>
              Bạn có chắc chắn muốn hủy đơn đặt phòng tại <Text style={{ fontWeight: '700', color: colors.text }}>"{bookingToCancel?.name}"</Text> không? Sau khi hủy, đơn phòng sẽ được cập nhật vào CSDL.
            </Text>

            <View style={s.confirmActions}>
              <Pressable style={s.closeCancelBtn} onPress={() => setBookingToCancel(null)}>
                <Text style={s.closeCancelText}>Giữ lại</Text>
              </Pressable>

              <Pressable style={s.confirmCancelActionBtn} onPress={handleConfirmCancelBooking}>
                <Text style={s.confirmCancelActionText}>Hủy đơn</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Line({ label, value, isDark }: { label: string; value: string; isDark?: boolean }) {
  return (
    <View style={s.line}>
      <Text style={s.lineLabel}>{label}</Text>
      <Text style={[s.lineValue, isDark && { color: '#F8FAFC' }]}>{value}</Text>
    </View>
  );
}

function DetailLine({
  label,
  value,
  isGreen,
  isDark,
}: {
  label: string;
  value: string;
  isGreen?: boolean;
  isDark?: boolean;
}) {
  return (
    <View style={s.detailLine}>
      <Text style={s.detailLineLabel}>{label}</Text>
      <Text style={[s.detailLineValue, isDark && { color: '#F8FAFC' }, isGreen && { color: '#16A34A', fontWeight: '700' }]}>
        {value}
      </Text>
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
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  contentList: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 20 },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { marginTop: 14, fontSize: 16, fontWeight: '800' },
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
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  wishlistCard: {
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    borderWidth: 1.5,
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
  name: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 6 },
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
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  bookNowSmallText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  summaryCard: {
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
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
  totalLabel: { fontSize: 14, fontWeight: '800' },
  totalValue: { fontSize: 16, fontWeight: '800' },
  checkout: {
    marginTop: 12,
    padding: 12,
    borderRadius: 22,
    alignItems: 'center',
  },
  checkoutText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  // Modal Overlay & Detail Card
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  detailModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  detailModalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  detailModalSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  detailPreviewRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  detailThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  detailHsName: {
    fontSize: 14,
    fontWeight: '700',
  },
  detailHsMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  receiptBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 7,
  },
  detailLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLineLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  detailLineValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  totalRowLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  totalRowValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  detailModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  viewHomestayBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  viewHomestayText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBookingBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 12,
  },
  cancelBookingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Confirm Cancel Dialog
  confirmCancelBox: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 8,
  },
  cancelWarningIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cancelWarningTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  cancelWarningDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  closeCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  confirmCancelActionBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmCancelActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
