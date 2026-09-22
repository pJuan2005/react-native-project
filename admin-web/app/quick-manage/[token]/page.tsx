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
  return `$${Number(value || 0).toFixed(2)}`;
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
            : "Unable to load the quick management view.",
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
      setCopyMessage("Quick link copied.");
      window.setTimeout(() => setCopyMessage(""), 2200);
    } catch (_error) {
      setCopyMessage("Unable to copy the link on this browser.");
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
      setMessage(response.message);
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
          : "Unable to create the direct booking right now.",
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
        Loading quick management view...
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
            Quick management unavailable
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            {pageError || "This management link is invalid or has expired."}
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
              Property Quick Manage
            </div>
            <h1 style={{ fontWeight: 800, color: "#1e293b", fontSize: "2rem", marginBottom: 8 }}>
              {data.property.title}
            </h1>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", color: "#64748b" }}>
              <StatusBadge status={data.property.status} />
              <span>{data.property.location}</span>
              <span>Host: {data.property.hostName}</span>
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
              Copy Quick Link
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
                Price per night
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
                Capacity
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#1e293b", marginTop: 4 }}>
                {data.property.maxGuests} guests
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="hs-stat-card">
              <div className="hs-stat-icon" style={{ background: "#fef3c7" }}>
                <CalendarDays size={22} color="#d97706" />
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, marginTop: 12 }}>
                Upcoming busy periods
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#1e293b", marginTop: 4 }}>
                {data.unavailableRanges.length}
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="hs-stat-card">
              <div className="hs-stat-icon" style={{ background: "#f3e8ff" }}>
                <Clock3 size={22} color="#7c3aed" />
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, marginTop: 12 }}>
                Direct commission
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
                  Create Direct Booking
                </h3>
                <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "0.84rem" }}>
                  Use this quick link for walk-in guests or phone reservations. Direct bookings still block the calendar and flow into admin reports.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                    Guest name
                  </label>
                  <input
                    className="hs-form-control"
                    value={form.guestName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, guestName: event.target.value }))
                    }
                    placeholder="Nguyen Van A"
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                    Guest phone
                  </label>
                  <div style={{ position: "relative" }}>
                    <Phone size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      className="hs-form-control"
                      style={{ paddingLeft: 36 }}
                      value={form.guestPhone}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, guestPhone: event.target.value }))
                      }
                      placeholder="0900..."
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                      Check-in
                    </label>
                    <input
                      type="date"
                      className="hs-form-control"
                      value={form.checkIn}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, checkIn: event.target.value }))
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                      Check-out
                    </label>
                    <input
                      type="date"
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
                      Guests
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
                          {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                      Payment
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
                      <option value="cash">Cash at store</option>
                      <option value="bank_transfer">Bank transfer</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                      Reservation
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
                      <option value="confirmed">Confirmed now</option>
                      <option value="pending">Reserve and pay later</option>
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
                    <span>Total nights</span>
                    <strong>{Math.max(nights, 0)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", fontSize: "0.88rem" }}>
                    <span>Gross booking value</span>
                    <strong>{formatCurrency(directSubtotal)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", fontSize: "0.88rem" }}>
                    <span>Platform commission</span>
                    <strong>
                      {formatCurrency(
                        Number(
                          (directSubtotal * data.settings.directCommissionRate).toFixed(2),
                        ),
                      )}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#1e293b", fontSize: "0.92rem", fontWeight: 800 }}>
                    <span>Host payout</span>
                    <span>
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
                    These dates overlap with an existing reservation. Choose another range before saving.
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
                  Standard check-in is after 2:00 PM and check-out is before 12:00 PM.
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
                  {isSubmitting ? "Saving booking..." : "Create Direct Booking"}
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
                    Availability snapshot
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: 16 }}>
                    Upcoming busy ranges are listed here so staff can avoid double-booking at the front desk.
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
                        No upcoming busy periods yet.
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
                              {range.status === "confirmed" ? "Confirmed stay" : "Pending hold"}
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
                    Recent Bookings
                  </h3>
                  <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.8rem" }}>
                    Includes online guests and direct reservations created from this quick link.
                  </p>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="hs-table">
                  <thead>
                    <tr>
                      <th>Guest</th>
                      <th>Stay</th>
                      <th>Source</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "36px", color: "#94a3b8" }}>
                          No bookings yet for this homestay.
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
                              {booking.nights} nights • {booking.guests} guests
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
                              {booking.source === "host_direct" ? "Direct" : "Online"}
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
