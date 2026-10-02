"use client";

import { useEffect, useState } from "react";
import { CreditCard, DollarSign, Percent, Save, Settings } from "lucide-react";
import {
  getAdminPlatformSettings,
  updateAdminPlatformSettings,
  type PlatformSettings,
} from "@/services/adminSettingsService";

function formatPercentValue(value: number) {
  return `${Number(value || 0).toFixed(2).replace(/\.00$/, "")}%`;
}

export function PlatformSettingsPanel() {
  const [settings, setSettings] = useState<PlatformSettings>({
    usdToVndRate: 25000,
    onlineCommissionRate: 0.1,
    directCommissionRate: 0.05,
    onlineCommissionPercent: 10,
    directCommissionPercent: 5,
    platformCommissionRate: 0.1,
    platformCommissionPercent: 10,
    paymentBankCode: "TCB",
    paymentBankName: "Techcombank",
    paymentAccountNumber: "19071766471019",
    paymentAccountName: "PHAM XUAN CHUAN",
  });
  const [formValues, setFormValues] = useState({
    usdToVndRate: "25000",
    onlineCommissionPercent: "10",
    directCommissionPercent: "5",
    paymentBankCode: "TCB",
    paymentBankName: "Techcombank",
    paymentAccountNumber: "19071766471019",
    paymentAccountName: "PHAM XUAN CHUAN",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const paymentAccountDisplay = settings.paymentAccountNumber.replace(
    /(\d{4})(?=\d)/g,
    "$1 ",
  );

  useEffect(() => {
    async function loadPlatformSettings() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getAdminPlatformSettings();
        setSettings(response.settings);
        setFormValues({
          usdToVndRate: String(response.settings.usdToVndRate),
          onlineCommissionPercent: String(
            response.settings.onlineCommissionPercent,
          ),
          directCommissionPercent: String(
            response.settings.directCommissionPercent,
          ),
          paymentBankCode: response.settings.paymentBankCode,
          paymentBankName: response.settings.paymentBankName,
          paymentAccountNumber: response.settings.paymentAccountNumber,
          paymentAccountName: response.settings.paymentAccountName,
        });
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Không thể tải cấu hình nền tảng lúc này.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPlatformSettings();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await updateAdminPlatformSettings({
        usdToVndRate: Number(formValues.usdToVndRate),
        onlineCommissionPercent: Number(formValues.onlineCommissionPercent),
        directCommissionPercent: Number(formValues.directCommissionPercent),
        paymentBankCode: formValues.paymentBankCode,
        paymentBankName: formValues.paymentBankName,
        paymentAccountNumber: formValues.paymentAccountNumber,
        paymentAccountName: formValues.paymentAccountName,
      });

      setSettings(response.settings);
      setFormValues({
        usdToVndRate: String(response.settings.usdToVndRate),
        onlineCommissionPercent: String(
          response.settings.onlineCommissionPercent,
        ),
        directCommissionPercent: String(
          response.settings.directCommissionPercent,
        ),
        paymentBankCode: response.settings.paymentBankCode,
        paymentBankName: response.settings.paymentBankName,
        paymentAccountNumber: response.settings.paymentAccountNumber,
        paymentAccountName: response.settings.paymentAccountName,
      });
      setSuccessMessage("Cập nhật cấu hình nền tảng thành công.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật cấu hình nền tảng lúc này.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="hs-card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Settings size={18} color="#2563EB" />
        </div>
        <div>
          <h3
            style={{
              margin: 0,
              color: "#1e293b",
              fontWeight: 800,
              fontSize: "1.05rem",
            }}
          >
            Cấu hình nền tảng
          </h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.82rem" }}>
            Điều chỉnh tỷ lệ hoa hồng trực tuyến, tỷ lệ đặt tại quầy và thông tin tài khoản ngân hàng nhận thanh toán VietQR.
          </p>
        </div>
      </div>

      <div style={{ padding: "22px 24px" }}>
        {errorMessage && (
          <div
            style={{
              marginBottom: 16,
              borderRadius: 12,
              padding: "12px 14px",
              border: "1px solid #fecaca",
              background: "#fef2f2",
              color: "#b91c1c",
              fontSize: "0.84rem",
            }}
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              marginBottom: 16,
              borderRadius: 12,
              padding: "12px 14px",
              border: "1px solid #bbf7d0",
              background: "#f0fdf4",
              color: "#15803d",
              fontSize: "0.84rem",
            }}
          >
            {successMessage}
          </div>
        )}

        <div className="row g-3" style={{ marginBottom: 20 }}>
          <div className="col-lg-4 col-md-6">
            <div
              style={{
                borderRadius: 18,
                border: "1px solid #dbeafe",
                background: "#f8fbff",
                padding: "18px 18px 16px",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <DollarSign size={18} color="#2563EB" />
                <div style={{ fontWeight: 700, color: "#1e293b" }}>
                  Tỷ giá quy đổi (USD / VND)
                </div>
              </div>
              <div
                style={{
                  fontSize: "1.55rem",
                  fontWeight: 800,
                  color: "#1e293b",
                  marginBottom: 4,
                }}
              >
                {isLoading ? "..." : settings.usdToVndRate.toLocaleString("vi-VN") + " ₫"}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                Áp dụng quy đổi chuẩn xác cho các giao dịch nội địa và quốc tế.
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div
              style={{
                borderRadius: 18,
                border: "1px solid #ede9fe",
                background: "#fbfaff",
                padding: "18px 18px 16px",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <Percent size={18} color="#7c3aed" />
                <div style={{ fontWeight: 700, color: "#1e293b" }}>
                  Quy tắc hoa hồng sàn
                </div>
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: "#1e293b",
                  marginBottom: 4,
                }}
              >
                {isLoading ? "..." : formatPercentValue(settings.onlineCommissionPercent)}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                Đơn đặt online áp dụng tỷ lệ sàn chuẩn, đơn trực tiếp tại quầy áp dụng mức phí ưu đãi.
              </div>
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid #ede9fe",
                  display: "grid",
                  gap: 5,
                  fontSize: "0.8rem",
                  color: "#475569",
                }}
              >
                <div>
                  Đơn tại quầy:{" "}
                  <strong>{isLoading ? "..." : formatPercentValue(settings.directCommissionPercent)}</strong>
                </div>
                <div>
                  Chủ nhà thực nhận online:{" "}
                  <strong>{formatPercentValue(100 - settings.onlineCommissionPercent)}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div
              style={{
                borderRadius: 18,
                border: "1px solid #dcfce7",
                background: "#f6fff8",
                padding: "18px 18px 16px",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <CreditCard size={18} color="#16a34a" />
                <div style={{ fontWeight: 700, color: "#1e293b" }}>
                  Tài khoản nhận thanh toán
                </div>
              </div>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "#1e293b",
                  marginBottom: 4,
                }}
              >
                {isLoading ? "..." : settings.paymentBankName}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                {isLoading
                  ? "..."
                  : `${paymentAccountDisplay} - ${settings.paymentAccountName}`}
              </div>
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid #dcfce7",
                  display: "grid",
                  gap: 5,
                  fontSize: "0.8rem",
                  color: "#475569",
                }}
              >
                <div>
                  Mã ngân hàng VietQR:{" "}
                  <strong>{isLoading ? "..." : settings.paymentBankCode}</strong>
                </div>
                <div>
                  Phục vụ:{" "}
                  <strong>thanh toán đơn đặt phòng khách hàng và đơn tại quầy</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label
                htmlFor="usdToVndRate"
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 700,
                  color: "#1e293b",
                  fontSize: "0.9rem",
                }}
              >
                Tỷ giá quy đổi (1 USD tương đương VND)
              </label>
              <input
                id="usdToVndRate"
                type="number"
                min="1"
                step="1"
                value={formValues.usdToVndRate}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    usdToVndRate: event.target.value,
                  }))
                }
                className="form-control"
                style={{ minHeight: 48, borderRadius: 14 }}
              />
              <div style={{ color: "#94a3b8", fontSize: "0.77rem", marginTop: 6 }}>
                Ví dụ: `25000` nghĩa là 1 USD = 25.000 VNĐ.
              </div>
            </div>

            <div className="col-md-6">
              <label
                htmlFor="onlineCommissionPercent"
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 700,
                  color: "#1e293b",
                  fontSize: "0.9rem",
                }}
              >
                Hoa hồng đơn đặt Online (%)
              </label>
              <input
                id="onlineCommissionPercent"
                type="number"
                min="0"
                max="99.99"
                step="0.01"
                value={formValues.onlineCommissionPercent}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    onlineCommissionPercent: event.target.value,
                  }))
                }
                className="form-control"
                style={{ minHeight: 48, borderRadius: 14 }}
              />
              <div style={{ color: "#94a3b8", fontSize: "0.77rem", marginTop: 6 }}>
                Áp dụng cho các đơn đặt phòng do khách tự đặt qua website hoặc ứng dụng di động.
              </div>
            </div>

            <div className="col-md-6">
              <label
                htmlFor="directCommissionPercent"
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 700,
                  color: "#1e293b",
                  fontSize: "0.9rem",
                }}
              >
                Hoa hồng đơn đặt trực tiếp tại quầy (%)
              </label>
              <input
                id="directCommissionPercent"
                type="number"
                min="0"
                max="99.99"
                step="0.01"
                value={formValues.directCommissionPercent}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    directCommissionPercent: event.target.value,
                  }))
                }
                className="form-control"
                style={{ minHeight: 48, borderRadius: 14 }}
              />
              <div style={{ color: "#94a3b8", fontSize: "0.77rem", marginTop: 6 }}>
                Áp dụng cho đơn trực tiếp do chủ homestay hoặc lễ tân tự tạo tại quầy.
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontWeight: 800,
                  color: "#1e293b",
                  fontSize: "0.98rem",
                  marginBottom: 4,
                }}
              >
                Tài khoản ngân hàng nhận tiền
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                Khách hàng sẽ nhìn thấy tài khoản này trong hướng dẫn chuyển khoản và mã VietQR.
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label
                  htmlFor="paymentBankCode"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 700,
                    color: "#1e293b",
                    fontSize: "0.9rem",
                  }}
                >
                  Mã ngân hàng (VietQR Bank Code)
                </label>
                <input
                  id="paymentBankCode"
                  type="text"
                  value={formValues.paymentBankCode}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      paymentBankCode: event.target.value.toUpperCase(),
                    }))
                  }
                  className="form-control"
                  style={{ minHeight: 48, borderRadius: 14, textTransform: "uppercase" }}
                />
                <div style={{ color: "#94a3b8", fontSize: "0.77rem", marginTop: 6 }}>
                  Ví dụ: `TCB`, `VCB`, `MBBANK`. Mã này dùng để sinh mã QR thanh toán chuẩn VietQR.
                </div>
              </div>

              <div className="col-md-6">
                <label
                  htmlFor="paymentBankName"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 700,
                    color: "#1e293b",
                    fontSize: "0.9rem",
                  }}
                >
                  Tên ngân hàng
                </label>
                <input
                  id="paymentBankName"
                  type="text"
                  value={formValues.paymentBankName}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      paymentBankName: event.target.value,
                    }))
                  }
                  className="form-control"
                  style={{ minHeight: 48, borderRadius: 14 }}
                />
                <div style={{ color: "#94a3b8", fontSize: "0.77rem", marginTop: 6 }}>
                  Hiển thị trong thẻ hướng dẫn chuyển khoản cho khách hàng.
                </div>
              </div>

              <div className="col-md-6">
                <label
                  htmlFor="paymentAccountNumber"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 700,
                    color: "#1e293b",
                    fontSize: "0.9rem",
                  }}
                >
                  Số tài khoản
                </label>
                <input
                  id="paymentAccountNumber"
                  type="text"
                  value={formValues.paymentAccountNumber}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      paymentAccountNumber: event.target.value,
                    }))
                  }
                  className="form-control"
                  style={{ minHeight: 48, borderRadius: 14 }}
                />
                <div style={{ color: "#94a3b8", fontSize: "0.77rem", marginTop: 6 }}>
                  Mã QR sinh ra và hướng dẫn chuyển khoản sẽ sử dụng số tài khoản này.
                </div>
              </div>

              <div className="col-md-6">
                <label
                  htmlFor="paymentAccountName"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 700,
                    color: "#1e293b",
                    fontSize: "0.9rem",
                  }}
                >
                  Tên chủ tài khoản
                </label>
                <input
                  id="paymentAccountName"
                  type="text"
                  value={formValues.paymentAccountName}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      paymentAccountName: event.target.value,
                    }))
                  }
                  className="form-control"
                  style={{ minHeight: 48, borderRadius: 14 }}
                />
                <div style={{ color: "#94a3b8", fontSize: "0.77rem", marginTop: 6 }}>
                  Nhập chính xác tên thụ hưởng trên tài khoản ngân hàng (viết hoa không dấu).
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="submit"
              className="btn-primary-hs"
              disabled={isLoading || isSaving}
              style={{
                minWidth: 180,
                opacity: isLoading || isSaving ? 0.7 : 1,
                cursor: isLoading || isSaving ? "not-allowed" : "pointer",
              }}
            >
              <Save size={16} />
              {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
