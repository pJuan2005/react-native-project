"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  Copy,
  DollarSign,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge";
import {
  createDirectBookingByToken,
  getQuickManageData,
  type QuickManageData,
} from "@/services/quickManageService";
import { isBackendUploadImage } from "@/lib/image";
import { useParams } from "next/navigation";

function formatCurrency(value: number) {
  return `${Number(value || 0).toLocaleString("vi-VN")} ₫`;
}

function getNightCount(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function hasDateConflict(
  ranges: QuickManageData["unavailableRanges"],
  checkIn: string,
  checkOut: string,
) {
  if (!checkIn || !checkOut) {
    return false;
  }

  return ranges.some((range) => checkIn < range.checkOut && checkOut > range.checkIn);
}

export default function QuickManagePropertyPage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = useState<QuickManageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [message, setMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [form, setForm] = useState({
    guestName: "",
    guestPhone: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
    paymentMethod: "cash" as "cash" | "bank_transfer",
    reservationStatus: "confirmed" as "pending" | "confirmed",
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setPageError("");

      try {
        const response = await getQuickManageData(params.token);
        setData(response);
      } catch (error) {
        setPageError(
          error instanceof Error
            ? error.message
            : "Không thể tải giao diện quản lý nhanh.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (params.token) {
      loadData();
    }
  }, [params.token]);

  const nights = getNightCount(form.checkIn, form.checkOut);
  const directSubtotal = useMemo(() => {
    if (!data || nights <= 0) {
      return 0;
    }

    return Number((data.property.price * nights).toFixed(2));
  }, [data, nights]);

  const conflictSelected = useMemo(
    () =>
      data
        ? hasDateConflict(data.unavailableRanges, form.checkIn, form.checkOut)
        : false,
    [data, form.checkIn, form.checkOut],
  );

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyMessage("Đã sao chép liên kết quản lý nhanh.");
      window.setTimeout(() => setCopyMessage(""), 2200);
    } catch (_error) {
      setCopyMessage("Không thể sao chép liên kết trên trình duyệt này.");
      window.setTimeout(() => setCopyMessage(""), 2200);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!data) {
      return;
    }

    setIsSubmitting(true);
    setPageError("");
    setMessage("");

    try {
      const response = await createDirectBookingByToken(params.token, {
        guestName: form.guestName,
        guestPhone: form.guestPhone,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: Number(form.guests),
        paymentMethod: form.paymentMethod,
        reservationStatus: form.reservationStatus,
      });

      const refreshed = await getQuickManageData(params.token);
      setData(refreshed);
      setMessage(response.message || "Tạo đơn đặt phòng trực tiếp thành công!");
      setForm((current) => ({
        ...current,
        guestName: "",
        guestPhone: "",
        checkIn: "",
        checkOut: "",
        guests: "1",
      }));
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Không thể tạo đơn đặt phòng trực tiếp lúc này.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
        }}
      >
        Đang tải giao diện quản lý nhanh tại quầy...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "32px 20px 48px" }}>
        <div
          className="hs-card"
          style={{ maxWidth: 760, margin: "0 auto", padding: "34px 28px", textAlign: "center" }}
        >
          <AlertTriangle size={38} color="#d97706" style={{ marginBottom: 14 }} />
          <h1 style={{ fontWeight: 800, color: "#1e293b", fontSize: "1.7rem", marginBottom: 8 }}>
            Liên kết quản lý không khả dụng
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            {pageError || "Liên kết quản lý này không hợp lệ hoặc đã hết hạn truy cập."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 20px 48px" }}>
      <div style={{ maxWidth: 1260, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 20,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 999,
                padding: "7px 12px",
                background: "#eff6ff",
                color: "#2563eb",
                fontSize: "0.82rem",
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              <ShieldCheck size={15} />
              Quản lý chỗ nghỉ tại quầy
            </div>
            <h1 style={{ fontWeight: 800, color: "#1e293b", fontSize: "2rem", marginBottom: 8 }}>
              {data.property.title}
            </h1>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", color: "#64748b" }}>
              <StatusBadge status={data.property.status} />
              <span>{data.property.location}</span>
              <span>Chủ nhà: {data.property.hostName}</span>
            </div>
          </div>

          <div style={{ display: "grid", gap: 8, minWidth: 220 }}>
            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #cbd5e1",
                background: "#fff",
                color: "#1e293b",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <Copy size={15} />
              Sao chép liên kết nhanh
            </button>
            {copyMessage && (
              <div style={{ fontSize: "0.82rem", color: "#16a34a", textAlign: "center" }}>
                {copyMessage}
              </div>
            )}
          </div>
        </div>

        {(pageError || message) && (
          <div
            style={{
              marginBottom: 18,
              borderRadius: 12,
              padding: "12px 14px",
              border: `1px solid ${pageError ? "#fecaca" : "#bbf7d0"}`,
              background: pageError ? "#fef2f2" : "#f0fdf4",
              color: pageError ? "#b91c1c" : "#166534",
              fontSize: "0.84rem",
            }}
          >
            {pageError || message}
          </div>
        )}

        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="hs-stat-card">
              <div className="hs-stat-icon" style={{ background: "#eff6ff" }}>
                <DollarSign size={22} color="#2563EB" />
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, marginTop: 12 }}>
                Giá mỗi đêm
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#1e293b", marginTop: 4 }}>
                {formatCurrency(data.property.price)}
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="hs-stat-card">
              <div className="hs-stat-icon" style={{ background: "#dcfce7" }}>
                <Users size={22} color="#16a34a" />
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, marginTop: 12 }}>
                Sức chứa tối đa
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#1e293b", marginTop: 4 }}>
                {data.property.maxGuests} khách
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="hs-stat-card">
              <div className="hs-stat-icon" style={{ background: "#fef3c7" }}>
                <CalendarDays size={22} color="#d97706" />
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, marginTop: 12 }}>
                Đợt bận sắp tới
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#1e293b", marginTop: 4 }}>
                {data.unavailableRanges.length} khoảng ngày
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="hs-stat-card">
              <div className="hs-stat-icon" style={{ background: "#f3e8ff" }}>
                <Clock3 size={22} color="#7c3aed" />
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, marginTop: 12 }}>
                Hoa hồng tại quầy
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#1e293b", marginTop: 4 }}>
                {data.settings.directCommissionPercent.toFixed(2).replace(/\.00$/, "")}%
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-xl-5">
            <div className="hs-card" style={{ padding: 22 }}>
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ margin: 0, color: "#1e293b", fontWeight: 800, fontSize: "1.15rem" }}>
                  Đặt phòng trực tiếp tại quầy
                </h3>
                <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "0.84rem" }}>
                  Sử dụng liên kết này cho khách vãng lai hoặc khách gọi điện đặt phòng. Đơn tại quầy tự động khóa lịch và tính toán hoa hồng.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                    Tên khách hàng *
                  </label>
                  <input
                    className="hs-form-control"
                    required
                    value={form.guestName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, guestName: event.target.value }))
                    }
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                    Số điện thoại khách *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Phone size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      className="hs-form-control"
                      required
                      style={{ paddingLeft: 36 }}
                      value={form.guestPhone}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, guestPhone: event.target.value }))
                      }
                      placeholder="0987654321"
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                      Ngày nhận phòng *
                    </label>
                    <input
                      type="date"
                      required
                      className="hs-form-control"
                      value={form.checkIn}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, checkIn: event.target.value }))
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                      Ngày trả phòng *
                    </label>
                    <input
                      type="date"
                      required
                      className="hs-form-control"
                      value={form.checkOut}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, checkOut: event.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-4">
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                      Số khách
                    </label>
                    <select
                      className="hs-form-control"
                      value={form.guests}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, guests: event.target.value }))
                      }
                    >
                      {Array.from({ length: data.property.maxGuests }, (_, index) => (
                        <option key={index + 1} value={index + 1}>
                          {index + 1} khách
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                      Thanh toán
                    </label>
                    <select
                      className="hs-form-control"
                      value={form.paymentMethod}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          paymentMethod: event.target.value as "cash" | "bank_transfer",
                        }))
                      }
                    >
                      <option value="cash">Tiền mặt tại quầy</option>
                      <option value="bank_transfer">Chuyển khoản</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                      Trạng thái
                    </label>
                    <select
                      className="hs-form-control"
                      value={form.reservationStatus}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          reservationStatus: event.target.value as "pending" | "confirmed",
                        }))
                      }
                    >
                      <option value="confirmed">Xác nhận ngay</option>
                      <option value="pending">Giữ phòng tạm thời</option>
                    </select>
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 16,
                    border: "1px solid #dbeafe",
                    background: "#f8fbff",
                    padding: "14px 16px",
                    display: "grid",
                    gap: 6,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", fontSize: "0.88rem" }}>
                    <span>Số đêm lưu trú:</span>
                    <strong>{Math.max(nights, 0)} đêm</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", fontSize: "0.88rem" }}>
                    <span>Tổng tiền khách trả:</span>
                    <strong>{formatCurrency(directSubtotal)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", fontSize: "0.88rem" }}>
                    <span>Hoa hồng nền tảng (5%):</span>
                    <strong style={{ color: "#dc2626" }}>
                      -{formatCurrency(
                        Number(
                          (directSubtotal * data.settings.directCommissionRate).toFixed(2),
                        ),
                      )}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#1e293b", fontSize: "0.92rem", fontWeight: 800 }}>
                    <span>Chủ nhà thực nhận (95%):</span>
                    <span style={{ color: "#16a34a" }}>
                      {formatCurrency(
                        Number(
                          (
                            directSubtotal -
                            directSubtotal * data.settings.directCommissionRate
                          ).toFixed(2),
                        ),
                      )}
                    </span>
                  </div>
                </div>

                {conflictSelected && (
                  <div
                    style={{
                      borderRadius: 12,
                      border: "1px solid #fecaca",
                      background: "#fef2f2",
                      color: "#b91c1c",
                      padding: "12px 14px",
                      fontSize: "0.84rem",
                    }}
                  >
                    Khoảng ngày này bị trùng với một đơn đặt phòng khác. Vui lòng chọn khoảng ngày khác.
                  </div>
                )}

                <div
                  style={{
                    borderRadius: 12,
                    border: "1px solid #dbeafe",
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    padding: "12px 14px",
                    fontSize: "0.84rem",
                  }}
                >
                  Quy định nhận phòng sau 14:00 và trả phòng trước 12:00.
                </div>

                <button
                  type="submit"
                  className="btn-primary-hs"
                  disabled={isSubmitting || conflictSelected || nights <= 0}
                  style={{
                    opacity: isSubmitting || conflictSelected || nights <= 0 ? 0.7 : 1,
                    cursor:
                      isSubmitting || conflictSelected || nights <= 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {isSubmitting ? "Đang lưu đơn..." : "Tạo đơn đặt phòng tại quầy"}
                </button>
              </form>
            </div>
          </div>

          <div className="col-xl-7">
            <div className="hs-card" style={{ padding: 22, marginBottom: 20 }}>
              <div className="row g-4 align-items-center">
                <div className="col-lg-6">
                  <div
                    style={{
                      position: "relative",
                      borderRadius: 18,
                      overflow: "hidden",
                      minHeight: 260,
                      background: "#e2e8f0",
                    }}
                  >
                    <Image
                      src={data.property.image}
                      alt={data.property.title}
                      fill
                      sizes="(max-width: 1200px) 100vw, 50vw"
                      unoptimized={isBackendUploadImage(data.property.image)}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <h3 style={{ fontWeight: 800, color: "#1e293b", fontSize: "1.15rem", marginBottom: 10 }}>
                    Lịch phòng bận sắp tới
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: 16 }}>
                    Các đợt khách đã đặt trước được liệt kê tại đây giúp lễ tân tránh đặt trùng phòng tại quầy.
                  </p>
                  <div style={{ display: "grid", gap: 10, maxHeight: 240, overflowY: "auto" }}>
                    {data.unavailableRanges.length === 0 ? (
                      <div
                        style={{
                          borderRadius: 12,
                          border: "1px dashed #cbd5e1",
                          padding: "14px 16px",
                          color: "#64748b",
                          fontSize: "0.85rem",
                        }}
                      >
                        Chưa có lịch bận nào sắp tới.
                      </div>
                    ) : (
                      data.unavailableRanges.map((range, index) => (
                        <div
                          key={`${range.checkIn}-${range.checkOut}-${index}`}
                          style={{
                            borderRadius: 12,
                            border: "1px solid #e2e8f0",
                            background: "#fff",
                            padding: "12px 14px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.88rem" }}>
                              {range.checkIn} → {range.checkOut}
                            </div>
                            <div style={{ color: "#94a3b8", fontSize: "0.76rem" }}>
                              {range.status === "confirmed" ? "Đã xác nhận ở" : "Đang giữ chỗ"}
                            </div>
                          </div>
                          <StatusBadge status={range.status} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="hs-card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: "#1e293b", fontWeight: 800, fontSize: "1.05rem" }}>
                    Đơn đặt phòng gần đây
                  </h3>
                  <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.8rem" }}>
                    Bao gồm cả khách đặt online từ ứng dụng và khách đặt trực tiếp tại quầy.
                  </p>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="hs-table">
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Lưu trú</th>
                      <th>Nguồn</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Thanh toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "36px", color: "#94a3b8" }}>
                          Chưa có đơn đặt phòng nào cho homestay này.
                        </td>
                      </tr>
                    ) : (
                      data.recentBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.88rem" }}>
                              {booking.guestName}
                            </div>
                            <div style={{ color: "#94a3b8", fontSize: "0.76rem" }}>
                              {booking.guestPhone || booking.guestEmail || booking.bookingCode}
                            </div>
                          </td>
                          <td>
                            <div style={{ color: "#475569", fontSize: "0.84rem" }}>
                              {booking.checkIn} → {booking.checkOut}
                            </div>
                            <div style={{ color: "#94a3b8", fontSize: "0.76rem" }}>
                              {booking.nights} đêm • {booking.guests} khách
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                borderRadius: 999,
                                padding: "5px 10px",
                                background:
                                  booking.source === "host_direct" ? "#fff7ed" : "#eff6ff",
                                color:
                                  booking.source === "host_direct" ? "#c2410c" : "#2563eb",
                                fontSize: "0.76rem",
                                fontWeight: 700,
                              }}
                            >
                              {booking.source === "host_direct" ? "Tại quầy" : "Trực tuyến"}
                            </span>
                          </td>
                          <td style={{ fontWeight: 800, color: "#1e293b" }}>
                            {formatCurrency(booking.totalPrice)}
                          </td>
                          <td>
                            <StatusBadge status={booking.status} />
                          </td>
                          <td>
                            <PaymentStatusBadge status={booking.paymentStatus} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
