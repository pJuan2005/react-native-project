import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL, fetchWithTimeout } from '@/config/api';

const DISPUTE_CATEGORIES = [
  { code: 'PROPERTY_MISMATCH', label: 'Chỗ ở không giống mô tả', icon: 'images-outline' },
  { code: 'CHECKIN_ISSUE', label: 'Không thể nhận phòng / Chờ quá lâu', icon: 'key-outline' },
  { code: 'HOST_UNRESPONSIVE', label: 'Chủ nhà không liên lạc được', icon: 'chatbox-ellipses-outline' },
  { code: 'PAYMENT_ISSUE', label: 'Vấn đề thanh toán & đối soát biên lai', icon: 'card-outline' },
  { code: 'REFUND_ISSUE', label: 'Vấn đề về hoàn tiền sau khi hủy phòng', icon: 'wallet-outline' },
  { code: 'SAFETY_ISSUE', label: 'Vấn đề về an toàn & vệ sinh phòng', icon: 'shield-outline' },
  { code: 'OTHER', label: 'Vấn đề khác', icon: 'help-circle-outline' },
];

export default function CreateDisputeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark, colors } = useAppTheme();
  const { token, user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState(DISPUTE_CATEGORIES[0]);
  const [reasonTitle, setReasonTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = useMemo(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, [token]);

  const handleSubmitDispute = async () => {
    const finalReason = reasonTitle.trim() || selectedCategory.label;
    const finalDesc = description.trim();

    if (!finalDesc || finalDesc.length < 15) {
      Alert.alert('Mô tả quá ngắn', 'Vui lòng mô tả chi tiết sự việc (tối thiểu 15 ký tự) để Ban Quản Trị có đủ cơ sở xác minh.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/api/disputes`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            reporterId: user?.id || 4,
            reporterRole: 'guest',
            targetType: 'booking',
            targetId: parseInt(id || '1', 10),
            bookingId: parseInt(id || '1', 10),
            category: selectedCategory.code,
            reason: finalReason,
            description: finalDesc,
          }),
        },
        5000
      );

      const json = await res.json();
      setSubmitting(false);

      if (json.success || json.id) {
        Alert.alert(
          'Gửi khiếu nại thành công! 🛡️',
          'Yêu cầu hỗ trợ của bạn đã được chuyển tới Ban Quản Trị Sàn Homestay Booking. Chúng tôi sẽ liên hệ đối soát và phản hồi sớm nhất.',
          [
            {
              text: 'Xem khiếu nại của tôi',
              onPress: () => router.replace('/disputes' as any),
            },
            {
              text: 'Về đơn phòng',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', json.message || 'Không thể gửi khiếu nại lúc này.');
      }
    } catch (err) {
      setSubmitting(false);
      Alert.alert('Lỗi kết nối', 'Không thể gửi khiếu nại. Vui lòng kiểm tra lại kết nối mạng.');
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderColor: colors.cardBorder }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Khiếu nại & Trợ giúp</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Booking Card Info */}
        <View style={[styles.bookingBanner, { backgroundColor: isDark ? '#1C2541' : '#F0F9FF', borderColor: colors.cardBorder }]}>
          <Ionicons name="information-circle" size={20} color="#0284C7" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: isDark ? '#BAE6FD' : '#0369A1' }]}>
              Khiếu nại cho đơn phòng #{id}
            </Text>
            <Text style={[styles.bannerSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Ban Quản Trị cam kết bảo vệ quyền lợi du khách và xử lý nghiêm minh mọi vi phạm từ chủ nhà.
            </Text>
          </View>
        </View>

        {/* Category Selection */}
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Chọn phân loại vấn đề:</Text>
        <View style={styles.categoryList}>
          {DISPUTE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.code === cat.code;
            return (
              <Pressable
                key={cat.code}
                style={[
                  styles.categoryCard,
                  { backgroundColor: colors.cardBackground, borderColor: isSelected ? colors.primary : colors.cardBorder },
                  isSelected && { backgroundColor: isDark ? '#082F49' : '#EFF6FF', borderWidth: 1.8 },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <View style={[styles.catIconCircle, { backgroundColor: isSelected ? colors.primary : isDark ? '#334155' : '#E0F2FE' }]}>
                  <Ionicons name={cat.icon as any} size={16} color={isSelected ? '#FFFFFF' : colors.primary} />
                </View>
                <Text style={[styles.catLabel, { color: colors.text }, isSelected && { color: colors.primary, fontWeight: '700' }]}>
                  {cat.label}
                </Text>
                {isSelected && <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={{ marginLeft: 'auto' }} />}
              </Pressable>
            );
          })}
        </View>

        {/* Reason summary */}
        <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>Tiêu đề ngắn gọn:</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder, color: colors.text }]}
          placeholder={`VD: ${selectedCategory.label}`}
          placeholderTextColor="#94A3B8"
          value={reasonTitle}
          onChangeText={setReasonTitle}
          maxLength={150}
        />

        {/* Description textarea */}
        <Text style={[styles.inputLabel, { color: colors.text, marginTop: 14 }]}>Mô tả chi tiết sự việc (*):</Text>
        <TextInput
          style={[styles.textAreaInput, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder, color: colors.text }]}
          placeholder="Vui lòng nêu rõ thời gian, nội dung trao đổi và sự cố bạn gặp phải để Admin đối soát..."
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={1000}
        />
        <Text style={styles.charCount}>{description.length} / 1000 ký tự (tối thiểu 15 ký tự)</Text>

        {/* Submit Button */}
        <Pressable
          style={[styles.submitBtn, { backgroundColor: colors.primary }, submitting && { opacity: 0.7 }]}
          onPress={handleSubmitDispute}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Gửi khiếu nại tới Ban Quản Trị</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 40 },
  bookingBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  bannerTitle: { fontSize: 13, fontWeight: '700' },
  bannerSub: { fontSize: 11, marginTop: 2, lineHeight: 16 },
  sectionHeading: { fontSize: 13, fontWeight: '800', marginBottom: 10 },
  categoryList: { gap: 8 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  catIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: { fontSize: 12, fontWeight: '600', flex: 1 },
  inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  textInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  textAreaInput: {
    minHeight: 110,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    lineHeight: 18,
  },
  charCount: { fontSize: 10, color: '#94A3B8', textAlign: 'right', marginTop: 4 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 24,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
