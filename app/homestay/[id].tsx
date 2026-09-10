import { ProductImage } from '@/components/product-image';
import { formatPrice, Homestay } from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import API_BASE_URL from '@/src/config/api';

export default function HomestayDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [homestay, setHomestay] = useState<Homestay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const { addToBooking } = useBooking();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/homestays/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('not_found');
        return res.json();
      })
      .then(json => {
        if (json.success) {
          setHomestay(json.data);
        } else {
          setError(json.message || 'Lỗi không xác định');
        }
      })
      .catch(err => {
        console.error('API Error:', err);
        setError(err.message === 'not_found' ? 'Không tìm thấy homestay' : 'Không thể tải thông tin Homestay');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={s.screen}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.icon}><Ionicons name="arrow-back" size={23} color="#0F172A" /></Pressable>
          <Text style={s.headerTitle}>Chi tiết homestay</Text>
          <View style={s.icon} />
        </View>
        <View style={s.center}>
          <ActivityIndicator size="large" color="#2563EB" />
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

  const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = nights > 0 ? homestay.price * nights : 0;

  const handleBook = () => {
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
    addToBooking(homestay, { checkIn, checkOut, guests, nights, totalPrice });
    Alert.alert('Đặt phòng thành công', `${homestay.name} đã được thêm vào danh sách đặt phòng.`, [
      { text: 'Xem đặt phòng', onPress: () => router.push('/bookings') },
      { text: 'Tiếp tục xem', style: 'cancel' }
    ]);
  };

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.icon}><Ionicons name="arrow-back" size={23} color="#0F172A" /></Pressable>
        <Text style={s.headerTitle}>Chi tiết homestay</Text>
        <Pressable onPress={() => router.push('/bookings')} style={s.icon}><Ionicons name="calendar-outline" size={23} color="#0F172A" /></Pressable>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.imageContainer}>
          <ProductImage uri={homestay.images[currentImage]} style={s.image} containerStyle={s.image} />
          {homestay.images.length > 1 && (
            <View style={s.imageDots}>
              {homestay.images.map((_, i) => (
                <View key={i} style={[s.dot, i === currentImage && s.dotActive]} />
              ))}
            </View>
          )}
        </View>
        <Text style={s.name}>{homestay.name}</Text>
        <View style={s.rating}>
          <Ionicons name="star" size={18} color="#F59E0B" />
          <Text style={s.ratingText}>{homestay.rating} ({homestay.reviewCount} đánh giá)</Text>
          <Text style={s.locationText}>📍 {homestay.location} • {homestay.type}</Text>
        </View>
        <View style={s.priceRow}>
          <Text style={s.price}>{formatPrice(homestay.price)}<Text style={s.perNight}>/đêm</Text></Text>
          {homestay.oldPrice && <Text style={s.oldPrice}>{formatPrice(homestay.oldPrice)}</Text>}
        </View>
        {homestay.oldPrice && <Text style={s.sale}>Đang giảm giá {Math.round((1 - homestay.price / homestay.oldPrice) * 100)}%</Text>}

        <Text style={s.section}>Mô tả</Text>
        <Text style={s.description} numberOfLines={expanded ? undefined : 4}>{homestay.description}</Text>
        <Pressable onPress={() => setExpanded(!expanded)}><Text style={s.more}>{expanded ? 'Thu gọn' : 'Xem thêm'}</Text></Pressable>

        <Text style={s.section}>Tiện nghi</Text>
        {homestay.amenities.length > 0 ? (
          <View style={s.amenitiesGrid}>
            {homestay.amenities.map((a, i) => (
              <View key={i} style={s.amenityItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={s.amenityText}>{a}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={s.noAmenities}>Chưa có thông tin tiện nghi</Text>
        )}

        <Text style={s.section}>Thông tin chỗ nghỉ</Text>
        <Info label="Loại hình" value={homestay.type} />
        <Info label="Số phòng ngủ" value={`${homestay.bedrooms}`} />
        <Info label="Số phòng tắm" value={`${homestay.bathrooms}`} />
        <Info label="Tối đa khách" value={`${homestay.maxGuests} người`} />
        <Info label="Địa điểm" value={homestay.location} />

        <Text style={s.section}>Đặt phòng</Text>
        <View style={s.dateRow}>
          <Pressable style={s.dateField} onPress={() => setCheckIn(new Date().toISOString().split('T')[0])}>
            <Ionicons name="calendar-outline" size={20} color="#2563EB" />
            <View>
              <Text style={s.dateLabel}>Ngày nhận phòng</Text>
              <Text style={s.dateValue}>{checkIn || 'Chọn ngày'}</Text>
            </View>
          </Pressable>
          <Pressable style={s.dateField} onPress={() => setCheckOut(new Date(Date.now() + 86400000).toISOString().split('T')[0])}>
            <Ionicons name="calendar-outline" size={20} color="#2563EB" />
            <View>
              <Text style={s.dateLabel}>Ngày trả phòng</Text>
              <Text style={s.dateValue}>{checkOut || 'Chọn ngày'}</Text>
            </View>
          </Pressable>
        </View>
        <View style={s.quantity}>
          <Text style={s.quantityLabel}>Số khách</Text>
          <View style={s.stepper}>
            <Pressable style={s.step} onPress={() => setGuests(Math.max(1, guests - 1))}><Ionicons name="remove" size={20} color="#2563EB" /></Pressable>
            <Text style={s.quantityValue}>{guests}</Text>
            <Pressable style={s.step} onPress={() => setGuests(Math.min(homestay.maxGuests, guests + 1))}><Ionicons name="add" size={20} color="#2563EB" /></Pressable>
          </View>
        </View>
        {nights > 0 && (
          <View style={s.priceSummary}>
            <Line label={`${nights} đêm × ${formatPrice(homestay.price)}`} value={formatPrice(homestay.price * nights)} />
            <View style={s.total}><Text style={s.totalLabel}>Tổng cộng</Text><Text style={s.totalValue}>{formatPrice(totalPrice)}</Text></View>
          </View>
        )}
        <View style={s.actions}>
          <Pressable style={s.saveButton} onPress={() => { addToBooking(homestay); Alert.alert('Đã lưu', `${homestay.name} đã được thêm vào danh sách yêu thích.`); }}>
            <Ionicons name="heart-outline" size={20} color="#2563EB" />
            <Text style={s.saveText}>Lưu</Text>
          </Pressable>
          <Pressable style={[s.bookButton, (!checkIn || !checkOut) && { opacity: 0.7 }]} onPress={handleBook} disabled={!checkIn || !checkOut}>
            <Ionicons name="calendar-outline" size={20} color="#FFF" />
            <Text style={s.bookText}>Đặt phòng ngay</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <View style={s.info}><Text style={s.infoLabel}>{label}</Text><Text style={s.infoValue}>{value}</Text></View>;
}

function Line({ label, value }: { label: string; value: string }) {
  return <View style={s.line}><Text style={s.lineLabel}>{label}</Text><Text style={s.lineValue}>{value}</Text></View>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  icon: { padding: 8 },
  content: { padding: 20, paddingTop: 4, paddingBottom: 120 },
  imageContainer: { position: 'relative', height: 300, width: '100%', borderRadius: 20, overflow: 'hidden', backgroundColor: '#EFF6FF' },
  image: { height: 300, width: '100%' },
  imageDots: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#FFF', width: 20 },
  name: { marginTop: 20, fontSize: 25, fontWeight: '700', color: '#0F172A' },
  rating: { flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 9, flexWrap: 'wrap' },
  ratingText: { fontSize: 14, color: '#475569' },
  locationText: { marginLeft: 8, fontSize: 14, color: '#64748B' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 12 },
  price: { fontSize: 22, fontWeight: '700', color: '#2563EB' },
  perNight: { fontSize: 14, fontWeight: '400', color: '#64748B' },
  oldPrice: { fontSize: 14, color: '#94A3B8', textDecorationLine: 'line-through' },
  sale: { alignSelf: 'flex-start', marginTop: 9, padding: 5, borderRadius: 7, backgroundColor: '#FEF3C7', color: '#B45309', fontSize: 12, fontWeight: '700' },
  section: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginTop: 24, marginBottom: 9 },
  description: { fontSize: 14, lineHeight: 21, color: '#475569' },
  more: { marginTop: 6, color: '#2563EB', fontWeight: '600' },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0FDF4', padding: 10, borderRadius: 10, width: '48%' },
  amenityText: { fontSize: 13, color: '#1E293B' },
  noAmenities: { fontSize: 14, color: '#94A3B8' },
  info: { paddingVertical: 11, borderBottomWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: '#64748B' },
  infoValue: { fontWeight: '600', color: '#1E293B' },
  dateRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  dateField: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateLabel: { fontSize: 12, color: '#64748B' },
  dateValue: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  quantity: { marginTop: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quantityLabel: { fontSize: 17, fontWeight: '700' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  step: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E2E8F0' },
  quantityValue: { fontSize: 18, fontWeight: '700' },
  priceSummary: { marginTop: 16, padding: 16, backgroundColor: '#F8FAFC', borderRadius: 12 },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  lineLabel: { color: '#475569' },
  lineValue: { fontWeight: '600', color: '#1E293B' },
  total: { borderTopWidth: 1, borderColor: '#E2E8F0', marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#2563EB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  centerText: { marginTop: 12, fontSize: 15, color: '#64748B' },
  centerTitle: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#334155', textAlign: 'center' },
  retryBtn: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: '#2563EB' },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  saveButton: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 13, backgroundColor: '#DBEAFE', flexDirection: 'row', gap: 8 },
  saveText: { fontWeight: '700', color: '#1D4ED8' },
  bookButton: { flex: 2, alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 13, backgroundColor: '#2563EB', flexDirection: 'row', gap: 8 },
  bookText: { fontWeight: '700', color: '#FFF' },
});
