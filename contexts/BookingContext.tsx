import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { Homestay } from '@/constants/mockData';

export type BookingItem = Homestay & {
  quantity: number;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  nights?: number;
  totalPrice?: number;
  homestayImage?: string;
  status?: 'confirmed' | 'pending' | 'cancelled' | 'completed';
};

type BookingContextValue = {
  bookings: BookingItem[];
  savedHomestays: BookingItem[];
  addToBooking: (homestay: Homestay, bookingDetails?: { checkIn: string; checkOut: string; guests: number; nights: number; totalPrice: number }) => void;
  removeFromBooking: (id: string) => void;
  removeSaved: (id: string) => void;
  clearBookings: () => void;
  getBookingsTotal: () => number;
};

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [savedHomestays, setSavedHomestays] = useState<BookingItem[]>([]);

  const addToBooking = (homestay: Homestay, bookingDetails?: { checkIn: string; checkOut: string; guests: number; nights: number; totalPrice: number }) => {
    if (bookingDetails) {
      // This is a confirmed booking
      setBookings((items) => {
        const existing = items.find((item) => item.id === homestay.id && item.checkIn === bookingDetails.checkIn && item.checkOut === bookingDetails.checkOut);
        if (existing) return items;
        return [...items, { ...homestay, quantity: 1, ...bookingDetails }];
      });
    } else {
      // This is just saving to wishlist
      setSavedHomestays((items) => {
        if (items.find((item) => item.id === homestay.id)) return items;
        return [...items, { ...homestay, quantity: 1 }];
      });
    }
  };

  const removeFromBooking = (id: string) => setBookings((items) => items.filter((item) => item.id !== id));
  const removeSaved = (id: string) => setSavedHomestays((items) => items.filter((item) => item.id !== id));
  const clearBookings = () => setBookings([]);
  const getBookingsTotal = () => bookings.reduce((total, item) => total + (item.totalPrice || item.price * item.quantity), 0);

  const value = useMemo(() => ({ bookings, savedHomestays, addToBooking, removeFromBooking, removeSaved, clearBookings, getBookingsTotal }), [bookings, savedHomestays]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
}