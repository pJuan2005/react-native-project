"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  MessageSquare,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  User,
  XCircle,
  ExternalLink,
} from "lucide-react";
import {
  getAdminDisputes,
  resolveAdminDispute,
  type DisputeItem,
} from "@/services/disputeService";
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

function getStatusBadge(status: DisputeItem["status"]) {
  switch (status) {
    case "pending":
      return { label: "Chờ xử lý", bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
    case "investigating":
      return { label: "Đang điều tra", bg: "#f3e8ff", color: "#7c3aed", border: "#e9d5ff" };
    case "resolved":
      return { label: "Đã giải quyết", bg: "#dcfce7", color: "#166534", border: "#bbf7d0" };
    case "rejected":
      return { label: "Đã từ chối", bg: "#fee2e2", color: "#991b1b", border: "#fecaca" };
    default:
      return { label: status, bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
  }
}

function getTargetTypeLabel(type: DisputeItem["target_type"]) {
  switch (type) {
    case "booking":
      return "Đơn đặt phòng";
    case "property":
      return "Chỗ nghỉ";
    case "user":
      return "Người dùng";
    case "payment":
      return "Thanh toán";
    default:
      return type;
  }
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog State
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [resolveForm, setResolveForm] = useState({
    status: "resolved" as "investigating" | "resolved" | "rejected",
    adminNote: "",
    resolutionAction: "Đã xác minh và xử lý thỏa đáng cho các bên",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const data = await getAdminDisputes({ limit: 200, offset: 0 });
      setDisputes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn("Lỗi tải disputes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, targetFilter]);

  const filteredDisputes = useMemo(() => {
    return disputes.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        String(item.id).includes(q) ||
        (item.reporter_name && item.reporter_name.toLowerCase().includes(q)) ||
        (item.reporter_email && item.reporter_email.toLowerCase().includes(q)) ||
        (item.reason && item.reason.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        String(item.target_id).includes(q) ||
        String(item.booking_id || "").includes(q);

      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const matchTarget = targetFilter === "all" || item.target_type === targetFilter;

      return matchSearch && matchStatus && matchTarget;
    });
  }, [disputes, search, statusFilter, targetFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDisputes.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedDisputes = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredDisputes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredDisputes, safeCurrentPage]);

  const handleOpenResolve = (item: DisputeItem) => {
    setSelectedDispute(item);
    setResolveForm({
      status: item.status === "pending" ? "resolved" : (item.status as any),
      adminNote: item.admin_note || "",
      resolutionAction: item.resolution_action || "Đã xác minh và hòa giải thành công giữa Khách và Chủ nhà",
    });
    setFeedback(null);
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;

    if (!resolveForm.adminNote.trim()) {
      alert("Vui lòng nhập ghi chú / kết luận xử lý của ban quản trị.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resolveAdminDispute(selectedDispute.id, {
        status: resolveForm.status,
        adminNote: resolveForm.adminNote.trim(),
        resolutionAction: resolveForm.resolutionAction.trim(),
      });
      setFeedback({ type: "success", text: `Đã cập nhật khiếu nại #${selectedDispute.id} thành công!` });
      setSelectedDispute(null);
      fetchDisputes();
    } catch (err: any) {
      alert(err?.message || "Không thể xử lý khiếu nại lúc này.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "28px" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontWeight: 800,
              color: "#1e293b",
              marginBottom: 4,
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            <AlertTriangle size={24} color="#d97706" />
            Quản lý Khiếu nại & Tranh chấp
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "0.88rem" }}>
            Tiếp nhận, điều tra và phân xử công bằng các khiếu nại giữa Khách hàng và Chủ nhà để duy trì chuẩn mực dịch vụ sàn.
          </p>
        </div>

        <button
          onClick={fetchDisputes}
          className="btn-outline-hs"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}
        >
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            marginBottom: 20,
            fontSize: "0.85rem",
            fontWeight: 600,
            background: feedback.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${feedback.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            color: feedback.type === "success" ? "#16a34a" : "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} /> {feedback.text}
        </div>
      )}

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Tổng số khiếu nại", value: disputes.length, color: "#2563EB", bg: "#eff6ff" },
          {
            label: "Chờ xử lý (Cần giải quyết)",
            value: disputes.filter((d) => d.status === "pending").length,
            color: "#d97706",
            bg: "#fef3c7",
          },
          {
            label: "Đang điều tra / Hòa giải",
            value: disputes.filter((d) => d.status === "investigating").length,
            color: "#7c3aed",
            bg: "#f3e8ff",
          },
          {
            label: "Đã giải quyết / Đóng",
            value: disputes.filter((d) => d.status === "resolved" || d.status === "rejected").length,
            color: "#16a34a",
            bg: "#dcfce7",
          },
        ].map((item, idx) => (
          <div key={idx} className="col-6 col-md-3">
            <div style={{ background: item.bg, borderRadius: 14, padding: "16px 18px", textAlign: "center" }}>
              <div style={{ fontSize: "1.7rem", fontWeight: 900, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: "0.8rem", color: item.color, fontWeight: 700 }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
          <Search
            size={15}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
          />
          <input
            className="hs-form-control"
            placeholder="Tìm theo mã khiếu nại, người gửi, lý do, ID thực thể..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <Filter size={14} color="#64748b" />
          {[
            { key: "all", label: "Tất cả" },
            { key: "pending", label: "Chờ xử lý" },
            { key: "investigating", label: "Đang điều tra" },
            { key: "resolved", label: "Đã giải quyết" },
            { key: "rejected", label: "Từ chối" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: "0.8rem",
                border: `1.5px solid ${statusFilter === item.key ? "#2563EB" : "#e2e8f0"}`,
                background: statusFilter === item.key ? "#eff6ff" : "#fff",
                color: statusFilter === item.key ? "#2563EB" : "#64748b",
                fontWeight: statusFilter === item.key ? 700 : 500,
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Target Type Selector */}
        <select
          className="hs-form-control"
          style={{ width: "auto", padding: "6px 12px", fontSize: "0.8rem" }}
          value={targetFilter}
          onChange={(e) => setTargetFilter(e.target.value)}
        >
          <option value="all">Mọi loại thực thể</option>
          <option value="booking">Đơn đặt phòng</option>
          <option value="property">Chỗ nghỉ</option>
          <option value="user">Người dùng</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="hs-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid #e2e8f0",
            fontSize: "0.85rem",
            color: "#64748b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span>
            Hiển thị {filteredDisputes.length > 0 ? (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1 : 0} -{" "}
            {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredDisputes.length)} trên tổng số {filteredDisputes.length} khiếu nại
          </span>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            Trang {safeCurrentPage} / {totalPages}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="hs-table">
            <thead>
              <tr>
                <th>Mã / Thời gian</th>
                <th>Người khiếu nại</th>
                <th>Thực thể liên quan</th>
                <th>Lý do & Nội dung</th>
                <th>Trạng thái</th>
                <th>Người xử lý</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                    Đang tải danh sách khiếu nại...
                  </td>
                </tr>
              ) : paginatedDisputes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                    Không có khiếu nại nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedDisputes.map((item) => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <tr key={item.id}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <div style={{ fontWeight: 800, color: "#2563EB", fontSize: "0.88rem" }}>
                          #{item.id}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 3 }}>
                          <Clock size={11} /> {formatTimestamp(item.created_at)}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.87rem" }}>
                          {item.reporter_name || `User #${item.reporter_id}`}
                        </div>
                        {item.reporter_email && (
                          <div style={{ color: "#64748b", fontSize: "0.76rem" }}>{item.reporter_email}</div>
                        )}
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: 10,
                            background: item.reporter_role === "host" ? "#f3e8ff" : "#e0f2fe",
                            color: item.reporter_role === "host" ? "#6b21a8" : "#0369a1",
                            textTransform: "uppercase",
                          }}
                        >
                          {item.reporter_role}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.85rem" }}>
                          {getTargetTypeLabel(item.target_type)} #{item.target_id}
                        </div>
                        {item.booking_id && (
                          <div style={{ fontSize: "0.75rem", color: "#2563EB", fontFamily: "monospace", fontWeight: 700 }}>
                            Đơn: #{item.booking_id}
                          </div>
                        )}
                      </td>

                      <td style={{ maxWidth: 280 }}>
                        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.85rem" }}>
                          {item.reason}
                        </div>
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: "0.78rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginTop: 2,
                          }}
                          title={item.description}
                        >
                          {item.description}
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {item.resolved_by_name ? (
                          <div>
                            <span style={{ fontWeight: 600, color: "#1e293b" }}>{item.resolved_by_name}</span>
                            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{formatTimestamp(item.resolved_at)}</div>
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Chưa phân xử</span>
                        )}
                      </td>

                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => handleOpenResolve(item)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: item.status === "pending" ? "#2563EB" : "#eff6ff",
                            color: item.status === "pending" ? "#ffffff" : "#2563EB",
                            border: "1px solid #bfdbfe",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          {item.status === "pending" ? "Phân xử ngay" : "Xem / Đổi kết quả"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div style={{ marginTop: 20 }}>
        <PaginationControls
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={filteredDisputes.length}
          pageSize={ITEMS_PER_PAGE}
          itemLabel="khiếu nại"
          onPageChange={setCurrentPage}
        />
      </div>

      {/* MODAL: RESOLVE DISPUTE DIALOG */}
      {selectedDispute && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.65)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: 580,
              borderRadius: 20,
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              maxHeight: "92vh",
              overflowY: "auto",
              padding: 24,
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
                  <ShieldAlert size={20} color="#d97706" />
                  Xử lý Khiếu nại #{selectedDispute.id}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "3px 0 0" }}>
                  Người gửi: <strong>{selectedDispute.reporter_name}</strong> ({selectedDispute.reporter_email})
                </p>
              </div>
              <button onClick={() => setSelectedDispute(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <XCircle size={22} />
              </button>
            </div>

            {/* Dispute Detail Card */}
            <div style={{ background: "#f8fafc", borderRadius: 14, border: "1px solid #e2e8f0", padding: "14px 16px", marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>
                  Đối tượng: <strong style={{ color: "#2563EB" }}>{getTargetTypeLabel(selectedDispute.target_type)} #{selectedDispute.target_id}</strong>
                </span>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                  Gửi lúc: {formatTimestamp(selectedDispute.created_at)}
                </span>
              </div>

              <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#1e293b", marginBottom: 4 }}>
                Lý do: {selectedDispute.reason}
              </div>
              <p style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.6, margin: 0, background: "#ffffff", padding: "10px 12px", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                {selectedDispute.description}
              </p>

              {selectedDispute.evidence_url && (
                <div style={{ marginTop: 10, fontSize: "0.78rem" }}>
                  <span style={{ color: "#64748b" }}>Bằng chứng đính kèm: </span>
                  <a href={selectedDispute.evidence_url} target="_blank" rel="noreferrer" style={{ color: "#2563EB", fontWeight: 700, textDecoration: "underline" }}>
                    Xem ảnh chụp / tài liệu chứng minh
                  </a>
                </div>
              )}
            </div>

            {/* Resolve Form */}
            <form onSubmit={handleResolveSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                  Quyết định của Quản trị viên:
                </label>
                <select
                  className="hs-form-control"
                  style={{ fontSize: "0.85rem" }}
                  value={resolveForm.status}
                  onChange={(e) => setResolveForm((prev) => ({ ...prev, status: e.target.value as any }))}
                >
                  <option value="resolved">🟢 Đã giải quyết (Chấp thuận xử lý / Bồi thường)</option>
                  <option value="investigating">🟣 Đang điều tra (Yêu cầu chủ nhà / khách đối soát thêm)</option>
                  <option value="rejected">🔴 Bác bỏ / Từ chối (Khiếu nại không có căn cứ)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                  Biện pháp xử lý / Thỏa thuận hòa giải:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Đã hoàn 70% cọc vào ví người dùng / Nhắc nhở chủ nhà bảo dưỡng điều hòa"
                  value={resolveForm.resolutionAction}
                  onChange={(e) => setResolveForm((prev) => ({ ...prev, resolutionAction: e.target.value }))}
                  className="hs-form-control"
                  style={{ fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                  Ghi chú kết luận & Phản hồi cho các bên:
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Nhập nội dung kết luận điều tra và thông báo chính thức gửi cho Khách hàng và Chủ nhà..."
                  value={resolveForm.adminNote}
                  onChange={(e) => setResolveForm((prev) => ({ ...prev, adminNote: e.target.value }))}
                  className="hs-form-control"
                  style={{ fontSize: "0.85rem", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setSelectedDispute(null)}
                  style={{ padding: "8px 16px", borderRadius: 10, background: "#f1f5f9", border: "none", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", color: "#64748b" }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 10,
                    background: "#2563EB",
                    border: "none",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#fff",
                    cursor: "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Đang lưu..." : "Xác nhận & Cập nhật quyết định"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
