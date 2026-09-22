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
            : "Unable to load platform settings right now.",
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
      setSuccessMessage(response.message);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update platform settings right now.",
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
            Platform Settings
          </h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.82rem" }}>
            Adjust the exchange rate, commission rules, and the receiving bank
            account used in QR payment instructions.
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
                  USD to VND Rate
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
                {isLoading ? "..." : settings.usdToVndRate.toLocaleString("en-US")}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                Used to convert the booking total into a ready-to-pay VND QR
                amount.
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
                  Commission Rules
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
                Online bookings use the marketplace commission, while direct
                bookings can use a lower rate.
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
                  Direct bookings:{" "}
                  <strong>{isLoading ? "..." : formatPercentValue(settings.directCommissionPercent)}</strong>
                </div>
                <div>
                  Host keeps online:{" "}
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
                  Receiving Account
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
                  VietQR bank code:{" "}
                  <strong>{isLoading ? "..." : settings.paymentBankCode}</strong>
                </div>
                <div>
                  Used by:{" "}
                  <strong>guest bookings and quick-manage bank transfers</strong>
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
                Exchange Rate
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
                Example: `25000` means 1 USD = 25,000 VND.
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
                Online Commission (%)
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
                Applied to bookings created by guests on the website.
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
                Direct Booking Commission (%)
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
                Applied to quick direct bookings created from a homestay manage link.
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
                Payment Receiving Account
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                Guests will see this account in their bank transfer instructions
                and VietQR payment image.
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
                  Bank Code
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
                  Example: `TCB`, `VCB`, `MBBANK`. This code is used to generate VietQR.
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
                  Bank Name
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
                  Shown in the payment instruction card so guests know where to transfer.
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
                  Account Number
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
                  The generated QR and booking payment instructions will use this number.
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
                  Account Name
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
                  Enter the exact beneficiary name used by the bank account.
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
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
