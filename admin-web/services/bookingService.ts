import { apiRequest, buildAssetUrl } from "@/lib/apiClient";

export interface BookingPaymentInfo {
  method: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  amountUsd: number;
  amountVnd: number;
  exchangeRate: number;
  currency: string;
  transferContent: string;
  qrImageUrl: string;
}

export interface BookingRecord {
  id: number;
  bookingCode: string;
  propertyId: number;
  propertyTitle: string;
  propertyLocation: string;
  propertyImage: string;
  guestId: number | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  hostId: number;
  hostName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  source: string;
  createdBy: number | null;
  paymentMethod: string;
  paymentReference: string;
  paymentStatus: "unpaid" | "proof_uploaded" | "verified" | "rejected";
  paymentProofImage: string;
  paymentSubmittedAt: string | null;
  confirmedBy: number | null;
  confirmedByName: string | null;
  confirmedAt: string | null;
  rejectionReason: string;
  hostNote: string;
  checkinInstructions: string;
  commissionRateApplied: number;
  commissionAmount: number;
  hostPayoutAmount: number;
  reviewId: number | null;
  reviewRating: number | null;
  reviewCreatedAt: string | null;
  createdAt: string;
  paymentInfo: BookingPaymentInfo;
}

function mapBooking(record: any): BookingRecord {
  return {
    id: Number(record.id),
    bookingCode: String(record.bookingCode || ""),
    propertyId: Number(record.propertyId),
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
    hostId: Number(record.hostId),
    hostName: String(record.hostName || ""),
    checkIn: String(record.checkIn || ""),
    checkOut: String(record.checkOut || ""),
    nights: Number(record.nights || 0),
    guests: Number(record.guests || 0),
    totalPrice: Number(record.totalPrice || 0),
    status: String(record.status || "pending").toLowerCase() as BookingRecord["status"],
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
      amountUsd: Number(record.paymentInfo?.amountUsd || record.paymentInfo?.amount || 0),
      amountVnd: Number(record.paymentInfo?.amountVnd || 0),
      exchangeRate: Number(record.paymentInfo?.exchangeRate || 0),
      currency: String(record.paymentInfo?.currency || "VND"),
      transferContent: String(record.paymentInfo?.transferContent || ""),
      qrImageUrl: String(record.paymentInfo?.qrImageUrl || ""),
    },
  };
}

export async function createBooking(payload: {
  propertyId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  const response = await apiRequest<{ message: string; data: any }>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    ...response,
    data: mapBooking(response.data),
  };
}

export async function getMyBookings() {
  const response = await apiRequest<any[]>("/api/bookings");
  return response.map(mapBooking);
}

export async function getMyBookingById(id: number | string) {
  const response = await apiRequest<any>(`/api/bookings/${id}`);
  return mapBooking(response);
}

export async function uploadPaymentProof(id: number, file: File) {
  const formData = new FormData();
  formData.append("paymentProof", file);

  const response = await apiRequest<{ message: string; data: any }>(
    `/api/bookings/${id}/payment-proof`,
    {
      method: "PUT",
      body: formData,
    },
  );

  return {
    ...response,
    data: mapBooking(response.data),
  };
}

export async function cancelBooking(id: number) {
  const response = await apiRequest<{ message: string; data: any }>(
    `/api/bookings/${id}/cancel`,
    {
      method: "PUT",
    },
  );

  return {
    ...response,
    data: mapBooking(response.data),
  };
}

export async function getHostBookings() {
  const response = await apiRequest<any[]>("/api/host/bookings");
  return response.map(mapBooking);
}

export async function getHostBookingById(id: number | string) {
  const response = await apiRequest<any>(`/api/host/bookings/${id}`);
  return mapBooking(response);
}

export async function reviewHostBooking(
  id: number,
  payload: {
    decision: "approve" | "reject";
    hostNote?: string;
    checkinInstructions?: string;
    rejectionReason?: string;
  },
) {
  const response = await apiRequest<{ message: string; data: any }>(
    `/api/host/bookings/${id}/review`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

  return {
    ...response,
    data: mapBooking(response.data),
  };
}

export async function getAdminBookings() {
  const response = await apiRequest<any[]>("/api/admin/bookings");
  return response.map(mapBooking);
}

export async function getAdminBookingById(id: number | string) {
  const response = await apiRequest<any>(`/api/admin/bookings/${id}`);
  return mapBooking(response);
}

export async function reviewAdminBooking(
  id: number,
  payload: {
    decision: "approve" | "reject";
    hostNote?: string;
    checkinInstructions?: string;
    rejectionReason?: string;
  },
) {
  const response = await apiRequest<{ message: string; data: any }>(
    `/api/admin/bookings/${id}/review`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

  return {
    ...response,
    data: mapBooking(response.data),
  };
}
