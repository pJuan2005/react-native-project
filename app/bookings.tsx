import { PaginationControls } from '@/components/pagination-controls';
import { ProductImage } from '@/components/product-image';
import { formatDate, formatPrice } from '@/constants/mockData';
import { BookingItem, useBooking } from '@/contexts/BookingContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BOOKINGS_PER_PAGE = 5;

const CANCELLATION_REASONS = [
  { code: 'CHANGE_OF_PLAN', label: 'Tôi thay đổi kế hoạch' },
  { code: 'FOUND_ANOTHER_PLACE', label: 'Tìm được chỗ ở khác' },
  { code: 'PRICE_ISSUE', label: 'Giá không phù hợp' },
  { code: 'PROPERTY_ISSUE', label: 'Có vấn đề với chỗ nghỉ' },
  { code: 'SCHEDULE_ISSUE', label: 'Có vấn đề với lịch trình' },
  { code: 'OTHER', label: 'Lý do khác' },
];

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
    previewCancellation,
    cancelBookingWithPolicy,
    refreshBookings,
    uploadProof,
    removeSaved,
    getBookingsTotal,
    completeStayAndReward,
    submitReview,
  } = useBooking();

  const [activeTab, setActiveTab] = useState<'bookings' | 'wishlist'>('bookings');
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<BookingItem | null>(null);

  // Cancel Confirmation Modal State
  const [cancelTarget, setCancelTarget] = useState<BookingItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelPreview, setCancelPreview] = useState<{
    totalPaid?: number;
    refundPercentage?: number;
    refundAmount?: number;
    cancellationFee?: number;
    policyDescription?: string;
    hoursUntilCheckIn?: number;
    loading?: boolean;
  }>({});
  const [selectedReasonCode, setSelectedReasonCode] = useState('CHANGE_OF_PLAN');
  const [otherReasonText, setOtherReasonText] = useState('');
  const [agreePolicy, setAgreePolicy] = useState(false);

  // Payment Modal State
  const [paymentBooking, setPaymentBooking] = useState<BookingItem | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [transactionCode, setTransactionCode] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  // Review Modal State
  const [reviewBookingTarget, setReviewBookingTarget] = useState<BookingItem | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('Trải nghiệm rất tuyệt vời, phòng sạch sẽ và chủ nhà chu đáo!');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [bookingPage, setBookingPage] = useState(1);
  const [wishlistPage, setWishlistPage] = useState(1);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'staying' | 'upcoming' | 'completed' | 'cancelled'>('all');

  const formatLocalDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => formatLocalDateStr(new Date()), []);

  const isBookingPaid = (b: BookingItem) => {
    return (
      b.paymentStatus === 'completed' ||
      b.paymentStatus === 'verified' ||
      b.paymentStatus === 'proof_uploaded' ||
      b.status === 'confirmed' ||
      b.status === 'completed'
    );
  };

  // Đơn đang trong thời gian lưu trú (Đã được duyệt/thanh toán và hôm nay nằm trong khoảng ngày ở)
  const isBookingStaying = (b: BookingItem) => {
    if (b.status === 'cancelled' || b.status === 'completed') return false;
    const isApprovedOrPaid =
      b.status === 'confirmed' ||
      b.paymentStatus === 'verified' ||
      b.paymentStatus === 'completed';
    if (!isApprovedOrPaid) return false;
    if (!b.checkIn || !b.checkOut) return false;
    return b.checkIn <= todayStr && todayStr <= b.checkOut;
  };

  // Đơn sắp tới (Chưa đến ngày check-in)
  const isBookingUpcoming = (b: BookingItem) => {
    if (b.status === 'cancelled' || b.status === 'completed') return false;
    if (isBookingStaying(b)) return false;
    if (b.checkIn && b.checkIn > todayStr) return true;
    return b.status === 'pending' || b.status === 'confirmed';
  };

  // Đơn đã ở qua (Đã hoàn thành hoặc đã qua ngày check-out)
  const isBookingCompleted = (b: BookingItem) => {
    if (b.status === 'cancelled') return false;
    if (b.status === 'completed') return true;
    if (b.checkOut && b.checkOut < todayStr && (b.status === 'confirmed' || isBookingPaid(b))) {
      return true;
    }
    return false;
  };

  const allBookingsCount = bookings.length;
  const stayingBookingsCount = useMemo(() => bookings.filter(isBookingStaying).length, [bookings, todayStr]);
  const upcomingBookingsCount = useMemo(() => bookings.filter(isBookingUpcoming).length, [bookings, todayStr]);
  const completedBookingsCount = useMemo(() => bookings.filter(isBookingCompleted).length, [bookings, todayStr]);
  const cancelledBookingsCount = useMemo(() => bookings.filter((b) => b.status === 'cancelled').length, [bookings]);

  // Filtered bookings based on chip selection
  const displayedBookings = useMemo(() => {
    if (bookingStatusFilter === 'staying') {
      return bookings.filter(isBookingStaying);
    }
    if (bookingStatusFilter === 'upcoming') {
      return bookings.filter(isBookingUpcoming);
    }
    if (bookingStatusFilter === 'completed') {
      return bookings.filter(isBookingCompleted);
    }
    if (bookingStatusFilter === 'cancelled') {
      return bookings.filter((b: BookingItem) => b.status === 'cancelled');
    }
    return bookings;
  }, [bookings, bookingStatusFilter, todayStr]);

  const totalBookingPages = Math.max(1, Math.ceil(displayedBookings.length / BOOKINGS_PER_PAGE));
  const safeBookingPage = Math.min(bookingPage, totalBookingPages);
  const paginatedBookings = useMemo(() => {
    const start = (safeBookingPage - 1) * BOOKINGS_PER_PAGE;
    return displayedBookings.slice(start, start + BOOKINGS_PER_PAGE);
  }, [displayedBookings, safeBookingPage]);

  useEffect(() => {
    setBookingPage(1);
  }, [bookingStatusFilter]);

  const totalWishlistPages = Math.max(1, Math.ceil(savedHomestays.length / BOOKINGS_PER_PAGE));
  const safeWishlistPage = Math.min(wishlistPage, totalWishlistPages);
  const paginatedWishlist = useMemo(() => {
    const start = (safeWishlistPage - 1) * BOOKINGS_PER_PAGE;
    return savedHomestays.slice(start, start + BOOKINGS_PER_PAGE);
  }, [savedHomestays, safeWishlistPage]);

  // Active bookings (not cancelled)
  const activeBookings = useMemo(
    () => bookings.filter((b: BookingItem) => b.status !== 'cancelled'),
    [bookings]
  );

  const total = useMemo(
    () => activeBookings.reduce((sum: number, item: BookingItem) => sum + (item.totalPrice || item.price * item.quantity), 0),
    [activeBookings]
  );

  // Unpaid bookings needing payment
  const unpaidBookings = useMemo(
    () => activeBookings.filter((b: BookingItem) => !isBookingPaid(b)),
    [activeBookings]
  );

  const unpaidTotal = useMemo(
    () => unpaidBookings.reduce((sum: number, item: BookingItem) => sum + (item.totalPrice || item.price * item.quantity), 0),
    [unpaidBookings]
  );

  const allPaid = activeBookings.length > 0 && unpaidBookings.length === 0;

  const handleOpenReviewModal = (booking: BookingItem) => {
    setReviewBookingTarget(booking);
    setReviewRating(booking.reviewRating || 5);
    setReviewComment(
      booking.reviewComment || 'Trải nghiệm rất tuyệt vời, phòng sạch sẽ và chủ nhà chu đáo!'
    );
  };

  const handleConfirmSubmitReview = async () => {
    if (!reviewBookingTarget) return;
    setIsSubmittingReview(true);
    const bId = reviewBookingTarget.bookingId || reviewBookingTarget.id;
    const pId = reviewBookingTarget.id;
    const pointsEarned =
      reviewRating === 5 ? 150 : reviewRating === 4 ? 100 : reviewRating === 3 ? 60 : reviewRating === 2 ? 30 : 10;
    const res = await submitReview(bId, pId, reviewRating, reviewComment.trim(), pointsEarned);
    setIsSubmittingReview(false);

    // Cập nhật cả selectedBookingDetail nếu đang mở
    if (
      selectedBookingDetail &&
      (selectedBookingDetail.bookingId === bId || selectedBookingDetail.id === pId)
    ) {
      setSelectedBookingDetail((prev) =>
        prev ? { ...prev, reviewRating, reviewComment: reviewComment.trim(), status: 'completed' } : null
      );
    }

    setReviewBookingTarget(null);
    Alert.alert('Đánh giá thành công! 🎉', res.message || `Cảm ơn bạn! Bạn nhận được +${pointsEarned} điểm thưởng thành viên vào ví.`);
  };

  // Safe Cancel Confirmation with Server-Driven Policy & Reason
  const handlePromptCancel = async (booking: BookingItem) => {
    // 1. Kiểm tra nếu đơn đang nộp biên lai chờ Web Admin duyệt thì không cho hủy
    const isProofPending = (
      (booking.paymentStatus === 'proof_uploaded' || Boolean(booking.proofImageUrl)) &&
      booking.status !== 'confirmed' &&
      booking.paymentStatus !== 'verified' &&
      booking.paymentStatus !== 'completed'
    );

    if (isProofPending) {
      Alert.alert(
        'Đơn đang chờ duyệt ⏳',
        'Đơn đặt phòng đang được Web Admin đối soát biên lai chuyển khoản. Để đảm bảo an toàn tài chính, bạn không thể hủy phòng trong thời gian chờ duyệt. Vui lòng đợi Admin xác nhận đơn hoặc liên hệ hỗ trợ.'
      );
      return;
    }

    setCancelTarget(booking);
    setSelectedReasonCode('CHANGE_OF_PLAN');
    setOtherReasonText('');
    setAgreePolicy(false);
    setCancelPreview({ loading: true });

    const targetId = booking.bookingId || booking.id;
    const isPaid = booking.paymentStatus === 'completed' || booking.paymentStatus === 'verified';
    const totalAmount = booking.totalPrice || booking.price * booking.quantity || 0;
    const fallbackTotalPaid = isPaid ? totalAmount : 0;

    let fallbackHours = 96;
    if (booking.checkIn) {
      const checkInDate = new Date(`${booking.checkIn}T14:00:00`);
      fallbackHours = Math.round((checkInDate.getTime() - Date.now()) / (1000 * 60 * 60));
    }
    const fallbackRefundPct = fallbackTotalPaid > 0 ? (fallbackHours >= 72 ? 70 : 0) : 0;
    const fallbackRefundAmt = Math.round((fallbackTotalPaid * fallbackRefundPct) / 100);
    const fallbackCancelFee = fallbackTotalPaid - fallbackRefundAmt;

    try {
      const res = await previewCancellation(targetId);
      if (res && res.canCancel !== undefined) {
        setCancelPreview({
          totalPaid: res.totalPaid !== undefined ? res.totalPaid : fallbackTotalPaid,
          refundPercentage: res.refundPercentage !== undefined ? res.refundPercentage : fallbackRefundPct,
          refundAmount: res.refundAmount !== undefined ? res.refundAmount : fallbackRefundAmt,
          cancellationFee: res.cancellationFee !== undefined ? res.cancellationFee : fallbackCancelFee,
          policyDescription: res.policyDescription || '',
          hoursUntilCheckIn: res.hoursUntilCheckIn !== undefined ? res.hoursUntilCheckIn : fallbackHours,
          loading: false,
        });
      } else {
        setCancelPreview({
          totalPaid: fallbackTotalPaid,
          refundPercentage: fallbackRefundPct,
          refundAmount: fallbackRefundAmt,
          cancellationFee: fallbackCancelFee,
          hoursUntilCheckIn: fallbackHours,
          loading: false,
        });
      }
    } catch (_) {
      setCancelPreview({
        totalPaid: fallbackTotalPaid,
        refundPercentage: fallbackRefundPct,
        refundAmount: fallbackRefundAmt,
        cancellationFee: fallbackCancelFee,
        hoursUntilCheckIn: fallbackHours,
        loading: false,
      });
    }
  };

  const confirmCancelBooking = async () => {
    if (!cancelTarget) return;

    if (!agreePolicy) {
      Alert.alert('Chính sách hủy phòng', 'Vui lòng đọc và tích chọn đồng ý với chính sách hủy phòng trước khi tiếp tục.');
      return;
    }

    if (selectedReasonCode === 'OTHER' && otherReasonText.trim().length < 10) {
      Alert.alert('Lý do hủy phòng', 'Vui lòng nhập chi tiết lý do hủy phòng (tối thiểu 10 ký tự).');
      return;
    }

    setIsCancelling(true);
    try {
      const targetId = cancelTarget.bookingId || cancelTarget.id;
      const res = await cancelBookingWithPolicy(
        targetId,
        selectedReasonCode,
        selectedReasonCode === 'OTHER' ? otherReasonText.trim() : undefined
      );

      setIsCancelling(false);
      setCancelTarget(null);
      if (
        selectedBookingDetail?.bookingId === cancelTarget.bookingId ||
        selectedBookingDetail?.id === cancelTarget.id
      ) {
        setSelectedBookingDetail(null);
      }

      if (res && (res.success || res.status === 'cancelled')) {
        const msg = res.refundAmount && res.refundAmount > 0
          ? `Hủy phòng thành công! Số tiền ${formatPrice(res.refundAmount)} (70%) đã được hoàn về Ví của bạn.`
          : 'Hủy phòng thành công.';
        Alert.alert('Đã hủy phòng ✅', msg);
        refreshBookings();
      } else {
        Alert.alert('Lỗi hủy phòng', res?.message || 'Không thể hủy phòng lúc này.');
      }
    } catch (err) {
      setIsCancelling(false);
      Alert.alert('Lỗi kết nối', 'Không thể gửi yêu cầu hủy phòng tới máy chủ.');
    }
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

    if (res.success) {
      Alert.alert(
        'Thanh toán thành công! 🎉',
        res.message || 'Minh chứng chuyển khoản của bạn đã được ghi nhận thành công! Đơn đặt phòng đang chờ Quản trị viên (Web Admin) phê duyệt để chuyển sang trạng thái "Đặt phòng thành công".',
        [{ text: 'Đã hiểu' }]
      );
    } else {
      Alert.alert('Chưa thể gửi minh chứng', res.message || 'Lỗi khi gửi minh chứng thanh toán.');
    }
  };

  // Handle Checkout button in footer
  const handleProceedCheckout = () => {
    const unpaid = bookings.find((b) => !isBookingPaid(b) && b.status !== 'cancelled');
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
          {/* Sub-Filter Status Chips */}
          <View style={s.subFilterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.subFilterScroll}>
              {[
                { key: 'all', label: `Tất cả (${allBookingsCount})`, icon: 'apps-outline' },
                { key: 'staying', label: `Đang ở (${stayingBookingsCount})`, icon: 'bed-outline', isStayingChip: true },
                { key: 'upcoming', label: `Sắp tới (${upcomingBookingsCount})`, icon: 'time-outline' },
                { key: 'completed', label: `Đã ở qua (${completedBookingsCount})`, icon: 'checkmark-circle-outline' },
                { key: 'cancelled', label: `Đã hủy (${cancelledBookingsCount})`, icon: 'close-circle-outline' },
              ].map((chip) => {
                const isSelected = bookingStatusFilter === chip.key;
                const isStayingChip = chip.isStayingChip;
                return (
                  <Pressable
                    key={chip.key}
                    style={[
                      s.subFilterChip,
                      {
                        backgroundColor: isSelected
                          ? isStayingChip ? '#059669' : colors.primary
                          : isDark ? '#1E293B' : '#FFFFFF',
                        borderColor: isSelected
                          ? isStayingChip ? '#059669' : colors.primary
                          : isStayingChip && stayingBookingsCount > 0 ? '#10B981' : isDark ? '#334155' : '#CBD5E1',
                      },
                    ]}
                    onPress={() => setBookingStatusFilter(chip.key as any)}
                  >
                    <Ionicons
                      name={chip.icon as any}
                      size={13}
                      color={
                        isSelected
                          ? '#FFFFFF'
                          : isStayingChip && stayingBookingsCount > 0
                          ? '#059669'
                          : isDark
                          ? '#94A3B8'
                          : '#475569'
                      }
                    />
                    <Text
                      style={[
                        s.subFilterChipText,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : isStayingChip && stayingBookingsCount > 0
                            ? '#059669'
                            : isDark
                            ? '#94A3B8'
                            : '#475569',
                          fontWeight: isSelected || (isStayingChip && stayingBookingsCount > 0) ? '700' : '600',
                        },
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {displayedBookings.length === 0 ? (
            <View style={s.empty}>
              <View style={[s.emptyIconCircle, { backgroundColor: isDark ? '#1C2541' : '#E0F2FE' }]}>
                <Ionicons name="cart-outline" size={38} color={colors.primary} />
              </View>
              <Text style={[s.emptyTitle, { color: colors.text }]}>
                {bookingStatusFilter === 'staying'
                  ? 'Hiện không có đơn phòng nào đang trong thời gian lưu trú'
                  : bookingStatusFilter === 'cancelled'
                  ? 'Chưa có đơn đặt phòng nào bị hủy'
                  : bookingStatusFilter === 'completed'
                  ? 'Chưa có chuyến đi nào đã hoàn tất'
                  : bookingStatusFilter === 'upcoming'
                  ? 'Chưa có đơn phòng nào sắp tới'
                  : 'Chưa có đặt phòng nào'}
              </Text>
              <Text style={s.emptyText}>Khám phá các homestay tuyệt vời và đặt chỗ ngay hôm nay.</Text>
              <Pressable style={[s.continue, { backgroundColor: colors.primary }]} onPress={() => router.push('/homestays')}>
                <Text style={s.continueText}>Khám phá homestay</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={paginatedBookings}
              keyExtractor={(item, index) =>
                item.bookingId
                  ? `booking-${item.bookingId}-${index}`
                  : item.bookingCode
                  ? `code-${item.bookingCode}-${index}`
                  : `item-${item.id}-${item.checkIn || ''}-${index}`
              }
              contentContainerStyle={s.contentList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: booking }) => {
                const isPaid = booking.paymentStatus === 'completed' || booking.paymentStatus === 'verified';
                const isProofUploaded = booking.paymentStatus === 'proof_uploaded' || Boolean(booking.proofImageUrl);
                const isConfirmed = booking.status === 'confirmed';
                const isCompleted = booking.status === 'completed';
                const isCancelled = booking.status === 'cancelled';
                const isStaying = isBookingStaying(booking);

                return (
                  <View style={[
                    s.bookingCard,
                    { backgroundColor: colors.cardBackground, borderColor: isCancelled ? '#FECACA' : colors.cardBorder },
                    isCancelled && { borderLeftWidth: 4, borderLeftColor: '#DC2626' },
                  ]}>
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
                          {isCancelled ? (
                            <View style={s.cancelledBadge}>
                              <Ionicons name="close-circle" size={11} color="#DC2626" />
                              <Text style={s.cancelledBadgeText}>Đã hủy phòng</Text>
                            </View>
                          ) : isCompleted ? (
                            <View style={s.completedBadge}>
                              <Ionicons name="checkmark-done-circle" size={11} color="#16A34A" />
                              <Text style={s.completedBadgeText}>Đã hoàn thành chuyến đi</Text>
                            </View>
                          ) : isStaying ? (
                            <>
                              <View style={s.stayingBadge}>
                                <Ionicons name="bed" size={11} color="#059669" />
                                <Text style={s.stayingBadgeText}>Đang lưu trú</Text>
                              </View>
                              <View style={s.confirmedBadge}>
                                <Ionicons name="shield-checkmark" size={11} color="#0284C7" />
                                <Text style={s.confirmedBadgeText}>Đã duyệt</Text>
                              </View>
                            </>
                          ) : (
                            <>
                              {isPaid ? (
                                <View style={s.paidBadge}>
                                  <Ionicons name="checkmark-circle" size={11} color="#15803D" />
                                  <Text style={s.paidBadgeText}>Đã thanh toán CK</Text>
                                </View>
                              ) : isProofUploaded ? (
                                <View style={[s.paidBadge, { backgroundColor: isDark ? '#082F49' : '#E0F2FE', borderColor: '#7DD3FC' }]}>
                                  <Ionicons name="document-text" size={11} color="#0284C7" />
                                  <Text style={[s.paidBadgeText, { color: '#0284C7' }]}>Đã gửi biên lai</Text>
                                </View>
                              ) : (
                                <>
                                  <View style={s.unpaidBadge}>
                                    <Ionicons name="card-outline" size={11} color="#D97706" />
                                    <Text style={s.unpaidBadgeText}>Chưa thanh toán</Text>
                                  </View>
                                  <View style={s.holdBadge}>
                                    <Ionicons name="hourglass-outline" size={10} color="#C2410C" />
                                    <Text style={s.holdBadgeText}>Hạn 15 phút</Text>
                                  </View>
                                </>
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
                            </>
                          )}
                        </View>

                        {/* Cancelled Snippet Info */}
                        {isCancelled && (
                          <View style={[s.cancelInfoSnippet, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2' }]}>
                            <Text style={s.cancelInfoSnippetTitle} numberOfLines={1}>
                              Lý do: {booking.cancelledReason || 'Khách hủy theo yêu cầu'}
                            </Text>
                            {booking.refundAmount && booking.refundAmount > 0 ? (
                              <Text style={s.cancelInfoSnippetRefund}>
                                💰 Đã hoàn ví: +{formatPrice(booking.refundAmount)} ({booking.refundPercentage || 70}%)
                              </Text>
                            ) : booking.cancellationPolicyApplied === 'CANCEL_UNPAID_FREE' || booking.paymentStatus === 'unpaid' || booking.paymentStatus === 'rejected' ? (
                              <Text style={[s.cancelInfoSnippetNoRefund, { color: '#059669' }]}>
                                🔓 Hủy miễn phí 100% (Đơn chưa thanh toán)
                              </Text>
                            ) : (
                              <Text style={s.cancelInfoSnippetNoRefund}>
                                🔒 Không hoàn cọc (Hủy sát ngày &lt; 72h)
                              </Text>
                            )}
                          </View>
                        )}

                        {/* Hiển thị đánh giá của khách nếu đơn đã hoàn thành */}
                        {isCompleted && Boolean(booking.reviewRating) && (
                          <View style={[s.userReviewSnippet, { backgroundColor: isDark ? '#0B132B' : '#FFFBEB', borderColor: isDark ? '#334155' : '#FDE68A' }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                              <Ionicons name="star" size={11} color="#F59E0B" />
                              <Text style={s.userReviewSnippetStars}>Đã đánh giá {booking.reviewRating}★:</Text>
                            </View>
                            <Text style={[s.userReviewSnippetComment, { color: colors.text }]} numberOfLines={1}>
                              "{booking.reviewComment || 'Trải nghiệm rất tuyệt vời!'}"
                            </Text>
                          </View>
                        )}

                        <View style={s.itemBottomRow}>
                          <Text style={s.priceLabel}>
                            Tổng: <Text style={[s.priceValue, isDark && { color: '#38BDF8' }]}>{new Intl.NumberFormat('vi-VN').format(booking.totalPrice || booking.price * booking.quantity)} Đ</Text>
                          </Text>

                          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                            {isCancelled ? (
                              <Pressable
                                style={[s.rebookBtn, { backgroundColor: colors.primary }]}
                                onPress={() => router.push(`/homestay/${booking.id}` as any)}
                              >
                                <Ionicons name="refresh" size={12} color="#FFFFFF" />
                                <Text style={s.rebookText}>Đặt lại</Text>
                              </Pressable>
                            ) : isCompleted ? (
                              <Pressable
                                style={[
                                  s.reviewBtn,
                                  Boolean(booking.reviewRating) && {
                                    backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                                    borderColor: '#6EE7B7',
                                  },
                                ]}
                                onPress={() => handleOpenReviewModal(booking)}
                              >
                                <Ionicons name="star" size={12} color={booking.reviewRating ? '#059669' : '#D97706'} />
                                <Text style={[s.reviewBtnText, Boolean(booking.reviewRating) && { color: '#059669' }]}>
                                  {booking.reviewRating ? `Đã đánh giá (${booking.reviewRating}★)` : 'Đánh giá'}
                                </Text>
                              </Pressable>
                            ) : (
                              <>
                                {!isPaid && !isProofUploaded && (
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
                                  onPress={() => handleOpenReviewModal(booking)}
                                >
                                  <Ionicons name="star" size={12} color="#D97706" />
                                  <Text style={s.reviewBtnText}>Đánh giá</Text>
                                </Pressable>
                              </>
                            )}
                          </View>
                        </View>
                      </View>
                    </Pressable>

                    {/* Independent Trash Button (Chỉ hiển thị cho đơn chưa hủy, chưa hoàn thành và không phải đang chờ Admin duyệt biên lai) */}
                    {!isCancelled && !isCompleted && !isProofUploaded && (
                      <Pressable
                        style={s.trashBtnCorner}
                        hitSlop={10}
                        onPress={() => handlePromptCancel(booking)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </Pressable>
                    )}
                  </View>
                );
              }}
              ListFooterComponent={
                <>
                  {totalBookingPages > 1 && (
                    <PaginationControls
                      currentPage={safeBookingPage}
                      totalPages={totalBookingPages}
                      totalItems={activeBookings.length}
                      pageSize={BOOKINGS_PER_PAGE}
                      itemLabel="đơn đặt phòng"
                      onPageChange={setBookingPage}
                    />
                  )}
                  {activeBookings.length > 0 ? (
                    <View style={[s.summaryCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                      <Line label="Tổng giá trị đặt phòng" value={formatPrice(total)} isDark={isDark} />

                      {allPaid ? (
                        <>
                          <View style={s.total}>
                            <Text style={[s.totalLabel, { color: colors.text }]}>Số tiền cần thanh toán</Text>
                            <Text style={[s.totalValue, { color: '#16A34A' }]}>0 ₫</Text>
                          </View>
                          <View style={[s.allPaidBanner, { backgroundColor: isDark ? '#052E16' : '#DCFCE7', borderColor: '#86EFAC' }]}>
                            <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                            <Text style={[s.allPaidBannerText, { color: '#16A34A' }]}>
                              Tất cả đơn phòng đã hoàn tất thanh toán
                            </Text>
                          </View>
                        </>
                      ) : (
                        <>
                          <View style={s.total}>
                            <Text style={[s.totalLabel, { color: colors.text }]}>
                              Cần thanh toán ({unpaidBookings.length} đơn)
                            </Text>
                            <Text style={[s.totalValue, { color: colors.primary }]}>{formatPrice(unpaidTotal)}</Text>
                          </View>
                          <Pressable
                            style={[s.checkout, { backgroundColor: colors.primary }]}
                            onPress={handleProceedCheckout}
                          >
                            <Text style={s.checkoutText}>
                              Tiến hành thanh toán ({formatPrice(unpaidTotal)})
                            </Text>
                          </Pressable>
                        </>
                      )}
                    </View>
                  ) : null}
                </>
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
              data={paginatedWishlist}
              keyExtractor={(item, index) => `wishlist-${item.id}-${index}`}
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
              ListFooterComponent={
                totalWishlistPages > 1 ? (
                  <PaginationControls
                    currentPage={safeWishlistPage}
                    totalPages={totalWishlistPages}
                    totalItems={savedHomestays.length}
                    pageSize={BOOKINGS_PER_PAGE}
                    itemLabel="chỗ nghỉ yêu thích"
                    onPageChange={setWishlistPage}
                  />
                ) : null
              }
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
                    {selectedBookingDetail?.status === 'cancelled' ? (
                      <>
                        <View style={s.cancelledBadge}>
                          <Ionicons name="close-circle" size={11} color="#DC2626" />
                          <Text style={s.cancelledBadgeText}>Đã hủy phòng</Text>
                        </View>
                        {selectedBookingDetail?.refundAmount && selectedBookingDetail.refundAmount > 0 ? (
                          <View style={s.paidBadge}>
                            <Ionicons name="wallet-outline" size={11} color="#15803D" />
                            <Text style={s.paidBadgeText}>Đã hoàn ví: +{formatPrice(selectedBookingDetail.refundAmount)}</Text>
                          </View>
                        ) : selectedBookingDetail?.cancellationPolicyApplied === 'CANCEL_UNPAID_FREE' || selectedBookingDetail?.paymentStatus === 'unpaid' ? (
                          <View style={s.unpaidBadge}>
                            <Ionicons name="shield-checkmark-outline" size={11} color="#059669" />
                            <Text style={[s.unpaidBadgeText, { color: '#059669' }]}>Hủy miễn phí 100%</Text>
                          </View>
                        ) : (
                          <View style={s.unpaidBadge}>
                            <Ionicons name="lock-closed-outline" size={11} color="#DC2626" />
                            <Text style={[s.unpaidBadgeText, { color: '#DC2626' }]}>Không hoàn cọc (&lt; 72h)</Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <>
                        {selectedBookingDetail?.paymentStatus === 'completed' || selectedBookingDetail?.paymentStatus === 'verified' ? (
                          <View style={s.paidBadge}>
                            <Ionicons name="checkmark-circle" size={11} color="#15803D" />
                            <Text style={s.paidBadgeText}>Đã thanh toán CK</Text>
                          </View>
                        ) : selectedBookingDetail?.paymentStatus === 'proof_uploaded' || Boolean(selectedBookingDetail?.proofImageUrl) ? (
                          <View style={[s.paidBadge, { backgroundColor: isDark ? '#082F49' : '#E0F2FE', borderColor: '#7DD3FC' }]}>
                            <Ionicons name="document-text" size={11} color="#0284C7" />
                            <Text style={[s.paidBadgeText, { color: '#0284C7' }]}>Đã gửi biên lai CK</Text>
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
                        ) : selectedBookingDetail?.status === 'completed' || (selectedBookingDetail && isBookingCompleted(selectedBookingDetail)) ? (
                          <View style={s.completedBadge}>
                            <Ionicons name="checkmark-done-circle" size={11} color="#16A34A" />
                            <Text style={s.completedBadgeText}>Đã hoàn thành chuyến đi</Text>
                          </View>
                        ) : (
                          <View style={s.pendingBadge}>
                            <Ionicons name="time-outline" size={11} color="#D97706" />
                            <Text style={s.pendingBadgeText}>Chờ Web Admin duyệt</Text>
                          </View>
                        )}

                        {selectedBookingDetail && isBookingStaying(selectedBookingDetail) && (
                          <View style={s.stayingBadge}>
                            <Ionicons name="bed" size={11} color="#059669" />
                            <Text style={s.stayingBadgeText}>Đang lưu trú</Text>
                          </View>
                        )}
                      </>
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

              {/* Notice regarding approval / cancellation */}
              {selectedBookingDetail?.status === 'cancelled' ? (
                <View style={[s.approvalNoticeBox, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2', borderColor: '#FCA5A5' }]}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <Text style={[s.approvalNoticeText, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
                    Đơn phòng này đã hủy vào lúc {selectedBookingDetail.cancelledAt ? new Date(selectedBookingDetail.cancelledAt).toLocaleString('vi-VN') : 'vừa qua'}.
                    {'\n'}Lý do hủy: {selectedBookingDetail.cancelledReason || 'Khách yêu cầu hủy phòng.'}
                  </Text>
                </View>
              ) : selectedBookingDetail && isBookingStaying(selectedBookingDetail) ? (
                <View style={[s.approvalNoticeBox, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: '#6EE7B7' }]}>
                  <Ionicons name="home" size={16} color="#059669" />
                  <Text style={[s.approvalNoticeText, { color: isDark ? '#A7F3D0' : '#065F46' }]}>
                    🎉 Bạn hiện đang trong thời gian lưu trú tại homestay này (Trả phòng: {formatDate(selectedBookingDetail.checkOut)}). Chúc bạn có kỳ nghỉ thật tuyệt vời!
                  </Text>
                </View>
              ) : selectedBookingDetail && (selectedBookingDetail.status === 'completed' || isBookingCompleted(selectedBookingDetail)) ? (
                <View style={[s.approvalNoticeBox, { backgroundColor: isDark ? '#052E16' : '#DCFCE7', borderColor: '#86EFAC' }]}>
                  <Ionicons name="checkmark-done-circle" size={16} color="#16A34A" />
                  <Text style={[s.approvalNoticeText, { color: isDark ? '#86EFAC' : '#15803D' }]}>
                    🎉 Chuyến đi đã hoàn thành xuất sắc! Cảm ơn bạn đã lựa chọn trải nghiệm chỗ nghỉ.
                  </Text>
                </View>
              ) : selectedBookingDetail?.paymentStatus === 'completed' || selectedBookingDetail?.paymentStatus === 'verified' ? (
                <View style={[s.approvalNoticeBox, { backgroundColor: isDark ? '#052E16' : '#DCFCE7', borderColor: '#86EFAC' }]}>
                  <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                  <Text style={[s.approvalNoticeText, { color: isDark ? '#86EFAC' : '#15803D' }]}>
                    Đơn phòng đã được Web Admin xác minh thanh toán thành công! Chúc bạn có kỳ nghỉ tuyệt vời.
                  </Text>
                </View>
              ) : selectedBookingDetail?.paymentStatus === 'proof_uploaded' || Boolean(selectedBookingDetail?.proofImageUrl) ? (
                <View style={[s.approvalNoticeBox, { backgroundColor: isDark ? '#082F49' : '#E0F2FE', borderColor: '#7DD3FC' }]}>
                  <Ionicons name="shield-checkmark" size={16} color="#0284C7" />
                  <Text style={[s.approvalNoticeText, { color: isDark ? '#BAE6FD' : '#0369A1' }]}>
                    Biên lai chuyển khoản đã được gửi thành công! Đơn phòng đang chờ Web Admin kiểm tra và duyệt phòng.
                  </Text>
                </View>
              ) : (
                <View style={[s.approvalNoticeBox, { backgroundColor: isDark ? '#1C2541' : '#FEF3C7', borderColor: '#F59E0B' }]}>
                  <Ionicons name="information-circle" size={16} color="#D97706" />
                  <Text style={[s.approvalNoticeText, { color: isDark ? '#FDE68A' : '#92400E' }]}>
                    Chỉ cần chuyển khoản & upload biên lai là thanh toán thành công. Sau đó Web Admin sẽ chấp nhận duyệt phòng để chuyển trạng thái sang "Đặt phòng thành công".
                  </Text>
                </View>
              )}

              {/* Khung hiển thị đánh giá của khách trong modal chi tiết */}
              {selectedBookingDetail && (selectedBookingDetail.status === 'completed' || isBookingCompleted(selectedBookingDetail)) && (
                <View style={[s.detailReviewCard, { backgroundColor: isDark ? '#0F172A' : '#FFFBEB', borderColor: isDark ? '#334155' : '#FDE68A' }]}>
                  {selectedBookingDetail.reviewRating ? (
                    <>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={{ fontWeight: '700', color: colors.text, fontSize: 13 }}>Đánh giá của bạn:</Text>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= (selectedBookingDetail.reviewRating || 5) ? 'star' : 'star-outline'}
                              size={14}
                              color="#F59E0B"
                            />
                          ))}
                        </View>
                        <Pressable
                          hitSlop={8}
                          onPress={() => {
                            const item = selectedBookingDetail;
                            setSelectedBookingDetail(null);
                            handleOpenReviewModal(item);
                          }}
                        >
                          <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700' }}>Sửa</Text>
                        </Pressable>
                      </View>
                      <Text style={{ fontSize: 12, color: colors.text, fontStyle: 'italic', lineHeight: 17 }}>
                        "{selectedBookingDetail.reviewComment || 'Trải nghiệm rất tuyệt vời!'}"
                      </Text>
                    </>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={{ fontWeight: '700', color: '#B45309', fontSize: 13 }}>⭐ Chưa đánh giá chuyến đi</Text>
                        <Text style={{ fontSize: 11, color: '#D97706', marginTop: 2 }}>Đánh giá ngay nhận tới +150 điểm thưởng thành viên!</Text>
                      </View>
                      <Pressable
                        style={s.reviewNowModalBtn}
                        onPress={() => {
                          const item = selectedBookingDetail;
                          setSelectedBookingDetail(null);
                          handleOpenReviewModal(item);
                        }}
                      >
                        <Text style={s.reviewNowModalText}>Đánh giá ngay</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Modal Actions */}
            <View style={s.detailModalActions}>
              {/* Nút Đánh giá trong Modal Chi tiết cho đơn đã hoàn thành */}
              {selectedBookingDetail &&
               (selectedBookingDetail.status === 'completed' || isBookingCompleted(selectedBookingDetail)) && (
                <Pressable
                  style={[s.reviewInDetailActionBtn, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
                  onPress={() => {
                    const item = selectedBookingDetail;
                    setSelectedBookingDetail(null);
                    handleOpenReviewModal(item);
                  }}
                >
                  <Ionicons name="star" size={15} color="#D97706" />
                  <Text style={s.reviewInDetailActionText}>
                    {selectedBookingDetail.reviewRating ? 'Sửa đánh giá chuyến đi' : '⭐ Viết đánh giá (lên tới +150 điểm)'}
                  </Text>
                </Pressable>
              )}

              {selectedBookingDetail?.status !== 'cancelled' &&
               selectedBookingDetail?.status !== 'completed' &&
               !(selectedBookingDetail && isBookingCompleted(selectedBookingDetail)) &&
               selectedBookingDetail?.paymentStatus !== 'completed' &&
               selectedBookingDetail?.paymentStatus !== 'verified' &&
               selectedBookingDetail?.paymentStatus !== 'proof_uploaded' &&
               !Boolean(selectedBookingDetail?.proofImageUrl) && (
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

              {/* Chat với chủ nhà (chỉ khi đơn chưa hủy) */}
              {selectedBookingDetail?.status !== 'cancelled' && (
                <Pressable
                  style={[s.chatInDetailBtn, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}
                  onPress={() => {
                    const bId = selectedBookingDetail?.bookingId || selectedBookingDetail?.id;
                    setSelectedBookingDetail(null);
                    if (bId) {
                      router.push({ pathname: '/chat/[id]' as any, params: { id: bId } });
                    }
                  }}
                >
                  <Ionicons name="chatbubbles-outline" size={15} color="#0284C7" />
                  <Text style={s.chatInDetailText}>Nhắn tin với chủ nhà</Text>
                </Pressable>
              )}

              {/* Trợ giúp & Khiếu nại */}
              <Pressable
                style={[s.disputeInDetailBtn, { backgroundColor: isDark ? '#1C2541' : '#F8FAFC', borderColor: colors.cardBorder }]}
                onPress={() => {
                  const bId = selectedBookingDetail?.bookingId || selectedBookingDetail?.id;
                  setSelectedBookingDetail(null);
                  if (bId) {
                    router.push({ pathname: '/dispute/[id]' as any, params: { id: bId } });
                  }
                }}
              >
                <Ionicons name="shield-outline" size={15} color="#D97706" />
                <Text style={s.disputeInDetailText}>Trợ giúp & Khiếu nại</Text>
              </Pressable>

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
                <Ionicons name="eye-outline" size={15} color={colors.primary} />
                <Text style={[s.viewHomestayText, { color: colors.primary }]}>
                  {selectedBookingDetail?.status === 'cancelled' ? 'Đặt lại phòng này' : 'Xem chi tiết chỗ nghỉ'}
                </Text>
              </Pressable>

              {/* Nút hủy phòng: CHỈ HIỂN THỊ KHI ĐƠN CHƯA HỦY, CHƯA HOÀN THÀNH VÀ KHÔNG PHẢI ĐANG CHỜ ADMIN DUYỆT BIÊN LAI */}
              {selectedBookingDetail?.status !== 'cancelled' &&
               selectedBookingDetail?.status !== 'completed' &&
               !(selectedBookingDetail && isBookingCompleted(selectedBookingDetail)) &&
               !(
                 (selectedBookingDetail?.paymentStatus === 'proof_uploaded' || Boolean(selectedBookingDetail?.proofImageUrl)) &&
                 selectedBookingDetail?.status !== 'confirmed' &&
                 selectedBookingDetail?.paymentStatus !== 'verified'
               ) && (
                <Pressable
                  style={s.cancelBookingBtn}
                  onPress={() => {
                    if (selectedBookingDetail) {
                      const item = selectedBookingDetail;
                      setSelectedBookingDetail(null);
                      handlePromptCancel(item);
                    }
                  }}
                >
                  <Ionicons name="trash-outline" size={15} color="#FFFFFF" />
                  <Text style={s.cancelBookingText}>Hủy đặt phòng</Text>
                </Pressable>
              )}
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
              {/* Payment Deadline 15-Minute Notice */}
              <View style={[s.paymentDeadlineBox, { backgroundColor: isDark ? '#3E1F03' : '#FEF3C7', borderColor: '#F59E0B' }]}>
                <Ionicons name="time" size={16} color="#D97706" />
                <Text style={[s.paymentDeadlineText, { color: isDark ? '#FEF08A' : '#92400E' }]}>
                  Thời hạn giữ phòng: 15 phút. Quá 15 phút không thanh toán, hệ thống sẽ tự động hủy đơn và mở lại lịch cho khách khác. Hủy quá 3 lần/24h tài khoản sẽ bị hạn chế đặt phòng.
                </Text>
              </View>

              {/* QR Code Section */}
              <View style={[s.qrBox, { backgroundColor: isDark ? '#0B132B' : '#F8FAFC', borderColor: colors.cardBorder }]}>
                <Text style={[s.qrTitle, { color: colors.text }]}>Quét mã VietQR chuyển khoản</Text>
                <Image
                  source={{
                    uri: `https://img.vietqr.io/image/TCB-19071766471019-compact2.png?amount=${paymentBooking?.totalPrice || 0}&addInfo=${paymentBooking?.bookingCode || 'DATPHONG'}&accountName=PHAM%20XUAN%20CHUAN`,
                  }}
                  style={[s.qrImage, { width: qrSize, height: qrSize }]}
                  resizeMode="contain"
                />
                <Text style={s.qrHint}>Tự động nhận diện số tài khoản & số tiền chuyển khoản</Text>
              </View>

              {/* Bank Account Details */}
              <View style={[s.bankInfoBox, { backgroundColor: isDark ? '#0F172A' : '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <BankLine label="Ngân hàng" value="Techcombank (TCB)" isDark={isDark} />
                <BankLine label="Số tài khoản" value="1907 1766 4710 19" isDark={isDark} isCopyable copyText="19071766471019" />
                <BankLine label="Chủ tài khoản" value="PHAM XUAN CHUAN" isDark={isDark} />
                <BankLine label="Số tiền cần chuyển" value={formatPrice(paymentBooking?.totalPrice || 0)} isDark={isDark} isHighlight />
                <BankLine label="Nội dung CK" value={paymentBooking?.bookingCode || ''} isDark={isDark} isCopyable copyText={paymentBooking?.bookingCode || ''} />
              </View>

              {/* Upload Proof of Payment */}
              <View style={[s.uploadSection, { borderColor: colors.cardBorder }]}>
                <Text style={[s.uploadTitle, { color: colors.text }]}>
                  Biên lai chuyển khoản
                </Text>
                <Text style={s.uploadDesc}>
                  Tải lên ảnh chụp màn hình giao dịch chuyển khoản thành công để hoàn tất xác nhận đơn phòng.
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
                  <Pressable style={[s.chooseImageBtn, { backgroundColor: colors.primary }]} onPress={handlePickProofImage}>
                    <Ionicons name="images-outline" size={16} color="#FFFFFF" />
                    <Text style={s.chooseImageText}>Tải ảnh biên lai lên</Text>
                  </Pressable>
                )}

                {/* Optional Transaction Code */}
                <View style={{ marginTop: 10 }}>
                  <Text style={[s.inputLabel, { color: colors.textSecondary }]}>Mã giao dịch ngân hàng (nếu có):</Text>
                  <TextInput
                    value={transactionCode}
                    onChangeText={setTransactionCode}
                    placeholder="Ví dụ: FT260918001"
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

      {/* MODAL 3: XÁC NHẬN HỦY ĐẶT PHÒNG & CHÍNH SÁCH HOÀN TIỀN CỦA SERVER */}
      <Modal
        visible={!!cancelTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setCancelTarget(null)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.cancelModalCard, { width: modalCardWidth, backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <View style={s.cancelModalHeader}>
              <View style={s.cancelIconCircle}>
                <Ionicons name="alert-circle" size={24} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.cancelModalTitle, { color: colors.text }]}>Hủy đặt phòng & Hoàn tiền</Text>
                <Text style={s.cancelModalCodeText}>
                  Đơn phòng: {cancelTarget?.bookingCode || '#' + cancelTarget?.id} • {cancelTarget?.name}
                </Text>
              </View>
              <Pressable onPress={() => setCancelTarget(null)} hitSlop={8}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: height * 0.58 }} showsVerticalScrollIndicator={false}>
              {/* Server-computed Policy Breakdown */}
              <View style={[s.policyBreakdownCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.cardBorder }]}>
                <Text style={[s.policyCardTitle, { color: colors.text }]}>Bảng tính hoàn tiền (Server tính toán):</Text>

                {cancelPreview.loading ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
                ) : (
                  <>
                    <View style={s.calcRow}>
                      <Text style={s.calcLabel}>Số tiền đã thanh toán:</Text>
                      <Text style={[s.calcVal, { color: colors.text }]}>{formatPrice(cancelPreview.totalPaid || 0)}</Text>
                    </View>
                    <View style={s.calcRow}>
                      <Text style={s.calcLabel}>Tỷ lệ hoàn tiền:</Text>
                      <Text style={[s.calcVal, { color: (cancelPreview.refundPercentage || 0) > 0 ? '#16A34A' : '#DC2626' }]}>
                        {cancelPreview.refundPercentage || 0}%
                      </Text>
                    </View>
                    <View style={s.calcRow}>
                      <Text style={s.calcLabel}>Số tiền được hoàn vào Ví:</Text>
                      <Text style={[s.calcVal, { color: '#16A34A', fontSize: 14, fontWeight: '800' }]}>
                        {formatPrice(cancelPreview.refundAmount || 0)}
                      </Text>
                    </View>
                    <View style={s.calcRow}>
                      <Text style={s.calcLabel}>Phí hủy phòng nền tảng:</Text>
                      <Text style={[s.calcVal, { color: '#DC2626' }]}>
                        {formatPrice(cancelPreview.cancellationFee || 0)}
                      </Text>
                    </View>
                    <View style={s.policyDescBox}>
                      <Ionicons name="information-circle-outline" size={14} color="#0284C7" />
                      <Text style={s.policyDescText}>{cancelPreview.policyDescription}</Text>
                    </View>
                  </>
                )}
              </View>

              {/* Bắt buộc chọn lý do hủy */}
              <Text style={[s.reasonSelectLabel, { color: colors.text }]}>Lý do hủy phòng (*):</Text>
              <View style={s.reasonList}>
                {CANCELLATION_REASONS.map((r) => {
                  const isSelected = selectedReasonCode === r.code;
                  return (
                    <Pressable
                      key={r.code}
                      style={[
                        s.reasonChip,
                        { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: isSelected ? colors.primary : '#E2E8F0' },
                        isSelected && { backgroundColor: isDark ? '#082F49' : '#EFF6FF', borderWidth: 1.8 },
                      ]}
                      onPress={() => setSelectedReasonCode(r.code)}
                    >
                      <View style={[s.reasonRadio, isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                        {isSelected && <View style={s.reasonRadioDot} />}
                      </View>
                      <Text style={[s.reasonChipText, { color: colors.text }, isSelected && { fontWeight: '700', color: colors.primary }]}>
                        {r.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Nếu chọn lý do khác thì bắt buộc nhập chi tiết */}
              {selectedReasonCode === 'OTHER' && (
                <View style={{ marginTop: 10 }}>
                  <Text style={[s.reasonSelectLabel, { color: colors.text }]}>Nhập chi tiết lý do (10 - 500 ký tự):</Text>
                  <TextInput
                    style={[s.otherReasonInput, { backgroundColor: colors.inputBg, borderColor: colors.primary, color: colors.text }]}
                    placeholder="Vui lòng cho biết lý do hủy cụ thể của bạn..."
                    placeholderTextColor="#94A3B8"
                    value={otherReasonText}
                    onChangeText={setOtherReasonText}
                    multiline
                    numberOfLines={3}
                    maxLength={500}
                  />
                </View>
              )}

              {/* Checkbox cam kết */}
              <Pressable style={s.agreeRow} onPress={() => setAgreePolicy(!agreePolicy)}>
                <View style={[s.agreeCheckbox, agreePolicy && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  {agreePolicy && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                </View>
                <Text style={[s.agreeText, { color: colors.text }]}>
                  Tôi đã đọc và đồng ý với chính sách hủy phòng & hoàn tiền.
                </Text>
              </Pressable>
            </ScrollView>

            <View style={s.cancelModalActions}>
              <Pressable
                style={[s.cancelKeepBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                onPress={() => setCancelTarget(null)}
                disabled={isCancelling}
              >
                <Text style={[s.cancelKeepText, { color: isDark ? '#E2E8F0' : '#475569' }]}>
                  Giữ lại
                </Text>
              </Pressable>

              <Pressable
                style={[
                  s.cancelConfirmBtn,
                  (!agreePolicy || isCancelling || (selectedReasonCode === 'OTHER' && otherReasonText.trim().length < 10)) && { opacity: 0.5 },
                ]}
                onPress={confirmCancelBooking}
                disabled={!agreePolicy || isCancelling || (selectedReasonCode === 'OTHER' && otherReasonText.trim().length < 10)}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={15} color="#FFFFFF" />
                    <Text style={s.cancelConfirmText}>Xác nhận hủy phòng</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: ĐÁNH GIÁ CHUYẾN ĐI (INTERACTIVE REVIEW MODAL) */}
      <Modal
        visible={!!reviewBookingTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewBookingTarget(null)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.reviewModalCard, { width: modalCardWidth, backgroundColor: isDark ? '#1C2541' : '#FFFFFF' }]}>
            {/* Modal Header */}
            <View style={[s.detailModalHeader, { borderBottomColor: colors.cardBorder }]}>
              <View>
                <Text style={[s.detailModalTitle, { color: colors.text }]}>Đánh giá chuyến đi ⭐</Text>
                <Text style={[s.detailModalSubtitle, { color: colors.primary }]}>
                  {reviewBookingTarget?.name}
                </Text>
              </View>
              <Pressable onPress={() => setReviewBookingTarget(null)} hitSlop={8}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: height * 0.6 }} showsVerticalScrollIndicator={false}>
              {/* Star Rating Selector */}
              <View style={s.starPickerSection}>
                <Text style={[s.starPickerTitle, { color: colors.text }]}>Bạn thấy chất lượng dịch vụ thế nào?</Text>
                <View style={s.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable
                      key={star}
                      onPress={() => setReviewRating(star)}
                      hitSlop={8}
                      style={s.starItemBtn}
                    >
                      <Ionicons
                        name={star <= reviewRating ? 'star' : 'star-outline'}
                        size={36}
                        color={star <= reviewRating ? '#F59E0B' : '#94A3B8'}
                      />
                    </Pressable>
                  ))}
                </View>
                <Text style={s.starRatingLabel}>
                  {reviewRating === 5
                    ? '⭐⭐⭐⭐⭐ Xuất sắc (+150 điểm thưởng)'
                    : reviewRating === 4
                    ? '⭐⭐⭐⭐ Rất tốt (+100 điểm thưởng)'
                    : reviewRating === 3
                    ? '⭐⭐⭐ Hài lòng (+60 điểm thưởng)'
                    : reviewRating === 2
                    ? '⭐⭐ Trung bình (+30 điểm thưởng)'
                    : '⭐ Cần cải thiện (+10 điểm thưởng)'}
                </Text>
              </View>

              {/* Quick Preset Feedback Chips */}
              <Text style={[s.feedbackLabel, { color: colors.text }]}>Nhận xét nhanh:</Text>
              <View style={s.presetChipsWrap}>
                {[
                  'Phòng rất đẹp và sạch sẽ ✨',
                  'Chủ nhà siêu nhiệt tình ❤️',
                  'View đồi núi cực chill 🌲',
                  'Vị trí thuận tiện đi lại 🚗',
                  'Đúng như hình chụp, 10/10 👍',
                ].map((preset) => (
                  <Pressable
                    key={preset}
                    style={[s.quickPresetChip, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}
                    onPress={() => setReviewComment(preset)}
                  >
                    <Text style={[s.quickPresetText, { color: colors.text }]}>{preset}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Comment Input */}
              <Text style={[s.feedbackLabel, { color: colors.text, marginTop: 10 }]}>Cảm nhận chi tiết của bạn:</Text>
              <TextInput
                style={[
                  s.reviewInputBox,
                  { backgroundColor: colors.inputBg, borderColor: colors.primary, color: colors.text },
                ]}
                placeholder="Chia sẻ trải nghiệm của bạn về chỗ nghỉ, không gian và thái độ phục vụ..."
                placeholderTextColor="#94A3B8"
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            {/* Submit Action */}
            <View style={s.reviewModalActions}>
              <Pressable
                style={[s.cancelKeepBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                onPress={() => setReviewBookingTarget(null)}
                disabled={isSubmittingReview}
              >
                <Text style={[s.cancelKeepText, { color: isDark ? '#E2E8F0' : '#475569' }]}>Để sau</Text>
              </Pressable>

              <Pressable
                style={[s.submitReviewBtn, { backgroundColor: colors.primary }, isSubmittingReview && { opacity: 0.6 }]}
                onPress={handleConfirmSubmitReview}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="send" size={14} color="#FFFFFF" />
                    <Text style={s.submitReviewBtnText}>
                      Gửi đánh giá (+{reviewRating === 5 ? 150 : reviewRating === 4 ? 100 : reviewRating === 3 ? 60 : reviewRating === 2 ? 30 : 10} điểm)
                    </Text>
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
  copyText,
}: {
  label: string;
  value: string;
  isDark?: boolean;
  isHighlight?: boolean;
  isCopyable?: boolean;
  copyText?: string;
}) {
  const handleCopy = () => {
    if (isCopyable) {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(copyText || value);
      }
      Alert.alert('Đã sao chép 📋', `${label}: ${copyText || value}`);
    }
  };

  return (
    <Pressable style={s.bankLine} onPress={isCopyable ? handleCopy : undefined}>
      <Text style={s.bankLineLabel}>{label}:</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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
          <Ionicons name="copy-outline" size={14} color="#0284C7" />
        )}
      </View>
    </Pressable>
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
  contentList: { padding: 16, paddingBottom: 48 },
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
  holdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  holdBadgeText: { fontSize: 9, fontWeight: '700', color: '#C2410C' },
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
  stayingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stayingBadgeText: { fontSize: 9, fontWeight: '800', color: '#059669' },
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
  allPaidBanner: {
    marginTop: 12,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  allPaidBannerText: {
    fontWeight: '700',
    fontSize: 13,
  },
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
    flexDirection: 'column',
    gap: 8,
    marginTop: 14,
  },
  payInDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 11,
    borderRadius: 14,
  },
  payInDetailText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  chatInDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  chatInDetailText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
  disputeInDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  disputeInDetailText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '700',
  },
  viewHomestayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 14,
  },
  viewHomestayText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#DC2626',
    paddingVertical: 11,
    borderRadius: 14,
    marginTop: 2,
  },
  cancelBookingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // QR & Payment Modal
  paymentDeadlineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  paymentDeadlineText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
    fontWeight: '600',
  },
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
  // Cancel Confirmation Modal Styles
  cancelModalCard: {
    borderRadius: 22,
    padding: 20,
    elevation: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
  },
  cancelModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  cancelIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cancelModalCodeText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  policyBreakdownCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  policyCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  calcLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  calcVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  policyDescBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  policyDescText: {
    fontSize: 10,
    color: '#0369A1',
    lineHeight: 14,
    flex: 1,
    fontWeight: '500',
  },
  reasonSelectLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  reasonList: {
    gap: 6,
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  reasonRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  reasonChipText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  otherReasonInput: {
    minHeight: 70,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 10,
    fontSize: 12,
    lineHeight: 16,
    textAlignVertical: 'top',
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    marginBottom: 4,
  },
  agreeCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreeText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  cancelModalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 14,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 12,
  },
  cancelKeepBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelKeepText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cancelConfirmBtn: {
    flex: 1.6,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cancelConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  // Sub-Filter Status Chips Styles
  subFilterRow: {
    marginBottom: 10,
  },
  subFilterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  subFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  subFilterChipText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cancelledBadgeText: { fontSize: 9.5, fontWeight: '800', color: '#DC2626' },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedBadgeText: { fontSize: 9.5, fontWeight: '800', color: '#16A34A' },
  cancelInfoSnippet: {
    marginTop: 6,
    padding: 8,
    borderRadius: 8,
  },
  cancelInfoSnippetTitle: {
    fontSize: 10.5,
    color: '#991B1B',
    fontWeight: '600',
  },
  cancelInfoSnippetRefund: {
    fontSize: 10.5,
    color: '#15803D',
    fontWeight: '800',
    marginTop: 2,
  },
  cancelInfoSnippetNoRefund: {
    fontSize: 10.5,
    color: '#DC2626',
    fontWeight: '700',
    marginTop: 2,
  },
  rebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  rebookText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  // Review Snippets & Review Modal Styles
  userReviewSnippet: {
    marginTop: 6,
    padding: 7,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
  },
  userReviewSnippetStars: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#D97706',
  },
  userReviewSnippetComment: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  detailReviewCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  reviewNowModalBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reviewNowModalText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  reviewInDetailActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 4,
  },
  reviewInDetailActionText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '800',
  },
  reviewModalCard: {
    borderRadius: 22,
    padding: 20,
    elevation: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
  },
  starPickerSection: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  starPickerTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginVertical: 4,
  },
  starItemBtn: {
    padding: 2,
  },
  starRatingLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 8,
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  presetChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  quickPresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickPresetText: {
    fontSize: 11,
    fontWeight: '500',
  },
  reviewInputBox: {
    minHeight: 75,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 10,
    fontSize: 12,
    lineHeight: 17,
    textAlignVertical: 'top',
  },
  reviewModalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 14,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 12,
  },
  submitReviewBtn: {
    flex: 1.8,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
