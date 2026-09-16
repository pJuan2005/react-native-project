import { ProductImage } from '@/components/product-image';
import { formatPrice, Homestay, mockHomestays, Voucher } from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL, fetchWithTimeout } from '@/src/config/api';

const { width } = Dimensions.get('window');
const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function HomestayDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [homestay, setHomestay] = useState<Homestay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Booking details state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  // Modals
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [pickerMonth, setPickerMonth] = useState(new Date(2026, 8, 1)); // Tháng 9, 2026

  // Bank-like Success Receipt Modal
  const [bookingSuccessData, setBookingSuccessData] = useState<{
    bookingCode: string;
    homestayName: string;
    location: string;
    type: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    guests: number;
    totalPrice: number;
    discountAmount: number;
    voucherCode?: string;
    bookingTime: string;
  } | null>(null);

  const {
    addToBooking,
    savedHomestays,
    toggleSavedHomestay,
    userVouchers,
    calculateDiscount,
  } = useBooking();

  const isSaved = homestay ? savedHomestays.some((s) => s.id === homestay.id) : false;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchWithTimeout(`${API_BASE_URL}/api/homestays/${id}`, {}, 3000)
      .then((res) => {
        if (!res.ok) throw new Error('not_found');
        return res.json();
      })
      .then((json) => {
        if (json.success && json.data) {
          setHomestay(json.data);
        } else {
          const fallback = mockHomestays.find((h) => h.id === id);
          if (fallback) setHomestay(fallback);
          else setError(json.message || 'Không tìm thấy homestay');
        }
      })
      .catch((err) => {
        console.warn('API Error (falling back to mock data):', err);
        const fallback = mockHomestays.find((h) => h.id === id);
        if (fallback) setHomestay(fallback);
        else setError('Không thể tải thông tin Homestay');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const imagesList = useMemo(() => {
    if (homestay && homestay.images && homestay.images.length > 0) {
      return homestay.images;
    }
    return ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'];
  }, [homestay]);

  // Calculations
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const rawTotalPrice = homestay && nights > 0 ? homestay.price * nights : 0;
  const discountAmount = useMemo(
    () => calculateDiscount(selectedVoucher, rawTotalPrice),
    [selectedVoucher, rawTotalPrice, calculateDiscount]
  );
  const finalTotalPrice = Math.max(0, rawTotalPrice - discountAmount);

  const handleBook = () => {
    if (!homestay) return;
    if (!checkIn || !checkOut) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn ngày nhận và trả phòng');
      return;
    }
    if (nights <= 0) {
      Alert.alert('Ngày không hợp lệ', 'Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }
    if (guests > homestay.maxGuests) {
      Alert.alert('Quá số khách', `Homestay này tối đa nhận ${homestay.maxGuests} khách`);
      return;
    }

    const generatedCode = `BK${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(1000 + Math.random() * 9000)}`;

    addToBooking(homestay, {
      checkIn,
      checkOut,
      guests,
      nights,
      totalPrice: finalTotalPrice,
      voucherCode: selectedVoucher ? selectedVoucher.code : undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
    });

    setBookingSuccessData({
      bookingCode: generatedCode,
      homestayName: homestay.name,
      location: homestay.location,
      type: homestay.type,
      checkIn,
      checkOut,
      nights,
      guests,
      totalPrice: finalTotalPrice,
      discountAmount,
      voucherCode: selectedVoucher?.code,
      bookingTime: new Date().toLocaleString('vi-VN'),
    });
  };

  const toggleFavorite = () => {
    if (!homestay) return;
    const nowSaved = toggleSavedHomestay(homestay);
    if (nowSaved) {
      Alert.alert('Đã lưu yêu thích ❤️', `${homestay.name} đã được thêm vào danh sách yêu thích.`);
    } else {
      Alert.alert('Đã bỏ lưu 💔', `${homestay.name} đã được xóa khỏi danh sách yêu thích.`);
    }
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1));
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0));
  };

  // Calendar Day Click Logic
  const handleDayPress = (dateStr: string) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut('');
    } else {
      if (new Date(dateStr) > new Date(checkIn)) {
        setCheckOut(dateStr);
      } else {
        setCheckIn(dateStr);
        setCheckOut('');
      }
    }
  };

  const setQuickPreset = (type: 'tonight' | 'weekend' | '3days') => {
    const today = new Date();
    const formatDateStr = (d: Date) => d.toISOString().split('T')[0];

    if (type === 'tonight') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      setCheckIn(formatDateStr(today));
      setCheckOut(formatDateStr(tomorrow));
    } else if (type === 'weekend') {
      const friday = new Date(today);
      const day = today.getDay();
      const distToFriday = (5 - day + 7) % 7;
      friday.setDate(today.getDate() + (distToFriday === 0 ? 7 : distToFriday));
      const sunday = new Date(friday);
      sunday.setDate(friday.getDate() + 2);
      setCheckIn(formatDateStr(friday));
      setCheckOut(formatDateStr(sunday));
    } else {
      const d1 = new Date(today);
      d1.setDate(today.getDate() + 3);
      const d2 = new Date(d1);
      d2.setDate(d1.getDate() + 2);
      setCheckIn(formatDateStr(d1));
      setCheckOut(formatDateStr(d2));
    }
    setShowDatePicker(false);
  };

  const handleApplyPromoCode = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã voucher');
      return;
    }
    const matched = userVouchers.find((v) => v.code.toUpperCase() === code);
    if (matched) {
      setSelectedVoucher(matched);
      setShowVoucherModal(false);
      setPromoInput('');
      Alert.alert('Thành công', `Đã áp dụng voucher: ${matched.title}`);
    } else {
      Alert.alert('Mã không hợp lệ', 'Mã voucher không tồn tại hoặc đã hết hạn.');
    }
  };

  const calendarDays = useMemo(() => {
    const year = pickerMonth.getFullYear();
    const month = pickerMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dateStr: `empty_${i}`, dayNum: 0, isCurrentMonth: false });
    }

    for (let d = 1; d <= totalDays; d++) {
      const mStr = (month + 1).toString().padStart(2, '0');
      const dStr = d.toString().padStart(2, '0');
      days.push({
        dateStr: `${year}-${mStr}-${dStr}`,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [pickerMonth]);

  if (loading) {
    return (
      <SafeAreaView style={s.screen}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.icon}><Ionicons name="arrow-back" size={23} color="#0F172A" /></Pressable>
          <Text style={s.headerTitle}>Chi tiết homestay</Text>
          <View style={s.icon} />
        </View>
        <View style={s.center}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={s.centerText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !homestay) {
    return (
      <SafeAreaView style={s.screen}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.icon}><Ionicons name="arrow-back" size={23} color="#0F172A" /></Pressable>
          <Text style={s.headerTitle}>Chi tiết homestay</Text>
          <View style={s.icon} />
        </View>
        <View style={s.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={s.centerTitle}>{error || 'Không tìm thấy homestay'}</Text>
          <Pressable style={s.retryBtn} onPress={() => router.back()}>
            <Text style={s.retryText}>Quay lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.icon} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text style={s.headerTitle}>Chi tiết homestay</Text>
        <Pressable onPress={() => router.push('/bookings')} style={s.icon} hitSlop={8}>
          <Ionicons name="cart-outline" size={22} color="#0284C7" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* INTERACTIVE MULTI-IMAGE CAROUSEL VIEWER */}
        <View style={s.imageContainer}>
          <Pressable
            style={{ width: '100%', height: '100%' }}
            onPress={() => setShowFullscreenGallery(true)}
          >
            <ProductImage
              uri={imagesList[currentImage]}
              style={s.image}
              containerStyle={s.image}
            />
          </Pressable>

          {/* Left Navigation Arrow */}
          {imagesList.length > 1 && (
            <Pressable style={[s.navArrow, s.navArrowLeft]} onPress={prevImage} hitSlop={8}>
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            </Pressable>
          )}

          {/* Right Navigation Arrow */}
          {imagesList.length > 1 && (
            <Pressable style={[s.navArrow, s.navArrowRight]} onPress={nextImage} hitSlop={8}>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </Pressable>
          )}

          {/* Image Counter Badge */}
          <View style={s.imageCounterBadge}>
            <Ionicons name="images" size={12} color="#FFFFFF" />
            <Text style={s.imageCounterText}>
              {currentImage + 1} / {imagesList.length} ảnh
            </Text>
          </View>

          {/* Tap to Fullscreen View hint */}
          <Pressable
            style={s.expandIconBtn}
            onPress={() => setShowFullscreenGallery(true)}
            hitSlop={6}
          >
            <Ionicons name="expand" size={14} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* THUMBNAIL STRIP (Bấm để chuyển ảnh ngay) */}
        {imagesList.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.thumbList}
          >
            {imagesList.map((imgUrl, idx) => (
              <Pressable
                key={idx}
                style={[
                  s.thumbWrapper,
                  currentImage === idx && s.thumbWrapperActive,
                ]}
                onPress={() => setCurrentImage(idx)}
              >
                <ProductImage uri={imgUrl} style={s.thumbImg} containerStyle={s.thumbImg} />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Title & Ratings */}
        <Text style={s.name}>{homestay.name}</Text>
        <View style={s.rating}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={s.ratingText}>{homestay.rating} ({homestay.reviewCount} đánh giá)</Text>
          <Text style={s.locationText}>📍 by {homestay.location} • {homestay.type}</Text>
        </View>

        <View style={s.priceRow}>
          <Text style={s.price}>{formatPrice(homestay.price)}<Text style={s.perNight}>/đêm</Text></Text>
          {homestay.oldPrice && <Text style={s.oldPrice}>{formatPrice(homestay.oldPrice)}</Text>}
        </View>
        {homestay.oldPrice && (
          <Text style={s.sale}>Đang giảm giá {Math.round((1 - homestay.price / homestay.oldPrice) * 100)}%</Text>
        )}

        {/* Description */}
        <Text style={s.section}>Mô tả</Text>
        <Text style={s.description} numberOfLines={expanded ? undefined : 4}>{homestay.description}</Text>
        <Pressable onPress={() => setExpanded(!expanded)}><Text style={s.more}>{expanded ? 'Thu gọn' : 'Xem thêm'}</Text></Pressable>

        {/* Amenities */}
        <Text style={s.section}>Tiện nghi nổi bật</Text>
        {homestay.amenities.length > 0 ? (
          <View style={s.amenitiesGrid}>
            {homestay.amenities.map((a, i) => (
              <View key={i} style={s.amenityItem}>
                <Ionicons name="checkmark-circle" size={18} color="#0284C7" />
                <Text style={s.amenityText}>{a}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={s.noAmenities}>Chưa có thông tin tiện nghi</Text>
        )}

        {/* Property Info */}
        <Text style={s.section}>Thông tin chỗ nghỉ</Text>
        <Info label="Loại hình" value={homestay.type} />
        <Info label="Số phòng ngủ" value={`${homestay.bedrooms} phòng ngủ`} />
        <Info label="Số phòng tắm" value={`${homestay.bathrooms} phòng tắm`} />
        <Info label="Sức chứa tối đa" value={`${homestay.maxGuests} người`} />
        <Info label="Địa điểm" value={homestay.location} />

        {/* Booking Form */}
        <Text style={s.section}>Đặt phòng</Text>

        {/* Interactive Date Picker Field */}
        <View style={s.dateRow}>
          <Pressable style={s.dateField} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar" size={18} color="#0284C7" />
            <View>
              <Text style={s.dateLabel}>Nhận phòng</Text>
              <Text style={s.dateValue}>{checkIn || 'Chọn ngày'}</Text>
            </View>
          </Pressable>

          <Pressable style={s.dateField} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={18} color="#0284C7" />
            <View>
              <Text style={s.dateLabel}>Trả phòng</Text>
              <Text style={s.dateValue}>{checkOut || 'Chọn ngày'}</Text>
            </View>
          </Pressable>
        </View>

        {/* Guests Stepper */}
        <View style={s.quantity}>
          <Text style={s.quantityLabel}>Số lượng khách</Text>
          <View style={s.stepper}>
            <Pressable style={s.step} onPress={() => setGuests(Math.max(1, guests - 1))}>
              <Ionicons name="remove" size={18} color="#0284C7" />
            </Pressable>
            <Text style={s.quantityValue}>{guests} người</Text>
            <Pressable style={s.step} onPress={() => setGuests(Math.min(homestay.maxGuests, guests + 1))}>
              <Ionicons name="add" size={18} color="#0284C7" />
            </Pressable>
          </View>
        </View>

        {/* Voucher Section */}
        <Text style={s.section}>Mã giảm giá / Voucher</Text>
        <Pressable style={s.voucherCard} onPress={() => setShowVoucherModal(true)}>
          <View style={s.voucherLeft}>
            <Ionicons name="ticket-outline" size={20} color="#0284C7" />
            <View>
              <Text style={s.voucherTitle}>
                {selectedVoucher ? selectedVoucher.title : 'Chọn hoặc nhập mã Voucher'}
              </Text>
              <Text style={s.voucherSubtitle}>
                {selectedVoucher
                  ? `Mã: ${selectedVoucher.code} (Tiết kiệm ${formatPrice(discountAmount)})`
                  : `${userVouchers.length} voucher khả dụng`}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </Pressable>

        {/* Price Breakdown */}
        {nights > 0 && (
          <View style={s.priceSummary}>
            <Line label={`${nights} đêm × ${formatPrice(homestay.price)}`} value={formatPrice(rawTotalPrice)} />
            {discountAmount > 0 && (
              <Line
                label={`Giảm giá Voucher (${selectedVoucher?.code})`}
                value={`-${formatPrice(discountAmount)}`}
                isDiscount
              />
            )}
            <View style={s.total}>
              <Text style={s.totalLabel}>Tổng thanh toán</Text>
              <Text style={s.totalValue}>{formatPrice(finalTotalPrice)}</Text>
            </View>
            <View style={s.rewardNotice}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={s.rewardNoticeText}>Tích lũy +100 điểm thưởng sau chuyến đi này</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={s.actions}>
          <Pressable
            style={[s.saveButton, isSaved && s.saveButtonSaved]}
            onPress={toggleFavorite}
          >
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={18} color={isSaved ? '#EF4444' : '#0284C7'} />
            <Text style={[s.saveText, isSaved && s.saveTextSaved]}>{isSaved ? 'Đã lưu' : 'Lưu'}</Text>
          </Pressable>

          <Pressable
            style={[s.bookButton, (!checkIn || !checkOut) && { opacity: 0.7 }]}
            onPress={handleBook}
            disabled={!checkIn || !checkOut}
          >
            <Ionicons name="calendar-outline" size={18} color="#FFF" />
            <Text style={s.bookText}>Đặt phòng ngay</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* MODAL 1: CALENDAR DATE PICKER */}
      <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setShowDatePicker(false)}>
          <Pressable style={s.modalBox} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHeader}>
              <Text style={s.modalHeaderTitle}>Chọn ngày nhận & trả phòng</Text>
              <Pressable onPress={() => setShowDatePicker(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            {/* Quick Presets */}
            <View style={s.presetsRow}>
              <Pressable style={s.presetChip} onPress={() => setQuickPreset('tonight')}>
                <Text style={s.presetChipText}>Hôm nay (1 đêm)</Text>
              </Pressable>
              <Pressable style={s.presetChip} onPress={() => setQuickPreset('weekend')}>
                <Text style={s.presetChipText}>Cuối tuần (2 đêm)</Text>
              </Pressable>
              <Pressable style={s.presetChip} onPress={() => setQuickPreset('3days')}>
                <Text style={s.presetChipText}>Tuần tới (2 đêm)</Text>
              </Pressable>
            </View>

            {/* Month Navigation */}
            <View style={s.monthNav}>
              <Pressable
                onPress={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1))}
                style={s.monthNavBtn}
              >
                <Ionicons name="chevron-back" size={20} color="#0F172A" />
              </Pressable>
              <Text style={s.monthNavTitle}>
                Tháng {pickerMonth.getMonth() + 1}, {pickerMonth.getFullYear()}
              </Text>
              <Pressable
                onPress={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1))}
                style={s.monthNavBtn}
              >
                <Ionicons name="chevron-forward" size={20} color="#0F172A" />
              </Pressable>
            </View>

            {/* Days of Week Header */}
            <View style={s.weekHeader}>
              {DAYS_OF_WEEK.map((d, i) => (
                <Text key={i} style={s.weekDayText}>{d}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={s.calendarGrid}>
              {calendarDays.map((cell, idx) => {
                if (!cell.isCurrentMonth) {
                  return <View key={idx} style={s.calendarCell} />;
                }

                const isCheckIn = cell.dateStr === checkIn;
                const isCheckOut = cell.dateStr === checkOut;
                const inRange =
                  checkIn &&
                  checkOut &&
                  new Date(cell.dateStr) > new Date(checkIn) &&
                  new Date(cell.dateStr) < new Date(checkOut);

                return (
                  <Pressable
                    key={idx}
                    style={[
                      s.calendarCell,
                      inRange && s.cellInRange,
                      (isCheckIn || isCheckOut) && s.cellSelected,
                    ]}
                    onPress={() => handleDayPress(cell.dateStr)}
                  >
                    <Text
                      style={[
                        s.calendarDayText,
                        inRange && s.textInRange,
                        (isCheckIn || isCheckOut) && s.textSelected,
                      ]}
                    >
                      {cell.dayNum}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Current Selection summary */}
            <View style={s.dateSummaryRow}>
              <Text style={s.dateSummaryText}>
                {checkIn ? `Nhận: ${checkIn}` : 'Chọn ngày nhận'}
                {checkOut ? ` ➔ Trả: ${checkOut} (${nights} đêm)` : ''}
              </Text>
              <Pressable
                style={[s.confirmDateBtn, (!checkIn || !checkOut) && { opacity: 0.6 }]}
                onPress={() => setShowDatePicker(false)}
                disabled={!checkIn || !checkOut}
              >
                <Text style={s.confirmDateText}>Áp dụng</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 2: VOUCHER PICKER & INPUT */}
      <Modal visible={showVoucherModal} transparent animationType="slide" onRequestClose={() => setShowVoucherModal(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setShowVoucherModal(false)}>
          <Pressable style={s.modalBox} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHeader}>
              <Text style={s.modalHeaderTitle}>Mã ưu đãi / Voucher</Text>
              <Pressable onPress={() => setShowVoucherModal(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            {/* Promo Code Input */}
            <View style={s.promoInputRow}>
              <TextInput
                value={promoInput}
                onChangeText={setPromoInput}
                placeholder="Nhập mã voucher (VD: WELCOME10)"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                style={s.promoInput}
              />
              <Pressable style={s.promoApplyBtn} onPress={handleApplyPromoCode}>
                <Text style={s.promoApplyText}>Áp dụng</Text>
              </Pressable>
            </View>

            <Text style={s.voucherListTitle}>Voucher của bạn:</Text>
            <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
              {userVouchers.map((v) => {
                const isSelected = selectedVoucher?.id === v.id;
                return (
                  <Pressable
                    key={v.id}
                    style={[s.voucherItem, isSelected && s.voucherItemSelected]}
                    onPress={() => {
                      setSelectedVoucher(isSelected ? null : v);
                      setShowVoucherModal(false);
                    }}
                  >
                    <View style={s.voucherIconBox}>
                      <Ionicons name={(v.icon as any) || 'ticket-outline'} size={22} color="#0284C7" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.voucherItemTitle}>{v.title}</Text>
                      <Text style={s.voucherItemDesc}>{v.description}</Text>
                      <Text style={s.voucherItemExpire}>HSD: {v.expiresAt} • Mã: {v.code}</Text>
                    </View>
                    <View style={[s.selectRadio, isSelected && s.selectRadioActive]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 3: FULLSCREEN IMAGE GALLERY MODAL */}
      <Modal
        visible={showFullscreenGallery}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFullscreenGallery(false)}
      >
        <View style={s.fullscreenOverlay}>
          {/* Header */}
          <View style={s.fullscreenHeader}>
            <Text style={s.fullscreenTitle}>
              {homestay.name} ({currentImage + 1}/{imagesList.length})
            </Text>
            <Pressable
              style={s.closeFullscreenBtn}
              onPress={() => setShowFullscreenGallery(false)}
              hitSlop={8}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Main Fullscreen Image */}
          <View style={s.fullscreenImageBox}>
            <ProductImage
              uri={imagesList[currentImage]}
              style={s.fullscreenImage}
              containerStyle={s.fullscreenImage}
            />

            {/* Left Nav */}
            {imagesList.length > 1 && (
              <Pressable style={[s.fullNavBtn, s.fullNavLeft]} onPress={prevImage} hitSlop={10}>
                <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
              </Pressable>
            )}

            {/* Right Nav */}
            {imagesList.length > 1 && (
              <Pressable style={[s.fullNavBtn, s.fullNavRight]} onPress={nextImage} hitSlop={10}>
                <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
              </Pressable>
            )}
          </View>

          {/* Bottom Thumbnails Strip in Fullscreen */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.fullscreenThumbList}
          >
            {imagesList.map((imgUrl, idx) => (
              <Pressable
                key={idx}
                style={[
                  s.fullThumbWrapper,
                  currentImage === idx && s.fullThumbWrapperActive,
                ]}
                onPress={() => setCurrentImage(idx)}
              >
                <ProductImage uri={imgUrl} style={s.fullThumbImg} containerStyle={s.fullThumbImg} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL 4: BANK-STYLE SUCCESS CONFIRMATION RECEIPT */}
      <Modal
        visible={!!bookingSuccessData}
        transparent
        animationType="fade"
        onRequestClose={() => setBookingSuccessData(null)}
      >
        <View style={s.bankSuccessOverlay}>
          <View style={s.bankSuccessCard}>
            {/* Success Glowing Icon */}
            <View style={s.bankSuccessIconWrapper}>
              <View style={s.bankSuccessIconOuter}>
                <Ionicons name="checkmark-circle" size={68} color="#10B981" />
              </View>
            </View>

            {/* Header Text */}
            <Text style={s.bankSuccessTitle}>ĐẶT PHÒNG THÀNH CÔNG!</Text>
            <Text style={s.bankSuccessAmount}>{formatPrice(bookingSuccessData?.totalPrice || 0)}</Text>

            <View style={s.bankSuccessBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#15803D" />
              <Text style={s.bankSuccessBadgeText}>Đã xác nhận & Thanh toán</Text>
            </View>

            {/* Reward Points Tag */}
            <View style={s.bankRewardCard}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={s.bankRewardText}>
                Bạn đã được cộng <Text style={{ fontWeight: '800' }}>+100 điểm thưởng</Text> vào ví!
              </Text>
            </View>

            {/* Receipt Details Box */}
            <View style={s.receiptBox}>
              <ReceiptLine label="Mã đặt phòng" value={bookingSuccessData?.bookingCode || ''} isCode />
              <ReceiptLine label="Chỗ nghỉ" value={bookingSuccessData?.homestayName || ''} />
              <ReceiptLine label="Địa điểm" value={`${bookingSuccessData?.location} • ${bookingSuccessData?.type}`} />
              <ReceiptLine
                label="Thời gian lưu trú"
                value={`${bookingSuccessData?.checkIn} ➔ ${bookingSuccessData?.checkOut} (${bookingSuccessData?.nights} đêm)`}
              />
              <ReceiptLine label="Số lượng khách" value={`${bookingSuccessData?.guests} người`} />
              {bookingSuccessData?.discountAmount ? (
                <ReceiptLine
                  label="Voucher áp dụng"
                  value={`-${formatPrice(bookingSuccessData.discountAmount)} (${bookingSuccessData.voucherCode})`}
                  isGreen
                />
              ) : null}
              <ReceiptLine label="Thời gian thực hiện" value={bookingSuccessData?.bookingTime || ''} />
            </View>

            {/* Action Buttons */}
            <View style={s.bankActions}>
              <Pressable
                style={s.bankViewBookingsBtn}
                onPress={() => {
                  setBookingSuccessData(null);
                  router.push('/bookings');
                }}
              >
                <Ionicons name="cart-outline" size={18} color="#FFFFFF" />
                <Text style={s.bankViewBookingsText}>Xem đặt phòng của tôi</Text>
              </Pressable>

              <Pressable
                style={s.bankHomeBtn}
                onPress={() => {
                  setBookingSuccessData(null);
                  router.push('/');
                }}
              >
                <Ionicons name="home-outline" size={17} color="#0369A1" />
                <Text style={s.bankHomeText}>Về trang chủ</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.info}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

function Line({
  label,
  value,
  isDiscount,
}: {
  label: string;
  value: string;
  isDiscount?: boolean;
}) {
  return (
    <View style={s.line}>
      <Text style={s.lineLabel}>{label}</Text>
      <Text style={[s.lineValue, isDiscount && { color: '#16A34A', fontWeight: '700' }]}>
        {value}
      </Text>
    </View>
  );
}

function ReceiptLine({
  label,
  value,
  isCode,
  isGreen,
}: {
  label: string;
  value: string;
  isCode?: boolean;
  isGreen?: boolean;
}) {
  return (
    <View style={s.receiptLine}>
      <Text style={s.receiptLabel}>{label}</Text>
      <Text
        style={[
          s.receiptValue,
          isCode && s.receiptCode,
          isGreen && { color: '#16A34A', fontWeight: '700' },
        ]}
      >
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
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E0F2FE',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  icon: { padding: 4 },
  content: { padding: 16, paddingTop: 8, paddingBottom: 110 },
  // Image Box
  imageContainer: {
    position: 'relative',
    height: 240,
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  image: { height: 240, width: '100%' },
  navArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowLeft: { left: 10 },
  navArrowRight: { right: 10 },
  imageCounterBadge: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  expandIconBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Thumbnails Strip
  thumbList: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  thumbWrapper: {
    width: 60,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  thumbWrapperActive: {
    borderColor: '#0284C7',
    borderWidth: 2.5,
  },
  thumbImg: { width: '100%', height: '100%' },
  name: { marginTop: 12, fontSize: 19, fontWeight: '800', color: '#0F172A' },
  rating: { flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 5, flexWrap: 'wrap' },
  ratingText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  locationText: { marginLeft: 6, fontSize: 12, color: '#64748B' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 8 },
  price: { fontSize: 20, fontWeight: '800', color: '#0369A1' },
  perNight: { fontSize: 13, fontWeight: '400', color: '#64748B' },
  oldPrice: { fontSize: 13, color: '#94A3B8', textDecorationLine: 'line-through' },
  sale: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
  },
  section: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 16, marginBottom: 8 },
  description: { fontSize: 13, lineHeight: 20, color: '#475569' },
  more: { marginTop: 4, color: '#0284C7', fontWeight: '700', fontSize: 12 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 10,
    width: '48.5%',
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
  },
  amenityText: { fontSize: 12, color: '#1E293B', fontWeight: '500' },
  noAmenities: { fontSize: 13, color: '#94A3B8' },
  info: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: '#64748B', fontSize: 12 },
  infoValue: { fontWeight: '600', color: '#1E293B', fontSize: 12 },
  dateRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  dateField: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#0284C7',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: { fontSize: 11, color: '#0369A1', fontWeight: '600' },
  dateValue: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  quantity: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quantityLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
  },
  quantityValue: { fontSize: 14, fontWeight: '700', color: '#0F172A', minWidth: 50, textAlign: 'center' },
  voucherCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voucherLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  voucherTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  voucherSubtitle: { fontSize: 11, color: '#0284C7', marginTop: 2, fontWeight: '600' },
  priceSummary: { marginTop: 14, padding: 12, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1.5, borderColor: '#E0F2FE' },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  lineLabel: { color: '#64748B', fontSize: 12 },
  lineValue: { fontWeight: '600', color: '#1E293B', fontSize: 13 },
  total: { borderTopWidth: 1, borderColor: '#F1F5F9', marginTop: 6, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  totalValue: { fontSize: 17, fontWeight: '800', color: '#0369A1' },
  rewardNotice: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: '#FEF3C7', padding: 6, borderRadius: 6 },
  rewardNoticeText: { fontSize: 11, color: '#92400E', fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  centerText: { marginTop: 12, fontSize: 14, color: '#64748B' },
  centerTitle: { marginTop: 12, fontSize: 15, fontWeight: '600', color: '#334155', textAlign: 'center' },
  retryBtn: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#0284C7' },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 25,
    backgroundColor: '#E0F2FE',
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#0284C7',
  },
  saveButtonSaved: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  saveText: { fontWeight: '700', color: '#0369A1', fontSize: 13 },
  saveTextSaved: { color: '#DC2626' },
  bookButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 25,
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  bookText: { fontWeight: '700', color: '#FFF', fontSize: 14 },
  // Calendar Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalHeaderTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  presetsRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  presetChip: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  presetChipText: { fontSize: 11, color: '#0369A1', fontWeight: '700' },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  monthNavBtn: { padding: 6 },
  monthNavTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 4,
  },
  weekDayText: { width: 36, textAlign: 'center', fontSize: 11, fontWeight: '600', color: '#64748B' },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  cellInRange: {
    backgroundColor: '#E0F2FE',
  },
  cellSelected: {
    backgroundColor: '#0284C7',
    borderRadius: 19,
  },
  calendarDayText: { fontSize: 13, color: '#1E293B', fontWeight: '500' },
  textInRange: { color: '#0369A1', fontWeight: '700' },
  textSelected: { color: '#FFFFFF', fontWeight: '700' },
  dateSummaryRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 12,
  },
  dateSummaryText: { fontSize: 12, color: '#334155', fontWeight: '600', flex: 1 },
  confirmDateBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  confirmDateText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  // Voucher Modal
  promoInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  promoInput: {
    flex: 1,
    height: 40,
    borderWidth: 1.5,
    borderColor: '#0284C7',
    borderRadius: 20,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#0F172A',
  },
  promoApplyBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoApplyText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  voucherListTitle: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
  voucherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  voucherItemSelected: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  voucherIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherItemTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  voucherItemDesc: { fontSize: 11, color: '#475569', marginTop: 1 },
  voucherItemExpire: { fontSize: 10, color: '#94A3B8', marginTop: 3 },
  selectRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectRadioActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  // Fullscreen Image Gallery Modal
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullscreenTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  closeFullscreenBtn: {
    padding: 6,
  },
  fullscreenImageBox: {
    width: '100%',
    height: 320,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  fullNavBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullNavLeft: { left: 8 },
  fullNavRight: { right: 8 },
  fullscreenThumbList: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  fullThumbWrapper: {
    width: 64,
    height: 52,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#475569',
  },
  fullThumbWrapperActive: {
    borderColor: '#38BDF8',
    borderWidth: 2.5,
  },
  fullThumbImg: {
    width: '100%',
    height: '100%',
  },
  // Bank Success Receipt Styles
  bankSuccessOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  bankSuccessCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  bankSuccessIconWrapper: {
    marginTop: 4,
    marginBottom: 10,
  },
  bankSuccessIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankSuccessTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  bankSuccessAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  bankSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  bankSuccessBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  bankRewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
    width: '100%',
    justifyContent: 'center',
  },
  bankRewardText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  receiptBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  receiptLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  receiptValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  receiptCode: {
    fontFamily: 'monospace',
    color: '#0369A1',
    fontWeight: '700',
  },
  bankActions: {
    width: '100%',
    marginTop: 18,
    gap: 8,
  },
  bankViewBookingsBtn: {
    width: '100%',
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bankViewBookingsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bankHomeBtn: {
    width: '100%',
    backgroundColor: '#E0F2FE',
    paddingVertical: 11,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bankHomeText: {
    color: '#0369A1',
    fontSize: 13,
    fontWeight: '700',
  },
});
