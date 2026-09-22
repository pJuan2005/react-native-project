"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Filter, MessageCircle, Search } from "lucide-react";
import { BookingChatDialog } from "@/components/shared/BookingChatDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge";
import { BookingReviewDialog } from "@/components/shared/BookingReviewDialog";
import { PaginationControls } from "@/components/shared/PaginationControls";
import {
  getAdminBookings,
  reviewAdminBooking,
  type BookingRecord,
} from "@/services/bookingService";
import { isBackendUploadImage } from "@/lib/image";

const ITEMS_PER_PAGE = 8;

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [chatBooking, setChatBooking] = useState<BookingRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  async function loadBookings() {
    setIsLoading(true);
    setError("");

    try {
      const data = await getAdminBookings();
      setBookings(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load the booking list right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const keyword = search.trim().toLowerCase();
        const matchesSearch =
          !keyword ||
          booking.guestName.toLowerCase().includes(keyword) ||
          booking.hostName.toLowerCase().includes(keyword) ||
          booking.propertyTitle.toLowerCase().includes(keyword) ||
          booking.bookingCode.toLowerCase().includes(keyword);
        const matchesStatus =
          statusFilter === "all" || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
      }),
    [bookings, search, statusFilter],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedBookings = filteredBookings.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  const summary = [
    { label: "Total Bookings", value: bookings.length, color: "#2563EB", bg: "#eff6ff" },
    { label: "Confirmed", value: bookings.filter((booking) => booking.status === "confirmed").length, color: "#16a34a", bg: "#dcfce7" },
    { label: "Pending", value: bookings.filter((booking) => booking.status === "pending").length, color: "#d97706", bg: "#fef3c7" },
    { label: "Awaiting Review", value: bookings.filter((booking) => booking.paymentStatus === "proof_uploaded").length, color: "#7c3aed", bg: "#f3e8ff" },
  ];

  const totalRevenue = bookings
    .filter((booking) => booking.status === "confirmed")
    .reduce((sum, booking) => sum + booking.totalPrice, 0);

  function canReviewBooking(booking: BookingRecord) {
    return booking.status === "pending" && booking.paymentStatus === "proof_uploaded";
  }

  async function handleReview(payload: {
    decision: "approve" | "reject";
    hostNote: string;
    checkinInstructions: string;
    rejectionReason: string;
  }) {
    if (!selectedBooking) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await reviewAdminBooking(selectedBooking.id, payload);
      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === response.data.id ? response.data : booking,
        ),
      );
      setMessage(response.message);
      setSelectedBooking(null);
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Unable to review this booking right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ padding: "28px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontWeight: 800, color: "#1e293b", marginBottom: 4, fontSize: "1.5rem" }}>
          Manage Bookings
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Supervise payment proofs and confirm platform bookings from one screen.
        </p>
      </div>

      {(error || message) && (
        <div style={{ marginBottom: 18, borderRadius: 12, padding: "12px 14px", border: `1px solid ${error ? "#fecaca" : "#bbf7d0"}`, background: error ? "#fef2f2" : "#f0fdf4", color: error ? "#b91c1c" : "#166534", fontSize: "0.84rem" }}>
          {error || message}
        </div>
      )}

      <div className="row g-3 mb-4">
        {summary.map((item) => (
          <div key={item.label} className="col-6 col-md-3">
            <div style={{ background: item.bg, borderRadius: 12, padding: "16px 18px", textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: item.color }}>
                {item.value}
              </div>
              <div style={{ fontSize: "0.82rem", color: item.color, fontWeight: 600 }}>
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hs-card" style={{ padding: "16px 18px", marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ color: "#94a3b8", fontSize: "0.74rem", fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>
              Confirmed Revenue
            </div>
            <div style={{ color: "#1e293b", fontSize: "1.35rem", fontWeight: 800 }}>
              ${totalRevenue.toFixed(2)}
            </div>
          </div>
          <div style={{ color: "#64748b", fontSize: "0.84rem" }}>
            Gross booking revenue is based on confirmed bookings only.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input className="hs-form-control" placeholder="Search guest, host, property, or booking code..." style={{ paddingLeft: 36 }} value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <Filter size={14} color="#64748b" />
          {["all", "pending", "confirmed", "cancelled"].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)} style={{ padding: "6px 12px", borderRadius: 20, fontSize: "0.8rem", border: `1.5px solid ${statusFilter === status ? "#2563EB" : "#e2e8f0"}`, background: statusFilter === status ? "#eff6ff" : "#fff", color: statusFilter === status ? "#2563EB" : "#64748b", fontWeight: statusFilter === status ? 700 : 500, cursor: "pointer" }}>
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="hs-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0", fontSize: "0.85rem", color: "#64748b" }}>
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="hs-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Guest</th>
                <th>Host</th>
                <th>Property</th>
                <th>Total</th>
                <th>Booking Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                    Loading bookings...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                    No bookings found
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#2563EB", fontSize: "0.87rem" }}>
                        {booking.bookingCode}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                        {booking.checkIn} → {booking.checkOut}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.87rem" }}>{booking.guestName}</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{booking.guestEmail}</div>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "#475569" }}>{booking.hostName}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Image
                          src={booking.propertyImage}
                          alt={booking.propertyTitle}
                          width={40}
                          height={40}
                          sizes="40px"
                          unoptimized={isBackendUploadImage(booking.propertyImage)}
                          style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                        />
                        <span style={{ fontSize: "0.85rem", color: "#475569", maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {booking.propertyTitle}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, color: "#1e293b" }}>${booking.totalPrice.toFixed(2)}</td>
                    <td><StatusBadge status={booking.status} /></td>
                    <td><PaymentStatusBadge status={booking.paymentStatus} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {canReviewBooking(booking) && (
                          <button onClick={() => { setSelectedBooking(booking); setError(""); setMessage(""); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                            Review
                          </button>
                        )}
                        {booking.status === "confirmed" && (
                          <button
                            type="button"
                            onClick={() => setChatBooking(booking)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "6px 10px",
                              borderRadius: 7,
                              border: "1.5px solid #fed7aa",
                              background: "#fff7ed",
                              color: "#c2410c",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <MessageCircle size={13} />
                            Chat
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "0 20px 20px" }}>
          <PaginationControls
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={filteredBookings.length}
            pageSize={ITEMS_PER_PAGE}
            itemLabel="bookings"
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <BookingReviewDialog
        booking={selectedBooking}
        title="Review booking payment"
        submitLabel="Save review"
        isSubmitting={isSubmitting}
        onClose={() => setSelectedBooking(null)}
        onSubmit={handleReview}
      />

      <BookingChatDialog
        booking={chatBooking}
        scope="admin"
        title="Booking Chat"
        onClose={() => setChatBooking(null)}
      />
    </div>
  );
}
