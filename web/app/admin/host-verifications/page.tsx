"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  User,
  FileText,
  Eye,
  Check,
  X,
  AlertCircle,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import {
  getAdminHostVerifications,
  reviewAdminHostVerification,
  type HostVerificationItem,
} from "@/services/hostVerificationService";
import { PaginationControls } from "@/components/shared/PaginationControls";

const ITEMS_PER_PAGE = 10;

function formatTimestamp(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatusBadge(status: HostVerificationItem["status"]) {
  switch (status) {
    case "pending":
      return { label: "Chờ duyệt hồ sơ", bg: "#fef3c7", color: "#b45309", border: "#fde68a" };
    case "approved":
      return { label: "Đã xác minh (Hợp lệ)", bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" };
    case "rejected":
      return { label: "Đã từ chối", bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" };
    default:
      return { label: "Chưa nộp hồ sơ", bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
  }
}

export default function AdminHostVerificationsPage() {
  const [verifications, setVerifications] = useState<HostVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal xem chi tiết & duyệt
  const [activeItem, setActiveItem] = useState<HostVerificationItem | null>(null);
  const [actionType, setActionType] = useState<"approved" | "rejected">("approved");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const data = await getAdminHostVerifications(statusFilter !== "all" ? statusFilter : undefined);
      setVerifications(data);
    } catch (err) {
      console.error("Lỗi tải danh sách xác minh:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
    setCurrentPage(1);
  }, [statusFilter]);

  const stats = useMemo(() => {
    const total = verifications.length;
    const pending = verifications.filter((v) => v.status === "pending").length;
    const approved = verifications.filter((v) => v.status === "approved").length;
    const rejected = verifications.filter((v) => v.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [verifications]);

  const filteredItems = useMemo(() => {
    return verifications.filter((v) => {
      const match =
        !search.trim() ||
        String(v.id_card_number || "").includes(search.trim()) ||
        v.host_name?.toLowerCase().includes(search.toLowerCase()) ||
        v.host_email?.toLowerCase().includes(search.toLowerCase()) ||
        v.host_phone?.toLowerCase().includes(search.toLowerCase());
      return match;
    });
  }, [verifications, search]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handleOpenReview = (item: HostVerificationItem, decision: "approved" | "rejected") => {
    setActiveItem(item);
    setActionType(decision);
    setRejectionReason(
      decision === "rejected"
        ? "Ảnh chụp CCCD bị mờ/lóa sáng, không đọc được số nhận dạng hoặc họ tên."
        : ""
    );
  };

  const handleProcessSubmit = async () => {
    if (!activeItem) return;
    if (actionType === "rejected" && !rejectionReason.trim()) {
      alert("Vui lòng cung cấp lý do từ chối để chủ nhà điều chỉnh.");
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewAdminHostVerification(activeItem.host_id, {
        decision: actionType,
        rejectionReason: rejectionReason.trim(),
      });
      alert(
        actionType === "approved"
          ? "✅ Đã phê duyệt xác minh danh tính Chủ nhà thành công! Chủ nhà đã được cấp tích xanh."
          : "✅ Đã từ chối hồ sơ xác minh với lý do cụ thể."
      );
      setActiveItem(null);
      fetchVerifications();
    } catch (err: any) {
      alert(err.message || "Lỗi khi xử lý hồ sơ xác minh.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck className="text-blue-600" size={28} />
            Xác minh Danh tính Chủ nhà (KYC)
          </h1>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "0.92rem" }}>
            Kiểm tra căn cước công dân (CCCD) và giấy phép kinh doanh của Chủ Homestay để bảo đảm uy tín nền tảng.
          </p>
        </div>
        <button
          onClick={fetchVerifications}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 16px",
            background: "#fff",
            border: "1px solid #cbd5e1",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.88rem",
            color: "#334155",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#fff", padding: "18px 20px", borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>
            Tổng hồ sơ nộp
            <FileText size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1e293b", marginTop: 8 }}>{stats.total}</div>
        </div>

        <div style={{ background: "#fff", padding: "18px 20px", borderRadius: 14, border: "1px solid #fde68a", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#b45309", fontSize: "0.85rem", fontWeight: 600 }}>
            Chờ kiểm duyệt CCCD
            <Clock size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#b45309", marginTop: 8 }}>
            {stats.pending}
            {stats.pending > 0 && (
              <span style={{ fontSize: "0.8rem", fontWeight: 700, background: "#fef3c7", color: "#b45309", padding: "3px 8px", borderRadius: 20, marginLeft: 8 }}>
                Cần duyệt
              </span>
            )}
          </div>
        </div>

        <div style={{ background: "#fff", padding: "18px 20px", borderRadius: 14, border: "1px solid #bbf7d0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#15803d", fontSize: "0.85rem", fontWeight: 600 }}>
            Đã cấp tích xanh
            <CheckCircle2 size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#15803d", marginTop: 8 }}>{stats.approved}</div>
        </div>

        <div style={{ background: "#fff", padding: "18px 20px", borderRadius: 14, border: "1px solid #fecaca", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#b91c1c", fontSize: "0.85rem", fontWeight: 600 }}>
            Hồ sơ từ chối
            <XCircle size={18} color="#dc2626" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#b91c1c", marginTop: 8 }}>{stats.rejected}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ background: "#fff", padding: 16, borderRadius: 14, border: "1px solid #e2e8f0", marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search size={17} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Tìm theo tên chủ nhà, email, số CCCD..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{
                width: "100%",
                padding: "9px 12px 9px 38px",
                borderRadius: 9,
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem",
                outline: "none",
                background: "#f8fafc",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { key: "all", label: "Tất cả" },
            { key: "pending", label: "Chờ duyệt" },
            { key: "approved", label: "Đã duyệt" },
            { key: "rejected", label: "Từ chối" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                fontSize: "0.84rem",
                fontWeight: 600,
                cursor: "pointer",
                border: statusFilter === tab.key ? "1px solid #2563eb" : "1px solid #e2e8f0",
                background: statusFilter === tab.key ? "#2563eb" : "#fff",
                color: statusFilter === tab.key ? "#fff" : "#475569",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
                <th style={{ padding: "14px 18px" }}>Chủ nhà</th>
                <th style={{ padding: "14px 18px" }}>Số CCCD / Hộ chiếu</th>
                <th style={{ padding: "14px 18px" }}>Hình ảnh giấy tờ</th>
                <th style={{ padding: "14px 18px" }}>Trạng thái</th>
                <th style={{ padding: "14px 18px" }}>Ngày nộp</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 8px" }} />
                    Đang tải danh sách hồ sơ xác minh...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
                    <AlertCircle size={32} style={{ margin: "0 auto 10px", color: "#cbd5e1" }} />
                    Không tìm thấy hồ sơ xác minh nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const badge = getStatusBadge(item.status);
                  const isPending = item.status === "pending";

                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                          <User size={15} color="#2563eb" />
                          {item.host_name || `Host #${item.host_id}`}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>{item.host_email || "—"}</div>
                        {item.host_phone && (
                          <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>{item.host_phone}</div>
                        )}
                      </td>

                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", background: "#f1f5f9", padding: "3px 8px", borderRadius: 6 }}>
                          {item.id_card_number}
                        </span>
                      </td>

                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {item.id_card_front_url && (
                            <a href={item.id_card_front_url} target="_blank" rel="noreferrer" title="Xem mặt trước CCCD">
                              <img
                                src={item.id_card_front_url}
                                alt="Mặt trước"
                                style={{ width: 50, height: 35, borderRadius: 6, objectFit: "cover", border: "1px solid #cbd5e1" }}
                              />
                            </a>
                          )}
                          {item.id_card_back_url && (
                            <a href={item.id_card_back_url} target="_blank" rel="noreferrer" title="Xem mặt sau CCCD">
                              <img
                                src={item.id_card_back_url}
                                alt="Mặt sau"
                                style={{ width: 50, height: 35, borderRadius: 6, objectFit: "cover", border: "1px solid #cbd5e1" }}
                              />
                            </a>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: 20,
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {badge.label}
                        </span>
                        {item.rejection_reason && (
                          <div style={{ fontSize: "0.76rem", color: "#dc2626", marginTop: 4, maxWidth: 200 }}>
                            {item.rejection_reason}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "14px 18px", verticalAlign: "middle", fontSize: "0.82rem", color: "#64748b" }}>
                        {formatTimestamp(item.created_at)}
                      </td>

                      <td style={{ padding: "14px 18px", verticalAlign: "middle", textAlign: "right" }}>
                        {isPending ? (
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button
                              onClick={() => handleOpenReview(item, "approved")}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "6px 12px",
                                background: "#16a34a",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                fontWeight: 700,
                                fontSize: "0.8rem",
                                cursor: "pointer",
                              }}
                            >
                              <Check size={14} /> Duyệt hồ sơ
                            </button>

                            <button
                              onClick={() => handleOpenReview(item, "rejected")}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "6px 10px",
                                background: "#fee2e2",
                                color: "#dc2626",
                                border: "1px solid #fecaca",
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: "0.8rem",
                                cursor: "pointer",
                              }}
                            >
                              <X size={14} /> Từ chối
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                            {item.reviewed_at ? `Đã xử lý lúc ${formatTimestamp(item.reviewed_at)}` : "Đã hoàn tất"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "12px 18px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.max(1, totalPages)}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal Duyệt / Từ chối hồ sơ */}
      {activeItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 520,
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: actionType === "approved" ? "#f0fdf4" : "#fef2f2",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {actionType === "approved" ? (
                  <CheckCircle2 size={22} color="#16a34a" />
                ) : (
                  <XCircle size={22} color="#dc2626" />
                )}
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: actionType === "approved" ? "#166534" : "#991b1b" }}>
                  {actionType === "approved" ? "Xác nhận duyệt hồ sơ CCCD" : "Từ chối hồ sơ xác minh"}
                </h3>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Chủ nhà:</span>
                  <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.88rem" }}>{activeItem.host_name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Email:</span>
                  <span style={{ color: "#334155", fontSize: "0.88rem" }}>{activeItem.host_email}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Số CCCD:</span>
                  <span style={{ fontWeight: 800, fontFamily: "monospace", color: "#0f172a", fontSize: "0.95rem" }}>{activeItem.id_card_number}</span>
                </div>

                {/* Hình ảnh 2 mặt */}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #cbd5e1" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569", marginBottom: 8 }}>Hình ảnh giấy tờ tải lên:</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Mặt trước CCCD:</div>
                      <a href={activeItem.id_card_front_url} target="_blank" rel="noreferrer">
                        <img src={activeItem.id_card_front_url} alt="Mặt trước" style={{ width: "100%", height: 100, borderRadius: 8, objectFit: "cover", border: "1px solid #cbd5e1" }} />
                      </a>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Mặt sau CCCD:</div>
                      <a href={activeItem.id_card_back_url} target="_blank" rel="noreferrer">
                        <img src={activeItem.id_card_back_url} alt="Mặt sau" style={{ width: "100%", height: 100, borderRadius: 8, objectFit: "cover", border: "1px solid #cbd5e1" }} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {actionType === "rejected" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Lý do từ chối hồ sơ:
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                    placeholder="VD: Ảnh chụp CCCD không rõ số hoặc họ tên..."
                  />
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                <button
                  onClick={() => setActiveItem(null)}
                  disabled={isSubmitting}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    color: "#475569",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  Đóng
                </button>

                <button
                  onClick={handleProcessSubmit}
                  disabled={isSubmitting}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: actionType === "approved" ? "#16a34a" : "#dc2626",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  {isSubmitting ? "Đang xử lý..." : actionType === "approved" ? "Xác nhận duyệt" : "Xác nhận từ chối"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
