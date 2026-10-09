"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ImageIcon, User } from "lucide-react";
import type { BookingRecord } from "@/services/bookingService";
import { StatusBadge } from "./StatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

interface BookingReviewDialogProps {
  booking: BookingRecord | null;
  title: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    decision: "approve" | "reject";
    hostNote: string;
    checkinInstructions: string;
    rejectionReason: string;
  }) => Promise<void> | void;
}

export function BookingReviewDialog({
  booking,
  title,
  submitLabel = "Lưu kết quả duyệt",
  isSubmitting = false,
  onClose,
  onSubmit,
}: BookingReviewDialogProps) {
  const [decision, setDecision] = useState<"approve" | "reject">("approve");
  const [hostNote, setHostNote] = useState("");
  const [checkinInstructions, setCheckinInstructions] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const isReviewable =
    booking?.status === "pending" && booking?.paymentStatus === "proof_uploaded";
  const amountInVnd = booking?.paymentInfo?.amountVnd || (booking?.totalPrice && booking?.totalPrice > 1000 ? booking?.totalPrice : 0);

  useEffect(() => {
    if (!booking) {
      return;
    }

    setDecision("approve");
    setHostNote(booking.hostNote || "");
    setCheckinInstructions(booking.checkinInstructions || "");
    setRejectionReason(booking.rejectionReason || "");
  }, [booking]);

  function handleDecisionChange(nextDecision: "approve" | "reject") {
    setDecision(nextDecision);

    if (nextDecision === "reject") {
      setCheckinInstructions("");
    }
  }

  if (!booking) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 30px 80px rgba(15, 23, 42, 0.25)",
          padding: 26,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: "1.15rem",
                color: "#1e293b",
                marginBottom: 4,
              }}
            >
              {title}
            </h3>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.86rem" }}>
              {isReviewable ? (
                <>
                  Kiểm tra đơn đặt phòng <strong>{booking.bookingCode}</strong> trước khi cập nhật kết quả xác nhận.
                </>
              ) : (
                <>
                  Đơn đặt phòng <strong>{booking.bookingCode}</strong> đã được xử lý và không thể chỉnh sửa lại.
                </>
              )}
            </p>
          </div>
          <button type="button" className="btn-outline-hs" onClick={onClose}>
            Đóng
          </button>
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <img
                src={booking.propertyImage || "/img/home1.png"}
                alt={booking.propertyTitle}
                onError={(e) => {
                  e.currentTarget.src = "/img/home1.png";
                }}
                style={{ width: "100%", height: 220, objectFit: "cover", background: "#f1f5f9" }}
              />
              <div style={{ padding: "16px 18px" }}>
                <div
                  style={{
                    fontWeight: 800,
                    color: "#1e293b",
                    fontSize: "1rem",
                    marginBottom: 4,
                  }}
                >
                  {booking.propertyTitle}
                </div>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "0.84rem",
                    marginBottom: 12,
                  }}
                >
                  {booking.propertyLocation}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <StatusBadge status={booking.status} />
                  <PaymentStatusBadge status={booking.paymentStatus} />
                </div>
              </div>
            </div>

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                  color: "#1e293b",
                  fontWeight: 700,
                }}
              >
                <User size={15} color="#2563EB" />
                Thông tin khách & Thanh toán
              </div>
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  fontSize: "0.84rem",
                }}
              >
                <div>
                  <strong style={{ color: "#1e293b" }}>{booking.guestName}</strong>
                  <div style={{ color: "#64748b" }}>{booking.guestEmail}</div>
                </div>
                <div style={{ color: "#475569" }}>
                  <CalendarDays
                    size={13}
                    color="#2563EB"
                    style={{ marginRight: 6, verticalAlign: "middle" }}
                  />
                  {booking.checkIn} đến {booking.checkOut} • {booking.nights} đêm
                </div>
                <div style={{ color: "#475569" }}>
                  Tổng tiền đặt phòng:{" "}
                  <strong style={{ color: "#1e293b" }}>
                    {new Intl.NumberFormat("vi-VN").format(booking.totalPrice)} ₫
                  </strong>
                </div>
                <div style={{ color: "#475569" }}>
                  Số tiền chuyển khoản:{" "}
                  <strong style={{ color: "#1e293b" }}>
                    {new Intl.NumberFormat("vi-VN").format(amountInVnd || booking.totalPrice)} ₫
                  </strong>
                </div>
                <div style={{ color: "#475569" }}>
                  Nội dung chuyển khoản:{" "}
                  <strong style={{ color: "#1e293b" }}>
                    {booking.paymentInfo.transferContent}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                padding: 18,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                  color: "#1e293b",
                  fontWeight: 700,
                }}
              >
                <ImageIcon size={15} color="#2563EB" />
                Ảnh chụp biên lai chuyển khoản
              </div>
              {booking.paymentProofImage ? (
                <img
                  src={booking.paymentProofImage}
                  alt="Biên lai thanh toán"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80";
                  }}
                  style={{
                    width: "100%",
                    maxHeight: 320,
                    objectFit: "contain",
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                  }}
                />
              ) : (
                <div
                  style={{
                    border: "1px dashed #cbd5e1",
                    borderRadius: 14,
                    padding: "30px 16px",
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  Chưa có ảnh biên lai nào được gửi lên.
                </div>
              )}
            </div>

            {isReviewable ? (
              <div className="row g-3">
                <div className="col-12">
                  <label className="hs-form-label">Quyết định xử lý</label>
                  <select
                    className="hs-form-control"
                    value={decision}
                    onChange={(event) =>
                      handleDecisionChange(
                        event.target.value as "approve" | "reject",
                      )
                    }
                  >
                    <option value="approve">Duyệt biên lai & Xác nhận đặt phòng thành công</option>
                    <option value="reject">Từ chối biên lai thanh toán</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="hs-form-label">Ghi chú của chủ nhà / quản trị</label>
                  <textarea
                    className="hs-form-control"
                    rows={3}
                    value={hostNote}
                    onChange={(event) => setHostNote(event.target.value)}
                    placeholder="Nhập ghi chú gửi cho khách..."
                  />
                </div>
                {decision === "approve" && (
                  <div className="col-12">
                    <label className="hs-form-label">Hướng dẫn nhận phòng</label>
                    <textarea
                      className="hs-form-control"
                      rows={3}
                      value={checkinInstructions}
                      onChange={(event) =>
                        setCheckinInstructions(event.target.value)
                      }
                      placeholder="Hướng dẫn quy trình nhận phòng, giao chìa khóa, mật khẩu cửa..."
                    />
                  </div>
                )}
                {decision === "reject" && (
                  <div className="col-12">
                    <label className="hs-form-label">Lý do từ chối</label>
                    <textarea
                      className="hs-form-control"
                      rows={3}
                      value={rejectionReason}
                      onChange={(event) => setRejectionReason(event.target.value)}
                      placeholder="Giải thích rõ lý do từ chối (VD: sai số tiền, sai nội dung CK, ảnh giả mạo)..."
                    />
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 12,
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: 18,
                  background: "#f8fafc",
                }}
              >
                {booking.confirmedAt && (
                  <div style={{ color: "#475569", fontSize: "0.84rem" }}>
                    Xử lý vào lúc:{" "}
                    <strong style={{ color: "#1e293b" }}>
                      {new Date(booking.confirmedAt).toLocaleString("vi-VN")}
                    </strong>
                  </div>
                )}
                {booking.confirmedByName && (
                  <div style={{ color: "#475569", fontSize: "0.84rem" }}>
                    Người kiểm duyệt:{" "}
                    <strong style={{ color: "#1e293b" }}>
                      {booking.confirmedByName}
                    </strong>
                  </div>
                )}
                {booking.hostNote && (
                  <div>
                    <div className="hs-form-label">Ghi chú phản hồi</div>
                    <div
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "12px 14px",
                        background: "#fff",
                        color: "#475569",
                        fontSize: "0.84rem",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {booking.hostNote}
                    </div>
                  </div>
                )}
                {booking.checkinInstructions && (
                  <div>
                    <div className="hs-form-label">Hướng dẫn nhận phòng</div>
                    <div
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "12px 14px",
                        background: "#fff",
                        color: "#475569",
                        fontSize: "0.84rem",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {booking.checkinInstructions}
                    </div>
                  </div>
                )}
                {booking.rejectionReason && (
                  <div>
                    <div className="hs-form-label">Lý do từ chối</div>
                    <div
                      style={{
                        border: "1px solid #fecaca",
                        borderRadius: 12,
                        padding: "12px 14px",
                        background: "#fef2f2",
                        color: "#b91c1c",
                        fontSize: "0.84rem",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {booking.rejectionReason}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isReviewable && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 18,
                  flexWrap: "wrap",
                }}
              >
                <button
                  className="btn-primary-hs"
                  disabled={isSubmitting}
                  onClick={() =>
                    onSubmit({
                      decision,
                      hostNote,
                      checkinInstructions:
                        decision === "approve" ? checkinInstructions : "",
                      rejectionReason,
                    })
                  }
                >
                  {isSubmitting ? "Đang xử lý..." : submitLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
