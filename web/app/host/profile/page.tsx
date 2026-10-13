"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Mail, MapPin, Phone, User, ShieldCheck, CheckCircle2, Clock, XCircle, FileText, Upload, Sparkles, Image as ImageIcon, Trash2 } from "lucide-react";
import { useAuth, getUserInitials } from "@/components/context/AuthContext";
import { AccountSettingsPanel } from "@/components/shared/AccountSettingsPanel";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getHostBookings } from "@/services/bookingService";
import { getHostProperties } from "@/services/propertyService";
import {
  getHostVerificationStatus,
  submitHostVerification,
  type HostVerificationItem,
} from "@/services/hostVerificationService";

export default function HostProfilePage() {
  const { user, isInitializing } = useAuth();
  const [stats, setStats] = useState({
    properties: 0,
    bookings: 0,
    pendingReviews: 0,
  });
  const [statsError, setStatsError] = useState("");

  // KYC Host Verification state
  const [verification, setVerification] = useState<HostVerificationItem | null>(null);
  const [loadingKyc, setLoadingKyc] = useState(true);
  const [showKycForm, setShowKycForm] = useState(false);
  const [idCardNumber, setIdCardNumber] = useState("");
  const [idCardFrontUrl, setIdCardFrontUrl] = useState("");
  const [idCardBackUrl, setIdCardBackUrl] = useState("");
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState("");
  const [submittingKyc, setSubmittingKyc] = useState(false);

  useEffect(() => {
    if (isInitializing || !user || user.role !== "Host") {
      return;
    }

    async function loadStats() {
      try {
        const [properties, bookings, kycData] = await Promise.all([
          getHostProperties(),
          getHostBookings(),
          getHostVerificationStatus(user?.id),
        ]);

        setStats({
          properties: properties.length,
          bookings: bookings.length,
          pendingReviews: bookings.filter(
            (booking) => booking.paymentStatus === "proof_uploaded",
          ).length,
        });

        if (kycData) {
          setVerification(kycData);
          if (kycData.id_card_number) {
            setIdCardNumber(kycData.id_card_number);
          }
          if (kycData.id_card_front_url) {
            setIdCardFrontUrl(kycData.id_card_front_url);
          }
          if (kycData.id_card_back_url) {
            setIdCardBackUrl(kycData.id_card_back_url);
          }
        }
      } catch (_error) {
        setStatsError("Không thể tải số liệu thống kê của chủ nhà lúc này.");
      } finally {
        setLoadingKyc(false);
      }
    }

    loadStats();
  }, [isInitializing, user]);

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>, target: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      alert("Dung lượng ảnh vượt quá 12MB. Vui lòng chọn ảnh nhỏ hơn.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (target === "front") {
        setIdCardFrontUrl(dataUrl);
      } else {
        setIdCardBackUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUseMockKyc = () => {
    setIdCardNumber("02409600" + Math.floor(1000 + Math.random() * 9000));
    setIdCardFrontUrl("https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80");
    setIdCardBackUrl("https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80");
    setBusinessLicenseUrl("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=80");
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCardNumber.trim() || idCardNumber.trim().length < 9) {
      alert("Vui lòng nhập số CCCD / Hộ chiếu hợp lệ (tối thiểu 9-12 chữ số).");
      return;
    }
    if (!idCardFrontUrl.trim() || !idCardBackUrl.trim()) {
      alert("Vui lòng cung cấp link hoặc ảnh CCCD 2 mặt (Mặt trước & Mặt sau).");
      return;
    }

    setSubmittingKyc(true);
    try {
      const res = await submitHostVerification({
        hostId: user?.id,
        idCardNumber: idCardNumber.trim(),
        idCardFrontUrl: idCardFrontUrl.trim(),
        idCardBackUrl: idCardBackUrl.trim(),
        businessLicenseUrl: businessLicenseUrl.trim() || undefined,
      });

      alert("🎉 Gửi hồ sơ xác minh thành công! Quản trị viên sẽ kiểm duyệt trong vòng 24 giờ.");
      setShowKycForm(false);
      // Reload verification status
      const updated = await getHostVerificationStatus(user?.id);
      if (updated) setVerification(updated);
    } catch (err: any) {
      alert(err.message || "Lỗi khi nộp hồ sơ xác minh.");
    } finally {
      setSubmittingKyc(false);
    }
  };

  if (isInitializing || !user || user.role !== "Host") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
        }}
      >
        Đang tải hồ sơ chủ nhà...
      </div>
    );
  }

  const initials = getUserInitials(user.name);
  const memberSince = user.joined
    ? new Date(user.joined).toLocaleDateString("vi-VN", {
        month: "2-digit",
        year: "numeric",
      })
    : "Tháng 01/2026";

  return (
    <div style={{ padding: "28px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontWeight: 800,
            color: "#1e293b",
            marginBottom: 4,
            fontSize: "1.5rem",
          }}
        >
          Hồ sơ Chủ Homestay
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Quản lý thông tin chủ nhà và cập nhật bảo mật tài khoản.
        </p>
      </div>

      {statsError && (
        <div
          style={{
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#c2410c",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 16,
            fontSize: "0.84rem",
          }}
        >
          {statsError}
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="hs-card" style={{ padding: "28px 22px" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2563EB, #7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  fontSize: "1.95rem",
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                {initials}
              </div>
              <h2
                style={{
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: 4,
                  fontSize: "1.08rem",
                }}
              >
                {user.name}
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.83rem", marginBottom: 12 }}>
                {user.email}
              </p>
              <StatusBadge status="Host" />
            </div>

            <div
              style={{
                borderTop: "1px solid #e2e8f0",
                paddingTop: 16,
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#64748b" }}>
                <Mail size={14} color="#2563EB" />
                <span>{user.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#64748b" }}>
                <Phone size={14} color="#2563EB" />
                <span>{user.phone || "Chưa cập nhật SĐT"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#64748b" }}>
                <MapPin size={14} color="#2563EB" />
                <span>{user.location || "Chưa cập nhật địa chỉ"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#64748b" }}>
                <CalendarDays size={14} color="#2563EB" />
                <span>Tham gia từ {memberSince}</span>
              </div>
            </div>
          </div>

          <div className="hs-card" style={{ padding: "18px 20px", marginTop: 16 }}>
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#94a3b8",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Thống kê hoạt động
            </div>
            {[
              { label: "Chỗ nghỉ quản lý", value: stats.properties, color: "#2563EB" },
              { label: "Đơn đặt phòng", value: stats.bookings, color: "#16a34a" },
              { label: "Đơn chờ kiểm tra biên lai", value: stats.pendingReviews, color: "#d97706" },
            ].map((item, index) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom:
                    index < 2 ? "1px solid #f1f5f9" : "none",
                }}
              >
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  {item.label}
                </span>
                <span style={{ fontWeight: 700, color: item.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-8">
          {/* Card Xác minh Danh tính KYC */}
          <div className="hs-card" style={{ padding: "24px 26px", marginBottom: 24, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <ShieldCheck size={22} color="#2563eb" />
                  Xác minh Danh tính Chủ nhà (KYC / CCCD)
                </h3>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.84rem" }}>
                  Bảo vệ uy tín tài khoản và tăng độ tin cậy với khách du lịch khi mở bán Homestay.
                </p>
              </div>

              {/* Status Badge */}
              {verification?.status === "approved" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 700, background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}>
                  <CheckCircle2 size={15} /> Đã xác minh (Tích xanh)
                </span>
              ) : verification?.status === "pending" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 700, background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" }}>
                  <Clock size={15} /> Chờ Admin duyệt CCCD
                </span>
              ) : verification?.status === "rejected" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 700, background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca" }}>
                  <XCircle size={15} /> Hồ sơ bị từ chối
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 700, background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>
                  Chưa nộp hồ sơ CCCD
                </span>
              )}
            </div>

            {verification?.status === "approved" ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "16px", borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#15803d", fontWeight: 700, fontSize: "0.95rem" }}>
                  <CheckCircle2 size={20} />
                  Hồ sơ CCCD đã được phê duyệt hợp lệ!
                </div>
                <div style={{ marginTop: 8, fontSize: "0.86rem", color: "#166534" }}>
                  Số CCCD / Hộ chiếu: <strong>{verification.id_card_number}</strong>
                </div>
                <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 4 }}>
                  Tài khoản của bạn đã được chứng thực chính chủ và có huy hiệu uy tín trên toàn bộ sàn Homestay.
                </div>
              </div>
            ) : verification?.status === "pending" ? (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "16px", borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#b45309", fontWeight: 700, fontSize: "0.92rem" }}>
                  <Clock size={18} />
                  Hồ sơ CCCD #{verification.id_card_number} đang chờ Ban Quản Trị kiểm duyệt
                </div>
                <p style={{ margin: "6px 0 0", fontSize: "0.83rem", color: "#78350f" }}>
                  Ban Quản Trị sẽ đối soát ảnh 2 mặt CCCD và phản hồi trong vòng 24 giờ. Bạn vẫn có thể chuẩn bị đăng chỗ nghỉ trong thời gian này.
                </p>
              </div>
            ) : (
              <div>
                {verification?.status === "rejected" && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "12px 14px", borderRadius: 10, marginBottom: 16, fontSize: "0.85rem", color: "#991b1b" }}>
                    ❌ <strong>Lý do từ chối:</strong> {verification.rejection_reason || "Ảnh chụp không rõ ràng."} Vui lòng nộp lại thông tin chính xác bên dưới.
                  </div>
                )}

                {!showKycForm && verification?.status !== "rejected" ? (
                  <div style={{ background: "#f8fafc", padding: "18px 20px", borderRadius: 12, border: "1px dashed #cbd5e1", textAlign: "center" }}>
                    <p style={{ color: "#475569", fontSize: "0.88rem", margin: "0 0 12px" }}>
                      Bạn chưa nộp hồ sơ CCCD / Hộ chiếu để xác minh danh tính Chủ nhà.
                    </p>
                    <button
                      onClick={() => setShowKycForm(true)}
                      style={{ padding: "8px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
                    >
                      Bắt đầu xác minh ngay
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitKyc} style={{ background: "#f8fafc", padding: "20px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }}>
                        Nhập thông tin giấy tờ tùy thân
                      </span>
                      <button
                        type="button"
                        onClick={handleUseMockKyc}
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: "0.78rem", color: "#2563eb", fontWeight: 700, cursor: "pointer" }}
                        title="Điền nhanh ảnh CCCD mẫu 1 chạm"
                      >
                        <Sparkles size={13} /> Dùng ảnh mẫu CCCD test
                      </button>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: "block", fontSize: "0.83rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                        Số CCCD / CMND / Hộ chiếu (*):
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 024096001234"
                        value={idCardNumber}
                        onChange={(e) => setIdCardNumber(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.88rem", outline: "none" }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                      {/* Mặt trước CCCD */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.83rem", fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                          Ảnh mặt trước CCCD (*):
                        </label>
                        {idCardFrontUrl ? (
                          <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1.5px solid #bfdbfe", background: "#f0f9ff" }}>
                            <img src={idCardFrontUrl} alt="Mặt trước CCCD" style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                            <div style={{ padding: "6px 8px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "0.74rem", color: "#16a34a", fontWeight: 700 }}>✓ Đã chọn mặt trước</span>
                              <label
                                htmlFor="cccd-front-picker"
                                style={{ fontSize: "0.74rem", color: "#2563eb", fontWeight: 700, cursor: "pointer" }}
                              >
                                Đổi ảnh
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="cccd-front-picker"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              height: 110,
                              borderRadius: 10,
                              border: "2px dashed #93c5fd",
                              background: "#eff6ff",
                              cursor: "pointer",
                              padding: 8,
                              textAlign: "center",
                            }}
                          >
                            <Upload size={22} color="#2563eb" style={{ marginBottom: 4 }} />
                            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2563eb" }}>Chọn ảnh mặt trước</span>
                            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>PNG, JPG từ máy tính</span>
                          </label>
                        )}
                        <input
                          id="cccd-front-picker"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePickFile(e, "front")}
                          style={{ display: "none" }}
                        />
                      </div>

                      {/* Mặt sau CCCD */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.83rem", fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                          Ảnh mặt sau CCCD (*):
                        </label>
                        {idCardBackUrl ? (
                          <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1.5px solid #bfdbfe", background: "#f0f9ff" }}>
                            <img src={idCardBackUrl} alt="Mặt sau CCCD" style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                            <div style={{ padding: "6px 8px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "0.74rem", color: "#16a34a", fontWeight: 700 }}>✓ Đã chọn mặt sau</span>
                              <label
                                htmlFor="cccd-back-picker"
                                style={{ fontSize: "0.74rem", color: "#2563eb", fontWeight: 700, cursor: "pointer" }}
                              >
                                Đổi ảnh
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="cccd-back-picker"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              height: 110,
                              borderRadius: 10,
                              border: "2px dashed #93c5fd",
                              background: "#eff6ff",
                              cursor: "pointer",
                              padding: 8,
                              textAlign: "center",
                            }}
                          >
                            <Upload size={22} color="#2563eb" style={{ marginBottom: 4 }} />
                            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2563eb" }}>Chọn ảnh mặt sau</span>
                            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>PNG, JPG từ máy tính</span>
                          </label>
                        )}
                        <input
                          id="cccd-back-picker"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePickFile(e, "back")}
                          style={{ display: "none" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
                      {verification?.status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => setShowKycForm(false)}
                          style={{ padding: "8px 14px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: "0.84rem", color: "#64748b", cursor: "pointer" }}
                        >
                          Hủy
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={submittingKyc}
                        style={{ padding: "8px 20px", background: "#2563eb", border: "none", borderRadius: 8, fontSize: "0.86rem", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                      >
                        {submittingKyc ? "Đang gửi hồ sơ..." : "Gửi hồ sơ xác minh CCCD"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          <AccountSettingsPanel
            user={user}
            profileTitle="Thông tin cá nhân chủ nhà"
            passwordTitle="Đổi mật khẩu tài khoản"
          />
        </div>
      </div>
    </div>
  );
}
