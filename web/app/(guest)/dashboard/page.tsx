"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  Home,
  MapPin,
  Star,
  User,
  XCircle,
  UploadCloud,
  CheckCircle2,
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
  ExternalLink,
  Eye,
  Lock,
  Copy,
  Check,
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
  revealGuestBankAccount,
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

function GuestDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isInitializing } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "bookings" | "wallet" | "vouchers" | "favorites" | "profile"
  >("bookings");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["bookings", "wallet", "vouchers", "favorites", "profile"].includes(tabParam)
    ) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

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

  // Bank Reveal Security Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedBankToReveal, setSelectedBankToReveal] = useState<BankAccountItem | null>(null);
  const [revealPassword, setRevealPassword] = useState("");
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [revealedBankDetail, setRevealedBankDetail] = useState<BankAccountItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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

  async function handleRevealSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBankToReveal || !user) return;
    if (!revealPassword) {
      alert("Vui lòng nhập mật khẩu tài khoản");
      return;
    }

    setIsVerifyingPassword(true);
    try {
      const detail = await revealGuestBankAccount({
        accountId: selectedBankToReveal.id,
        password: revealPassword,
        userId: user.id,
      });
      setShowPasswordModal(false);
      setRevealPassword("");
      setRevealedBankDetail(detail);
      setShowDetailModal(true);
    } catch (err: any) {
      alert(err?.message || "Mật khẩu không chính xác. Không thể xem thông tin.");
    } finally {
      setIsVerifyingPassword(false);
    }
  }

  function handleCopyAccountNumber(text?: string) {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  if (isInitializing || !user) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  const avatarSrc =
    user.avatar ||
    user.avatarUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "32px 0 64px" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px" }}>

        {/* HEADER PROFILE BANNER */}
        <div
          className="hs-card"
          style={{
            padding: "28px",
            marginBottom: 24,
            borderRadius: 20,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            {/* User Identity */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {/* Avatar fixed size */}
              <div
                style={{
                  width: 84,
                  height: 84,
                  minWidth: 84,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid #dbeafe",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.15)",
                }}
              >
                <img
                  src={avatarSrc}
                  alt={user.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                    {user.name}
                  </h1>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      border: "1px solid #bfdbfe",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <ShieldCheck size={13} color="#2563EB" /> Thành viên Sàn
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                    marginTop: 6,
                    fontSize: "0.83rem",
                    color: "#64748b",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Mail size={13} color="#94a3b8" /> {user.email}
                  </span>
                  {user.phone && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Phone size={13} color="#94a3b8" /> {user.phone}
                    </span>
                  )}
                  {user.location && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <MapPin size={13} color="#94a3b8" /> {user.location}
                    </span>
                  )}
                  {user.birthDate && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Cake size={13} color="#94a3b8" /> {user.birthDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Explore */}
            <Link
              href="/listings"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 12,
                background: "#2563EB",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.85rem",
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
              }}
            >
              <Home size={15} /> Khám phá Homestay
            </Link>
          </div>

          {/* 4 QUICK STATS & UTILITY CARDS (MATCHING MOBILE APP) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 14,
              marginTop: 22,
              paddingTop: 20,
              borderTop: "1px solid #f1f5f9",
            }}
          >
            {/* Card 1: Reward Points */}
            <div
              onClick={() => setActiveTab("vouchers")}
              style={{
                background: "#fffbeb",
                border: "1px solid #fef3c7",
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#92400e" }}>
                  Điểm thưởng tích lũy
                </span>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: "#f59e0b",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Star size={14} fill="#fff" />
                </div>
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 900, color: "#78350f", marginTop: 4 }}>
                {user.rewardPoints || 82}{" "}
                <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>điểm</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "#b45309", marginTop: 2 }}>
                +100đ sau mỗi chuyến đi • Đổi Voucher
              </div>
            </div>

            {/* Card 2: Wallet Balance */}
            <div
              onClick={() => setActiveTab("wallet")}
              style={{
                background: "#f0fdf4",
                border: "1px solid #dcfce7",
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#166534" }}>
                  Ví của tôi
                </span>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: "#16a34a",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Wallet size={14} />
                </div>
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 900, color: "#14532d", marginTop: 4 }}>
                {formatCurrency(wallet?.balance || 0)}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#15803d", marginTop: 2 }}>
                {wallet?.pending_withdrawal && wallet.pending_withdrawal > 0
                  ? `Đang chờ rút: ${formatCurrency(wallet.pending_withdrawal)}`
                  : "Hoàn tiền tự động & Rút tiền nhanh"}
              </div>
            </div>

            {/* Card 3: My Vouchers */}
            <div
              onClick={() => setActiveTab("vouchers")}
              style={{
                background: "#eef2ff",
                border: "1px solid #e0e7ff",
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#3730a3" }}>
                  Kho Voucher
                </span>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: "#4f46e5",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ticket size={14} />
                </div>
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 900, color: "#312e81", marginTop: 4 }}>
                {vouchers.length} <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>ưu đãi</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "#4338ca", marginTop: 2 }}>
                Giảm tới 30% khi đặt homestay
              </div>
            </div>

            {/* Card 4: Wishlist / Favorites */}
            <div
              onClick={() => setActiveTab("favorites")}
              style={{
                background: "#fff1f2",
                border: "1px solid #ffe4e6",
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9f1239" }}>
                  Chỗ nghỉ yêu thích
                </span>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: "#f43f5e",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Heart size={14} fill="#fff" />
                </div>
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 900, color: "#881337", marginTop: 4 }}>
                {favorites.length} <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>đã lưu</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "#be123c", marginTop: 2 }}>
                Bộ sưu tập homestay ưa thích
              </div>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION CHIPS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 8,
            marginBottom: 20,
          }}
        >
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
                style={{
                  padding: "9px 16px",
                  borderRadius: 12,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  border: active ? "1px solid #2563EB" : "1px solid #e2e8f0",
                  background: active ? "#2563EB" : "#ffffff",
                  color: active ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* FEEDBACK MESSAGES */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: "0.83rem",
              fontWeight: 600,
              padding: "12px 16px",
              borderRadius: 12,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#16a34a",
              fontSize: "0.83rem",
              fontWeight: 600,
              padding: "12px 16px",
              borderRadius: 12,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= TAB 1: BOOKINGS LIST ================= */}
        {activeTab === "bookings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {isLoading ? (
              <div
                className="hs-card"
                style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}
              >
                Đang tải danh sách đặt phòng...
              </div>
            ) : bookings.length === 0 ? (
              <div
                className="hs-card"
                style={{
                  padding: 48,
                  textAlign: "center",
                  background: "#ffffff",
                  borderRadius: 20,
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "#eff6ff",
                    color: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <Home size={28} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                  Bạn chưa có đơn đặt phòng nào
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: 6, maxWidth: 450, margin: "6px auto 0" }}>
                  Khám phá hàng trăm homestay, villa tuyệt đẹp với giá tốt nhất và đặt chỗ cho kỳ nghỉ sắp tới ngay hôm nay!
                </p>
                <Link
                  href="/listings"
                  style={{
                    marginTop: 20,
                    display: "inline-block",
                    padding: "10px 22px",
                    borderRadius: 12,
                    background: "#2563EB",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    textDecoration: "none",
                  }}
                >
                  Khám phá Homestay ngay
                </Link>
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="hs-card"
                  style={{
                    padding: 20,
                    borderRadius: 18,
                    background: "#ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 18,
                  }}
                >
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: 14,
                        overflow: "hidden",
                        background: "#f1f5f9",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={booking.propertyImage || "/img/home1.png"}
                        alt={booking.propertyTitle}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.78rem", fontWeight: 800, color: "#2563EB" }}>
                          {booking.bookingCode}
                        </span>
                        <StatusBadge status={booking.status} />
                        <PaymentStatusBadge status={booking.paymentStatus} />
                      </div>

                      <h3 style={{ fontSize: "1.02rem", fontWeight: 800, color: "#1e293b", margin: "2px 0 4px" }}>
                        {booking.propertyTitle}
                      </h3>
                      <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={12} color="#94a3b8" /> {booking.propertyLocation}
                      </p>

                      <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: 4, display: "flex", gap: 14 }}>
                        <span>📅 {booking.checkIn} ➔ {booking.checkOut} ({booking.nights} đêm)</span>
                        <span>👥 {booking.guests} khách</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8", display: "block" }}>Tổng thanh toán</span>
                      <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#2563EB" }}>
                        {formatCurrency(booking.totalPrice)}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      {booking.paymentStatus === "unpaid" && booking.status !== "cancelled" && (
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          style={{
                            padding: "7px 12px",
                            borderRadius: 10,
                            background: "#2563EB",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            border: "none",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <CreditCard size={13} /> Thanh toán VietQR
                        </button>
                      )}

                      {booking.status === "completed" && (
                        <Link
                          href={`/reviews/create/${booking.id}`}
                          style={{
                            padding: "7px 12px",
                            borderRadius: 10,
                            background: "#fffbeb",
                            color: "#b45309",
                            border: "1px solid #fef3c7",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Star size={13} fill="#f59e0b" color="#f59e0b" /> Đánh giá
                        </Link>
                      )}

                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          style={{
                            padding: "7px 12px",
                            borderRadius: 10,
                            background: "#fef2f2",
                            color: "#dc2626",
                            border: "1px solid #fecaca",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <XCircle size={13} /> Hủy đơn
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
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Top Cards: Balance & Bank List */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
              {/* Balance Card */}
              <div
                style={{
                  background: "linear-gradient(135deg, #0f172a, #1e293b)",
                  color: "#ffffff",
                  borderRadius: 20,
                  padding: "24px 28px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 8px 24px rgba(15,23,42,0.15)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8", fontWeight: 700 }}>
                      Ví Homestay Pay
                    </span>
                    <Wallet size={20} color="#60a5fa" />
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", marginTop: 12 }}>
                    {formatCurrency(wallet?.balance || 0)}
                  </div>
                  {wallet?.pending_withdrawal && wallet.pending_withdrawal > 0 ? (
                    <p style={{ fontSize: "0.78rem", color: "#fde047", margin: "4px 0 0" }}>
                      Đang xử lý rút: {formatCurrency(wallet.pending_withdrawal)}
                    </p>
                  ) : (
                    <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: "4px 0 0" }}>
                      Số dư khả dụng để rút về tài khoản ngân hàng
                    </p>
                  )}
                </div>

                <div style={{ marginTop: 24 }}>
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    disabled={(wallet?.balance || 0) < 50000}
                    style={{
                      width: "100%",
                      padding: "11px",
                      borderRadius: 12,
                      background: (wallet?.balance || 0) >= 50000 ? "#2563EB" : "#334155",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "0.84rem",
                      border: "none",
                      cursor: (wallet?.balance || 0) >= 50000 ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <ArrowUpRight size={16} /> Rút tiền về tài khoản
                  </button>
                </div>
              </div>

              {/* Linked Bank Accounts */}
              <div
                className="hs-card"
                style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "24px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                      Tài khoản ngân hàng liên kết
                    </h3>
                    <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "2px 0 0" }}>
                      Dùng để nhận tiền hoàn hủy phòng & rút số dư ví
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddBankModal(true)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: "#eff6ff",
                      color: "#2563EB",
                      border: "1px solid #bfdbfe",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <PlusCircle size={14} /> Thêm ngân hàng
                  </button>
                </div>

                {bankAccounts.length === 0 ? (
                  <div style={{ padding: 28, textAlign: "center", color: "#94a3b8", border: "1px dashed #e2e8f0", borderRadius: 14 }}>
                    <Landmark size={24} style={{ margin: "0 auto 6px", color: "#cbd5e1" }} />
                    <p style={{ fontSize: "0.8rem", margin: 0 }}>Bạn chưa liên kết tài khoản ngân hàng nào.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {bankAccounts.map((b) => {
                      const bankTitle = b.bankName || b.bank_name || "Ngân hàng liên kết";
                      const bankCodeText = b.bankCode || b.bank_code || "BANK";
                      const accMasked = b.accountNumberMasked || b.account_number_masked || b.accountNumber || b.account_number || "****";
                      const holderName = b.accountHolderName || b.account_holder_name || user.name;
                      const isDef = b.isDefault || b.is_default === 1;

                      return (
                        <div
                          key={b.id}
                          style={{
                            padding: "14px 16px",
                            borderRadius: 14,
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: 12,
                                background: "#eff6ff",
                                color: "#1d4ed8",
                                border: "1px solid #dbeafe",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "0.78rem",
                              }}
                            >
                              {bankCodeText}
                            </div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>
                                  {bankTitle}
                                </span>
                                {isDef && (
                                  <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#dcfce7", color: "#166534" }}>
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: "0.82rem", fontFamily: "monospace", color: "#475569", fontWeight: 700, marginTop: 2 }}>
                                {accMasked}
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", marginTop: 1 }}>
                                {holderName}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedBankToReveal(b);
                              setRevealPassword("");
                              setShowPasswordModal(true);
                            }}
                            title="Xác thực mật khẩu để xem số tài khoản đầy đủ"
                            style={{
                              padding: "7px 12px",
                              borderRadius: 10,
                              background: "#f8fafc",
                              color: "#2563EB",
                              border: "1px solid #e2e8f0",
                              fontWeight: 700,
                              fontSize: "0.76rem",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Lock size={12} color="#2563EB" />
                            <span>Xem chi tiết</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Transaction Ledger */}
            <div
              className="hs-card"
              style={{
                background: "#ffffff",
                borderRadius: 20,
                padding: "24px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                Lịch sử giao dịch ví (Biến động số dư)
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "2px 0 16px" }}>
                Theo dõi minh bạch toàn bộ các khoản hoàn tiền và rút tiền
              </p>

              {transactions.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: "0.82rem" }}>
                  Chưa có giao dịch biến động số dư nào.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="hs-table" style={{ width: "100%", fontSize: "0.82rem" }}>
                    <thead>
                      <tr>
                        <th>Thời gian</th>
                        <th>Loại giao dịch</th>
                        <th>Nội dung</th>
                        <th style={{ textAlign: "right" }}>Số tiền</th>
                        <th style={{ textAlign: "right" }}>Số dư sau</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => {
                        const isPlus = tx.amount > 0;
                        return (
                          <tr key={tx.id}>
                            <td style={{ color: "#64748b", whiteSpace: "nowrap" }}>{formatDate(tx.created_at)}</td>
                            <td>
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: 20,
                                  background: tx.type === "refund" ? "#dcfce7" : tx.type === "withdrawal" ? "#fef3c7" : "#eff6ff",
                                  color: tx.type === "refund" ? "#166534" : tx.type === "withdrawal" ? "#92400e" : "#1e40af",
                                }}
                              >
                                {tx.type === "refund" ? "Hoàn tiền" : tx.type === "withdrawal" ? "Rút tiền" : tx.type}
                              </span>
                            </td>
                            <td style={{ color: "#334155" }}>{tx.description || "Giao dịch ví"}</td>
                            <td style={{ textAlign: "right", fontWeight: 800, color: isPlus ? "#16a34a" : "#dc2626" }}>
                              {isPlus ? `+${formatCurrency(tx.amount)}` : formatCurrency(tx.amount)}
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 800, color: "#1e293b" }}>
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
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                Kho Voucher ưu đãi của bạn
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0 0" }}>
                Mã giảm giá có thể áp dụng ngay khi đặt homestay trên toàn sàn
              </p>
            </div>

            {vouchers.length === 0 ? (
              <div
                className="hs-card"
                style={{ padding: 48, textAlign: "center", background: "#ffffff", borderRadius: 20 }}
              >
                <Ticket size={32} style={{ margin: "0 auto 8px", color: "#cbd5e1" }} />
                <h4 style={{ fontWeight: 800, color: "#1e293b", margin: 0 }}>Chưa có voucher nào trong ví</h4>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: 4 }}>
                  Hãy tích lũy điểm thưởng từ các chuyến đi hoàn tất để đổi những voucher giá trị!
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                {vouchers.map((v) => (
                  <div
                    key={v.id}
                    className="hs-card"
                    style={{
                      padding: "20px",
                      borderRadius: 18,
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.82rem",
                            fontWeight: 800,
                            padding: "4px 10px",
                            borderRadius: 8,
                            background: "#eef2ff",
                            color: "#4338ca",
                            border: "1px solid #c7d2fe",
                          }}
                        >
                          {v.code}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                          HSD: {formatDate(v.end_date)}
                        </span>
                      </div>

                      <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", margin: "6px 0 4px" }}>
                        {v.title}
                      </h4>
                      <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0 }}>
                        {v.description}
                      </p>
                    </div>

                    <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 900, fontSize: "0.95rem", color: "#4f46e5" }}>
                        {v.discount_type === "percentage" ? `Giảm ${v.discount_value}%` : `Giảm ${formatCurrency(v.discount_value)}`}
                      </span>
                      <Link
                        href="/listings"
                        style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2563EB", textDecoration: "none" }}
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
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                Homestay yêu thích đã lưu
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0 0" }}>
                Các chỗ nghỉ bạn đã bấm biểu tượng trái tim lưu lại
              </p>
            </div>

            {favorites.length === 0 ? (
              <div
                className="hs-card"
                style={{ padding: 48, textAlign: "center", background: "#ffffff", borderRadius: 20 }}
              >
                <Heart size={32} style={{ margin: "0 auto 8px", color: "#cbd5e1" }} />
                <h4 style={{ fontWeight: 800, color: "#1e293b", margin: 0 }}>Chưa có homestay yêu thích nào</h4>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: 4 }}>
                  Hãy khám phá và bấm biểu tượng trái tim để lưu lại những nơi bạn muốn ghé thăm!
                </p>
                <Link
                  href="/listings"
                  style={{
                    marginTop: 16,
                    display: "inline-block",
                    padding: "9px 20px",
                    borderRadius: 12,
                    background: "#2563EB",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    textDecoration: "none",
                  }}
                >
                  Khám phá ngay
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 18,
                }}
              >
                {favorites.map((item) => (
                  <Link
                    key={item.id}
                    href={`/listings/${item.id}`}
                    className="hs-card"
                    style={{
                      borderRadius: 18,
                      overflow: "hidden",
                      background: "#ffffff",
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ height: 160, position: "relative", background: "#f1f5f9" }}>
                      <img
                        src={item.cover_image || "/img/home1.png"}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.9)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Heart size={16} fill="#f43f5e" color="#f43f5e" />
                      </div>
                    </div>

                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#f59e0b", fontSize: "0.78rem", fontWeight: 700 }}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span>{Number(item.rating_average || 5.0).toFixed(1)}</span>
                        <span style={{ color: "#94a3b8" }}>({item.review_count || 12})</span>
                      </div>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", margin: "4px 0" }}>
                        {item.name}
                      </h4>
                      <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0, display: "flex", alignItems: "center", gap: 3 }}>
                        <MapPin size={11} color="#94a3b8" /> {item.city}
                      </p>

                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Giá 1 đêm</span>
                        <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#2563EB" }}>
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
          <div style={{ maxWidth: 800 }}>
            <AccountSettingsPanel user={user} />
          </div>
        )}

        {/* MODAL: WITHDRAWAL REQUEST */}
        {showWithdrawModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
              padding: 16,
            }}
          >
            <div
              style={{
                background: "#ffffff",
                width: "100%",
                maxWidth: 440,
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                  Rút tiền về tài khoản ngân hàng
                </h3>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleWithdrawSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                    Số dư khả dụng: <span style={{ color: "#16a34a" }}>{formatCurrency(wallet?.balance || 0)}</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={50000}
                    max={wallet?.balance || 0}
                    placeholder="Nhập số tiền cần rút (tối thiểu 50.000 ₫)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="hs-form-control"
                    style={{ padding: "10px 14px", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                    Chọn tài khoản nhận tiền:
                  </label>
                  {bankAccounts.length === 0 ? (
                    <p style={{ fontSize: "0.78rem", color: "#dc2626", margin: 0 }}>
                      Bạn chưa có tài khoản ngân hàng nào. Vui lòng thêm ngân hàng trước.
                    </p>
                  ) : (
                    <select
                      value={withdrawBankId}
                      onChange={(e) => setWithdrawBankId(Number(e.target.value))}
                      className="hs-form-control"
                      style={{ padding: "10px 14px", fontSize: "0.85rem" }}
                    >
                      {bankAccounts.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName || b.bank_name} - {b.accountNumberMasked || b.account_number_masked || b.accountNumber || b.account_number} ({b.accountHolderName || b.accountHolderName || b.account_holder_name || user.name})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    style={{ padding: "8px 16px", borderRadius: 10, background: "#f1f5f9", border: "none", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", color: "#64748b" }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isWithdrawing || bankAccounts.length === 0}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 10,
                      background: "#2563EB",
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#fff",
                      cursor: "pointer",
                      opacity: isWithdrawing ? 0.6 : 1,
                    }}
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
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
              padding: 16,
            }}
          >
            <div
              style={{
                background: "#ffffff",
                width: "100%",
                maxWidth: 440,
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                  Liên kết tài khoản ngân hàng
                </h3>
                <button
                  onClick={() => setShowAddBankModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleAddBankSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Ngân hàng:
                  </label>
                  <select
                    value={newBankForm.bankName}
                    onChange={(e) => {
                      const name = e.target.value;
                      const code =
                        name === "Techcombank" ? "TCB" : name === "Vietcombank" ? "VCB" : name === "MB Bank" ? "MB" : "BIDV";
                      setNewBankForm((prev) => ({ ...prev, bankName: name, bankCode: code }));
                    }}
                    className="hs-form-control"
                    style={{ padding: "10px 14px", fontSize: "0.85rem" }}
                  >
                    <option value="Techcombank">Techcombank (TCB)</option>
                    <option value="Vietcombank">Vietcombank (VCB)</option>
                    <option value="MB Bank">MB Bank (MB)</option>
                    <option value="BIDV">BIDV</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Số tài khoản:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 190345678910"
                    value={newBankForm.accountNumber}
                    onChange={(e) =>
                      setNewBankForm((prev) => ({ ...prev, accountNumber: e.target.value }))
                    }
                    className="hs-form-control"
                    style={{ padding: "10px 14px", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Tên chủ tài khoản (in hoa không dấu):
                  </label>
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
                    className="hs-form-control"
                    style={{ padding: "10px 14px", fontSize: "0.85rem", textTransform: "uppercase" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddBankModal(false)}
                    style={{ padding: "8px 16px", borderRadius: 10, background: "#f1f5f9", border: "none", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", color: "#64748b" }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingBank}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 10,
                      background: "#2563EB",
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#fff",
                      cursor: "pointer",
                      opacity: isAddingBank ? 0.6 : 1,
                    }}
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
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
              padding: 16,
            }}
          >
            <div
              style={{
                background: "#ffffff",
                width: "100%",
                maxWidth: 480,
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                    Thanh toán chuyển khoản VietQR
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "#2563EB", fontFamily: "monospace", fontWeight: 800, margin: "2px 0 0" }}>
                    Mã đơn: {selectedBooking.bookingCode}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedBooking(null);
                    setSelectedProofFile(null);
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <PaymentInstructionsCard booking={selectedBooking} />

                <form onSubmit={handleUploadProof} style={{ paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 10 }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b" }}>
                    📸 Tải lên ảnh chụp biên lai chuyển khoản thành công:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setSelectedProofFile(e.target.files?.[0] || null)}
                    style={{ fontSize: "0.8rem", color: "#475569" }}
                  />

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBooking(null);
                        setSelectedProofFile(null);
                      }}
                      style={{ padding: "8px 16px", borderRadius: 10, background: "#f1f5f9", border: "none", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", color: "#64748b" }}
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading || !selectedProofFile}
                      style={{
                        padding: "8px 18px",
                        borderRadius: 10,
                        background: "#2563EB",
                        border: "none",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "#fff",
                        cursor: "pointer",
                        opacity: isUploading ? 0.6 : 1,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
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
        {/* MODAL: SECURITY PASSWORD CHALLENGE TO REVEAL BANK DETAIL */}
        {showPasswordModal && selectedBankToReveal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 16,
            }}
          >
            <div
              style={{
                background: "#ffffff",
                width: "100%",
                maxWidth: 420,
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#eff6ff",
                    color: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                    border: "2px solid #bfdbfe",
                  }}
                >
                  <Lock size={24} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                  Xác thực bảo mật tài chính
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 6 }}>
                  Để bảo vệ tài sản, vui lòng nhập mật khẩu tài khoản của bạn để xem số tài khoản và thông tin chi tiết ngân hàng{" "}
                  <strong>{selectedBankToReveal.bankName || selectedBankToReveal.bank_name}</strong>.
                </p>
              </div>

              <form onSubmit={handleRevealSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                    Mật khẩu tài khoản:
                  </label>
                  <input
                    type="password"
                    autoFocus
                    required
                    placeholder="Nhập mật khẩu của bạn..."
                    value={revealPassword}
                    onChange={(e) => setRevealPassword(e.target.value)}
                    className="hs-form-control"
                    style={{ padding: "10px 14px", fontSize: "0.9rem" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setRevealPassword("");
                    }}
                    style={{ padding: "8px 16px", borderRadius: 10, background: "#f1f5f9", border: "none", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", color: "#64748b" }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingPassword || !revealPassword}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 10,
                      background: "#2563EB",
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#fff",
                      cursor: "pointer",
                      opacity: isVerifyingPassword ? 0.6 : 1,
                    }}
                  >
                    {isVerifyingPassword ? "Đang xác thực..." : "Xác nhận & Xem"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: FULL BANK ACCOUNT DETAIL (REVEALED) */}
        {showDetailModal && revealedBankDetail && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 16,
            }}
          >
            <div
              style={{
                background: "#ffffff",
                width: "100%",
                maxWidth: 460,
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    {revealedBankDetail.bankCode || revealedBankDetail.bank_code || "BANK"}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                      {revealedBankDetail.bankName || revealedBankDetail.bank_name}
                    </h3>
                    <p style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 700, margin: "2px 0 0", display: "flex", alignItems: "center", gap: 3 }}>
                      <CheckCircle2 size={12} /> Đã xác thực bảo mật
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Full Account Number with Copy */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Số tài khoản đầy đủ:</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                    <span style={{ fontSize: "1.25rem", fontWeight: 900, fontFamily: "monospace", color: "#1e293b", letterSpacing: 1 }}>
                      {revealedBankDetail.accountNumber || revealedBankDetail.account_number}
                    </span>
                    <button
                      onClick={() => handleCopyAccountNumber(revealedBankDetail.accountNumber || revealedBankDetail.account_number)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        background: isCopied ? "#dcfce7" : "#eff6ff",
                        color: isCopied ? "#166534" : "#2563EB",
                        border: isCopied ? "1px solid #bbf7d0" : "1px solid #bfdbfe",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopied ? "Đã chép" : "Sao chép"}</span>
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 10 }}>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Chủ tài khoản</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b", textTransform: "uppercase", marginTop: 2 }}>
                      {revealedBankDetail.accountHolderName || revealedBankDetail.account_holder_name}
                    </div>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 10 }}>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Trạng thái tài khoản</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#16a34a", marginTop: 2 }}>
                      {revealedBankDetail.isDefault || revealedBankDetail.is_default ? "Mặc định (Ưu tiên)" : "Đang hoạt động"}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: "0.72rem", color: "#64748b", background: "#f0fdf4", border: "1px solid #dcfce7", borderRadius: 10, padding: "10px 12px", display: "flex", gap: 6 }}>
                  <ShieldCheck size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    Thông tin tài khoản đã được giải mã và kiểm toán. Hãy bảo mật thông tin và không chia sẻ cho người lạ.
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 10,
                      background: "#2563EB",
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuestDashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
          }}
        >
          Đang tải thông tin tài khoản...
        </div>
      }
    >
      <GuestDashboardContent />
    </Suspense>
  );
}
