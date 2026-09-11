import { ProductImage } from '@/components/product-image';
import {
  mockUser,
  redeemableVouchers,
  Voucher,
} from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
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

// Danh sách avatar nhân vật Disney hoạt hình nổi tiếng
const DISNEY_AVATARS = [
  {
    name: 'Mickey Mouse',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Stitch',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Elsa (Frozen)',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Simba (Lion King)',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Donald Duck',
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Woody (Toy Story)',
    url: 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=300&q=80',
  },
];

export default function ProfileScreen() {
  const { logout } = useAuth();
  const {
    userProfile,
    updateUserProfile,
    bookings,
    savedHomestays,
    userVouchers,
    rewardPoints,
    pointHistory,
    redeemPointsForVoucher,
  } = useBooking();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone,
    address: userProfile.address,
    avatar: userProfile.avatar,
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'wishlist' | 'vouchers'>('profile');
  const [saving, setSaving] = useState(false);

  // Modals
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Keep form in sync when userProfile changes
  useEffect(() => {
    setForm({
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone,
      address: userProfile.address,
      avatar: userProfile.avatar,
    });
  }, [userProfile]);

  const selectAvatar = async (url: string) => {
    setForm((prev) => ({ ...prev, avatar: url }));
    setShowAvatarModal(false);
    // Cập nhật ngay lập tức vào Context toàn cục để trang chủ đồng bộ tức thì
    await updateUserProfile({ avatar: url });
  };

  const pickImageFromDevice = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Cần cấp quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh để chọn ảnh đại diện.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        await selectAvatar(selectedUri);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh.');
    }
  };

  const handleRedeemVoucher = (voucher: Voucher) => {
    const success = redeemPointsForVoucher(voucher);
    if (success) {
      Alert.alert('Thành công! 🎉', `Bạn đã đổi thành công ${voucher.title}. Mã voucher: ${voucher.code}`);
      setShowRedeemModal(false);
    } else {
      Alert.alert('Không đủ điểm', `Bạn cần ${voucher.requiredPoints} điểm để đổi voucher này.`);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile(form);
      setIsEditing(false);
      Alert.alert('Thành công! 🎉', 'Hồ sơ và ảnh đại diện đã được cập nhật đồng bộ.');
    } catch {
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

        {/* Profile Avatar Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <ProductImage uri={userProfile.avatar} style={styles.avatar} containerStyle={styles.avatar} />
            <Pressable
              style={styles.avatarBadge}
              onPress={() => setShowAvatarModal(true)}
              hitSlop={8}
            >
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </Pressable>
          </View>

          <Text style={styles.name}>{userProfile.name}</Text>
          <Text style={styles.email}>{userProfile.email}</Text>

          <Pressable
            style={styles.editButton}
            onPress={() => {
              setForm({
                name: userProfile.name,
                email: userProfile.email,
                phone: userProfile.phone,
                address: userProfile.address,
                avatar: userProfile.avatar,
              });
              setIsEditing(!isEditing);
            }}
          >
            <Ionicons name={isEditing ? 'close-outline' : 'create-outline'} size={15} color="#2563EB" />
            <Text style={styles.editText}>{isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa hồ sơ'}</Text>
          </Pressable>
        </View>

            {/* Loyalty Points Card */}
            <View style={styles.pointsCard}>
              <View style={styles.pointsTop}>
                <View>
                  <Text style={styles.pointsLabel}>Điểm thưởng tích lũy</Text>
                  <View style={styles.pointsNumberRow}>
                    <Ionicons name="star" size={22} color="#F59E0B" />
                    <Text style={styles.pointsValue}>{rewardPoints} <Text style={{ fontSize: 13, fontWeight: '500' }}>điểm</Text></Text>
                  </View>
                </View>
                <Pressable style={styles.redeemBtn} onPress={() => setShowRedeemModal(true)}>
                  <Ionicons name="gift-outline" size={15} color="#FFFFFF" />
                  <Text style={styles.redeemBtnText}>Đổi Voucher</Text>
                </Pressable>
              </View>

              <View style={styles.pointsBottom}>
                <Text style={styles.pointsHint}>💡 +100 điểm sau mỗi chuyến đi • +50 điểm khi đánh giá 5★</Text>
                <Pressable onPress={() => setShowHistoryModal(true)} hitSlop={6}>
                  <Text style={styles.historyLink}>Lịch sử</Text>
                </Pressable>
              </View>
            </View>

            {/* Segmented Tab Bar */}
            <View style={styles.tabBar}>
              <Pressable style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]} onPress={() => setActiveTab('profile')}>
                <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>Hồ sơ</Text>
              </Pressable>
              <Pressable style={[styles.tabItem, activeTab === 'vouchers' && styles.tabItemActive]} onPress={() => setActiveTab('vouchers')}>
                <Text style={[styles.tabText, activeTab === 'vouchers' && styles.tabTextActive]}>Voucher ({userVouchers.length})</Text>
              </Pressable>
              <Pressable style={[styles.tabItem, activeTab === 'bookings' && styles.tabItemActive]} onPress={() => setActiveTab('bookings')}>
                <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>Đặt phòng ({bookings.length})</Text>
              </Pressable>
              <Pressable style={[styles.tabItem, activeTab === 'wishlist' && styles.tabItemActive]} onPress={() => setActiveTab('wishlist')}>
                <Text style={[styles.tabText, activeTab === 'wishlist' && styles.tabTextActive]}>Yêu thích ({savedHomestays.length})</Text>
              </Pressable>
            </View>

            {/* TAB 1: Profile Info / Edit */}
            {activeTab === 'profile' && (
              <>
                {isEditing ? (
                  <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Chỉnh sửa thông tin</Text>
                    <View style={styles.avatarEditRow}>
                      <Text style={styles.fieldLabel}>Ảnh đại diện</Text>
                      <Pressable style={styles.changeAvatarBtn} onPress={() => setShowAvatarModal(true)}>
                        <Ionicons name="image-outline" size={15} color="#2563EB" />
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
                    <Info label="Họ và tên" value={userProfile.name} />
                    <Info label="Email" value={userProfile.email} />
                    <Info label="Số điện thoại" value={userProfile.phone} />
                    <Info label="Địa chỉ" value={userProfile.address} />
                    <Info label="Ngày sinh" value={userProfile.birthDate} />
                  </View>
                )}
              </>
            )}

            {/* TAB 2: Vouchers Wallet */}
            {activeTab === 'vouchers' && (
              <View style={styles.card}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Ví Voucher ({userVouchers.length})</Text>
                  <Pressable style={styles.redeemSmallBtn} onPress={() => setShowRedeemModal(true)}>
                    <Ionicons name="add" size={14} color="#2563EB" />
                    <Text style={styles.redeemSmallText}>Đổi thêm</Text>
                  </Pressable>
                </View>

                {userVouchers.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="ticket-outline" size={36} color="#94A3B8" />
                    <Text style={styles.emptyTitle}>Chưa có voucher nào</Text>
                    <Text style={styles.emptyText}>Tích lũy điểm khi đặt phòng để quy đổi voucher!</Text>
                  </View>
                ) : (
                  userVouchers.map((v) => (
                    <View key={v.id} style={styles.voucherWalletCard}>
                      <View style={styles.voucherWalletIcon}>
                        <Ionicons name={(v.icon as any) || 'ticket-outline'} size={22} color="#2563EB" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.voucherWalletTitle}>{v.title}</Text>
                        <Text style={styles.voucherWalletDesc}>{v.description}</Text>
                        <Text style={styles.voucherWalletMeta}>Mã: <Text style={styles.boldCode}>{v.code}</Text> • HSD: {v.expiresAt}</Text>
                      </View>
                      <Pressable
                        style={styles.useVoucherBtn}
                        onPress={() => router.push('/homestays')}
                      >
                        <Text style={styles.useVoucherText}>Dùng ngay</Text>
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* TAB 3: Bookings History */}
            {activeTab === 'bookings' && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Lịch sử đặt phòng ({bookings.length})</Text>
                {bookings.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="calendar-outline" size={36} color="#94A3B8" />
                    <Text style={styles.emptyTitle}>Chưa có đặt phòng nào</Text>
                    <Text style={styles.emptyText}>Hãy đặt homestay đầu tiên của bạn để nhận điểm thưởng.</Text>
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

            {/* TAB 4: Wishlist */}
            {activeTab === 'wishlist' && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Danh sách yêu thích ({savedHomestays.length})</Text>
                {savedHomestays.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="heart-outline" size={36} color="#94A3B8" />
                    <Text style={styles.emptyTitle}>Chưa có homestay yêu thích</Text>
                    <Text style={styles.emptyText}>Nhấn tim vào homestay để lưu lại.</Text>
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

        {/* Logout Button */}
        <Pressable
          style={styles.logout}
          onPress={() => setShowLogoutModal(true)}
          hitSlop={8}
        >
          <Ionicons name="log-out-outline" size={17} color="#DC2626" />
          <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
        </Pressable>
      </ScrollView>

      {/* MODAL 1: CHỌN ẢNH ĐẠI DIỆN */}
      <Modal visible={showAvatarModal} transparent animationType="fade" onRequestClose={() => setShowAvatarModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAvatarModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ảnh đại diện</Text>
              <Pressable onPress={() => setShowAvatarModal(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <Pressable style={styles.pickDeviceBtn} onPress={pickImageFromDevice}>
              <View style={styles.pickDeviceIcon}>
                <Ionicons name="images" size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pickDeviceTitle}>Chọn ảnh từ thư viện máy</Text>
                <Text style={styles.pickDeviceSubtitle}>Tải ảnh có sẵn trên thiết bị</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </Pressable>

            <Text style={styles.disneySectionTitle}>Avatar mẫu:</Text>
            <View style={styles.presetsGrid}>
              {DISNEY_AVATARS.map((item, idx) => (
                <Pressable
                  key={idx}
                  style={styles.disneyItem}
                  onPress={() => selectAvatar(item.url)}
                >
                  <View style={[styles.presetAvatarWrapper, form.avatar === item.url && styles.presetAvatarSelected]}>
                    <ProductImage uri={item.url} style={styles.presetAvatar} containerStyle={styles.presetAvatar} />
                    {form.avatar === item.url && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <Text numberOfLines={1} style={styles.disneyName}>{item.name}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 2: ĐỔI ĐIỂM LẤY VOUCHER */}
      <Modal visible={showRedeemModal} transparent animationType="slide" onRequestClose={() => setShowRedeemModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowRedeemModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Đổi điểm lấy Voucher</Text>
                <Text style={styles.modalSubtitle}>Điểm hiện có: <Text style={{ color: '#2563EB', fontWeight: '700' }}>{rewardPoints} điểm</Text></Text>
              </View>
              <Pressable onPress={() => setShowRedeemModal(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {redeemableVouchers.map((rv) => {
                const canAfford = rewardPoints >= (rv.requiredPoints || 0);
                return (
                  <View key={rv.id} style={styles.redeemItem}>
                    <View style={styles.redeemIconBox}>
                      <Ionicons name={(rv.icon as any) || 'trophy-outline'} size={22} color="#D97706" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.redeemTitle}>{rv.title}</Text>
                      <Text style={styles.redeemDesc}>{rv.description}</Text>
                      <Text style={styles.redeemCost}>🌟 Cần: {rv.requiredPoints} điểm</Text>
                    </View>
                    <Pressable
                      style={[styles.actionRedeemBtn, !canAfford && { backgroundColor: '#E2E8F0' }]}
                      onPress={() => handleRedeemVoucher(rv)}
                      disabled={!canAfford}
                    >
                      <Text style={[styles.actionRedeemText, !canAfford && { color: '#94A3B8' }]}>
                        {canAfford ? 'Đổi ngay' : 'Thiếu điểm'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 3: LỊCH SỬ ĐIỂM THƯỞNG */}
      <Modal visible={showHistoryModal} transparent animationType="slide" onRequestClose={() => setShowHistoryModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowHistoryModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lịch sử điểm thưởng</Text>
              <Pressable onPress={() => setShowHistoryModal(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              {pointHistory.map((tx) => (
                <View key={tx.id} style={styles.historyRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle}>{tx.title}</Text>
                    <Text style={styles.historyDate}>{tx.date}</Text>
                  </View>
                  <Text style={[styles.historyPoints, tx.type === 'earn' ? styles.pointsEarn : styles.pointsRedeem]}>
                    {tx.type === 'earn' ? `+${tx.points}` : `-${tx.points}`}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 4: XÁC NHẬN ĐĂNG XUẤT */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowLogoutModal(false)}>
          <Pressable style={styles.logoutModalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.logoutIconWrapper}>
              <Ionicons name="log-out-outline" size={32} color="#DC2626" />
            </View>
            <Text style={styles.logoutModalTitle}>Đăng xuất tài khoản</Text>
            <Text style={styles.logoutModalText}>
              Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng Homestay Booking không?
            </Text>

            <View style={styles.logoutActions}>
              <Pressable
                style={styles.cancelLogoutBtn}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelLogoutText}>Hủy</Text>
              </Pressable>

              <Pressable
                style={styles.confirmLogoutBtn}
                onPress={() => {
                  setShowLogoutModal(false);
                  logout();
                  router.replace('/login');
                }}
              >
                <Text style={styles.confirmLogoutText}>Đăng xuất</Text>
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
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  profileHeader: { alignItems: 'center', paddingVertical: 12 },
  avatarContainer: { position: 'relative', width: 80, height: 80 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 17, fontWeight: '700', marginTop: 8, color: '#0F172A' },
  email: { fontSize: 12, color: '#64748B', marginTop: 2 },
  editButton: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  editText: { color: '#2563EB', fontWeight: '600', fontSize: 11 },
  pointsCard: {
    backgroundColor: '#1E40AF',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  pointsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsLabel: { fontSize: 11, color: '#BFDBFE', fontWeight: '500' },
  pointsNumberRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  pointsValue: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  redeemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  redeemBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  pointsBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingTop: 8,
  },
  pointsHint: { fontSize: 10, color: '#DBEAFE', flex: 1 },
  historyLink: { fontSize: 11, color: '#FFFFFF', fontWeight: '700', textDecorationLine: 'underline' },
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
  tabText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#FFFFFF' },
  card: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  redeemSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  redeemSmallText: { fontSize: 11, fontWeight: '600', color: '#2563EB' },
  avatarEditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  changeAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeAvatarText: { fontSize: 11, fontWeight: '600', color: '#2563EB' },
  info: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  infoLabel: { fontSize: 11, color: '#64748B' },
  infoValue: { marginTop: 2, fontSize: 13, fontWeight: '600', color: '#1E293B' },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#475569', marginBottom: 4 },
  input: {
    height: 38,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#0F172A',
    fontSize: 12,
  },
  saveButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  saveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyTitle: { marginTop: 8, fontSize: 13, fontWeight: '600', color: '#334155' },
  emptyText: { marginTop: 2, fontSize: 11, color: '#64748B', textAlign: 'center' },
  voucherWalletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  voucherWalletIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherWalletTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  voucherWalletDesc: { fontSize: 11, color: '#475569', marginTop: 1 },
  voucherWalletMeta: { fontSize: 10, color: '#64748B', marginTop: 3 },
  boldCode: { fontWeight: '700', color: '#2563EB' },
  useVoucherBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  useVoucherText: { color: '#FFFFFF', fontWeight: '700', fontSize: 11 },
  bookingItem: { flexDirection: 'row', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  bookingImage: { width: 60, height: 60, borderRadius: 8 },
  bookingInfo: { flex: 1 },
  bookingName: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  bookingLocation: { fontSize: 11, color: '#64748B', marginTop: 1 },
  bookingDates: { fontSize: 10, color: '#64748B', marginTop: 2 },
  bookingPrice: { fontSize: 12, fontWeight: '700', color: '#2563EB', marginTop: 2 },
  bookingStatus: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusConfirmed: { backgroundColor: '#DCFCE7', color: '#15803D' },
  statusPending: { backgroundColor: '#FEF3C7', color: '#B45309' },
  statusCompleted: { backgroundColor: '#E0E7FF', color: '#3730A3' },
  wishlistItem: { flexDirection: 'row', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  wishlistImage: { width: 60, height: 60, borderRadius: 8 },
  wishlistInfo: { flex: 1 },
  wishlistName: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  wishlistLocation: { fontSize: 11, color: '#64748B', marginTop: 1 },
  wishlistPrice: { fontSize: 12, fontWeight: '700', color: '#2563EB', marginTop: 2 },
  menuCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuItem: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  menuText: { flex: 1, fontSize: 12, fontWeight: '500', color: '#334155' },
  logout: { marginTop: 14, alignSelf: 'center', flexDirection: 'row', gap: 6, alignItems: 'center', padding: 6 },
  logoutText: { color: '#DC2626', fontWeight: '700', fontSize: 12 },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  modalSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
  pickDeviceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 10,
  },
  pickDeviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickDeviceTitle: { fontSize: 12, fontWeight: '700', color: '#1E40AF' },
  pickDeviceSubtitle: { fontSize: 10, color: '#64748B', marginTop: 1 },
  disneySectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 12,
    marginBottom: 8,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  disneyItem: { width: '30%', alignItems: 'center' },
  presetAvatarWrapper: {
    position: 'relative',
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  presetAvatarSelected: { borderColor: '#2563EB', borderWidth: 2 },
  presetAvatar: { width: 54, height: 54, borderRadius: 27 },
  checkBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disneyName: { fontSize: 10, fontWeight: '600', color: '#475569', marginTop: 3, textAlign: 'center' },
  // Redeem Modal
  redeemItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 8,
  },
  redeemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  redeemDesc: { fontSize: 11, color: '#475569', marginTop: 1 },
  redeemCost: { fontSize: 11, fontWeight: '700', color: '#D97706', marginTop: 3 },
  actionRedeemBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionRedeemText: { color: '#FFFFFF', fontWeight: '700', fontSize: 11 },
  // History Modal
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  historyTitle: { fontSize: 12, fontWeight: '600', color: '#1E293B' },
  historyDate: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  historyPoints: { fontSize: 13, fontWeight: '700' },
  pointsEarn: { color: '#16A34A' },
  pointsRedeem: { color: '#DC2626' },
  // Logout Modal
  logoutModalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  logoutIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoutModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  logoutModalText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  logoutActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelLogoutBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLogoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  confirmLogoutBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLogoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
