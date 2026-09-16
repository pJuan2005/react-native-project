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
    }
  }, [authUser]);

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
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/users/${targetUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      }, 4000);
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

  const addToBooking = (
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
    if (bookingDetails) {
      // This is a confirmed booking
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
      // Tích điểm sau khi đặt phòng thành công (+100 điểm)
      addRewardPoints(100, `Đặt phòng thành công: ${homestay.name}`);
    } else {
      // This is saving to wishlist
      setSavedHomestays((items) => {
        if (items.find((item) => item.id === homestay.id)) return items;
        return [...items, { ...homestay, quantity: 1 }];
      });
    }
  };

  const toggleSavedHomestay = (homestay: Homestay): boolean => {
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
    return nowSaved;
  };

  const removeFromBooking = (id: string) =>
    setBookings((items) => items.filter((item) => item.id !== id && item.id + (item.checkIn || '') !== id));

  const removeSaved = (id: string) =>
    setSavedHomestays((items) => items.filter((item) => item.id !== id));

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
