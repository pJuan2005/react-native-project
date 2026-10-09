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

function formatCurrency(value: number | string | undefined) {
  const amount = Number(value || 0);
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

function evaluateBookingRisk(booking: BookingRecord) {
  let score = 0;
  const factors: string[] = [];

  if (booking.nights > 14 && booking.paymentStatus !== "verified") {
    score += 25;
    factors.push("Lưu trú dài ngày (>14 đêm) chưa đối soát");
  }

  if (booking.totalPrice > 30000000 && booking.paymentStatus !== "verified") {
    score += 20;
    factors.push("Giá trị đơn rất lớn (>30 triệu)");
  }

  score = Math.min(100, score);
  const level = score >= 40 ? "HIGH" : score >= 20 ? "MEDIUM" : "LOW";
  return { score, level, factors };
}

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
          : "Không thể tải danh sách đơn đặt phòng lúc này.",
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
    { label: "Tổng đơn phòng", value: bookings.length, color: "#2563EB", bg: "#eff6ff" },
    { label: "Đã xác nhận", value: bookings.filter((booking) => booking.status === "confirmed").length, color: "#16a34a", bg: "#dcfce7" },
    { label: "Đang chờ duyệt", value: bookings.filter((booking) => booking.status === "pending").length, color: "#d97706", bg: "#fef3c7" },
    { label: "Chờ kiểm tra biên lai", value: bookings.filter((booking) => booking.paymentStatus === "proof_uploaded").length, color: "#7c3aed", bg: "#f3e8ff" },
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
          : "Không thể phê duyệt đơn đặt phòng lúc này.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ padding: "28px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontWeight: 800, color: "#1e293b", marginBottom: 4, fontSize: "1.5rem" }}>
          Quản lý Đặt phòng
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Kiểm tra biên lai thanh toán VietQR và xác nhận đơn đặt phòng trên toàn hệ thống.
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
              Tổng doanh số đơn đã xác nhận
            </div>
            <div style={{ color: "#1e293b", fontSize: "1.35rem", fontWeight: 800 }}>
              {formatCurrency(totalRevenue)}
            </div>
          </div>
          <div style={{ color: "#64748b", fontSize: "0.84rem" }}>
            Doanh số ghi nhận trực tiếp từ các đơn đặt phòng đã thanh toán và xác nhận thành công.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input className="hs-form-control" placeholder="Tìm kiếm theo khách hàng, chủ nhà, chỗ nghỉ, mã đơn..." style={{ paddingLeft: 36 }} value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <Filter size={14} color="#64748b" />
          {[
            { key: "all", label: "Tất cả" },
            { key: "pending", label: "Chờ xử lý" },
            { key: "confirmed", label: "Đã xác nhận" },
            { key: "cancelled", label: "Đã hủy" },
          ].map((item) => (
            <button key={item.key} onClick={() => setStatusFilter(item.key)} style={{ padding: "6px 12px", borderRadius: 20, fontSize: "0.8rem", border: `1.5px solid ${statusFilter === item.key ? "#2563EB" : "#e2e8f0"}`, background: statusFilter === item.key ? "#eff6ff" : "#fff", color: statusFilter === item.key ? "#2563EB" : "#64748b", fontWeight: statusFilter === item.key ? 700 : 500, cursor: "pointer" }}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hs-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0", fontSize: "0.85rem", color: "#64748b" }}>
          Hiển thị {filteredBookings.length} trên tổng số {bookings.length} đơn đặt phòng
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="hs-table">
            <thead>
              <tr>
                <th>Mã đơn phòng</th>
                <th>Khách hàng</th>
                <th>Chủ nhà</th>
                <th>Chỗ nghỉ</th>
                <th>Tổng tiền</th>
                <th>Đánh giá rủi ro</th>
                <th>Trạng thái đơn</th>
                <th>Thanh toán</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                    Đang tải danh sách đặt phòng...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                    Không tìm thấy đơn đặt phòng nào phù hợp
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => {
                  const risk = evaluateBookingRisk(booking);
                  return (
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
                          <img
                            src={booking.propertyImage || "/img/home1.png"}
                            alt={booking.propertyTitle}
                            onError={(e) => {
                              e.currentTarget.src = "/img/home1.png";
                            }}
                            style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", flexShrink: 0, background: "#f1f5f9" }}
                          />
                          <span style={{ fontSize: "0.85rem", color: "#475569", maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {booking.propertyTitle}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 800, color: "#1e293b" }}>{formatCurrency(booking.totalPrice)}</td>
                      <td>
                        <span
                          title={risk.factors.length ? risk.factors.join(" • ") : "Đơn phòng an toàn"}
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "3px 9px",
                            borderRadius: 14,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background:
                              risk.level === "HIGH"
                                ? "#fee2e2"
                                : risk.level === "MEDIUM"
                                ? "#fef3c7"
                                : "#dcfce7",
                            color:
                              risk.level === "HIGH"
                                ? "#dc2626"
                                : risk.level === "MEDIUM"
                                ? "#d97706"
                                : "#16a34a",
                          }}
                        >
                          {risk.level === "HIGH" ? "🔴 Cảnh báo" : risk.level === "MEDIUM" ? "🟡 Lưu ý" : "🟢 An toàn"}
                        </span>
                      </td>
                      <td><StatusBadge status={booking.status} /></td>
                      <td><PaymentStatusBadge status={booking.paymentStatus} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {canReviewBooking(booking) && (
                          <button onClick={() => { setSelectedBooking(booking); setError(""); setMessage(""); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 7, border: "1.5px solid #2563EB", background: "#eff6ff", color: "#2563EB", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                            Kiểm tra biên lai
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
                            Trò chuyện
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
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
            itemLabel="đơn đặt phòng"
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <BookingReviewDialog
        booking={selectedBooking}
        title="Kiểm tra & duyệt thanh toán đơn đặt phòng"
        submitLabel="Lưu kết quả duyệt"
        isSubmitting={isSubmitting}
        onClose={() => setSelectedBooking(null)}
        onSubmit={handleReview}
      />

      <BookingChatDialog
        booking={chatBooking}
        scope="admin"
        title="Trò chuyện hỗ trợ đơn phòng"
        onClose={() => setChatBooking(null)}
      />
    </div>
  );
}
