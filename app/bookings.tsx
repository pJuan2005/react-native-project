import { ProductImage } from '@/components/product-image';
import { formatPrice, formatDate } from '@/constants/mockData';
import { useBooking, BookingItem } from '@/contexts/BookingContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useResponsive } from '@/utils/responsive';

export default function BookingsScreen() {
  const { isDark, colors } = useAppTheme();
  const { width, height, scale, isSmallDevice, moderateScale, getModalWidth } = useResponsive();
  const qrSize = Math.round(Math.min(width * 0.52, 190));
  const modalCardWidth = getModalWidth(390, 16);
  const paymentModalWidth = getModalWidth(410, 14);

  const {
    bookings,
    savedHomestays,
    removeFromBooking,
    uploadProof,
    removeSaved,
    getBookingsTotal,
    completeStayAndReward,
  } = useBooking();

  const [activeTab, setActiveTab] = useState<'bookings' | 'wishlist'>('bookings');
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<BookingItem | null>(null);

  // Payment Modal State
  const [paymentBooking, setPaymentBooking] = useState<BookingItem | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [transactionCode, setTransactionCode] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

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

  // Safe Cancel Confirmation with Native Alert
  const handlePromptCancel = (booking: BookingItem) => {
    Alert.alert(
      'Xác nhận hủy đặt phòng',
      `Bạn có chắc chắn muốn hủy đơn đặt phòng tại "${booking.name}" không? Thao tác này sẽ cập nhật vào CSDL.`,
      [
        { text: 'Giữ lại', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            const key = booking.id + (booking.checkIn || '');
            const dbId = booking.bookingId || booking.id;
            await removeFromBooking(key, dbId);
            if (selectedBookingDetail?.id === booking.id) {
              setSelectedBookingDetail(null);
            }
            Alert.alert('Đã hủy đặt phòng', `Đơn đặt phòng "${booking.name}" đã được hủy thành công.`);
          },
        },
      ]
    );
  };

  // Image Picker for Payment Proof
  const handlePickProofImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để tải lên minh chứng chuyển khoản.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          setProofImage(`data:image/jpeg;base64,${asset.base64}`);
        } else {
          setProofImage(asset.uri);
        }
      }
    } catch (err) {
      console.warn('Pick proof image failed:', err);
    }
  };

  // Use Demo Mock Bill
  const handleUseMockBill = () => {
    setProofImage(
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
    );
    if (!transactionCode) {
      setTransactionCode(`MB${Date.now().toString().slice(-6)}`);
    }
  };

  // Submit Payment Proof
  const handleSubmitPaymentProof = async () => {
    if (!paymentBooking) return;
    if (!proofImage) {
      Alert.alert('Thiếu minh chứng', 'Vui lòng chọn ảnh chụp biên lai chuyển khoản hoặc sử dụng ảnh mẫu.');
      return;
    }

    setIsSubmittingProof(true);
    const targetId = paymentBooking.bookingId || paymentBooking.id;
    const res = await uploadProof(targetId, proofImage, transactionCode.trim());
    setIsSubmittingProof(false);

    setPaymentBooking(null);
    setProofImage(null);
    setTransactionCode('');

    Alert.alert(
      'Thanh toán thành công! 🎉',
      'Minh chứng chuyển khoản của bạn đã được ghi nhận thành công! Đơn đặt phòng đang chờ Quản trị viên (Web Admin) phê duyệt để chuyển sang trạng thái "Đặt phòng thành công".',
      [{ text: 'Đã hiểu' }]
    );
  };

  // Handle Checkout button in footer
  const handleProceedCheckout = () => {
    const unpaid = bookings.find((b) => b.paymentStatus !== 'completed' && b.status !== 'cancelled');
    if (unpaid) {
      setPaymentBooking(unpaid);
      setProofImage(null);
      setTransactionCode('');
    } else if (bookings.length > 0) {
      Alert.alert('Thông báo', 'Tất cả các phòng đã đặt của bạn đều đã được thanh toán thành công!');
    } else {
      Alert.alert('Chưa có đặt phòng', 'Vui lòng chọn homestay và đặt phòng trước khi thanh toán.');
    }
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

      {/* Segmented Tab Switcher */}
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

      {/* TAB 1: BOOKINGS */}
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
                const isPaid = booking.paymentStatus === 'completed';
                const isConfirmed = booking.status === 'confirmed';

                return (
                  <View style={[s.bookingCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                    {/* Clickable Card Body */}
                    <Pressable
                      style={s.cardTouchable}
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

                        {/* Dual Status Badges */}
                        <View style={s.badgeRow}>
                          {isPaid ? (
                            <View style={s.paidBadge}>
                              <Ionicons name="checkmark-circle" size={11} color="#15803D" />
                              <Text style={s.paidBadgeText}>Đã thanh toán CK</Text>
                            </View>
                          ) : (
                            <View style={s.unpaidBadge}>
                              <Ionicons name="card-outline" size={11} color="#D97706" />
                              <Text style={s.unpaidBadgeText}>Chưa thanh toán</Text>
                            </View>
                          )}

                          {isConfirmed ? (
                            <View style={s.confirmedBadge}>
                              <Ionicons name="shield-checkmark" size={11} color="#0284C7" />
                              <Text style={s.confirmedBadgeText}>Đặt phòng thành công</Text>
                            </View>
                          ) : (
                            <View style={s.pendingBadge}>
                              <Ionicons name="time-outline" size={11} color="#D97706" />
                              <Text style={s.pendingBadgeText}>Chờ Web Admin duyệt</Text>
                            </View>
                          )}
                        </View>

                        <View style={s.itemBottomRow}>
                          <Text style={s.priceLabel}>
                            Tổng: <Text style={[s.priceValue, isDark && { color: '#38BDF8' }]}>{new Intl.NumberFormat('vi-VN').format(booking.totalPrice || booking.price * booking.quantity)} Đ</Text>
                          </Text>

                          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                            {!isPaid && (
                              <Pressable
                                style={[s.payNowBtn, { backgroundColor: colors.primary }]}
                                onPress={() => {
                                  setPaymentBooking(booking);
                                  setProofImage(null);
                                  setTransactionCode('');
                                }}
                              >
                                <Ionicons name="card" size={12} color="#FFFFFF" />
                                <Text style={s.payNowText}>Thanh toán</Text>
                              </Pressable>
                            )}

                            <Pressable
                              style={s.reviewBtn}
                              onPress={() => handleReviewAndReward(booking.bookingId || booking.id, booking.name)}
                            >
                              <Ionicons name="star" size={12} color="#D97706" />
                              <Text style={s.reviewBtnText}>Đánh giá</Text>
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    </Pressable>

                    {/* Independent Trash Button (No event bubbling collision) */}
                    <Pressable
                      style={s.trashBtnCorner}
                      hitSlop={10}
                      onPress={() => handlePromptCancel(booking)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </Pressable>
                  </View>
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
                    onPress={handleProceedCheckout}
                  >
                    <Text style={s.checkoutText}>Tiến hành thanh toán</Text>
                  </Pressable>
                </View>
              }
            />
          )}
        </>
      )}

      {/* TAB 2: WISHLIST */}
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
                <View style={[s.wishlistCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                  <Pressable
                    style={s.cardTouchable}
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
                          onPress={() => router.push({ pathname: '/homestay/[id]' as any, params: { id: homestay.id } })}
                        >
                          <Text style={s.bookNowSmallText}>Đặt ngay</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>

                  <Pressable
                    style={s.trashBtnCorner}
                    hitSlop={10}
                    onPress={() => removeSaved(homestay.id)}
                  >
                    <Ionicons name="heart" size={20} color="#EF4444" />
                  </Pressable>
                </View>
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
          <View style={[s.detailModalCard, { width: modalCardWidth, backgroundColor: isDark ? '#1C2541' : '#FFFFFF' }]}>
            {/* Modal Header */}
            <View style={[s.detailModalHeader, { borderBottomColor: colors.cardBorder }]}>
              <View>
                <Text style={[s.detailModalTitle, { color: colors.text }]}>Chi tiết đơn đặt phòng</Text>
                <Text style={[s.detailModalSubtitle, { color: colors.primary }]}>
                  Mã đơn: {selectedBookingDetail?.bookingCode || 'BK' + selectedBookingDetail?.id}
                </Text>
              </View>
              <Pressable onPress={() => setSelectedBookingDetail(null)} hitSlop={8}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: height * 0.62 }} showsVerticalScrollIndicator={false}>
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

                  {/* Status Badges in Modal */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
                    {selectedBookingDetail?.paymentStatus === 'completed' ? (
                      <View style={s.paidBadge}>
                        <Ionicons name="checkmark-circle" size={11} color="#15803D" />
                        <Text style={s.paidBadgeText}>Đã thanh toán CK</Text>
                      </View>
                    ) : (
                      <View style={s.unpaidBadge}>
                        <Ionicons name="card-outline" size={11} color="#D97706" />
                        <Text style={s.unpaidBadgeText}>Chưa thanh toán</Text>
                      </View>
                    )}

                    {selectedBookingDetail?.status === 'confirmed' ? (
                      <View style={s.confirmedBadge}>
                        <Ionicons name="shield-checkmark" size={11} color="#0284C7" />
                        <Text style={s.confirmedBadgeText}>Đặt phòng thành công</Text>
                      </View>
                    ) : (
                      <View style={s.pendingBadge}>
                        <Ionicons name="time-outline" size={11} color="#D97706" />
                        <Text style={s.pendingBadgeText}>Chờ Web Admin duyệt</Text>
                      </View>
                    )}
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

              {/* Notice regarding approval */}
              <View style={[s.approvalNoticeBox, { backgroundColor: isDark ? '#1C2541' : '#FEF3C7', borderColor: '#F59E0B' }]}>
                <Ionicons name="information-circle" size={16} color="#D97706" />
                <Text style={[s.approvalNoticeText, { color: isDark ? '#FDE68A' : '#92400E' }]}>
                  Chỉ cần chuyển khoản & upload biên lai là thanh toán thành công. Sau đó Web Admin sẽ chấp nhận duyệt phòng để chuyển trạng thái sang "Đặt phòng thành công".
                </Text>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={s.detailModalActions}>
              {selectedBookingDetail?.paymentStatus !== 'completed' && (
                <Pressable
                  style={[s.payInDetailBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    const item = selectedBookingDetail;
                    setSelectedBookingDetail(null);
                    setPaymentBooking(item);
                    setProofImage(null);
                    setTransactionCode('');
                  }}
                >
                  <Ionicons name="card" size={15} color="#FFFFFF" />
                  <Text style={s.payInDetailText}>Thanh toán ngay</Text>
                </Pressable>
              )}

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
                    const item = selectedBookingDetail;
                    setSelectedBookingDetail(null);
                    setTimeout(() => {
                      handlePromptCancel(item);
                    }, 350);
                  }
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                <Text style={s.cancelBookingText}>Hủy phòng</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: TIẾN HÀNH THANH TOÁN (UPLOAD BIÊN LAI / MINH CHỨNG CHUYỂN KHOẢN) */}
      <Modal
        visible={!!paymentBooking}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentBooking(null)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.paymentModalCard, { width: paymentModalWidth, backgroundColor: isDark ? '#1C2541' : '#FFFFFF' }]}>
            {/* Payment Header */}
            <View style={[s.detailModalHeader, { borderBottomColor: colors.cardBorder }]}>
              <View>
                <Text style={[s.detailModalTitle, { color: colors.text }]}>Thanh toán chuyển khoản</Text>
                <Text style={[s.detailModalSubtitle, { color: colors.primary }]}>
                  Đơn phòng: {paymentBooking?.bookingCode}
                </Text>
              </View>
              <Pressable onPress={() => setPaymentBooking(null)} hitSlop={8}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: height * 0.65 }} showsVerticalScrollIndicator={false}>
              {/* QR Code Section */}
              <View style={[s.qrBox, { backgroundColor: isDark ? '#0B132B' : '#F8FAFC', borderColor: colors.cardBorder }]}>
                <Text style={[s.qrTitle, { color: colors.text }]}>Quét mã VietQR chuyển khoản</Text>
                <Image
                  source={{
                    uri: `https://img.vietqr.io/image/mbbank-0988888888-compact2.png?amount=${paymentBooking?.totalPrice || 0}&addInfo=${paymentBooking?.bookingCode || 'DATPHONG'}&accountName=HOMESTAY%20BOOKING%20VN`,
                  }}
                  style={[s.qrImage, { width: qrSize, height: qrSize }]}
                  resizeMode="contain"
                />
                <Text style={s.qrHint}>Tự động nhận diện số tài khoản & số tiền chuyển khoản</Text>
              </View>

              {/* Bank Account Details */}
              <View style={[s.bankInfoBox, { backgroundColor: isDark ? '#0F172A' : '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <BankLine label="Ngân hàng" value="MB Bank (Quân Đội)" isDark={isDark} />
                <BankLine label="Số tài khoản" value="0988 888 888" isDark={isDark} isCopyable />
                <BankLine label="Chủ tài khoản" value="HOMESTAY BOOKING VN" isDark={isDark} />
                <BankLine label="Số tiền cần chuyển" value={formatPrice(paymentBooking?.totalPrice || 0)} isDark={isDark} isHighlight />
                <BankLine label="Nội dung CK" value={paymentBooking?.bookingCode || ''} isDark={isDark} isCopyable />
              </View>

              {/* Upload Proof of Payment */}
              <View style={[s.uploadSection, { borderColor: colors.cardBorder }]}>
                <Text style={[s.uploadTitle, { color: colors.text }]}>
                  📸 Minh chứng chuyển khoản (Bắt buộc)
                </Text>
                <Text style={s.uploadDesc}>
                  Chụp màn hình giao dịch chuyển khoản thành công và tải lên đây để hoàn tất thanh toán.
                </Text>

                {proofImage ? (
                  <View style={s.proofPreviewContainer}>
                    <Image source={{ uri: proofImage }} style={s.proofPreviewImage} resizeMode="cover" />
                    <Pressable style={s.removeProofBtn} onPress={() => setProofImage(null)}>
                      <Ionicons name="trash" size={14} color="#FFFFFF" />
                      <Text style={s.removeProofText}>Chọn ảnh khác</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={s.uploadButtonsRow}>
                    <Pressable style={[s.chooseImageBtn, { backgroundColor: colors.primary }]} onPress={handlePickProofImage}>
                      <Ionicons name="images-outline" size={16} color="#FFFFFF" />
                      <Text style={s.chooseImageText}>Chọn từ thư viện</Text>
                    </Pressable>

                    <Pressable
                      style={[s.demoMockBtn, { backgroundColor: isDark ? '#0B132B' : '#E0F2FE' }]}
                      onPress={handleUseMockBill}
                    >
                      <Ionicons name="flash-outline" size={14} color={colors.primary} />
                      <Text style={[s.demoMockText, { color: colors.primary }]}>Dùng ảnh mẫu (Demo)</Text>
                    </Pressable>
                  </View>
                )}

                {/* Optional Transaction Code */}
                <View style={{ marginTop: 10 }}>
                  <Text style={[s.inputLabel, { color: colors.textSecondary }]}>Mã giao dịch ngân hàng (tùy chọn):</Text>
                  <TextInput
                    value={transactionCode}
                    onChangeText={setTransactionCode}
                    placeholder="VD: FT260918001"
                    placeholderTextColor="#94A3B8"
                    style={[s.inputBox, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.cardBorder }]}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Confirm Submit Button */}
            <View style={s.paymentModalActions}>
              <Pressable
                style={[s.submitProofBtn, { backgroundColor: colors.primary }, (!proofImage || isSubmittingProof) && { opacity: 0.7 }]}
                onPress={handleSubmitPaymentProof}
                disabled={!proofImage || isSubmittingProof}
              >
                {isSubmittingProof ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={16} color="#FFFFFF" />
                    <Text style={s.submitProofText}>Xác nhận thanh toán</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
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

function BankLine({
  label,
  value,
  isDark,
  isHighlight,
  isCopyable,
}: {
  label: string;
  value: string;
  isDark?: boolean;
  isHighlight?: boolean;
  isCopyable?: boolean;
}) {
  return (
    <View style={s.bankLine}>
      <Text style={s.bankLineLabel}>{label}:</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text
          style={[
            s.bankLineValue,
            isDark && { color: '#F8FAFC' },
            isHighlight && { color: '#2563EB', fontWeight: '800', fontSize: 13 },
          ]}
        >
          {value}
        </Text>
        {isCopyable && (
          <Ionicons name="copy-outline" size={12} color="#64748B" />
        )}
      </View>
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
    position: 'relative',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  wishlistCard: {
    position: 'relative',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTouchable: {
    flexDirection: 'row',
    gap: 10,
  },
  trashBtnCorner: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    zIndex: 10,
  },
  bookingImage: { width: 78, height: 86, borderRadius: 8 },
  wishlistImage: { width: 80, height: 80, borderRadius: 8 },
  info: { flex: 1, justifyContent: 'space-between', paddingRight: 24 },
  itemTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '700', flex: 1 },
  location: { fontSize: 11, color: '#64748B', marginTop: 1 },
  dates: { fontSize: 10, color: '#64748B', marginTop: 2 },
  voucherApplied: { fontSize: 10, color: '#0284C7', fontWeight: '600', marginTop: 2 },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 4,
    marginBottom: 2,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  paidBadgeText: { fontSize: 9, fontWeight: '700', color: '#15803D' },
  unpaidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unpaidBadgeText: { fontSize: 9, fontWeight: '700', color: '#B45309' },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  confirmedBadgeText: { fontSize: 9, fontWeight: '700', color: '#0369A1' },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  pendingBadgeText: { fontSize: 9, fontWeight: '700', color: '#D97706' },
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
  payNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  payNowText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
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
  paymentModalCard: {
    width: '100%',
    maxWidth: 400,
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
  approvalNoticeBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
    alignItems: 'center',
  },
  approvalNoticeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
  detailModalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  payInDetailBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
  },
  payInDetailText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  viewHomestayBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
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
    gap: 5,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 12,
  },
  cancelBookingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // QR & Payment Modal
  qrBox: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  qrTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  qrImage: {
    width: 190,
    height: 190,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  qrHint: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 6,
  },
  bankInfoBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    marginBottom: 12,
  },
  bankLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankLineLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  bankLineValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  uploadSection: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 10,
  },
  uploadTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  uploadDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 10,
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chooseImageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  chooseImageText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  demoMockBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    borderRadius: 10,
  },
  demoMockText: {
    fontSize: 11,
    fontWeight: '700',
  },
  proofPreviewContainer: {
    alignItems: 'center',
    gap: 8,
  },
  proofPreviewImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  removeProofBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  removeProofText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
  },
  paymentModalActions: {
    marginTop: 10,
  },
  submitProofBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  submitProofText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
