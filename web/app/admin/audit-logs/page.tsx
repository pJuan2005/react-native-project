"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Calendar,
  Clock,
  Filter,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  User,
} from "lucide-react";
import { getAdminAuditLogs, type AuditLogItem } from "@/services/adminAuditService";

function formatTimestamp(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getActionBadge(action: string) {
  switch (action) {
    case "property_approved":
    case "property_approve":
      return { label: "Duyệt chỗ nghỉ", bg: "#dcfce7", color: "#166534" };
    case "property_rejected":
    case "property_reject":
      return { label: "Từ chối chỗ nghỉ", bg: "#fee2e2", color: "#991b1b" };
    case "booking_confirmed":
    case "booking_review":
      return { label: "Duyệt đặt phòng", bg: "#eff6ff", color: "#1d4ed8" };
    case "booking_cancelled":
      return { label: "Hủy đặt phòng", bg: "#fee2e2", color: "#b91c1c" };
    case "user_status_changed":
      return { label: "Đổi trạng thái User", bg: "#fef3c7", color: "#92400e" };
    case "dispute_resolved":
      return { label: "Xử lý khiếu nại", bg: "#f3e8ff", color: "#7c3aed" };
    default:
      return { label: action, bg: "#f1f5f9", color: "#475569" };
  }
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAdminAuditLogs(100, 0);
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Lỗi tải audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        (log.actor_name && log.actor_name.toLowerCase().includes(q)) ||
        (log.entity_type && log.entity_type.toLowerCase().includes(q)) ||
        (log.metadata && log.metadata.toLowerCase().includes(q)) ||
        (log.ip_address && log.ip_address.includes(q));

      const matchAction =
        actionFilter === "all" || log.action.toLowerCase().includes(actionFilter);

      return matchSearch && matchAction;
    });
  }, [logs, search, actionFilter]);

  return (
    <div style={{ padding: "28px" }}>
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
              gap: 8,
            }}
          >
            <Shield size={24} color="#2563EB" />
            Nhật ký Kiểm toán Hệ thống (Audit Trail)
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Lưu vết và giám sát vĩnh viễn mọi hành động can thiệp dữ liệu nhạy cảm của Admin và Host.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="btn-outline-hs"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}
        >
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Tổng số bản ghi", value: logs.length, color: "#2563EB", bg: "#eff6ff" },
          {
            label: "Duyệt / Từ chối phòng",
            value: logs.filter((l) => l.action.includes("property")).length,
            color: "#16a34a",
            bg: "#dcfce7",
          },
          {
            label: "Thao tác đặt phòng",
            value: logs.filter((l) => l.action.includes("booking")).length,
            color: "#d97706",
            bg: "#fef3c7",
          },
          {
            label: "Khiếu nại & Tài khoản",
            value: logs.filter((l) => l.action.includes("user") || l.action.includes("dispute")).length,
            color: "#7c3aed",
            bg: "#f3e8ff",
          },
        ].map((item, idx) => (
          <div key={idx} className="col-6 col-md-3">
            <div style={{ background: item.bg, borderRadius: 12, padding: "16px 18px", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: "0.82rem", color: item.color, fontWeight: 600 }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <Search
            size={15}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
          />
          <input
            className="hs-form-control"
            placeholder="Tìm theo hành động, người thực hiện, thực thể hoặc IP..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <Filter size={14} color="#64748b" />
          {[
            { key: "all", label: "Tất cả" },
            { key: "property", label: "Chỗ nghỉ" },
            { key: "booking", label: "Đặt phòng" },
            { key: "user", label: "Người dùng" },
            { key: "dispute", label: "Khiếu nại" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActionFilter(item.key)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: "0.8rem",
                border: `1.5px solid ${actionFilter === item.key ? "#2563EB" : "#e2e8f0"}`,
                background: actionFilter === item.key ? "#eff6ff" : "#fff",
                color: actionFilter === item.key ? "#2563EB" : "#64748b",
                fontWeight: actionFilter === item.key ? 700 : 500,
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="hs-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0", fontSize: "0.85rem", color: "#64748b" }}>
          Hiển thị {filteredLogs.length} trên tổng số {logs.length} bản ghi kiểm toán
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="hs-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thực hiện</th>
                <th>Vai trò</th>
                <th>Hành động</th>
                <th>Thực thể</th>
                <th>Chi tiết / Ghi chú</th>
                <th>Địa chỉ IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                    Đang tải nhật ký kiểm toán...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                    Chưa có nhật ký kiểm toán nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem", color: "#475569" }}>
                        <Clock size={12} style={{ display: "inline", marginRight: 4 }} />
                        {formatTimestamp(log.created_at)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.87rem" }}>
                          {log.actor_name || (log.actor_id ? `ID #${log.actor_id}` : "Hệ thống")}
                        </div>
                        {log.actor_email && (
                          <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{log.actor_email}</div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 12,
                            background:
                              log.actor_role === "admin"
                                ? "#fce7f3"
                                : log.actor_role === "host"
                                ? "#f3e8ff"
                                : "#e0f2fe",
                            color:
                              log.actor_role === "admin"
                                ? "#9d174d"
                                : log.actor_role === "host"
                                ? "#6b21a8"
                                : "#0c4a6e",
                          }}
                        >
                          {log.actor_role?.toUpperCase() || "SYSTEM"}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            padding: "3px 9px",
                            borderRadius: 20,
                            background: badge.bg,
                            color: badge.color,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.84rem", color: "#1e293b", fontWeight: 600 }}>
                          {log.entity_type} #{log.entity_id}
                        </span>
                      </td>
                      <td style={{ maxWidth: 300, fontSize: "0.8rem", color: "#475569" }}>
                        <div
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={log.metadata || ""}
                        >
                          {log.metadata || "—"}
                        </div>
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "#94a3b8", fontFamily: "monospace" }}>
                        {log.ip_address || "127.0.0.1"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
