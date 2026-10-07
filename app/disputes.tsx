import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL, fetchWithTimeout } from '@/config/api';

interface DisputeItem {
  id: number;
  booking_id?: number;
  category?: string;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed' | 'rejected';
  admin_note?: string;
  resolution_action?: string;
  created_at: string;
}

export default function DisputesListScreen() {
  const { isDark, colors } = useAppTheme();
  const { token, user } = useAuth();

  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const authHeaders = useMemo(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, [token]);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/api/disputes?reporterId=${user?.id || 4}`,
        { headers: authHeaders },
        4000
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDisputes(json.data);
      } else if (Array.isArray(json)) {
        setDisputes(json);
      }
    } catch (err) {
      console.warn('Load disputes error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return { label: 'Đã giải quyết', color: '#16A34A', bg: '#DCFCE7' };
      case 'investigating':
        return { label: 'Đang điều tra', color: '#D97706', bg: '#FEF3C7' };
      case 'dismissed':
      case 'rejected':
        return { label: 'Đã đóng', color: '#64748B', bg: '#F1F5F9' };
      default:
        return { label: 'Chờ xử lý', color: '#0284C7', bg: '#E0F2FE' };
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
        <Pressable onPress={loadDisputes} style={styles.refreshBtn} hitSlop={8}>
          <Ionicons name="reload" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Support Guarantee Info */}
        <View style={[styles.infoBanner, { backgroundColor: isDark ? '#1C2541' : '#F0F9FF', borderColor: colors.cardBorder }]}>
          <Ionicons name="shield-checkmark" size={20} color="#0284C7" />
          <Text style={[styles.infoBannerText, { color: isDark ? '#BAE6FD' : '#0369A1' }]}>
            Bộ phận Chăm sóc khách hàng và An toàn Homestay Booking luôn đồng hành bảo vệ quyền lợi và hỗ trợ đối soát đơn phòng 24/7.
          </Text>
        </View>

        <View style={styles.sectionHeadingRow}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            Danh sách khiếu nại ({disputes.length})
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={{ marginTop: 8, fontSize: 12, color: colors.textSecondary }}>Đang nạp dữ liệu...</Text>
          </View>
        ) : disputes.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
            <Ionicons name="shield-outline" size={40} color="#94A3B8" />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Không có khiếu nại nào</Text>
            <Text style={styles.emptyDesc}>Nếu bạn gặp bất kỳ vấn đề nào với phòng đã đặt hoặc chủ nhà, hãy mở chi tiết đơn đặt phòng và chọn "Khiếu nại / Báo cáo".</Text>
            <Pressable style={[styles.goBookingsBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/bookings')}>
              <Text style={styles.goBookingsText}>Xem đơn đặt phòng</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.disputeList}>
            {disputes.map((d) => {
              const badge = getStatusBadge(d.status);
              return (
                <View
                  key={d.id}
                  style={[styles.disputeCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}
                >
                  <View style={styles.disputeTopRow}>
                    <View style={styles.disputeCodeBox}>
                      <Text style={styles.disputeCode}>#DSP{String(d.id).padStart(4, '0')}</Text>
                      {d.booking_id && (
                        <Text style={styles.bookingRef}>Đơn #{d.booking_id}</Text>
                      )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>

                  <Text style={[styles.reasonTitle, { color: colors.text }]}>{d.reason}</Text>
                  <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                    {d.description}
                  </Text>

                  {/* Phản hồi từ Admin nếu có */}
                  {d.admin_note ? (
                    <View style={[styles.adminReplyBox, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                        <Ionicons name="chatbubbles" size={13} color="#0284C7" />
                        <Text style={styles.adminReplyTitle}>Phản hồi từ Ban Quản Trị:</Text>
                      </View>
                      <Text style={[styles.adminReplyContent, { color: colors.text }]}>{d.admin_note}</Text>
                    </View>
                  ) : null}

                  <Text style={styles.dateFootnote}>
                    Gửi ngày: {new Date(d.created_at).toLocaleString('vi-VN')}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
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
  refreshBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 40 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoBannerText: { fontSize: 11, flex: 1, lineHeight: 16, fontWeight: '500' },
  sectionHeadingRow: { marginBottom: 12 },
  sectionHeading: { fontSize: 14, fontWeight: '800' },
  loadingBox: { alignItems: 'center', paddingVertical: 30 },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 36,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', marginTop: 10 },
  emptyDesc: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  goBookingsBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  goBookingsText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  disputeList: { gap: 12 },
  disputeCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  disputeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  disputeCodeBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  disputeCode: { fontSize: 12, fontWeight: '800', color: '#0284C7' },
  bookingRef: { fontSize: 10, color: '#64748B', backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  reasonTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  descriptionText: { fontSize: 12, lineHeight: 17, marginBottom: 8 },
  adminReplyBox: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
  },
  adminReplyTitle: { fontSize: 10, fontWeight: '700', color: '#0284C7' },
  adminReplyContent: { fontSize: 11, lineHeight: 16 },
  dateFootnote: { fontSize: 10, color: '#94A3B8' },
});
