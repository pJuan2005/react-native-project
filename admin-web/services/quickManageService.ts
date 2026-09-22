import { apiRequest, buildAssetUrl } from "@/lib/apiClient";
import type { BookingRecord } from "@/services/bookingService";
import type { PropertyDetail, PropertyUnavailableDateRange } from "@/services/propertyService";

export interface QuickManageSettings {
  usdToVndRate: number;
  onlineCommissionRate: number;
  directCommissionRate: number;
  directCommissionPercent: number;
}

export interface QuickManageData {
  property: PropertyDetail;
  unavailableRanges: PropertyUnavailableDateRange[];
  recentBookings: BookingRecord[];
  settings: QuickManageSettings;
}

function mapQuickProperty(property: any): PropertyDetail {
  return {
    id: Number(property.id),
    hostId: Number(property.hostId || 0),
    title: String(property.title || ""),
    description: String(property.description || ""),
    type: String(property.type || ""),
    price: Number(property.price || 0),
    location: String(property.location || ""),
    city: String(property.city || ""),
    country: String(property.country || ""),
    maxGuests: Number(property.maxGuests || 0),
    bedrooms: Number(property.bedrooms || 0),
    bathrooms: Number(property.bathrooms || 0),
    status: String(property.status || "pending"),
    image: buildAssetUrl(property.image || ""),
    featured: Boolean(property.featured),
    hostName: String(property.hostName || ""),
    reviews: Array.isArray(property.reviews) ? property.reviews.length : 0,
    rating: Number(property.rating || 0),
    address: String(property.address || ""),
    images: (property.images || []).map((image: string) => buildAssetUrl(image)),
    originalImages: (property.originalImages || []).map((image: string) =>
      buildAssetUrl(image),
    ),
    coverImageOriginal: buildAssetUrl(property.coverImageOriginal || ""),
    amenities: Array.isArray(property.amenities) ? property.amenities : [],
    reviewCount: Number(property.reviewCount || 0),
    manageToken: property.manageToken || "",
    manageTokenActive: Boolean(property.manageTokenActive),
    manageTokenExpiresAt: property.manageTokenExpiresAt || null,
  };
}

function mapQuickBooking(record: any): BookingRecord {
  return {
    id: Number(record.id),
    bookingCode: String(record.bookingCode || ""),
    propertyId: Number(record.propertyId || 0),
    propertyTitle: String(record.propertyTitle || ""),
    propertyLocation: String(record.propertyLocation || ""),
    propertyImage: buildAssetUrl(record.propertyImage || ""),
    guestId:
      record.guestId === null || record.guestId === undefined
        ? null
        : Number(record.guestId),
    guestName: String(record.guestName || ""),
    guestEmail: String(record.guestEmail || ""),
    guestPhone: String(record.guestPhone || ""),
    hostId: Number(record.hostId || 0),
    hostName: String(record.hostName || ""),
    checkIn: String(record.checkIn || ""),
    checkOut: String(record.checkOut || ""),
    nights: Number(record.nights || 0),
    guests: Number(record.guests || 0),
    totalPrice: Number(record.totalPrice || 0),
    status: (String(record.status || "pending").toLowerCase() as BookingRecord["status"]),
    source: String(record.source || "guest_online"),
    createdBy:
      record.createdBy === null || record.createdBy === undefined
        ? null
        : Number(record.createdBy),
    paymentMethod: String(record.paymentMethod || "bank_transfer"),
    paymentReference: String(record.paymentReference || ""),
    paymentStatus: String(record.paymentStatus || "unpaid").toLowerCase() as BookingRecord["paymentStatus"],
    paymentProofImage: buildAssetUrl(record.paymentProofImage || ""),
    paymentSubmittedAt: record.paymentSubmittedAt || null,
    confirmedBy:
      record.confirmedBy === null || record.confirmedBy === undefined
        ? null
        : Number(record.confirmedBy),
    confirmedByName: record.confirmedByName || null,
    confirmedAt: record.confirmedAt || null,
    rejectionReason: String(record.rejectionReason || ""),
    hostNote: String(record.hostNote || ""),
    checkinInstructions: String(record.checkinInstructions || ""),
    commissionRateApplied: Number(record.commissionRateApplied || 0),
    commissionAmount: Number(record.commissionAmount || 0),
    hostPayoutAmount: Number(record.hostPayoutAmount || 0),
    reviewId:
      record.reviewId === null || record.reviewId === undefined
        ? null
        : Number(record.reviewId),
    reviewRating:
      record.reviewRating === null || record.reviewRating === undefined
        ? null
        : Number(record.reviewRating),
    reviewCreatedAt: record.reviewCreatedAt || null,
    createdAt: String(record.createdAt || ""),
    paymentInfo: {
      method: String(record.paymentInfo?.method || "bank_transfer"),
      bankCode: String(record.paymentInfo?.bankCode || ""),
      bankName: String(record.paymentInfo?.bankName || ""),
      accountNumber: String(record.paymentInfo?.accountNumber || ""),
      accountName: String(record.paymentInfo?.accountName || ""),
      amount: Number(record.paymentInfo?.amount || 0),
      amountUsd: Number(record.paymentInfo?.amountUsd || 0),
      amountVnd: Number(record.paymentInfo?.amountVnd || 0),
      exchangeRate: Number(record.paymentInfo?.exchangeRate || 0),
      currency: String(record.paymentInfo?.currency || "VND"),
      transferContent: String(record.paymentInfo?.transferContent || ""),
      qrImageUrl: String(record.paymentInfo?.qrImageUrl || ""),
    },
  };
}

export async function getQuickManageData(token: string) {
  const response = await apiRequest<any>(`/api/quick-manage/${token}`);

  return {
    property: mapQuickProperty(response.property),
    unavailableRanges: (response.unavailableRanges || []).map((range: any) => ({
      checkIn: String(range.checkIn || ""),
      checkOut: String(range.checkOut || ""),
      status: String(range.status || ""),
    })),
    recentBookings: (response.recentBookings || []).map(mapQuickBooking),
    settings: {
      usdToVndRate: Number(response.settings?.usdToVndRate || 25000),
      onlineCommissionRate: Number(response.settings?.onlineCommissionRate || 0.1),
      directCommissionRate: Number(response.settings?.directCommissionRate || 0.05),
      directCommissionPercent: Number(response.settings?.directCommissionPercent || 5),
    },
  } satisfies QuickManageData;
}

export async function createDirectBookingByToken(
  token: string,
  payload: {
    guestName: string;
    guestPhone: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    paymentMethod: "cash" | "bank_transfer";
    reservationStatus: "pending" | "confirmed";
  },
) {
  const response = await apiRequest<{ message: string; data: any }>(
    `/api/quick-manage/${token}/direct-bookings`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return {
    message: response.message,
    data: response.data ? mapQuickBooking(response.data) : null,
  };
}
