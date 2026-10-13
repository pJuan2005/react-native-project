"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  RefreshCw,
  Building2,
  User,
  ArrowDownRight,
  Filter,
  Check,
  X,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import {
  getAdminWithdrawals,
  processAdminWithdrawal,
  type WithdrawalItem,
} from "@/services/withdrawalService";
import { PaginationControls } from "@/components/shared/PaginationControls";

const ITEMS_PER_PAGE = 10;

function formatPrice(amount: number) {
  return `${new Intl.NumberFormat("vi-VN").format(amount)} ₫`;
}

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

function getStatusBadge(status: WithdrawalItem["status"]) {
  switch (status) {
    case "pending":
      return { label: "Chờ duyệt & chuyển tiền", bg: "#fef3c7", color: "#b45309", border: "#fde68a" };
    case "processing":
      return { label: "Đang xử lý", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
    case "completed":
      return { label: "Đã chuyển tiền", bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" };
    case "rejected":
      return { label: "Đã từ chối", bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" };
    default:
      return { label: status, bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
  }
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal xử lý rút tiền
  const [activeItem, setActiveItem] = useState<WithdrawalItem | null>(null);
  const [actionType, setActionType] = useState<"completed" | "rejected">("completed");
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const data = await getAdminWithdrawals({ status: statusFilter !== "all" ? statusFilter : undefined, limit: 100 });
      setWithdrawals(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách rút tiền:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
    setCurrentPage(1);
  }, [statusFilter]);

  const stats = useMemo(() => {
    const total = withdrawals.length;
    const pending = withdrawals.filter((w) => w.status === "pending").length;
    const completed = withdrawals.filter((w) => w.status === "completed").length;
    const rejected = withdrawals.filter((w) => w.status === "rejected").length;
    const totalCompletedAmount = withdrawals
      .filter((w) => w.status === "completed")
      .reduce((sum, w) => sum + w.amount, 0);

    return { total, pending, completed, rejected, totalCompletedAmount };
  }, [withdrawals]);

  const filteredItems = useMemo(() => {
    return withdrawals.filter((item) => {
      const matchSearch =
        !search.trim() ||
        String(item.id).includes(search.trim()) ||
        item.userName?.toLowerCase().includes(search.toLowerCase()) ||
        item.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
        item.userPhone?.toLowerCase().includes(search.toLowerCase()) ||
        item.bankName.toLowerCase().includes(search.toLowerCase()) ||
        item.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.accountHolderName.toLowerCase().includes(search.toLowerCase());

      return matchSearch;
    });
  }, [withdrawals, search]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handleOpenActionModal = (item: WithdrawalItem, type: "completed" | "rejected") => {
    setActiveItem(item);
    setActionType(type);
    setAdminNote(
      type === "completed"
        ? `Đã chuyển khoản VietQR thành công đến ${item.bankName} - ${item.accountNumber}`
        : "Thông tin tài khoản ngân hàng không chính xác hoặc yêu cầu không hợp lệ."
    );
  };

  const handleProcessSubmit = async () => {
    if (!activeItem) return;
    if (!adminNote.trim()) {
      alert("Vui lòng nhập ghi chú xử lý để lưu vết kiểm toán hệ thống.");
      return;
    }

    setIsSubmitting(true);
    try {
      await processAdminWithdrawal(activeItem.id, {
        status: actionType,
        adminNote: adminNote.trim(),
      });
      alert(
        actionType === "completed"
          ? "✅ Đã xác nhận chuyển tiền thành công! Trạng thái đã được cập nhật."
          : "✅ Đã từ chối lệnh rút tiền! Số tiền đã được hoàn lại đầy đủ vào ví của người dùng."
      );
      setActiveItem(null);
      fetchWithdrawals();
    } catch (err: any) {
      alert(err.message || "Lỗi khi xử lý yêu cầu rút tiền.");
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
            <Wallet className="text-blue-600" size={28} />
            Quản lý yêu cầu rút tiền
          </h1>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "0.92rem" }}>
            Kiểm tra và duyệt các lệnh rút tiền từ ví người dùng về tài khoản ngân hàng cá nhân.
          </p>
        </div>
        <button
          onClick={fetchWithdrawals}
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
            Tổng số yêu cầu
            <CreditCard size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1e293b", marginTop: 8 }}>{stats.total}</div>
        </div>

        <div style={{ background: "#fff", padding: "18px 20px", borderRadius: 14, border: "1px solid #fde68a", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#b45309", fontSize: "0.85rem", fontWeight: 600 }}>
            Chờ duyệt chuyển tiền
            <Clock size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#b45309", marginTop: 8 }}>
            {stats.pending}
            {stats.pending > 0 && (
              <span style={{ fontSize: "0.8rem", fontWeight: 700, background: "#fef3c7", color: "#b45309", padding: "3px 8px", borderRadius: 20, marginLeft: 8 }}>
                Cần xử lý
              </span>
            )}
          </div>
        </div>

        <div style={{ background: "#fff", padding: "18px 20px", borderRadius: 14, border: "1px solid #bbf7d0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#15803d", fontSize: "0.85rem", fontWeight: 600 }}>
            Đã chuyển khoản
            <CheckCircle2 size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#15803d", marginTop: 8 }}>{stats.completed}</div>
          <div style={{ fontSize: "0.8rem", color: "#16a34a", marginTop: 4, fontWeight: 600 }}>
            Tổng tiền: {formatPrice(stats.totalCompletedAmount)}
          </div>
        </div>

        <div style={{ background: "#fff", padding: "18px 20px", borderRadius: 14, border: "1px solid #fecaca", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#b91c1c", fontSize: "0.85rem", fontWeight: 600 }}>
            Đã từ chối (Hoàn ví)
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
              placeholder="Tìm theo tên khách, email, ngân hàng, STK..."
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
            { key: "completed", label: "Đã chuyển" },
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
                <th style={{ padding: "14px 18px" }}>Mã / Thời gian</th>
                <th style={{ padding: "14px 18px" }}>Người yêu cầu</th>
                <th style={{ padding: "14px 18px" }}>Số tiền rút</th>
                <th style={{ padding: "14px 18px" }}>Tài khoản nhận tiền</th>
                <th style={{ padding: "14px 18px" }}>Trạng thái</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 8px" }} />
                    Đang tải danh sách yêu cầu rút tiền...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
                    <AlertCircle size={32} style={{ margin: "0 auto 10px", color: "#cbd5e1" }} />
                    Không tìm thấy yêu cầu rút tiền nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const badge = getStatusBadge(item.status);
                  const isPending = item.status === "pending";

                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}>
                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 700, color: "#1e293b" }}>#{item.id}</div>
                        <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 3 }}>
                          {formatTimestamp(item.createdAt)}
                        </div>
                      </td>

                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                          <User size={14} color="#64748b" />
                          {item.userName || `User #${item.userId}`}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>{item.userEmail || "—"}</div>
                        {item.userPhone && (
                          <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>{item.userPhone}</div>
                        )}
                      </td>

                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem" }}>
                          {formatPrice(item.amount)}
                        </div>
                      </td>

                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 700, color: "#1d4ed8", display: "flex", alignItems: "center", gap: 6 }}>
                          <Building2 size={15} />
                          {item.bankName} ({item.bankCode})
                        </div>
                        <div style={{ fontFamily: "monospace", fontSize: "0.92rem", fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                          {item.accountNumber}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#64748b", textTransform: "uppercase" }}>
                          {item.accountHolderName}
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
                        {item.adminNote && (
                          <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: 4, maxWidth: 220 }}>
                            {item.adminNote}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "14px 18px", verticalAlign: "middle", textAlign: "right" }}>
                        {isPending ? (
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button
                              onClick={() => handleOpenActionModal(item, "completed")}
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
                                boxShadow: "0 1px 2px rgba(22,163,74,0.3)",
                              }}
                              title="Xác nhận đã chuyển tiền VietQR cho khách"
                            >
                              <Check size={14} /> Duyệt chuyển tiền
                            </button>

                            <button
                              onClick={() => handleOpenActionModal(item, "rejected")}
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
                              title="Từ chối yêu cầu rút và hoàn lại tiền vào ví"
                            >
                              <X size={14} /> Từ chối
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                            {item.processedAt ? `Xử lý: ${formatTimestamp(item.processedAt)}` : "Đã hoàn tất"}
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

      {/* Modal Xử lý Duyệt / Từ chối rút tiền */}
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
              maxWidth: 480,
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
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
                background: actionType === "completed" ? "#f0fdf4" : "#fef2f2",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {actionType === "completed" ? (
                  <CheckCircle2 size={22} color="#16a34a" />
                ) : (
                  <XCircle size={22} color="#dc2626" />
                )}
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: actionType === "completed" ? "#166534" : "#991b1b" }}>
                  {actionType === "completed" ? "Xác nhận chuyển tiền" : "Từ chối yêu cầu rút tiền"}
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
              {/* Tóm tắt thông tin */}
              <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Người nhận:</span>
                  <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.88rem" }}>{activeItem.userName}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Ngân hàng:</span>
                  <span style={{ fontWeight: 700, color: "#1d4ed8", fontSize: "0.88rem" }}>{activeItem.bankName}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Số tài khoản:</span>
                  <span style={{ fontWeight: 800, fontFamily: "monospace", color: "#0f172a", fontSize: "0.95rem" }}>{activeItem.accountNumber}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Chủ tài khoản:</span>
                  <span style={{ fontWeight: 600, color: "#334155", fontSize: "0.88rem" }}>{activeItem.accountHolderName}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px dashed #cbd5e1", marginTop: 8 }}>
                  <span style={{ color: "#64748b", fontSize: "0.9rem", fontWeight: 600 }}>Số tiền chuyển:</span>
                  <span style={{ fontWeight: 900, color: actionType === "completed" ? "#16a34a" : "#dc2626", fontSize: "1.1rem" }}>
                    {formatPrice(activeItem.amount)}
                  </span>
                </div>
              </div>

              {actionType === "rejected" && (
                <div style={{ background: "#fef2f2", padding: "10px 14px", borderRadius: 8, border: "1px solid #fecaca", marginBottom: 14, fontSize: "0.82rem", color: "#991b1b" }}>
                  💡 Khi từ chối, toàn bộ số tiền <strong>{formatPrice(activeItem.amount)}</strong> sẽ được hệ thống hoàn trả lại vào ví của người dùng ngay lập tức.
                </div>
              )}

              {/* Nhập ghi chú */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  {actionType === "completed" ? "Ghi chú giao dịch chuyển khoản (VietQR / Mã GD):" : "Lý do từ chối yêu cầu rút:"}
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                  placeholder={actionType === "completed" ? "VD: Đã chuyển khoản VietQR thành công..." : "VD: Số tài khoản không đúng với tên chủ thẻ..."}
                />
              </div>

              {/* Action Buttons */}
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
                    background: actionType === "completed" ? "#16a34a" : "#dc2626",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  {isSubmitting ? "Đang xử lý..." : actionType === "completed" ? "Xác nhận đã chuyển" : "Xác nhận từ chối"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
