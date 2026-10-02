"use client";

import { useId } from "react";
import { CreditCard, ImageIcon, UploadCloud } from "lucide-react";
import type { BookingRecord } from "@/services/bookingService";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

interface PaymentInstructionsCardProps {
  booking: BookingRecord;
  uploadLabel?: string;
  isUploading?: boolean;
  uploadError?: string;
  uploadSuccess?: string;
  onUpload?: (file: File) => void;
  qrMaxWidth?: number;
}

export function PaymentInstructionsCard({
  booking,
  uploadLabel = "Tải lên biên lai thanh toán",
  isUploading = false,
  uploadError,
  uploadSuccess,
  onUpload,
  qrMaxWidth = 210,
}: PaymentInstructionsCardProps) {
  const inputId = useId();
  const canUpload =
    booking.status === "pending" &&
    ["unpaid", "rejected", "proof_uploaded"].includes(booking.paymentStatus);
  const amountVnd = booking.paymentInfo.amountVnd || (booking.totalPrice && booking.totalPrice > 1000 ? booking.totalPrice : 0);

  const accountNumberDisplay = booking.paymentInfo.accountNumber.replace(
    /(\d{4})(?=\d)/g,
    "$1 ",
  );

  return (
    <div
      className="hs-card"
      style={{
        padding: "22px 24px",
        background: "#fff",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <CreditCard size={16} color="#2563EB" />
            <h3
              style={{
                margin: 0,
                fontWeight: 800,
                color: "#1e293b",
                fontSize: "1.02rem",
              }}
            >
              Hướng dẫn chuyển khoản
            </h3>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.86rem" }}>
            Quét mã VietQR để ứng dụng ngân hàng tự động điền số tiền và nội dung chuyển khoản chính xác.
          </p>
          <p
            style={{
              margin: "6px 0 0",
              color: "#94a3b8",
              fontSize: "0.78rem",
            }}
          >
            Khoản thanh toán được bảo đảm và chuyển tới tài khoản ngân hàng chính thức của hệ thống.
          </p>
          <p
            style={{
              margin: "6px 0 0",
              color: "#1d4ed8",
              fontSize: "0.78rem",
              fontWeight: 600,
            }}
          >
            Quy định lưu trú: Giờ nhận phòng sau 14:00 và giờ trả phòng trước 12:00.
          </p>
        </div>
        <PaymentStatusBadge status={booking.paymentStatus} />
      </div>

      <div className="row g-3" style={{ marginBottom: 18 }}>
        <div className="col-md-7">
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: "18px 18px 14px",
              background: "#f8fafc",
            }}
          >
            {[
              ["Mã đặt phòng", booking.bookingCode],
              ["Ngân hàng", booking.paymentInfo.bankName],
              ["Số tài khoản", accountNumberDisplay],
              ["Chủ tài khoản", booking.paymentInfo.accountName],
              ["Tổng thanh toán", new Intl.NumberFormat("vi-VN").format(booking.totalPrice) + " ₫"],
              ["Số tiền chuyển khoản", new Intl.NumberFormat("vi-VN").format(amountVnd || booking.totalPrice) + " ₫"],
              ["Nội dung chuyển khoản", booking.paymentInfo.transferContent],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "7px 0",
                  borderBottom:
                    label === "Nội dung chuyển khoản"
                      ? "none"
                      : "1px solid #e2e8f0",
                }}
              >
                <span
                  style={{
                    color: "#64748b",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    color: "#1e293b",
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    textAlign: "right",
                    wordBreak: "break-word",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-5">
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: "16px",
              background: "#fff",
              textAlign: "center",
              height: "100%",
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                color: "#94a3b8",
                marginBottom: 10,
              }}
            >
              Mã QR VietQR
            </div>
            <img
              src={booking.paymentInfo.qrImageUrl}
              alt="Mã QR thanh toán"
              style={{
                width: "100%",
                maxWidth: qrMaxWidth,
                aspectRatio: "1 / 1",
                objectFit: "contain",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                padding: 8,
                background: "#fff",
              }}
            />
            <div
              style={{
                marginTop: 10,
                fontSize: "0.76rem",
                color: "#64748b",
                lineHeight: 1.6,
              }}
            >
              Mã QR được tạo với chính xác số tiền và nội dung chuyển khoản để hạn chế tối đa nhầm lẫn.
            </div>
          </div>
        </div>
      </div>

      {(booking.paymentSubmittedAt || booking.rejectionReason) && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: canUpload || booking.paymentProofImage ? 18 : 0,
          }}
        >
          {booking.paymentSubmittedAt && (
            <div
              style={{
                fontSize: "0.82rem",
                color: "#64748b",
                background: "#f8fafc",
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              Biên lai thanh toán đã gửi vào ngày{" "}
              <strong style={{ color: "#1e293b" }}>
                {new Date(booking.paymentSubmittedAt).toLocaleString("vi-VN")}
              </strong>
            </div>
          )}
          {booking.rejectionReason && (
            <div
              style={{
                fontSize: "0.82rem",
                color: "#b91c1c",
                background: "#fef2f2",
                borderRadius: 10,
                padding: "10px 12px",
                border: "1px solid #fecaca",
              }}
            >
              <strong>Lý do từ chối:</strong> {booking.rejectionReason}
            </div>
          )}
        </div>
      )}

      {(booking.paymentProofImage || canUpload) && (
        <div
          style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#1e293b",
                fontWeight: 700,
                fontSize: "0.92rem",
              }}
            >
              <ImageIcon size={16} color="#2563EB" />
              Biên lai thanh toán
            </div>
            {canUpload && onUpload && (
              <>
                <input
                  id={inputId}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }

                    onUpload(file);
                    event.currentTarget.value = "";
                  }}
                />
                <label
                  htmlFor={inputId}
                  className="btn-outline-hs"
                  style={{
                    cursor: isUploading ? "progress" : "pointer",
                    pointerEvents: isUploading ? "none" : "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    opacity: isUploading ? 0.7 : 1,
                  }}
                >
                  <UploadCloud size={14} />
                  {isUploading ? "Đang tải lên..." : uploadLabel}
                </label>
              </>
            )}
          </div>

          {booking.paymentProofImage ? (
            <img
              src={booking.paymentProofImage}
              alt="Biên lai thanh toán"
              style={{
                width: "100%",
                maxHeight: 360,
                objectFit: "cover",
                borderRadius: 14,
                border: "1px solid #e2e8f0",
              }}
            />
          ) : (
            <div
              style={{
                border: "1px dashed #cbd5e1",
                borderRadius: 14,
                padding: "24px 18px",
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "0.84rem",
              }}
            >
              Chưa có biên lai thanh toán nào được tải lên.
            </div>
          )}

          {uploadError && (
            <div
              style={{
                marginTop: 12,
                background: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: "0.82rem",
              }}
            >
              {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div
              style={{
                marginTop: 12,
                background: "#f0fdf4",
                color: "#166534",
                border: "1px solid #bbf7d0",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: "0.82rem",
              }}
            >
              {uploadSuccess}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
