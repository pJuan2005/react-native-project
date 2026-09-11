import { ProductImage } from '@/components/product-image';
import { mockUser } from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import API_BASE_URL from '@/src/config/api';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  avatar: string;
};

// Danh sách ảnh đại diện mẫu đẹp để người dùng chọn nhanh
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
];

export default function ProfileScreen() {
  const { bookings, savedHomestays } = useBooking();
  const [profile, setProfile] = useState<UserProfile>(mockUser);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: mockUser.name,
    email: mockUser.email,
    phone: mockUser.phone,
    address: mockUser.address,
    avatar: mockUser.avatar,
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'wishlist'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/1`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setProfile(json.data);
          setForm({
            name: json.data.name,
            email: json.data.email,
            phone: json.data.phone,
            address: json.data.address,
            avatar: json.data.avatar || mockUser.avatar,
          });
        } else {
          setProfile(mockUser);
          setForm({
            name: mockUser.name,
            email: mockUser.email,
            phone: mockUser.phone,
            address: mockUser.address,
            avatar: mockUser.avatar,
          });
        }
      })
      .catch(() => {
        setProfile(mockUser);
        setForm({
          name: mockUser.name,
          email: mockUser.email,
          phone: mockUser.phone,
          address: mockUser.address,
          avatar: mockUser.avatar,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const selectAvatar = (url: string) => {
    setForm(prev => ({ ...prev, avatar: url }));
    setProfile(prev => ({ ...prev, avatar: url }));
    setShowAvatarModal(false);
  };

  const handleApplyCustomAvatar = () => {
    if (!customAvatarUrl.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đường dẫn hình ảnh');
      return;
    }
    selectAvatar(customAvatarUrl.trim());
    setCustomAvatarUrl('');
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        setIsEditing(false);
        Alert.alert('Thành công', 'Cập nhật hồ sơ và ảnh đại diện thành công!');
      } else {
        // Cập nhật local nếu API báo lỗi
        setProfile(prev => ({ ...prev, ...form }));
        setIsEditing(false);
        Alert.alert('Thành công', 'Đã lưu thay đổi hồ sơ.');
      }
    } catch {
      // Offline fallback
      setProfile(prev => ({ ...prev, ...form }));
      setIsEditing(false);
      Alert.alert('Thành công', 'Đã lưu thay đổi hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Trang cá nhân</Text>

        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.emptyTitle}>Đang tải thông tin...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
            <Text style={styles.emptyTitle}>Lỗi</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Profile Avatar Header */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <ProductImage uri={profile.avatar} style={styles.avatar} containerStyle={styles.avatar} />
                <Pressable
                  style={styles.avatarBadge}
                  onPress={() => setShowAvatarModal(true)}
                  hitSlop={8}
                >
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                </Pressable>
              </View>

              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.email}>{profile.email}</Text>

              <Pressable
                style={styles.editButton}
                onPress={() => {
                  setForm({
                    name: profile.name,
                    email: profile.email,
                    phone: profile.phone,
                    address: profile.address,
                    avatar: profile.avatar,
                  });
                  setIsEditing(!isEditing);
                }}
              >
                <Ionicons name={isEditing ? 'close-outline' : 'create-outline'} size={16} color="#2563EB" />
                <Text style={styles.editText}>{isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa hồ sơ'}</Text>
              </Pressable>
            </View>

            {/* Segmented Tab Bar */}
            <View style={styles.tabBar}>
              <Pressable style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]} onPress={() => setActiveTab('profile')}>
                <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>Hồ sơ</Text>
              </Pressable>
              <Pressable style={[styles.tabItem, activeTab === 'bookings' && styles.tabItemActive]} onPress={() => setActiveTab('bookings')}>
                <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>Đặt phòng ({bookings.length})</Text>
              </Pressable>
              <Pressable style={[styles.tabItem, activeTab === 'wishlist' && styles.tabItemActive]} onPress={() => setActiveTab('wishlist')}>
                <Text style={[styles.tabText, activeTab === 'wishlist' && styles.tabTextActive]}>Yêu thích ({savedHomestays.length})</Text>
              </Pressable>
            </View>

            {/* Tab: Profile Info / Edit */}
            {activeTab === 'profile' && (
              <>
                {isEditing ? (
                  <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Chỉnh sửa thông tin</Text>

                    {/* Avatar quick select in edit mode */}
                    <View style={styles.avatarEditRow}>
                      <Text style={styles.fieldLabel}>Ảnh đại diện</Text>
                      <Pressable style={styles.changeAvatarBtn} onPress={() => setShowAvatarModal(true)}>
                        <Ionicons name="image-outline" size={16} color="#2563EB" />
                        <Text style={styles.changeAvatarText}>Đổi ảnh đại diện</Text>
                      </Pressable>
                    </View>

                    <Field label="Họ và tên" value={form.name} onChangeText={(name) => setForm({ ...form, name })} />
                    <Field label="Email" value={form.email} onChangeText={(email) => setForm({ ...form, email })} keyboardType="email-address" />
                    <Field label="Số điện thoại" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} keyboardType="phone-pad" />
                    <Field label="Địa chỉ" value={form.address} onChangeText={(address) => setForm({ ...form, address })} />

                    <Pressable style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={saveProfile} disabled={saving}>
                      <Text style={styles.saveText}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
                    <Info label="Họ và tên" value={profile.name} />
                    <Info label="Email" value={profile.email} />
                    <Info label="Số điện thoại" value={profile.phone} />
                    <Info label="Địa chỉ" value={profile.address} />
                    <Info label="Ngày sinh" value={profile.birthDate} />
                  </View>
                )}
              </>
            )}
          </>
        )}

        {/* Tab: Bookings History */}
        {activeTab === 'bookings' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Lịch sử đặt phòng</Text>
            {bookings.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={40} color="#94A3B8" />
                <Text style={styles.emptyTitle}>Chưa có đặt phòng nào</Text>
                <Text style={styles.emptyText}>Hãy đặt homestay đầu tiên của bạn ngay hôm nay.</Text>
              </View>
            ) : (
              bookings.map((booking) => (
                <Pressable
                  key={booking.id + (booking.checkIn || '')}
                  style={styles.bookingItem}
                  onPress={() => Alert.alert(booking.name, `${booking.location} • ${booking.checkIn} - ${booking.checkOut}`)}
                >
                  <ProductImage uri={booking.homestayImage || booking.images[0]} style={styles.bookingImage} containerStyle={styles.bookingImage} />
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingName}>{booking.name}</Text>
                    <Text style={styles.bookingLocation}>📍 {booking.location} • {booking.type}</Text>
                    <Text style={styles.bookingDates}>📅 {booking.checkIn} - {booking.checkOut} ({booking.nights} đêm)</Text>
                    <Text style={styles.bookingPrice}>
                      {booking.totalPrice
                        ? `Tổng: ${new Intl.NumberFormat('vi-VN').format(booking.totalPrice)} ₫`
                        : `${new Intl.NumberFormat('vi-VN').format(booking.price * booking.quantity)} ₫`}
                    </Text>
                    <Text
                      style={[
                        styles.bookingStatus,
                        booking.status === 'confirmed' && styles.statusConfirmed,
                        booking.status === 'pending' && styles.statusPending,
                        booking.status === 'completed' && styles.statusCompleted,
                      ]}
                    >
                      {booking.status === 'confirmed' ? 'Đã xác nhận' : booking.status === 'pending' ? 'Chờ xác nhận' : 'Hoàn thành'}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}

        {/* Tab: Wishlist */}
        {activeTab === 'wishlist' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Danh sách yêu thích</Text>
            {savedHomestays.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={40} color="#94A3B8" />
                <Text style={styles.emptyTitle}>Chưa có homestay yêu thích</Text>
                <Text style={styles.emptyText}>Nhấn tim vào homestay để lưu lại vào danh sách.</Text>
              </View>
            ) : (
              savedHomestays.map((homestay) => (
                <Pressable
                  key={homestay.id}
                  style={styles.wishlistItem}
                  onPress={() => Alert.alert(homestay.name, `${homestay.location} • ${new Intl.NumberFormat('vi-VN').format(homestay.price)} ₫/đêm`)}
                >
                  <ProductImage uri={homestay.images[0]} style={styles.wishlistImage} containerStyle={styles.wishlistImage} />
                  <View style={styles.wishlistInfo}>
                    <Text style={styles.wishlistName}>{homestay.name}</Text>
                    <Text style={styles.wishlistLocation}>📍 {homestay.location} • {homestay.type}</Text>
                    <Text style={styles.wishlistPrice}>{new Intl.NumberFormat('vi-VN').format(homestay.price)} ₫/đêm</Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}

        {/* Menu Options */}
        <View style={styles.menuCard}>
          <MenuItem icon="settings-outline" label="Cài đặt tài khoản" />
          <MenuItem icon="help-circle-outline" label="Trợ giúp & Hỗ trợ" />
          <MenuItem icon="information-circle-outline" label="Về ứng dụng Homestay" />
        </View>

        {/* Logout */}
        <Pressable
          style={styles.logout}
          onPress={() =>
            Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Đăng xuất', style: 'destructive' },
            ])
          }
        >
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>

      {/* Modal: Chọn ảnh đại diện */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowAvatarModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ảnh đại diện</Text>
              <Pressable onPress={() => setShowAvatarModal(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <Text style={styles.modalSubtitle}>Chọn từ mẫu có sẵn:</Text>
            <View style={styles.presetsGrid}>
              {AVATAR_PRESETS.map((url, idx) => (
                <Pressable
                  key={idx}
                  style={[
                    styles.presetAvatarWrapper,
                    form.avatar === url && styles.presetAvatarSelected,
                  ]}
                  onPress={() => selectAvatar(url)}
                >
                  <ProductImage uri={url} style={styles.presetAvatar} containerStyle={styles.presetAvatar} />
                  {form.avatar === url && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>

            <Text style={[styles.modalSubtitle, { marginTop: 16 }]}>Hoặc dán liên kết ảnh (URL):</Text>
            <View style={styles.customUrlRow}>
              <TextInput
                value={customAvatarUrl}
                onChangeText={setCustomAvatarUrl}
                placeholder="https://example.com/avatar.jpg"
                placeholderTextColor="#94A3B8"
                style={styles.customUrlInput}
              />
              <Pressable style={styles.applyBtn} onPress={handleApplyCustomAvatar}>
                <Text style={styles.applyBtnText}>Dùng ảnh</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={styles.input}
        placeholderTextColor="#94A3B8"
      />
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Chưa cập nhật'}</Text>
    </View>
  );
}

function MenuItem({ icon, label }: { icon: any; label: string }) {
  return (
    <Pressable style={styles.menuItem} onPress={() => Alert.alert(label, 'Chức năng đang được phát triển.')}>
      <Ionicons name={icon} size={18} color="#2563EB" />
      <Text style={styles.menuText}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  profileHeader: { alignItems: 'center', paddingVertical: 16 },
  avatarContainer: { position: 'relative', width: 84, height: 84 },
  avatar: { width: 84, height: 84, borderRadius: 42 },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 18, fontWeight: '700', marginTop: 10, color: '#0F172A' },
  email: { fontSize: 13, color: '#64748B', marginTop: 2 },
  editButton: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  editText: { color: '#2563EB', fontWeight: '600', fontSize: 12 },
  tabBar: {
    marginTop: 12,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 },
  tabItemActive: { backgroundColor: '#2563EB' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#FFFFFF' },
  card: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  avatarEditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  changeAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  changeAvatarText: { fontSize: 12, fontWeight: '600', color: '#2563EB' },
  info: { paddingVertical: 9, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  infoLabel: { fontSize: 11, color: '#64748B' },
  infoValue: { marginTop: 2, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#0F172A',
    fontSize: 13,
  },
  saveButton: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  saveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyTitle: { marginTop: 8, fontSize: 14, fontWeight: '600', color: '#334155' },
  emptyText: { marginTop: 2, fontSize: 12, color: '#64748B', textAlign: 'center' },
  bookingItem: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  bookingImage: { width: 64, height: 64, borderRadius: 8 },
  bookingInfo: { flex: 1 },
  bookingName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  bookingLocation: { fontSize: 11, color: '#64748B', marginTop: 1 },
  bookingDates: { fontSize: 11, color: '#64748B', marginTop: 2 },
  bookingPrice: { fontSize: 13, fontWeight: '700', color: '#2563EB', marginTop: 3 },
  bookingStatus: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusConfirmed: { backgroundColor: '#DCFCE7', color: '#15803D' },
  statusPending: { backgroundColor: '#FEF3C7', color: '#B45309' },
  statusCompleted: { backgroundColor: '#E0E7FF', color: '#3730A3' },
  wishlistItem: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  wishlistImage: { width: 64, height: 64, borderRadius: 8 },
  wishlistInfo: { flex: 1 },
  wishlistName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  wishlistLocation: { fontSize: 11, color: '#64748B', marginTop: 1 },
  wishlistPrice: { fontSize: 13, fontWeight: '700', color: '#2563EB', marginTop: 3 },
  menuCard: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuItem: { height: 46, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  menuText: { flex: 1, fontSize: 13, fontWeight: '500', color: '#334155' },
  logout: { marginTop: 16, alignSelf: 'center', flexDirection: 'row', gap: 6, alignItems: 'center', padding: 8 },
  logoutText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  modalSubtitle: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 8 },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  presetAvatarWrapper: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetAvatarSelected: { borderColor: '#2563EB' },
  presetAvatar: { width: 60, height: 60, borderRadius: 30 },
  checkBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customUrlRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  customUrlInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#0F172A',
  },
  applyBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});
