"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  FileText,
  Home,
  MapPin,
  Star,
  User,
  XCircle,
  UploadCloud,
  CheckCircle2,
  Clock,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import {
  getMyBookings,
  cancelBooking,
  uploadPaymentProof,
  type BookingRecord,
} from "@/services/bookingService";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge";
import { PaymentInstructionsCard } from "@/components/shared/PaymentInstructionsCard";
import { AccountSettingsPanel } from "@/components/shared/AccountSettingsPanel";

export default function GuestDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitializing } = useAuth();
  const [activeTab, setActiveTab] = useState<"bookings" | "profile">("bookings");
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [selectedProofFile, setSelectedProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isInitializing, isAuthenticated, router]);

  async function loadBookings() {
    setIsLoading(true);
    setError("");
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách đặt phòng của bạn.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated]);

  async function handleCancel(bookingId: number) {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn đặt phòng này?")) return;
    try {
      await cancelBooking(bookingId);
      setSuccessMsg("Đã hủy đơn đặt phòng thành công.");
      loadBookings();
    } catch (err: any) {
      setError(err?.message || "Lỗi khi hủy đơn đặt phòng.");
    }
  }

  async function handleUploadProof(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBooking || !selectedProofFile) return;

    setIsUploading(true);
    setError("");
    try {
      await uploadPaymentProof(selectedBooking.id, selectedProofFile);
      setSuccessMsg("Đã gửi minh chứng chuyển khoản thành công! Ban quản trị sẽ sớm duyệt đơn phòng cho bạn.");
      setSelectedBooking(null);
      setSelectedProofFile(null);
      loadBookings();
    } catch (err: any) {
      setError(err?.message || "Lỗi khi tải lên minh chứng thanh toán.");
    } finally {
      setIsUploading(false);
    }
  }

  if (isInitializing || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-medium">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                Xin chào, {user.name} 👋
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {user.email} • {user.phone || "Chưa cập nhật SĐT"}
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl self-start md:self-auto">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "bookings"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarDays size={14} />
              <span>Chuyến đi của tôi ({bookings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "profile"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User size={14} />
              <span>Cài đặt tài khoản</span>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-4 rounded-xl mb-6">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-4 rounded-xl mb-6">
            {successMsg}
          </div>
        )}

        {/* TAB 1: BOOKINGS LIST */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-sm">
                Đang tải danh sách đặt phòng...
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Home size={26} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Bạn chưa có đơn đặt phòng nào</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Khám phá hàng trăm homestay, villa tuyệt đẹp với giá tốt nhất và đặt chỗ cho kỳ nghỉ sắp tới ngay hôm nay!
                </p>
                <Link
                  href="/listings"
                  className="mt-5 inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
                >
                  Khám phá Homestay ngay
                </Link>
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                      <Image
                        src={booking.propertyImage || "/img/banner-home.jpg"}
                        alt={booking.propertyTitle}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">
                          {booking.bookingCode}
                        </span>
                        <StatusBadge status={booking.status} />
                        <PaymentStatusBadge status={booking.paymentStatus} />
                      </div>

                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {booking.propertyTitle}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{booking.propertyLocation}</span>
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                        <span>📅 {booking.checkIn} ➔ {booking.checkOut} ({booking.nights} đêm)</span>
                        <span>👥 {booking.guests} khách</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-slate-400 block">Tổng thanh toán</span>
                      <span className="text-lg font-extrabold text-blue-600">
                        {new Intl.NumberFormat("vi-VN").format(booking.totalPrice)} ₫
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {booking.paymentStatus === "unpaid" && booking.status !== "cancelled" && (
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                        >
                          <CreditCard size={12} />
                          <span>Thanh toán & Gửi bill</span>
                        </button>
                      )}

                      {booking.status === "completed" && (
                        <Link
                          href={`/reviews/create/${booking.id}`}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs border border-amber-200 transition flex items-center gap-1"
                        >
                          <Star size={12} className="fill-amber-500 text-amber-500" />
                          <span>Đánh giá chuyến đi</span>
                        </Link>
                      )}

                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition flex items-center gap-1"
                        >
                          <XCircle size={12} />
                          <span>Hủy đơn</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: PROFILE & ACCOUNT SETTINGS */}
        {activeTab === "profile" && (
          <div className="max-w-3xl">
            <AccountSettingsPanel user={user} />
          </div>
        )}

        {/* MODAL: PAYMENT INSTRUCTIONS & PROOF UPLOAD */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Thanh toán chuyển khoản VietQR</h3>
                  <p className="text-xs text-blue-600 font-mono font-bold">Mã đơn: {selectedBooking.bookingCode}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedBooking(null);
                    setSelectedProofFile(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* VietQR Instructions Card */}
                <PaymentInstructionsCard
                  booking={selectedBooking}
                />

                {/* Upload Form */}
                <form onSubmit={handleUploadProof} className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="block text-xs font-bold text-slate-800">
                    📸 Tải lên ảnh chụp biên lai chuyển khoản thành công:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setSelectedProofFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBooking(null);
                        setSelectedProofFile(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading || !selectedProofFile}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <UploadCloud size={14} />
                      <span>{isUploading ? "Đang gửi..." : "Xác nhận gửi biên lai"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
