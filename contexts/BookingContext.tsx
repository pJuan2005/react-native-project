import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import {
  Homestay,
  Voucher,
  PointTransaction,
  CustomerProfile,
  mockUser,
  mockVouchers,
  initialPointTransactions,
} from '@/constants/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL, fetchWithTimeout } from '@/src/config/api';

export type BookingItem = Homestay & {
  quantity: number;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  nights?: number;
  totalPrice?: number;
  homestayImage?: string;
  status?: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  voucherCode?: string;
  discountAmount?: number;
};

type BookingContextValue = {
  userProfile: CustomerProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<CustomerProfile>>;
  updateUserProfile: (profileData: Partial<CustomerProfile>) => Promise<boolean>;
  bookings: BookingItem[];
  savedHomestays: BookingItem[];
  userVouchers: Voucher[];
  rewardPoints: number;
  pointHistory: PointTransaction[];
  addToBooking: (
    homestay: Homestay,
    bookingDetails?: {
      checkIn: string;
      checkOut: string;
      guests: number;
      nights: number;
      totalPrice: number;
      voucherCode?: string;
      discountAmount?: number;
    }
  ) => void;
  toggleSavedHomestay: (homestay: Homestay) => boolean;
  removeFromBooking: (id: string) => void;
  removeSaved: (id: string) => void;
  clearBookings: () => void;
  getBookingsTotal: () => number;
  redeemPointsForVoucher: (voucher: Voucher) => boolean;
  addRewardPoints: (points: number, reason: string) => void;
  calculateDiscount: (voucher: Voucher | null, rawTotal: number) => number;
  completeStayAndReward: (bookingId: string) => void;
};

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const { user: authUser, updateUser: updateAuthUser } = useAuth();
  const [userProfile, setUserProfile] = useState<CustomerProfile>(authUser || mockUser);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [savedHomestays, setSavedHomestays] = useState<BookingItem[]>([]);
  const [userVouchers, setUserVouchers] = useState<Voucher[]>(mockVouchers);
  const [rewardPoints, setRewardPoints] = useState<number>(350);
  const [pointHistory, setPointHistory] = useState<PointTransaction[]>(initialPointTransactions);

  // Sync with authUser when user logs in or registers
  useEffect(() => {
    if (authUser) {
      setUserProfile(authUser);
      fetchUserData(authUser.id);
    }
  }, [authUser]);

  // Load user bookings and favorites from MySQL Backend API
  const fetchUserData = async (userId: string) => {
    try {
      // 1. Fetch user bookings
      const bRes = await fetchWithTimeout(`${API_BASE_URL}/api/bookings/my-bookings?userId=${userId}`, {}, 3000);
      const bJson = await bRes.json();
      if (bJson.success && Array.isArray(bJson.data)) {
        const mappedBookings = bJson.data.map((b: any) => ({
          id: String(b.homestay_id || b.id),
          name: b.homestay_name || 'Homestay',
          price: parseFloat(b.price_per_night || 0),
          location: b.location_name || '',
          type: b.type_name || '',
          rating: 4.9,
          reviewCount: 100,
          maxGuests: b.guests || 2,
          bedrooms: 2,
          bathrooms: 1,
          amenities: [],
          images: b.homestay_image ? [b.homestay_image] : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'],
          description: '',
          quantity: 1,
          checkIn: b.check_in ? b.check_in.split('T')[0] : '',
          checkOut: b.check_out ? b.check_out.split('T')[0] : '',
          guests: b.guests,
          nights: b.nights,
          totalPrice: parseFloat(b.total_price || 0),
          discountAmount: parseFloat(b.discount_amount || 0),
          voucherCode: b.voucher_code,
          status: b.status || 'confirmed',
          homestayImage: b.homestay_image,
        }));
        setBookings(mappedBookings);
      }

      // 2. Fetch user favorites
      const fRes = await fetchWithTimeout(`${API_BASE_URL}/api/favorites?userId=${userId}`, {}, 3000);
      const fJson = await fRes.json();
      if (fJson.success && Array.isArray(fJson.data)) {
        const mappedFavs = fJson.data.map((f: any) => ({
          ...f,
          quantity: 1,
        }));
        setSavedHomestays(mappedFavs);
      }
    } catch (err) {
      console.warn('API sync bookings/favorites failed, using local state:', err);
    }
  };

  const updateUserProfile = async (profileData: Partial<CustomerProfile>): Promise<boolean> => {
    // 1. Update global state immediately for instant UI responsiveness
    setUserProfile((prev) => ({
      ...prev,
      ...profileData,
    }));
    updateAuthUser(profileData);

    // 2. Sync with backend API
    const targetUserId = userProfile.id || '1';
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/api/users/${targetUserId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
        },
        4000
      );
      const json = await res.json();
      if (json.success && json.data) {
        setUserProfile((prev) => ({
          ...prev,
          ...json.data,
        }));
        updateAuthUser(json.data);
      }
      return true;
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err);
      return true;
    }
  };

  const calculateDiscount = (voucher: Voucher | null, rawTotal: number): number => {
    if (!voucher || rawTotal <= 0) return 0;
    if (voucher.minOrderPrice && rawTotal < voucher.minOrderPrice) return 0;

    let discount = 0;
    if (voucher.discountType === 'percentage') {
      discount = (rawTotal * voucher.discountValue) / 100;
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else {
      discount = voucher.discountValue;
    }

    return Math.min(discount, rawTotal);
  };

  const addToBooking = async (
    homestay: Homestay,
    bookingDetails?: {
      checkIn: string;
      checkOut: string;
      guests: number;
      nights: number;
      totalPrice: number;
      voucherCode?: string;
      discountAmount?: number;
    }
  ) => {
    const currentUserId = userProfile.id || '1';

    if (bookingDetails) {
      // 1. Update local state immediately for instant UI response
      setBookings((items) => {
        const existing = items.find(
          (item) =>
            item.id === homestay.id &&
            item.checkIn === bookingDetails.checkIn &&
            item.checkOut === bookingDetails.checkOut
        );
        if (existing) return items;
        return [...items, { ...homestay, quantity: 1, ...bookingDetails, status: 'confirmed' }];
      });
      addRewardPoints(100, `Đặt phòng thành công: ${homestay.name}`);

      // 2. Call Backend API to save into MySQL Database
      try {
        await fetchWithTimeout(
          `${API_BASE_URL}/api/bookings`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: parseInt(currentUserId, 10) || 1,
              homestayId: parseInt(homestay.id, 10) || 1,
              checkIn: bookingDetails.checkIn,
              checkOut: bookingDetails.checkOut,
              guests: bookingDetails.guests || 2,
              paymentMethod: 'cash',
              notes: bookingDetails.voucherCode ? `Áp dụng voucher: ${bookingDetails.voucherCode}` : '',
            }),
          },
          4000
        );
      } catch (err) {
        console.warn('API POST booking failed, saved to local state:', err);
      }
    } else {
      // This is saving to wishlist
      toggleSavedHomestay(homestay);
    }
  };

  const toggleSavedHomestay = (homestay: Homestay): boolean => {
    const currentUserId = userProfile.id || '1';
    let nowSaved = false;

    setSavedHomestays((items) => {
      const exists = items.some((item) => item.id === homestay.id);
      if (exists) {
        nowSaved = false;
        return items.filter((item) => item.id !== homestay.id);
      } else {
        nowSaved = true;
        return [...items, { ...homestay, quantity: 1 }];
      }
    });

    // Call Backend API to toggle favorite in MySQL Database
    fetchWithTimeout(
      `${API_BASE_URL}/api/favorites/toggle`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(currentUserId, 10) || 1,
          homestayId: parseInt(homestay.id, 10) || 1,
        }),
      },
      3000
    ).catch((err) => console.warn('API toggle favorite failed:', err));

    return nowSaved;
  };

  const removeFromBooking = async (id: string) => {
    setBookings((items) => items.filter((item) => item.id !== id && item.id + (item.checkIn || '') !== id));
  };

  const removeSaved = (id: string) => {
    const currentUserId = userProfile.id || '1';
    setSavedHomestays((items) => items.filter((item) => item.id !== id));
    fetchWithTimeout(`${API_BASE_URL}/api/favorites/${id}?userId=${currentUserId}`, { method: 'DELETE' }, 3000).catch(
      (err) => console.warn('API delete favorite failed:', err)
    );
  };

  const clearBookings = () => setBookings([]);

  const getBookingsTotal = () =>
    bookings.reduce((total, item) => total + (item.totalPrice || item.price * item.quantity), 0);

  const addRewardPoints = (points: number, reason: string) => {
    setRewardPoints((prev) => prev + points);
    const newTx: PointTransaction = {
      id: `PT_${Date.now()}`,
      title: reason,
      points,
      type: 'earn',
      date: new Date().toLocaleDateString('vi-VN'),
    };
    setPointHistory((prev) => [newTx, ...prev]);
  };

  const redeemPointsForVoucher = (voucher: Voucher): boolean => {
    const currentUserId = userProfile.id || '1';
    const cost = voucher.requiredPoints || 0;
    if (rewardPoints < cost) {
      return false;
    }

    setRewardPoints((prev) => prev - cost);
    setUserVouchers((prev) => [voucher, ...prev]);

    const newTx: PointTransaction = {
      id: `PT_${Date.now()}`,
      title: `Đổi điểm nhận ${voucher.title} (${voucher.code})`,
      points: cost,
      type: 'redeem',
      date: new Date().toLocaleDateString('vi-VN'),
    };
    setPointHistory((prev) => [newTx, ...prev]);

    // Call Backend API to record voucher redemption
    fetchWithTimeout(
      `${API_BASE_URL}/api/promotions/redeem`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(currentUserId, 10) || 1,
          promotionId: 4,
        }),
      },
      3000
    ).catch((err) => console.warn('API redeem voucher failed:', err));

    return true;
  };

  const completeStayAndReward = (bookingId: string) => {
    setBookings((items) =>
      items.map((b) => (b.id === bookingId ? { ...b, status: 'completed' } : b))
    );
    addRewardPoints(150, 'Hoàn thành chuyến đi & Đánh giá dịch vụ 5★');
  };

  const value = useMemo(
    () => ({
      userProfile,
      setUserProfile,
      updateUserProfile,
      bookings,
      savedHomestays,
      userVouchers,
      rewardPoints,
      pointHistory,
      addToBooking,
      toggleSavedHomestay,
      removeFromBooking,
      removeSaved,
      clearBookings,
      getBookingsTotal,
      redeemPointsForVoucher,
      addRewardPoints,
      calculateDiscount,
      completeStayAndReward,
    }),
    [userProfile, bookings, savedHomestays, userVouchers, rewardPoints, pointHistory]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
}
