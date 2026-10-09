import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL, fetchWithTimeout } from '@/config/api';
import { formatPrice } from '@/constants/mockData';

interface WalletInfo {
  id: number;
  balance: number;
  pendingWithdrawal: number;
  availableBalance: number;
  currency: string;
  status: string;
}

interface WalletTx {
  id: number;
  type: 'REFUND' | 'WITHDRAWAL' | 'DEPOSIT' | 'ADJUSTMENT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string;
  description: string;
  status: string;
  createdAt: string;
}

interface BankAccount {
  id: number;
  bankName: string;
  bankCode: string;
  accountNumberMasked: string;
  accountHolderName: string;
  isDefault: boolean;
}

export default function WalletScreen() {
  const { isDark, colors } = useAppTheme();
  const { token, user } = useAuth();

  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'refund' | 'withdrawal'>('all');

  // Modal Rút tiền
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmountStr, setWithdrawAmountStr] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  // Modal Chi tiết giao dịch ví / Đơn hủy
  const [selectedTx, setSelectedTx] = useState<WalletTx | null>(null);

  const authHeaders = useMemo(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, [token]);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      // 1. Lấy thông tin ví
      const wRes = await fetchWithTimeout(`${API_BASE_URL}/api/wallet?userId=${user?.id || 4}`, { headers: authHeaders }, 4000);
      const wJson = await wRes.json();
      if (wJson.success && wJson.data) {
        setWallet(wJson.data);
      }

      // 2. Lấy lịch sử giao dịch
      const txRes = await fetchWithTimeout(`${API_BASE_URL}/api/wallet/transactions?userId=${user?.id || 4}`, { headers: authHeaders }, 4000);
      const txJson = await txRes.json();
      if (txJson.success && Array.isArray(txJson.data)) {
        setTransactions(txJson.data);
      }

      // 3. Lấy danh sách ngân hàng
      const bRes = await fetchWithTimeout(`${API_BASE_URL}/api/bank-accounts?userId=${user?.id || 4}`, { headers: authHeaders }, 4000);
      const bJson = await bRes.json();
      if (bJson.success && Array.isArray(bJson.data)) {
        setBankAccounts(bJson.data);
        const defaultBank = bJson.data.find((b: BankAccount) => b.isDefault);
        if (defaultBank) {
          setSelectedBankId(defaultBank.id);
        } else if (bJson.data.length > 0) {
          setSelectedBankId(bJson.data[0].id);
        }
      }
    } catch (err) {
      console.warn('Load wallet error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (activeTab === 'refund') {
      return transactions.filter((t) => String(t.type || '').toUpperCase() === 'REFUND');
    }
    if (activeTab === 'withdrawal') {
      return transactions.filter((t) => String(t.type || '').toUpperCase() === 'WITHDRAWAL');
    }
    return transactions;
  }, [transactions, activeTab]);

  const handleOpenWithdrawModal = () => {
    if (bankAccounts.length === 0) {
      if (Platform.OS === 'web') {
        const ok = window.confirm('Bạn chưa có tài khoản ngân hàng. Đi đến trang Thêm tài khoản ngân hàng ngay bây giờ?');
        if (ok) router.push('/bank-accounts' as any);
      } else {
        Alert.alert(
          'Chưa có tài khoản ngân hàng',
          'Vui lòng thêm tài khoản ngân hàng trước khi tạo yêu cầu rút tiền.',
          [
            { text: 'Để sau', style: 'cancel' },
            { text: 'Thêm tài khoản', onPress: () => router.push('/bank-accounts' as any) },
          ]
        );
      }
      return;
    }
    setWithdrawAmountStr('');
    setShowWithdrawModal(true);
  };

  const handleConfirmWithdraw = async () => {
    const amount = parseFloat(withdrawAmountStr.replace(/\D/g, ''));
    if (!amount || amount <= 0) {
      const msg = 'Vui lòng nhập số tiền muốn rút.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Số tiền không hợp lệ', msg);
      return;
    }

    if (wallet && amount > wallet.availableBalance) {
      const msg = `Số dư khả dụng (${formatPrice(wallet.availableBalance)}) không đủ để rút số tiền này.`;
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Số dư không đủ', msg);
      return;
    }

    if (!selectedBankId) {
      const msg = 'Vui lòng chọn tài khoản ngân hàng nhận tiền.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Thiếu thông tin', msg);
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/api/wallet/withdraw`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            userId: user?.id || 4,
            bankAccountId: selectedBankId,
            amount,
          }),
        },
        5000
      );
      const json = await res.json();
      setIsSubmittingWithdraw(false);

      if (json.success) {
        setShowWithdrawModal(false);
        const msg = 'Yêu cầu rút tiền đã được gửi thành công. Quản trị viên sẽ xử lý chuyển khoản trong vòng 24 giờ.';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Thành công! 🎉', msg);
        }
        loadWalletData();
      } else {
        const msg = json.message || 'Lỗi khi tạo yêu cầu rút tiền.';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Không thể rút tiền', msg);
        }
      }
    } catch (err) {
      setIsSubmittingWithdraw(false);
      const msg = 'Không thể kết nối máy chủ để gửi yêu cầu rút tiền.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Lỗi kết nối', msg);
      }
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ví của tôi</Text>
        <Pressable onPress={() => router.push('/bank-accounts' as any)} style={styles.bankHeaderBtn} hitSlop={8}>
          <Ionicons name="card-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletCardHeader}>
            <View>
              <Text style={styles.walletLabel}>Số dư khả dụng</Text>
              <Text style={styles.walletBalance}>
                {formatPrice(wallet?.availableBalance || 0)}
              </Text>
            </View>
            <View style={styles.walletLogoBox}>
              <Ionicons name="wallet" size={28} color="#FFFFFF" />
            </View>
          </View>

          {wallet && wallet.pendingWithdrawal > 0 && (
            <View style={styles.pendingBox}>
              <Ionicons name="time-outline" size={13} color="#FEF08A" />
              <Text style={styles.pendingText}>
                Đang chờ chuyển khoản: {formatPrice(wallet.pendingWithdrawal)}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.walletActionsRow}>
            <Pressable style={styles.withdrawBtn} onPress={handleOpenWithdrawModal}>
              <Ionicons name="arrow-up-circle-outline" size={18} color="#0369A1" />
              <Text style={styles.withdrawBtnText}>Rút tiền về thẻ</Text>
            </Pressable>

            <Pressable style={styles.bankManageBtn} onPress={() => router.push('/bank-accounts' as any)}>
              <Ionicons name="business-outline" size={18} color="#FFFFFF" />
              <Text style={styles.bankManageBtnText}>Ngân hàng ({bankAccounts.length})</Text>
            </Pressable>
          </View>
        </View>

        {/* Feature Highlights Banner */}
        <View style={[styles.featureInfoBox, { backgroundColor: isDark ? '#1C2541' : '#F0F9FF', borderColor: colors.cardBorder }]}>
          <Ionicons name="shield-checkmark" size={18} color="#0284C7" />
          <Text style={[styles.featureInfoText, { color: isDark ? '#BAE6FD' : '#0369A1' }]}>
            Tiền hoàn phòng khi hủy đúng hạn được cộng ngay vào Ví. Bạn có thể yêu cầu rút về tài khoản ngân hàng bất cứ lúc nào mà không mất phí.
          </Text>
        </View>

        {/* Transaction History Section */}
        <View style={styles.historySection}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Lịch sử biến động số dư</Text>
            <Pressable onPress={loadWalletData} hitSlop={6}>
              <Ionicons name="refresh" size={16} color={colors.primary} />
            </Pressable>
          </View>

          {/* Filter Tabs */}
          <View style={[styles.filterTabs, isDark && { backgroundColor: '#1E293B' }]}>
            <Pressable
              style={[styles.filterTab, activeTab === 'all' && styles.filterTabActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.filterTabText, activeTab === 'all' && styles.filterTabTextActive]}>Tất cả</Text>
            </Pressable>
            <Pressable
              style={[styles.filterTab, activeTab === 'refund' && styles.filterTabActive]}
              onPress={() => setActiveTab('refund')}
            >
              <Text style={[styles.filterTabText, activeTab === 'refund' && styles.filterTabTextActive]}>Hoàn tiền</Text>
            </Pressable>
            <Pressable
              style={[styles.filterTab, activeTab === 'withdrawal' && styles.filterTabActive]}
              onPress={() => setActiveTab('withdrawal')}
            >
              <Text style={[styles.filterTabText, activeTab === 'withdrawal' && styles.filterTabTextActive]}>Rút tiền</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ marginTop: 8, fontSize: 12, color: colors.textSecondary }}>Đang cập nhật sổ ví...</Text>
            </View>
          ) : filteredTransactions.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
              <Ionicons name="receipt-outline" size={36} color="#94A3B8" />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có giao dịch nào</Text>
              <Text style={styles.emptyDesc}>Các khoản tiền hoàn hoặc yêu cầu rút tiền sẽ được ghi nhận tại đây.</Text>
            </View>
          ) : (
            <View style={[styles.txListWrapper, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
              {filteredTransactions.map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <Pressable
                    key={tx.id}
                    style={[styles.txRow, { borderBottomColor: isDark ? '#334155' : '#F1F5F9' }]}
                    onPress={() => setSelectedTx(tx)}
                    android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
                  >
                    <View style={[styles.txIconCircle, { backgroundColor: isPositive ? '#DCFCE7' : '#FEE2E2' }]}>
                      <Ionicons
                        name={isPositive ? 'arrow-down' : 'arrow-up'}
                        size={16}
                        color={isPositive ? '#16A34A' : '#DC2626'}
                      />
                    </View>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.txDesc, { color: colors.text }]} numberOfLines={2}>{tx.description}</Text>
                      <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleString('vi-VN')}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.txAmount, { color: isPositive ? '#16A34A' : '#DC2626' }]}>
                          {isPositive ? '+' : ''}{formatPrice(tx.amount)}
                        </Text>
                        <Text style={styles.txSub}>
                          Số dư: {formatPrice(tx.balanceAfter)}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL: TẠO YÊU CẦU RÚT TIỀN */}
      <Modal visible={showWithdrawModal} transparent animationType="slide" onRequestClose={() => setShowWithdrawModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowWithdrawModal(false)}>
          <Pressable style={[styles.modalBox, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Yêu cầu rút tiền</Text>
                <Text style={styles.modalSub}>
                  Số dư khả dụng: <Text style={{ color: colors.primary, fontWeight: '700' }}>{formatPrice(wallet?.availableBalance || 0)}</Text>
                </Text>
              </View>
              <Pressable onPress={() => setShowWithdrawModal(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            {/* Chọn tài khoản ngân hàng */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>Tài khoản ngân hàng nhận tiền:</Text>
            <View style={styles.bankPickerList}>
              {bankAccounts.map((b) => {
                const isSelected = selectedBankId === b.id;
                return (
                  <Pressable
                    key={b.id}
                    style={[
                      styles.bankOptionCard,
                      { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: isSelected ? colors.primary : '#E2E8F0' },
                      isSelected && { backgroundColor: isDark ? '#082F49' : '#EFF6FF', borderWidth: 1.8 },
                    ]}
                    onPress={() => setSelectedBankId(b.id)}
                  >
                    <View style={[styles.bankLogoSmall, { backgroundColor: isSelected ? colors.primary : '#E0F2FE' }]}>
                      <Ionicons name="business" size={16} color={isSelected ? '#FFFFFF' : colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.bankOptionName, { color: colors.text }]}>
                        {b.bankName} • {b.accountNumberMasked}
                      </Text>
                      <Text style={styles.bankOptionHolder}>{b.accountHolderName}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                  </Pressable>
                );
              })}
            </View>

            {/* Nhập số tiền */}
            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>Số tiền muốn rút (₫):</Text>
            <TextInput
              style={[styles.amountInput, { backgroundColor: colors.inputBg, borderColor: colors.primary, color: colors.text }]}
              placeholder="VD: 500000"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={withdrawAmountStr}
              onChangeText={setWithdrawAmountStr}
            />

            {/* Quick amount chips */}
            {wallet && wallet.availableBalance > 0 && (
              <View style={styles.quickChipsRow}>
                {[0.25, 0.5, 1].map((ratio) => {
                  const targetVal = Math.round(wallet.availableBalance * ratio);
                  return (
                    <Pressable
                      key={ratio}
                      style={[styles.quickChip, { backgroundColor: isDark ? '#0B132B' : '#E0F2FE' }]}
                      onPress={() => setWithdrawAmountStr(String(targetVal))}
                    >
                      <Text style={[styles.quickChipText, { color: colors.primary }]}>
                        {ratio === 1 ? 'Tất cả' : `${ratio * 100}%`} ({formatPrice(targetVal)})
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <View style={styles.modalActionsRow}>
              <Pressable
                style={[styles.cancelModalBtn, isDark && { backgroundColor: '#334155' }]}
                onPress={() => setShowWithdrawModal(false)}
                disabled={isSubmittingWithdraw}
              >
                <Text style={styles.cancelModalText}>Hủy</Text>
              </Pressable>

              <Pressable
                style={[styles.confirmModalBtn, { backgroundColor: colors.primary }, isSubmittingWithdraw && { opacity: 0.7 }]}
                onPress={handleConfirmWithdraw}
                disabled={isSubmittingWithdraw}
              >
                {isSubmittingWithdraw ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmModalText}>Gửi yêu cầu rút</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL: CHI TIẾT GIAO DỊCH VÍ & ĐƠN HỦY LIÊN QUAN */}
      <Modal visible={!!selectedTx} transparent animationType="fade" onRequestClose={() => setSelectedTx(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedTx(null)}>
          <Pressable style={[styles.modalBox, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.txModalIconBadge, { backgroundColor: selectedTx && selectedTx.amount > 0 ? '#DCFCE7' : '#FEE2E2' }]}>
                  <Ionicons
                    name={selectedTx && selectedTx.amount > 0 ? 'arrow-down' : 'arrow-up'}
                    size={18}
                    color={selectedTx && selectedTx.amount > 0 ? '#16A34A' : '#DC2626'}
                  />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Chi tiết giao dịch ví</Text>
                  <Text style={styles.modalSub}>Mã GD: #{selectedTx?.id}</Text>
                </View>
              </View>
              <Pressable onPress={() => setSelectedTx(null)} hitSlop={8}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            {selectedTx && (
              <View style={{ gap: 14, marginTop: 4 }}>
                {/* Big Amount Header */}
                <View style={[styles.txDetailAmountCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>Biến động số dư:</Text>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: selectedTx.amount > 0 ? '#16A34A' : '#DC2626', marginTop: 4 }}>
                    {selectedTx.amount > 0 ? '+' : ''}{formatPrice(selectedTx.amount)}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
                    Số dư sau GD: <Text style={{ color: colors.text, fontWeight: '800' }}>{formatPrice(selectedTx.balanceAfter)}</Text>
                  </Text>
                </View>

                {/* Details Breakdown */}
                <View style={[styles.txDetailInfoBox, { borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                  <View style={styles.txDetailRow}>
                    <Text style={styles.txDetailKey}>Loại giao dịch:</Text>
                    <Text style={[styles.txDetailVal, { color: colors.text }]}>
                      {selectedTx.type === 'REFUND' ? 'Hoàn tiền hủy phòng' : selectedTx.type === 'WITHDRAWAL' ? 'Rút tiền về tài khoản' : selectedTx.type}
                    </Text>
                  </View>

                  <View style={styles.txDetailRow}>
                    <Text style={styles.txDetailKey}>Thời gian ghi nhận:</Text>
                    <Text style={[styles.txDetailVal, { color: colors.text }]}>
                      {new Date(selectedTx.createdAt).toLocaleString('vi-VN')}
                    </Text>
                  </View>

                  <View style={styles.txDetailRow}>
                    <Text style={styles.txDetailKey}>Trạng thái:</Text>
                    <Text style={[styles.txDetailVal, { color: '#16A34A', fontWeight: '800' }]}>
                      {selectedTx.status === 'completed' ? 'Thành công' : 'Đang xử lý'}
                    </Text>
                  </View>

                  <View style={[styles.txDetailRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.txDetailKey}>Nội dung:</Text>
                    <Text style={[styles.txDetailVal, { color: colors.text, flex: 1, textAlign: 'right' }]}>
                      {selectedTx.description}
                    </Text>
                  </View>
                </View>

                {/* Refund Policy & Related Booking Info */}
                {selectedTx.type === 'REFUND' && (
                  <View style={styles.refundExplainBox}>
                    <Ionicons name="information-circle" size={18} color="#0284C7" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.refundExplainTitle}>Chính sách hoàn tiền 70%:</Text>
                      <Text style={styles.refundExplainDesc}>
                        Đơn phòng được hủy đúng hạn trước giờ nhận phòng ≥ 72 giờ. Bạn đã được hoàn lại 70% tiền phòng trực tiếp vào Ví Homestay Pay và có thể rút về ngân hàng ngay.
                      </Text>
                    </View>
                  </View>
                )}

                {/* Actions */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <Pressable
                    style={[styles.modalSecondaryBtn, { borderColor: colors.primary }]}
                    onPress={() => {
                      setSelectedTx(null);
                      router.push('/bookings');
                    }}
                  >
                    <Ionicons name="calendar-outline" size={15} color={colors.primary} />
                    <Text style={[styles.modalSecondaryText, { color: colors.primary }]}>Xem đơn phòng</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.modalPrimaryBtn, { backgroundColor: colors.primary }]}
                    onPress={() => setSelectedTx(null)}
                  >
                    <Text style={styles.modalPrimaryText}>Đóng</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
  bankHeaderBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 40 },
  walletCard: {
    backgroundColor: '#0284C7',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  walletCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  walletLabel: { fontSize: 12, color: '#E0F2FE', fontWeight: '600' },
  walletBalance: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginTop: 4 },
  walletLogoBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  pendingText: { fontSize: 11, color: '#FEF08A', fontWeight: '600' },
  walletActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingTop: 14,
  },
  withdrawBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 20,
  },
  withdrawBtnText: { fontSize: 12, fontWeight: '700', color: '#0369A1' },
  bankManageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingVertical: 10,
    borderRadius: 20,
  },
  bankManageBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  featureInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
  },
  featureInfoText: { fontSize: 11, flex: 1, lineHeight: 16, fontWeight: '500' },
  historySection: { marginTop: 20 },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800' },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    borderRadius: 20,
    padding: 3,
    marginBottom: 12,
  },
  filterTab: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 16 },
  filterTabActive: { backgroundColor: '#0284C7' },
  filterTabText: { fontSize: 11, fontWeight: '700', color: '#0369A1' },
  filterTabTextActive: { color: '#FFFFFF' },
  loadingBox: { alignItems: 'center', paddingVertical: 30 },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  emptyDesc: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  txListWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
  },
  txIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDesc: { fontSize: 12, fontWeight: '600' },
  txDate: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  txAmount: { fontSize: 13, fontWeight: '800' },
  txSub: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 16, fontWeight: '800' },
  modalSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  bankPickerList: { gap: 8, maxHeight: 160 },
  bankOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  bankLogoSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankOptionName: { fontSize: 12, fontWeight: '700' },
  bankOptionHolder: { fontSize: 10, color: '#64748B' },
  amountInput: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '700',
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  quickChipText: { fontSize: 10, fontWeight: '700' },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelModalText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  confirmModalBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  confirmModalText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  txModalIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDetailAmountCard: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 4,
  },
  txDetailInfoBox: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  txDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  txDetailKey: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  txDetailVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  refundExplainBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 10,
    marginTop: 2,
  },
  refundExplainTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 2,
  },
  refundExplainDesc: {
    fontSize: 10.5,
    color: '#0284C7',
    lineHeight: 15,
  },
  modalSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 11,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  modalSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalPrimaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 20,
  },
  modalPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
