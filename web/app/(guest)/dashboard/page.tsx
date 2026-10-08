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
  Wallet,
  Landmark,
  Ticket,
  Heart,
  ShieldCheck,
  Phone,
  Mail,
  Cake,
  ArrowUpRight,
  PlusCircle,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import {
  getMyBookings,
  cancelBooking,
  uploadPaymentProof,
  type BookingRecord,
} from "@/services/bookingService";
import {
  getGuestWallet,
  getGuestWalletTransactions,
  getGuestBankAccounts,
  addGuestBankAccount,
  requestGuestWithdrawal,
  getGuestVouchers,
  getGuestFavorites,
  type WalletInfo,
  type WalletTransactionItem,
  type BankAccountItem,
  type VoucherItem,
  type FavoriteItem,
} from "@/services/guestService";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge";
import { PaymentInstructionsCard } from "@/components/shared/PaymentInstructionsCard";
import { AccountSettingsPanel } from "@/components/shared/AccountSettingsPanel";

function formatCurrency(amount: number | undefined | null) {
  return `${Number(amount || 0).toLocaleString("vi-VN")} ₫`;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function GuestDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitializing } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "bookings" | "wallet" | "vouchers" | "favorites" | "profile"
  >("bookings");

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionItem[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>([]);
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [selectedProofFile, setSelectedProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Modals for Wallet & Banking
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawBankId, setWithdrawBankId] = useState<number | "">("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [newBankForm, setNewBankForm] = useState({
    bankName: "Techcombank",
    bankCode: "TCB",
    accountNumber: "",
    accountHolderName: "",
  });
  const [isAddingBank, setIsAddingBank] = useState(false);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isInitializing, isAuthenticated, router]);

  async function loadData() {
    if (!user) return;
    setIsLoading(true);
    setError("");

    try {
      const [bookingsData, walletData, txData, banksData, vouchersData, favesData] =
        await Promise.all([
          getMyBookings().catch(() => []),
          getGuestWallet(user.id),
          getGuestWalletTransactions(user.id),
          getGuestBankAccounts(user.id),
          getGuestVouchers(user.id),
          getGuestFavorites(user.id),
        ]);

      setBookings(bookingsData);
      setWallet(walletData);
      setTransactions(txData);
      setBankAccounts(banksData);
      setVouchers(vouchersData);
      setFavorites(favesData);
      if (banksData.length > 0) {
        setWithdrawBankId(banksData[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Không thể tải đầy đủ thông tin tài khoản.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user?.id]);

  async function handleCancel(bookingId: number) {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn đặt phòng này?")) return;
    try {
      await cancelBooking(bookingId);
      setSuccessMsg("Đã hủy đơn đặt phòng thành công.");
      loadData();
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
      loadData();
    } catch (err: any) {
      setError(err?.message || "Lỗi khi tải lên minh chứng thanh toán.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleWithdrawSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const amountNum = parseInt(withdrawAmount, 10);
    if (isNaN(amountNum) || amountNum < 50000) {
      alert("Số tiền rút tối thiểu là 50.000 ₫");
      return;
    }
    if (!withdrawBankId) {
      alert("Vui lòng chọn tài khoản ngân hàng nhận tiền");
      return;
    }

    setIsWithdrawing(true);
    try {
      await requestGuestWithdrawal({
        userId: user.id,
        amount: amountNum,
        bankAccountId: Number(withdrawBankId),
      });
      setSuccessMsg(`Yêu cầu rút ${formatCurrency(amountNum)} đã được gửi thành công!`);
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      loadData();
    } catch (err: any) {
      alert(err?.message || "Lỗi khi thực hiện rút tiền");
    } finally {
      setIsWithdrawing(false);
    }
  }

  async function handleAddBankSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!newBankForm.accountNumber || !newBankForm.accountHolderName) {
      alert("Vui lòng điền đầy đủ số tài khoản và tên chủ tài khoản");
      return;
    }

    setIsAddingBank(true);
    try {
      await addGuestBankAccount({
        userId: user.id,
        ...newBankForm,
      });
      setSuccessMsg("Liên kết tài khoản ngân hàng thành công!");
      setShowAddBankModal(false);
      setNewBankForm({
        bankName: "Techcombank",
        bankCode: "TCB",
        accountNumber: "",
        accountHolderName: "",
      });
      loadData();
    } catch (err: any) {
      alert(err?.message || "Lỗi khi liên kết ngân hàng");
    } finally {
      setIsAddingBank(false);
    }
  }

  if (isInitializing || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-medium">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  const avatarSrc =
    user.avatar ||
    user.avatarUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* HEADER PROFILE PREMIUM BANNER */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 mb-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/40 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            {/* User Identity */}
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-blue-500/20 shadow-lg shadow-blue-500/10 shrink-0">
                <Image
                  src={avatarSrc}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {user.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <ShieldCheck size={13} className="text-blue-600" />
                    Thành viên Sàn
                  </span>
                </div>

                <p className="text-xs md:text-sm text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail size={13} className="text-slate-400" />
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-slate-400" />
                      {user.phone}
                    </span>
                  )}
                  {user.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      {user.location}
                    </span>
                  )}
                  {user.birthDate && (
                    <span className="flex items-center gap-1">
                      <Cake size={13} className="text-slate-400" />
                      {user.birthDate}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3">
              <Link
                href="/listings"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition flex items-center gap-1.5"
              >
                <Home size={15} />
                <span>Khám phá Homestay</span>
              </Link>
            </div>
          </div>

          {/* 4 QUICK STATS & UTILITY CARDS (MATCHING MOBILE APP) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-7 pt-7 border-t border-slate-100">
            {/* Card 1: Reward Points */}
            <div
              onClick={() => setActiveTab("vouchers")}
              className="bg-amber-50/60 hover:bg-amber-50 border border-amber-200/80 rounded-2xl p-4 cursor-pointer transition shadow-xs group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-800">Điểm thưởng tích lũy</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Star size={14} className="fill-white" />
                </div>
              </div>
              <div className="text-xl md:text-2xl font-black text-amber-900">
                {user.rewardPoints || 82} <span className="text-xs font-semibold">điểm</span>
              </div>
              <p className="text-[11px] text-amber-700/80 mt-1 line-clamp-1">
                +100đ sau mỗi chuyến đi • Đổi Voucher
              </p>
            </div>

            {/* Card 2: Wallet Balance */}
            <div
              onClick={() => setActiveTab("wallet")}
              className="bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 cursor-pointer transition shadow-xs group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-800">Ví của tôi</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Wallet size={14} />
                </div>
              </div>
              <div className="text-xl md:text-2xl font-black text-emerald-900">
                {formatCurrency(wallet?.balance || 0)}
              </div>
              <p className="text-[11px] text-emerald-700/80 mt-1 line-clamp-1">
                {wallet?.pending_withdrawal && wallet.pending_withdrawal > 0
                  ? `Chờ rút: ${formatCurrency(wallet.pending_withdrawal)}`
                  : "Hoàn tiền tự động & Rút tiền nhanh"}
              </p>
            </div>

            {/* Card 3: My Vouchers */}
            <div
              onClick={() => setActiveTab("vouchers")}
              className="bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-200/80 rounded-2xl p-4 cursor-pointer transition shadow-xs group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-indigo-800">Kho Voucher</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Ticket size={14} />
                </div>
              </div>
              <div className="text-xl md:text-2xl font-black text-indigo-900">
                {vouchers.length} <span className="text-xs font-semibold">ưu đãi</span>
              </div>
              <p className="text-[11px] text-indigo-700/80 mt-1 line-clamp-1">
                Giảm tới 30% cho kỳ nghỉ tiếp theo
              </p>
            </div>

            {/* Card 4: Wishlist / Favorites */}
            <div
              onClick={() => setActiveTab("favorites")}
              className="bg-rose-50/60 hover:bg-rose-50 border border-rose-200/80 rounded-2xl p-4 cursor-pointer transition shadow-xs group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-rose-800">Chỗ nghỉ yêu thích</span>
                <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-xs">
                  <Heart size={14} className="fill-white" />
                </div>
              </div>
              <div className="text-xl md:text-2xl font-black text-rose-900">
                {favorites.length} <span className="text-xs font-semibold">đã lưu</span>
              </div>
              <p className="text-[11px] text-rose-700/80 mt-1 line-clamp-1">
                Bộ sưu tập homestay ưa thích của bạn
              </p>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {[
            { key: "bookings", label: `Chuyến đi của tôi (${bookings.length})`, icon: CalendarDays },
            { key: "wallet", label: `Ví & Ngân hàng`, icon: Wallet },
            { key: "vouchers", label: `Kho Voucher (${vouchers.length})`, icon: Ticket },
            { key: "favorites", label: `Yêu thích (${favorites.length})`, icon: Heart },
            { key: "profile", label: `Cài đặt tài khoản`, icon: User },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shadow-xs ${
                  active
                    ? "bg-blue-600 text-white shadow-blue-500/20"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* FEEDBACK MESSAGES */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-4 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-4 rounded-xl mb-6 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= TAB 1: BOOKINGS LIST ================= */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-sm">
                Đang tải danh sách đặt phòng...
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <Home size={30} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Bạn chưa có đơn đặt phòng nào</h3>
                <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Khám phá hàng trăm homestay, villa tuyệt đẹp với giá tốt nhất và đặt chỗ cho kỳ nghỉ sắp tới ngay hôm nay!
                </p>
                <Link
                  href="/listings"
                  className="mt-6 inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
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
                        src={booking.propertyImage || "/img/home1.png"}
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
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                        >
                          <CreditCard size={13} />
                          <span>Thanh toán & Gửi bill</span>
                        </button>
                      )}

                      {booking.status === "completed" && (
                        <Link
                          href={`/reviews/create/${booking.id}`}
                          className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs border border-amber-200 transition flex items-center gap-1.5"
                        >
                          <Star size={13} className="fill-amber-500 text-amber-500" />
                          <span>Đánh giá chuyến đi</span>
                        </Link>
                      )}

                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition flex items-center gap-1"
                        >
                          <XCircle size={13} />
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

        {/* ================= TAB 2: WALLET & BANKING ================= */}
        {activeTab === "wallet" && (
          <div className="space-y-6">
            {/* Top Cards: Balance & Bank List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Balance Card */}
              <div className="md:col-span-1 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                      Ví Homestay Pay
                    </span>
                    <Wallet size={20} className="text-blue-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-black mt-3 text-white">
                    {formatCurrency(wallet?.balance || 0)}
                  </div>
                  {wallet?.pending_withdrawal && wallet.pending_withdrawal > 0 ? (
                    <p className="text-xs text-amber-300 mt-1">
                      Đang xử lý rút: {formatCurrency(wallet.pending_withdrawal)}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1">Số dư khả dụng để rút về ngân hàng</p>
                  )}
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    disabled={(wallet?.balance || 0) < 50000}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <ArrowUpRight size={15} />
                    <span>Rút tiền về tài khoản</span>
                  </button>
                </div>
              </div>

              {/* Linked Bank Accounts */}
              <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Tài khoản ngân hàng liên kết</h3>
                    <p className="text-xs text-slate-500">Dùng để nhận tiền hoàn hủy phòng & rút số dư ví</p>
                  </div>
                  <button
                    onClick={() => setShowAddBankModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <PlusCircle size={14} />
                    <span>Thêm ngân hàng</span>
                  </button>
                </div>

                {bankAccounts.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    <Landmark size={28} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs">Bạn chưa liên kết tài khoản ngân hàng nào.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {bankAccounts.map((b) => (
                      <div
                        key={b.id}
                        className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {b.bank_code || "BANK"}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm">
                              {b.bank_name}
                            </div>
                            <div className="text-xs font-mono text-slate-600 font-semibold">
                              {b.account_number}
                            </div>
                            <div className="text-[11px] text-slate-400 uppercase">
                              {b.account_holder_name}
                            </div>
                          </div>
                        </div>

                        {b.is_default === 1 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Mặc định
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Transaction Ledger */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <h3 className="font-extrabold text-slate-900 text-base mb-1">
                Lịch sử giao dịch ví (Biến động số dư)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Theo dõi minh bạch toàn bộ các khoản hoàn tiền và rút tiền
              </p>

              {transactions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có giao dịch biến động số dư nào.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5">Thời gian</th>
                        <th className="py-2.5">Loại giao dịch</th>
                        <th className="py-2.5">Nội dung</th>
                        <th className="py-2.5 text-right">Số tiền</th>
                        <th className="py-2.5 text-right">Số dư sau</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {transactions.map((tx) => {
                        const isPlus = tx.amount > 0;
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="py-3 text-slate-500">{formatDate(tx.created_at)}</td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                                  tx.type === "refund"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : tx.type === "withdrawal"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {tx.type === "refund" ? "Hoàn tiền" : tx.type === "withdrawal" ? "Rút tiền" : tx.type}
                              </span>
                            </td>
                            <td className="py-3 max-w-xs truncate text-slate-600">
                              {tx.description || "Giao dịch ví"}
                            </td>
                            <td
                              className={`py-3 text-right font-bold ${
                                isPlus ? "text-emerald-600" : "text-red-600"
                              }`}
                            >
                              {isPlus ? `+${formatCurrency(tx.amount)}` : formatCurrency(tx.amount)}
                            </td>
                            <td className="py-3 text-right text-slate-900 font-bold">
                              {formatCurrency(tx.balance_after)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: VOUCHERS LIST ================= */}
        {activeTab === "vouchers" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Kho Voucher ưu đãi của bạn</h3>
                <p className="text-xs text-slate-500">Mã giảm giá có thể áp dụng ngay khi đặt homestay</p>
              </div>
            </div>

            {vouchers.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                <Ticket size={32} className="mx-auto mb-2 text-slate-300" />
                <h4 className="font-bold text-slate-800 text-sm">Chưa có voucher nào trong ví</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Hãy tích lũy điểm thưởng từ các chuyến đi hoàn tất để đổi những voucher giá trị!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vouchers.map((v) => (
                  <div
                    key={v.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100/50 to-transparent rounded-full pointer-events-none" />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-black tracking-wider px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {v.code}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          HSD: {formatDate(v.end_date)}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm mt-2">{v.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{v.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs font-black text-indigo-600">
                        {v.discount_type === "percentage"
                          ? `Giảm ${v.discount_value}%`
                          : `Giảm ${formatCurrency(v.discount_value)}`}
                      </div>
                      <Link
                        href="/listings"
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Dùng ngay →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: FAVORITES LIST ================= */}
        {activeTab === "favorites" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Homestay yêu thích đã lưu</h3>
                <p className="text-xs text-slate-500">Các chỗ nghỉ bạn đã bấm thả tim lưu lại</p>
              </div>
            </div>

            {favorites.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                <Heart size={32} className="mx-auto mb-2 text-slate-300" />
                <h4 className="font-bold text-slate-800 text-sm">Chưa có homestay yêu thích nào</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Hãy khám phá và bấm biểu tượng trái tim để lưu lại những nơi bạn muốn ghé thăm!
                </p>
                <Link
                  href="/listings"
                  className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Khám phá ngay
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {favorites.map((item) => (
                  <Link
                    key={item.id}
                    href={`/listings/${item.id}`}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col"
                  >
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <Image
                        src={item.cover_image || "/img/home1.png"}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-rose-500 shadow-xs">
                        <Heart size={16} className="fill-rose-500" />
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mb-1">
                          <Star size={13} className="fill-amber-400" />
                          <span>{Number(item.rating_average || 5.0).toFixed(1)}</span>
                          <span className="text-slate-400">({item.review_count || 12})</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin size={12} className="text-slate-400" />
                          <span>{item.city}</span>
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Giá 1 đêm</span>
                        <span className="font-extrabold text-blue-600 text-sm">
                          {formatCurrency(item.price_per_night)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: PROFILE & ACCOUNT SETTINGS ================= */}
        {activeTab === "profile" && (
          <div className="max-w-3xl">
            <AccountSettingsPanel user={user} />
          </div>
        )}

        {/* MODAL: WITHDRAWAL REQUEST */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-base">Rút tiền về tài khoản ngân hàng</h3>
                <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số dư khả dụng: <span className="text-emerald-600">{formatCurrency(wallet?.balance || 0)}</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={50000}
                    max={wallet?.balance || 0}
                    placeholder="Nhập số tiền cần rút (tối thiểu 50.000 ₫)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chọn tài khoản nhận tiền:</label>
                  {bankAccounts.length === 0 ? (
                    <p className="text-xs text-red-600">
                      Bạn chưa có tài khoản ngân hàng nào. Vui lòng thêm ngân hàng trước.
                    </p>
                  ) : (
                    <select
                      value={withdrawBankId}
                      onChange={(e) => setWithdrawBankId(Number(e.target.value))}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-blue-500"
                    >
                      {bankAccounts.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bank_name} - {b.account_number} ({b.account_holder_name})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isWithdrawing || bankAccounts.length === 0}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50"
                  >
                    {isWithdrawing ? "Đang xử lý..." : "Xác nhận rút tiền"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD BANK ACCOUNT */}
        {showAddBankModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-base">Liên kết tài khoản ngân hàng</h3>
                <button onClick={() => setShowAddBankModal(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleAddBankSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngân hàng:</label>
                  <select
                    value={newBankForm.bankName}
                    onChange={(e) => {
                      const name = e.target.value;
                      const code =
                        name === "Techcombank" ? "TCB" : name === "Vietcombank" ? "VCB" : name === "MB Bank" ? "MB" : "BIDV";
                      setNewBankForm((prev) => ({ ...prev, bankName: name, bankCode: code }));
                    }}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200"
                  >
                    <option value="Techcombank">Techcombank (TCB)</option>
                    <option value="Vietcombank">Vietcombank (VCB)</option>
                    <option value="MB Bank">MB Bank (MB)</option>
                    <option value="BIDV">BIDV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số tài khoản:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 190345678910"
                    value={newBankForm.accountNumber}
                    onChange={(e) =>
                      setNewBankForm((prev) => ({ ...prev, accountNumber: e.target.value }))
                    }
                    className="w-full text-xs p-3 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên chủ tài khoản (in hoa không dấu):</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: NGUYEN VAN A"
                    value={newBankForm.accountHolderName}
                    onChange={(e) =>
                      setNewBankForm((prev) => ({
                        ...prev,
                        accountHolderName: e.target.value.toUpperCase(),
                      }))
                    }
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 uppercase"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddBankModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingBank}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50"
                  >
                    {isAddingBank ? "Đang lưu..." : "Lưu tài khoản"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: PAYMENT INSTRUCTIONS & PROOF UPLOAD */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
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
                <PaymentInstructionsCard booking={selectedBooking} />

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
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50 flex items-center gap-1.5"
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
