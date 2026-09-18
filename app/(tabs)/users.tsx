import { ProductImage } from '@/components/product-image';
import {
  mockUser,
  redeemableVouchers,
  Voucher,
} from '@/constants/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme, ThemeMode } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '@/utils/responsive';

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
  const { themeMode, isDark, setThemeMode, colors } = useAppTheme();
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topHeaderRow}>
          <Text style={[styles.title, { color: colors.text }]}>Trang cá nhân</Text>
          <Pressable
            style={styles.settingsIconBtn}
            onPress={() => setShowSettingsModal(true)}
            hitSlop={8}
          >
            <Ionicons name="settings-outline" size={20} color="#0284C7" />
          </Pressable>
        </View>

        {/* Profile Avatar Header - Ocean Theme */}
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

          <Text style={[styles.name, { color: colors.text }]}>{userProfile.name}</Text>
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
            <Ionicons name={isEditing ? 'close-outline' : 'create-outline'} size={15} color="#0284C7" />
            <Text style={styles.editText}>{isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa hồ sơ'}</Text>
          </Pressable>
        </View>

        {/* Loyalty Points Card - Deep Ocean Blue */}
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

        {/* Segmented Tab Bar - Ocean Blue */}
        <View style={[styles.tabBar, isDark && { backgroundColor: '#1E293B' }]}>
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
              <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Chỉnh sửa thông tin</Text>
                <View style={styles.avatarEditRow}>
                  <Text style={styles.fieldLabel}>Ảnh đại diện</Text>
                  <Pressable style={styles.changeAvatarBtn} onPress={() => setShowAvatarModal(true)}>
                    <Ionicons name="image-outline" size={15} color="#0284C7" />
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
              <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin cá nhân</Text>
                <Info label="Họ và tên" value={userProfile.name} isDark={isDark} />
                <Info label="Email" value={userProfile.email} isDark={isDark} />
                <Info label="Số điện thoại" value={userProfile.phone} isDark={isDark} />
                <Info label="Địa chỉ" value={userProfile.address} isDark={isDark} />
                <Info label="Ngày sinh" value={userProfile.birthDate} isDark={isDark} />
              </View>
            )}
          </>
        )}

        {/* TAB 2: Vouchers Wallet */}
        {activeTab === 'vouchers' && (
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Ví Voucher ({userVouchers.length})</Text>
              <Pressable style={styles.redeemSmallBtn} onPress={() => setShowRedeemModal(true)}>
                <Ionicons name="add" size={14} color="#0284C7" />
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
                <View key={v.id} style={[styles.voucherWalletCard, isDark && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  <View style={styles.voucherWalletIcon}>
                    <Ionicons name={(v.icon as any) || 'ticket-outline'} size={22} color="#0284C7" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.voucherWalletTitle, isDark && { color: '#F8FAFC' }]}>{v.title}</Text>
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
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Lịch sử đặt phòng ({bookings.length})</Text>
            {bookings.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cart-outline" size={36} color="#94A3B8" />
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
                    <Text style={[styles.bookingName, isDark && { color: '#F8FAFC' }]}>{booking.name}</Text>
                    <Text style={styles.bookingLocation}>📍 by {booking.location} • {booking.type}</Text>
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
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Danh sách yêu thích ({savedHomestays.length})</Text>
            {savedHomestays.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={36} color="#94A3B8" />
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
                    <Text style={[styles.wishlistName, isDark && { color: '#F8FAFC' }]}>{homestay.name}</Text>
                    <Text style={styles.wishlistLocation}>📍 by {homestay.location} • {homestay.type}</Text>
                    <Text style={styles.wishlistPrice}>{new Intl.NumberFormat('vi-VN').format(homestay.price)} ₫/đêm</Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}

        {/* Menu Options */}
        <View style={[styles.menuCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <MenuItem
            icon="settings-outline"
            label="Cài đặt giao diện & Hệ thống"
            onPress={() => setShowSettingsModal(true)}
            isDark={isDark}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Trợ giúp & Hỗ trợ"
            onPress={() => Alert.alert('Trợ giúp', 'Liên hệ tổng đài CSKH: 1900 8888 (24/7)')}
            isDark={isDark}
          />
          <MenuItem
            icon="information-circle-outline"
            label="Về ứng dụng Homestay Booking"
            onPress={() => Alert.alert('Homestay Booking', 'Phiên bản v2.0.0 - Nền tảng du lịch & nghỉ dưỡng xanh')}
            isDark={isDark}
          />
        </View>

        {/* PROMINENT LOGOUT BUTTON CARD (Khung viền đỏ rõ nét, không bị chìm nền) */}
        <Pressable
          style={[styles.logoutCardBtn, isDark && { backgroundColor: '#1E293B', borderColor: '#7F1D1D' }]}
          onPress={() => setShowLogoutModal(true)}
          hitSlop={8}
        >
          <View style={styles.logoutIconBox}>
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          </View>
          <Text style={styles.logoutCardText}>Đăng xuất tài khoản</Text>
          <Ionicons name="chevron-forward" size={16} color="#DC2626" />
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
                <Ionicons name="images" size={18} color="#0284C7" />
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
                <Text style={styles.modalSubtitle}>Điểm hiện có: <Text style={{ color: '#0284C7', fontWeight: '700' }}>{rewardPoints} điểm</Text></Text>
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

      {/* MODAL 4: CÀI ĐẶT GIAO DIỆN SÁNG / TỐI (DARK MODE SETTINGS) */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSettingsModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Cài đặt hệ thống</Text>
                <Text style={styles.modalSubtitle}>Tùy chỉnh giao diện hiển thị ứng dụng</Text>
              </View>
              <Pressable onPress={() => setShowSettingsModal(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <Text style={styles.themeSectionTitle}>Chế độ giao diện:</Text>
            <View style={styles.themeOptionsList}>
              <ThemeOptionItem
                icon="sunny"
                title="Giao diện sáng (Light)"
                description="Tone màu Xanh Nước Biển & Trắng tươi sáng"
                isSelected={themeMode === 'light'}
                onSelect={() => setThemeMode('light')}
              />
              <ThemeOptionItem
                icon="moon"
                title="Giao diện tối (Dark)"
                description="Tone màu Đen Xanh bảo vệ mắt vào ban đêm"
                isSelected={themeMode === 'dark'}
                onSelect={() => setThemeMode('dark')}
              />
              <ThemeOptionItem
                icon="phone-portrait-outline"
                title="Tự động theo thiết bị (System)"
                description="Tự động chuyển sáng/tối theo cài đặt của máy"
                isSelected={themeMode === 'system'}
                onSelect={() => setThemeMode('system')}
              />
            </View>

            <Pressable
              style={styles.closeSettingsBtn}
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={styles.closeSettingsText}>Đóng cài đặt</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 5: XÁC NHẬN ĐĂNG XUẤT */}
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

function ThemeOptionItem({
  icon,
  title,
  description,
  isSelected,
  onSelect,
}: {
  icon: any;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.themeOptionCard,
        isSelected && styles.themeOptionCardSelected,
      ]}
      onPress={onSelect}
    >
      <View style={[styles.themeOptionIconBox, isSelected && { backgroundColor: '#0284C7' }]}>
        <Ionicons name={icon} size={18} color={isSelected ? '#FFFFFF' : '#0284C7'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.themeOptionTitle, isSelected && { color: '#0369A1', fontWeight: '800' }]}>
          {title}
        </Text>
        <Text style={styles.themeOptionDesc}>{description}</Text>
      </View>
      <View style={[styles.themeRadio, isSelected && styles.themeRadioActive]}>
        {isSelected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
      </View>
    </Pressable>
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

function Info({ label, value, isDark }: { label: string; value: string; isDark?: boolean }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, isDark && { color: '#F8FAFC' }]}>{value || 'Chưa cập nhật'}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  isDark,
}: {
  icon: any;
  label: string;
  onPress?: () => void;
  isDark?: boolean;
}) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={18} color="#0284C7" />
      <Text style={[styles.menuText, isDark && { color: '#E2E8F0' }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F0F9FF' },
  content: { padding: 16, paddingBottom: 32 },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  settingsIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    backgroundColor: '#0284C7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 17, fontWeight: '800', marginTop: 8, color: '#0F172A' },
  email: { fontSize: 12, color: '#64748B', marginTop: 2 },
  editButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  editText: { color: '#0369A1', fontWeight: '700', fontSize: 11 },
  pointsCard: {
    backgroundColor: '#0369A1',
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  pointsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsLabel: { fontSize: 11, color: '#BAE6FD', fontWeight: '500' },
  pointsNumberRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  pointsValue: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  redeemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  redeemBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  pointsBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingTop: 8,
  },
  pointsHint: { fontSize: 10, color: '#BAE6FD', flex: 1 },
  historyLink: { fontSize: 11, color: '#FFFFFF', fontWeight: '700', textDecorationLine: 'underline' },
  tabBar: {
    marginTop: 12,
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    borderRadius: 25,
    padding: 3,
  },
  tabItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 22 },
  tabItemActive: { backgroundColor: '#0284C7' },
  tabText: { fontSize: 11, fontWeight: '700', color: '#0369A1' },
  tabTextActive: { color: '#FFFFFF' },
  card: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  redeemSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  redeemSmallText: { fontSize: 11, fontWeight: '700', color: '#0369A1' },
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
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  changeAvatarText: { fontSize: 11, fontWeight: '700', color: '#0369A1' },
  info: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  infoLabel: { fontSize: 11, color: '#64748B' },
  infoValue: { marginTop: 2, fontSize: 13, fontWeight: '600', color: '#1E293B' },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#475569', marginBottom: 4 },
  input: {
    height: 42,
    borderWidth: 1.5,
    borderColor: '#0284C7',
    borderRadius: 20,
    paddingHorizontal: 12,
    color: '#0F172A',
    fontSize: 13,
  },
  saveButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#0284C7',
    alignItems: 'center',
  },
  saveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
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
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherWalletTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  voucherWalletDesc: { fontSize: 11, color: '#475569', marginTop: 1 },
  voucherWalletMeta: { fontSize: 10, color: '#64748B', marginTop: 3 },
  boldCode: { fontWeight: '700', color: '#0284C7' },
  useVoucherBtn: {
    backgroundColor: '#0284C7',
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
  bookingPrice: { fontSize: 12, fontWeight: '700', color: '#0284C7', marginTop: 2 },
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
  wishlistPrice: { fontSize: 12, fontWeight: '700', color: '#0284C7', marginTop: 2 },
  menuCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
  },
  menuItem: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  menuText: { flex: 1, fontSize: 12, fontWeight: '600', color: '#334155' },
  // Distinct Logout Button Card
  logoutCardBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutCardText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  modalSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
  pickDeviceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    padding: 10,
  },
  pickDeviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickDeviceTitle: { fontSize: 12, fontWeight: '700', color: '#0369A1' },
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
  presetAvatarSelected: { borderColor: '#0284C7', borderWidth: 2 },
  presetAvatar: { width: 54, height: 54, borderRadius: 27 },
  checkBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0284C7',
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
    backgroundColor: '#0284C7',
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
  // Settings Modal Styles
  themeSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    marginTop: 6,
    marginBottom: 10,
  },
  themeOptionsList: {
    gap: 8,
  },
  themeOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  themeOptionCardSelected: {
    borderColor: '#0284C7',
    backgroundColor: '#E0F2FE',
  },
  themeOptionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  themeOptionDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  themeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeRadioActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  closeSettingsBtn: {
    marginTop: 16,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeSettingsText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
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
