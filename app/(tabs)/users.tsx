import { ProductImage } from '@/components/product-image';
import { useBooking } from '@/contexts/BookingContext';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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

const EMPTY_PROFILE: UserProfile = { id: '1', name: '', email: '', phone: '', address: '', birthDate: '', avatar: '' };

export default function ProfileScreen() {
  const { bookings, savedHomestays } = useBooking();
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'wishlist'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/1`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setProfile(json.data);
          setForm({ name: json.data.name, email: json.data.email, phone: json.data.phone, address: json.data.address });
        } else {
          setError(json.message);
        }
      })
      .catch(() => setError('Không thể kết nối server'))
      .finally(() => setLoading(false));
  }, []);

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
        Alert.alert('Thành công', json.message);
      } else {
        Alert.alert('Lỗi', json.message);
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
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
            <View style={styles.profileHeader}>
              <ProductImage uri={profile.avatar} style={styles.avatar} containerStyle={styles.avatar} />
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.email}>{profile.email}</Text>
              <Pressable style={styles.editButton} onPress={() => { setForm({ name: profile.name, email: profile.email, phone: profile.phone, address: profile.address }); setIsEditing(!isEditing); }}>
                <Ionicons name="create-outline" size={18} color="#2563EB" />
                <Text style={styles.editText}>{isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa hồ sơ'}</Text>
              </Pressable>
            </View>

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

            {activeTab === 'profile' && (
              <>
                {isEditing ? (
                  <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Chỉnh sửa thông tin</Text>
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
                <Pressable key={booking.id + (booking.checkIn || '')} style={styles.bookingItem} onPress={() => Alert.alert(booking.name, `${booking.location} • ${booking.checkIn} - ${booking.checkOut}`)}>
                  <ProductImage uri={booking.homestayImage || booking.images[0]} style={styles.bookingImage} containerStyle={styles.bookingImage} />
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingName}>{booking.name}</Text>
                    <Text style={styles.bookingLocation}>{booking.location} • {booking.type}</Text>
                    <Text style={styles.bookingDates}>📅 {booking.checkIn} - {booking.checkOut} ({booking.nights} đêm) • 👥 {booking.guests} khách</Text>
                    <Text style={styles.bookingPrice}>{booking.totalPrice ? `Tổng: ${new Intl.NumberFormat('vi-VN').format(booking.totalPrice)} ₫` : `${new Intl.NumberFormat('vi-VN').format(booking.price * booking.quantity)} ₫`}</Text>
                    <Text style={[styles.bookingStatus, booking.status === 'confirmed' && styles.statusConfirmed, booking.status === 'pending' && styles.statusPending, booking.status === 'completed' && styles.statusCompleted]}>{booking.status === 'confirmed' ? 'Đã xác nhận' : booking.status === 'pending' ? 'Chờ xác nhận' : 'Hoàn thành'}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}

        {activeTab === 'wishlist' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Danh sách yêu thích</Text>
            {savedHomestays.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={40} color="#94A3B8" />
                <Text style={styles.emptyTitle}>Chưa có homestay yêu thích</Text>
                <Text style={styles.emptyText}>Nhấn tim vào homestay để lưu lại.</Text>
              </View>
            ) : (
              savedHomestays.map((homestay) => (
                <Pressable key={homestay.id} style={styles.wishlistItem} onPress={() => Alert.alert(homestay.name, `${homestay.location} • ${new Intl.NumberFormat('vi-VN').format(homestay.price)} ₫/đêm`)} >
                  <ProductImage uri={homestay.images[0]} style={styles.wishlistImage} containerStyle={styles.wishlistImage} />
                  <View style={styles.wishlistInfo}>
                    <Text style={styles.wishlistName}>{homestay.name}</Text>
                    <Text style={styles.wishlistLocation}>{homestay.location} • {homestay.type}</Text>
                    <Text style={styles.wishlistPrice}>{new Intl.NumberFormat('vi-VN').format(homestay.price)} ₫/đêm</Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}

        <View style={styles.menuCard}>
          <MenuItem icon="settings-outline" label="Cài đặt" />
          <MenuItem icon="help-outline" label="Trợ giúp & Hỗ trợ" />
          <MenuItem icon="information-circle-outline" label="Về ứng dụng" />
        </View>
        <Pressable style={styles.logout} onPress={() => Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất không?', [{ text: 'Hủy', style: 'cancel' }, { text: 'Đăng xuất', style: 'destructive' }])}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, keyboardType }: { label: string; value: string; onChangeText: (value: string) => void; keyboardType?: 'default' | 'email-address' | 'phone-pad' }) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} style={styles.input} placeholderTextColor="#64748B" />
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function MenuItem({ icon, label }: { icon: any; label: string }) {
  return (
    <Pressable style={styles.menuItem} onPress={() => Alert.alert(label, 'Chức năng đang được phát triển.')}>
      <Ionicons name={icon} size={21} color="#2563EB" />
      <Text style={styles.menuText}>{label}</Text>
      <Ionicons name="chevron-forward" size={19} color="#94A3B8" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingBottom: 35 },
  title: { fontSize: 27, fontWeight: '700', color: '#0F172A' },
  profileHeader: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  name: { fontSize: 21, fontWeight: '700', marginTop: 12, color: '#0F172A' },
  email: { fontSize: 14, color: '#64748B', marginTop: 4 },
  editButton: { marginTop: 15, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: '#EFF6FF', flexDirection: 'row', gap: 6, alignItems: 'center' },
  editText: { color: '#2563EB', fontWeight: '700' },
  tabBar: { marginTop: 20, flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 4, elevation: 2 },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabItemActive: { backgroundColor: '#2563EB' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#FFF' },
  card: { marginTop: 16, backgroundColor: '#FFF', borderRadius: 17, padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A', marginBottom: 7 },
  info: { paddingVertical: 11, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  infoLabel: { fontSize: 12, color: '#64748B' },
  infoValue: { marginTop: 4, fontSize: 15, fontWeight: '600', color: '#1E293B' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginTop: 11, marginBottom: 6 },
  input: { height: 45, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, color: '#0F172A' },
  saveButton: { marginTop: 18, padding: 14, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center' },
  saveText: { color: '#FFF', fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#334155' },
  emptyText: { marginTop: 4, color: '#64748B', textAlign: 'center' },
  bookingItem: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  bookingImage: { width: 70, height: 70, borderRadius: 10 },
  bookingInfo: { flex: 1 },
  bookingName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  bookingLocation: { fontSize: 12, color: '#64748B', marginTop: 2 },
  bookingDates: { fontSize: 11, color: '#64748B', marginTop: 2 },
  bookingPrice: { fontSize: 14, fontWeight: '700', color: '#2563EB', marginTop: 4 },
  bookingStatus: { marginTop: 4, fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, alignSelf: 'flex-start' },
  statusConfirmed: { backgroundColor: '#DCFCE7', color: '#15803D' },
  statusPending: { backgroundColor: '#FEF3C7', color: '#B45309' },
  statusCompleted: { backgroundColor: '#E0E7FF', color: '#3730A3' },
  wishlistItem: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  wishlistImage: { width: 70, height: 70, borderRadius: 10 },
  wishlistInfo: { flex: 1 },
  wishlistName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  wishlistLocation: { fontSize: 12, color: '#64748B', marginTop: 2 },
  wishlistPrice: { fontSize: 14, fontWeight: '700', color: '#2563EB', marginTop: 4 },
  menuCard: { marginTop: 18, backgroundColor: '#FFF', borderRadius: 17, paddingHorizontal: 15 },
  menuItem: { height: 55, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#334155' },
  logout: { marginTop: 20, alignSelf: 'center', flexDirection: 'row', gap: 7, alignItems: 'center' },
  logoutText: { color: '#DC2626', fontWeight: '700' },
});