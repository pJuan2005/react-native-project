"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  ExternalLink,
  Filter,
  Home,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Star,
  User,
} from "lucide-react";
import { useAuth, getUserInitials } from "@/components/context/AuthContext";
import { AccountSettingsPanel } from "@/components/shared/AccountSettingsPanel";
import { BookingChatDialog } from "@/components/shared/BookingChatDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge";
import { PaymentInstructionsCard } from "@/components/shared/PaymentInstructionsCard";
import { isBackendUploadImage } from "@/lib/image";
import {
  cancelBooking,
  getMyBookings,
  uploadPaymentProof,
  type BookingRecord,
} from "@/services/bookingService";

function isCheckoutPast(checkOutDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkout = new Date(checkOutDate);
  checkout.setHours(0, 0, 0, 0);
  return checkout < today;
}

export default function UserDashboard() {
  const { user, logout, isInitializing } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"bookings" | "profile">("bookings");
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [chatBooking, setChatBooking] = useState<BookingRecord | null>(null);
  const [pageError, setPageError] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [isCancellingBooking, setIsCancellingBooking] = useState<number | null>(null);

  async function loadBookings() {
    setIsLoading(true);
    setPageError("");

    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to load your booking history right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isInitializing && user?.role === "Guest") {
      loadBookings();
    }
  }, [isInitializing, user]);

  useEffect(() => {
    if (!isInitializing && (!user || user.role !== "Guest")) {
      router.replace("/auth/login");
    }
  }, [isInitializing, router, user]);

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const matchesStatus =
          statusFilter === "all" || booking.status === statusFilter;
        const keyword = searchValue.trim().toLowerCase();
        const matchesSearch =
          !keyword ||
          booking.propertyTitle.toLowerCase().includes(keyword) ||
          booking.hostName.toLowerCase().includes(keyword) ||
          booking.bookingCode.toLowerCase().includes(keyword);

        return matchesStatus && matchesSearch;
      }),
    [bookings, searchValue, statusFilter],
  );

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  async function handleUploadProof(file: File) {
    if (!selectedBooking) {
      return;
    }

    setIsUploadingProof(true);
    setPageError("");
    setPageMessage("");

    try {
      const response = await uploadPaymentProof(selectedBooking.id, file);
      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === response.data.id ? response.data : booking,
        ),
      );
      setSelectedBooking(response.data);
      setPageMessage(response.message);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to upload your payment proof right now.",
      );
    } finally {
      setIsUploadingProof(false);
    }
  }

  async function handleCancelBooking(booking: BookingRecord) {
    setIsCancellingBooking(booking.id);
    setPageError("");
    setPageMessage("");

    try {
      const response = await cancelBooking(booking.id);
      setBookings((currentBookings) =>
        currentBookings.map((currentBooking) =>
          currentBooking.id === response.data.id ? response.data : currentBooking,
        ),
      );
      if (selectedBooking?.id === response.data.id) {
        setSelectedBooking(response.data);
      }
      setPageMessage(response.message);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to cancel this booking right now.",
      );
    } finally {
      setIsCancellingBooking(null);
    }
  }

  if (isInitializing || !user || user.role !== "Guest") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
        Checking user session...
      </div>
    );
  }

  const initials = getUserInitials(user.name);
  const memberSince = user.joined
    ? new Date(user.joined).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "January 2026";
  const stats = [
    { label: "Total bookings", value: bookings.length, color: "#1e293b" },
    { label: "Confirmed", value: bookings.filter((booking) => booking.status === "confirmed").length, color: "#16a34a" },
    { label: "Pending", value: bookings.filter((booking) => booking.status === "pending").length, color: "#d97706" },
    { label: "Awaiting review", value: bookings.filter((booking) => booking.paymentStatus === "proof_uploaded").length, color: "#2563eb" },
  ];

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "32px 0" }}>
      <div className="container">
        <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontWeight: 800, color: "#1e293b", marginBottom: 4, fontSize: "1.5rem" }}>My Dashboard</h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.88rem" }}>
              Track bookings, transfer proofs, and check-in updates in one place.
            </p>
          </div>
          <Link href="/listings">
            <button className="btn-primary-hs" style={{ fontSize: "0.87rem", display: "flex", alignItems: "center", gap: 6 }}>
              <Search size={14} /> Find a Stay
            </button>
          </Link>
        </div>

        {(pageError || pageMessage) && (
          <div style={{ marginBottom: 20, borderRadius: 14, padding: "14px 16px", border: `1px solid ${pageError ? "#fecaca" : "#bbf7d0"}`, background: pageError ? "#fef2f2" : "#f0fdf4", color: pageError ? "#b91c1c" : "#166534", fontSize: "0.85rem" }}>
            {pageError || pageMessage}
          </div>
        )}

        <div className="row g-4">
          <div className="col-lg-3 col-md-4">
            <div className="hs-card" style={{ padding: "28px 20px", textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>
                {initials}
              </div>
              <h2 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4, fontSize: "1.1rem" }}>{user.name}</h2>
              <p style={{ color: "#64748b", fontSize: "0.83rem", marginBottom: 14 }}>{user.email}</p>
              <span className="hs-badge hs-badge-guest" style={{ display: "inline-flex" }}>
                <User size={11} style={{ marginRight: 4 }} /> Guest
              </span>
              <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 18, paddingTop: 18, display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
                {[
                  { icon: <Mail size={14} />, text: user.email },
                  { icon: <Phone size={14} />, text: user.phone || "Not updated yet" },
                  { icon: <MapPin size={14} />, text: user.location || "Not updated yet" },
                  { icon: <CalendarDays size={14} />, text: `Member since ${memberSince}` },
                ].map((item, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "#64748b" }}>
                    <span style={{ color: "#2563EB" }}>{item.icon}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hs-card" style={{ padding: "18px 20px", marginTop: 16 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 12 }}>
                Booking Stats
              </div>
              {stats.map((stat, index) => (
                <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: index < stats.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{stat.label}</span>
                  <span style={{ fontWeight: 700, color: stat.color }}>{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="hs-card" style={{ padding: "18px 20px", marginTop: 16 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 12 }}>
                Quick Actions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link href="/listings" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", background: "#eff6ff", border: "none", borderRadius: 8, padding: "9px 14px", color: "#2563EB", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <Home size={14} /> Browse properties
                  </button>
                </Link>
                <button onClick={handleLogout} style={{ width: "100%", background: "#fef2f2", border: "none", borderRadius: 8, padding: "9px 14px", color: "#dc2626", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-9 col-md-8">
            <div style={{ display: "flex", gap: 4, marginBottom: 22, borderBottom: "1px solid #e2e8f0" }}>
              {[{ id: "bookings" as const, label: "Booking history" }, { id: "profile" as const, label: "Profile details" }].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "10px 18px", fontWeight: 700, color: activeTab === tab.id ? "#2563EB" : "#64748b", borderBottom: activeTab === tab.id ? "2px solid #2563EB" : "2px solid transparent", fontSize: "0.92rem", marginBottom: -1 }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "bookings" ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                  <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
                    <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input className="hs-form-control" placeholder="Search property, host, or booking code..." style={{ paddingLeft: 36 }} value={searchValue} onChange={(event) => setSearchValue(event.target.value)} />
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    <Filter size={14} color="#64748b" />
                    {["all", "pending", "confirmed", "cancelled"].map((value) => (
                      <button key={value} onClick={() => setStatusFilter(value)} style={{ padding: "5px 14px", borderRadius: 20, fontSize: "0.8rem", border: `1.5px solid ${statusFilter === value ? "#2563EB" : "#e2e8f0"}`, background: statusFilter === value ? "#eff6ff" : "#fff", color: statusFilter === value ? "#2563EB" : "#64748b", fontWeight: statusFilter === value ? 700 : 500, cursor: "pointer" }}>
                        {value === "all" ? "All" : value.charAt(0).toUpperCase() + value.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hs-card" style={{ overflow: "hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table className="hs-table">
                      <thead>
                        <tr>
                          <th>Booking</th>
                          <th>Stay</th>
                          <th>Amount</th>
                          <th>Booking Status</th>
                          <th>Payment</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr><td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>Loading your bookings...</td></tr>
                        ) : filteredBookings.length === 0 ? (
                          <tr><td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>No bookings found</td></tr>
                        ) : filteredBookings.map((booking) => (
                          <tr key={booking.id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <Image
                                  src={booking.propertyImage}
                                  alt={booking.propertyTitle}
                                  width={48}
                                  height={48}
                                  sizes="48px"
                                  unoptimized={isBackendUploadImage(booking.propertyImage)}
                                  style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", flexShrink: 0 }}
                                />
                                <div>
                                  <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.88rem" }}>{booking.propertyTitle}</div>
                                  <div style={{ color: "#94a3b8", fontSize: "0.76rem", marginTop: 2 }}>{booking.bookingCode}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.6 }}>
                                <div>{booking.checkIn} → {booking.checkOut}</div>
                                <div style={{ color: "#94a3b8" }}>{booking.nights} nights • {booking.guests} guests</div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem" }}>${booking.totalPrice.toFixed(2)}</div>
                              <div style={{ color: "#94a3b8", fontSize: "0.73rem" }}>Host: {booking.hostName}</div>
                            </td>
                            <td><StatusBadge status={booking.status} /></td>
                            <td><PaymentStatusBadge status={booking.paymentStatus} /></td>
                            <td>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                <Link href={`/listings/${booking.propertyId}`}>
                                  <button style={{ background: "#eff6ff", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", color: "#2563EB", fontWeight: 600 }}>
                                    <ExternalLink size={12} /> View
                                  </button>
                                </Link>
                                {booking.status === "pending" && (
                                  <button onClick={() => { setSelectedBooking(booking); setPageError(""); setPageMessage(""); }} style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: 6, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", color: "#475569", fontWeight: 600 }}>
                                    <CreditCard size={12} /> Payment
                                  </button>
                                )}
                                {booking.status === "pending" && (
                                  <button onClick={() => handleCancelBooking(booking)} disabled={isCancellingBooking === booking.id} style={{ background: "#fee2e2", border: "none", borderRadius: 6, padding: "5px 8px", cursor: isCancellingBooking === booking.id ? "progress" : "pointer", fontSize: "0.78rem", color: "#dc2626", fontWeight: 600, opacity: isCancellingBooking === booking.id ? 0.7 : 1 }}>
                                    {isCancellingBooking === booking.id ? "Cancelling..." : "Cancel"}
                                  </button>
                                )}
                                {booking.status === "confirmed" &&
                                  isCheckoutPast(booking.checkOut) &&
                                  !booking.reviewId && (
                                  <Link href={`/reviews/create/${booking.id}`}>
                                    <button style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", color: "#16a34a", fontWeight: 700 }}>
                                      <Star size={12} fill="#16a34a" color="#16a34a" /> Write Review
                                    </button>
                                  </Link>
                                )}
                                {booking.status === "confirmed" &&
                                  isCheckoutPast(booking.checkOut) &&
                                  booking.reviewId && (
                                  <button
                                    type="button"
                                    disabled
                                    style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 6, padding: "5px 10px", cursor: "default", display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", color: "#2563EB", fontWeight: 700 }}
                                  >
                                    <Star size={12} fill="#2563EB" color="#2563EB" /> Reviewed
                                  </button>
                                )}
                                {booking.status === "confirmed" && (
                                  <button
                                    type="button"
                                    onClick={() => setChatBooking(booking)}
                                    style={{
                                      background: "#fff7ed",
                                      border: "1.5px solid #fed7aa",
                                      borderRadius: 6,
                                      padding: "5px 10px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                      fontSize: "0.78rem",
                                      color: "#c2410c",
                                      fontWeight: 700,
                                    }}
                                  >
                                    <MessageCircle size={12} /> Chat
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <AccountSettingsPanel
                user={user}
                profileTitle="Profile Details"
                passwordTitle="Change Password"
              />
            )}
          </div>
        </div>
      </div>

      {selectedBooking && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.52)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 940, maxHeight: "90vh", overflowY: "auto", borderRadius: 20, background: "#fff", padding: 18, boxShadow: "0 30px 80px rgba(15, 23, 42, 0.22)" }}>
            <PaymentInstructionsCard booking={selectedBooking} onUpload={handleUploadProof} isUploading={isUploadingProof} uploadError={pageError} uploadSuccess={pageMessage} uploadLabel="Upload or replace proof" />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <button className="btn-outline-hs" onClick={() => setSelectedBooking(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <BookingChatDialog
        booking={chatBooking}
        scope="guest"
        title="Booking Chat"
        onClose={() => setChatBooking(null)}
      />
    </div>
  );
}
