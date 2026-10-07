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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL, fetchWithTimeout } from '@/config/api';

const POPULAR_BANKS = [
  { name: 'Techcombank', code: 'TCB', logo: 'business' },
  { name: 'Vietcombank', code: 'VCB', logo: 'business' },
  { name: 'MB Bank (Quân Đội)', code: 'MB', logo: 'business' },
  { name: 'VietinBank', code: 'CTG', logo: 'business' },
  { name: 'BIDV', code: 'BIDV', logo: 'business' },
  { name: 'ACB', code: 'ACB', logo: 'business' },
  { name: 'VPBank', code: 'VPB', logo: 'business' },
  { name: 'TPBank', code: 'TPB', logo: 'business' },
  { name: 'Sacombank', code: 'STB', logo: 'business' },
];

interface BankAccount {
  id: number;
  bankName: string;
  bankCode: string;
  accountNumberMasked: string;
  accountHolderName: string;
  isDefault: boolean;
  createdAt: string;
}

export default function BankAccountsScreen() {
  const { isDark, colors } = useAppTheme();
  const { token, user } = useAuth();

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Bank Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(POPULAR_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState(user?.name ? user.name.toUpperCase() : '');
  const [isDefault, setIsDefault] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authHeaders = useMemo(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, [token]);

  const loadBankAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/api/bank-accounts?userId=${user?.id || 4}`,
        { headers: authHeaders },
        4000
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBankAccounts(json.data);
      }
    } catch (err) {
      console.warn('Load bank accounts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const handleSetDefault = async (account: BankAccount) => {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/api/bank-accounts/${account.id}/default`,
        {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ userId: user?.id }),
        },
        4000
      );
      const json = await res.json();
      if (json.success) {
        Alert.alert('Thành công', `Đã đặt ${account.bankName} làm tài khoản nhận tiền mặc định.`);
        loadBankAccounts();
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể đổi tài khoản mặc định lúc này.');
    }
  };

  const handleDeleteAccount = (account: BankAccount) => {
    Alert.alert(
      'Xóa tài khoản ngân hàng',
      `Bạn có chắc chắn muốn xóa tài khoản ${account.bankName} (${account.accountNumberMasked}) khỏi danh sách nhận tiền không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetchWithTimeout(
                `${API_BASE_URL}/api/bank-accounts/${account.id}?userId=${user?.id || 4}`,
                {
                  method: 'DELETE',
                  headers: authHeaders,
                },
                4000
              );
              const json = await res.json();
              if (json.success) {
                Alert.alert('Thành công', 'Đã xóa tài khoản ngân hàng.');
                loadBankAccounts();
              }
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa tài khoản ngân hàng lúc này.');
            }
          },
        },
      ]
    );
  };

  const handleCreateBankAccount = async () => {
    const cleanNumber = accountNumber.trim().replace(/\s+/g, '');
    const cleanHolder = accountHolderName.trim().toUpperCase();

    if (!cleanNumber || cleanNumber.length < 6) {
      Alert.alert('Số tài khoản không hợp lệ', 'Vui lòng nhập số tài khoản ngân hàng chính xác (ít nhất 6 chữ số).');
      return;
    }

    if (!cleanHolder || cleanHolder.length < 3) {
      Alert.alert('Tên chủ tài khoản không hợp lệ', 'Vui lòng nhập họ và tên chủ tài khoản in hoa không dấu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/api/bank-accounts`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            userId: user?.id,
            bankName: selectedBank.name,
            bankCode: selectedBank.code,
            accountNumber: cleanNumber,
            accountHolderName: cleanHolder,
            isDefault,
          }),
        },
        5000
      );
      const json = await res.json();
      setIsSubmitting(false);

      if (json.success) {
        setShowAddModal(false);
        setAccountNumber('');
        Alert.alert('Thành công! 🎉', 'Tài khoản ngân hàng đã được thêm thành công.');
        loadBankAccounts();
      } else {
        Alert.alert('Lỗi', json.message || 'Không thể thêm tài khoản ngân hàng.');
      }
    } catch (err) {
      setIsSubmitting(false);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối máy chủ để lưu tài khoản ngân hàng.');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tài khoản ngân hàng</Text>
        <Pressable onPress={() => setShowAddModal(true)} style={styles.addHeaderBtn} hitSlop={8}>
          <Ionicons name="add-circle" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner Notice */}
        <View style={[styles.noticeCard, { backgroundColor: isDark ? '#1C2541' : '#F0F9FF', borderColor: colors.cardBorder }]}>
          <Ionicons name="information-circle" size={18} color="#0284C7" />
          <Text style={[styles.noticeText, { color: isDark ? '#BAE6FD' : '#0369A1' }]}>
            Tài khoản ngân hàng liên kết được dùng để nhận tiền rút từ Ví. Số tài khoản được mã hóa bảo mật theo tiêu chuẩn ngân hàng.
          </Text>
        </View>

        <View style={styles.listHeaderRow}>
          <Text style={[styles.listHeaderTitle, { color: colors.text }]}>
            Tài khoản của bạn ({bankAccounts.length})
          </Text>
          <Pressable style={styles.addSmallBtn} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={14} color="#0284C7" />
            <Text style={styles.addSmallText}>Thêm thẻ mới</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={{ marginTop: 8, fontSize: 12, color: colors.textSecondary }}>Đang tải danh sách thẻ...</Text>
          </View>
        ) : bankAccounts.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
            <Ionicons name="card-outline" size={38} color="#94A3B8" />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có tài khoản ngân hàng nào</Text>
            <Text style={styles.emptyDesc}>Thêm tài khoản ngân hàng của bạn để có thể yêu cầu rút tiền về thẻ.</Text>
            <Pressable style={[styles.addFirstBtn, { backgroundColor: colors.primary }]} onPress={() => setShowAddModal(true)}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addFirstText}>Thêm tài khoản ngay</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.bankList}>
            {bankAccounts.map((account) => (
              <View
                key={account.id}
                style={[
                  styles.bankCard,
                  { backgroundColor: colors.cardBackground, borderColor: account.isDefault ? colors.primary : colors.cardBorder },
                  account.isDefault && { borderWidth: 1.8 },
                ]}
              >
                <View style={styles.bankCardTop}>
                  <View style={[styles.bankIconCircle, { backgroundColor: isDark ? '#0F172A' : '#E0F2FE' }]}>
                    <Ionicons name="business" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.bankNameRow}>
                      <Text style={[styles.bankName, { color: colors.text }]}>{account.bankName}</Text>
                      {account.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Ionicons name="checkmark-circle" size={11} color="#0284C7" />
                          <Text style={styles.defaultBadgeText}>Mặc định</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.accountNumMasked, { color: colors.textSecondary }]}>
                      {account.accountNumberMasked}
                    </Text>
                    <Text style={[styles.accountHolder, { color: colors.text }]}>
                      {account.accountHolderName}
                    </Text>
                  </View>
                </View>

                {/* Card Actions */}
                <View style={[styles.bankCardActions, { borderTopColor: isDark ? '#334155' : '#F1F5F9' }]}>
                  {!account.isDefault && (
                    <Pressable
                      style={styles.setDefaultBtn}
                      onPress={() => handleSetDefault(account)}
                      hitSlop={6}
                    >
                      <Ionicons name="checkmark" size={14} color="#0284C7" />
                      <Text style={styles.setDefaultText}>Đặt làm mặc định</Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={styles.deleteBankBtn}
                    onPress={() => handleDeleteAccount(account)}
                    hitSlop={6}
                  >
                    <Ionicons name="trash-outline" size={15} color="#EF4444" />
                    <Text style={styles.deleteBankText}>Xóa</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* MODAL: THÊM TÀI KHOẢN NGÂN HÀNG MỚI */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddModal(false)}>
          <Pressable style={[styles.modalBox, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Thêm tài khoản ngân hàng</Text>
              <Pressable onPress={() => setShowAddModal(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {/* Chọn ngân hàng */}
              <Text style={[styles.formLabel, { color: colors.text }]}>Chọn ngân hàng:</Text>
              <View style={styles.bankGrid}>
                {POPULAR_BANKS.map((b) => {
                  const isSelected = selectedBank.code === b.code;
                  return (
                    <Pressable
                      key={b.code}
                      style={[
                        styles.bankGridItem,
                        { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: isSelected ? colors.primary : '#E2E8F0' },
                        isSelected && { borderWidth: 1.8, backgroundColor: isDark ? '#082F49' : '#EFF6FF' },
                      ]}
                      onPress={() => setSelectedBank(b)}
                    >
                      <Text style={[styles.bankGridCode, { color: isSelected ? colors.primary : colors.text }]}>
                        {b.code}
                      </Text>
                      <Text numberOfLines={1} style={styles.bankGridName}>
                        {b.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Nhập số tài khoản */}
              <Text style={[styles.formLabel, { color: colors.text, marginTop: 12 }]}>Số tài khoản:</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.inputBg, borderColor: colors.primary, color: colors.text }]}
                placeholder="VD: 19071766471019"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                value={accountNumber}
                onChangeText={setAccountNumber}
              />

              {/* Nhập tên chủ tài khoản */}
              <Text style={[styles.formLabel, { color: colors.text, marginTop: 12 }]}>Tên chủ tài khoản (in hoa không dấu):</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.inputBg, borderColor: colors.primary, color: colors.text }]}
                placeholder="VD: NGUYEN VAN A"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                value={accountHolderName}
                onChangeText={(text) => setAccountHolderName(text.toUpperCase())}
              />

              {/* Checkbox Đặt làm mặc định */}
              <Pressable
                style={styles.checkboxRow}
                onPress={() => setIsDefault(!isDefault)}
              >
                <View style={[styles.checkboxBox, isDefault && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  {isDefault && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  Đặt làm tài khoản ngân hàng nhận tiền mặc định
                </Text>
              </Pressable>
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <Pressable
                style={[styles.cancelBtn, isDark && { backgroundColor: '#334155' }]}
                onPress={() => setShowAddModal(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </Pressable>

              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.primary }, isSubmitting && { opacity: 0.7 }]}
                onPress={handleCreateBankAccount}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Lưu tài khoản</Text>
                )}
              </Pressable>
            </View>
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
  addHeaderBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 40 },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  noticeText: { fontSize: 11, flex: 1, lineHeight: 16, fontWeight: '500' },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listHeaderTitle: { fontSize: 14, fontWeight: '800' },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  addSmallText: { fontSize: 11, fontWeight: '700', color: '#0369A1' },
  loadingBox: { alignItems: 'center', paddingVertical: 30 },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 34,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 13, fontWeight: '700', marginTop: 10 },
  emptyDesc: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  addFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addFirstText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  bankList: { gap: 12 },
  bankCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bankCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bankIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankName: { fontSize: 14, fontWeight: '800' },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadgeText: { fontSize: 9, fontWeight: '700', color: '#0284C7' },
  accountNumMasked: { fontSize: 13, fontWeight: '700', letterSpacing: 1.2, marginTop: 4 },
  accountHolder: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  bankCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  setDefaultText: { fontSize: 11, fontWeight: '700', color: '#0284C7' },
  deleteBankBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  deleteBankText: { fontSize: 11, fontWeight: '700', color: '#EF4444' },
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
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: '800' },
  formLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
  },
  bankGridItem: {
    width: '31%',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 4,
  },
  bankGridCode: { fontSize: 12, fontWeight: '800' },
  bankGridName: { fontSize: 9, color: '#64748B', marginTop: 2 },
  formInput: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: { fontSize: 11, fontWeight: '600', flex: 1 },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
});
