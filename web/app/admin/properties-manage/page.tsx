"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Edit2,
  ExternalLink,
  Eye,
  Filter,
  MapPin,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  deleteProperty,
  getAdminProperties,
  type PropertySummary,
} from "@/services/propertyService";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { isBackendUploadImage } from "@/lib/image";

const STATUS_OPTIONS = [
  { key: "all", label: "Tất cả" },
  { key: "approved", label: "Đã duyệt" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "rejected", label: "Từ chối" },
] as const;

const ITEMS_PER_PAGE = 8;

function formatCurrency(value: number | string | undefined) {
  const amount = Number(value || 0);
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

export default function ManagePropertiesPage() {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const data = await getAdminProperties();
        setProperties(data);
      } catch (_error) {
        setNotice("Không thể tải danh sách chỗ nghỉ lúc này.");
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  const filtered = useMemo(() => {
    return properties.filter((property) => {
      const query = search.toLowerCase();
      const matchSearch =
        !query ||
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.hostName.toLowerCase().includes(query);

      const matchStatus =
        statusFilter === "all" || property.status.toLowerCase() === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [properties, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProperties = filtered.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  async function handleDelete(id: number) {
    try {
      await deleteProperty(id);
      setProperties((prev) => prev.filter((property) => property.id !== id));
      setNotice("Đã xóa chỗ nghỉ thành công.");
    } catch (_error) {
      setNotice("Không thể xóa chỗ nghỉ.");
    } finally {
      setDeleteConfirm(null);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          padding: "28px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <div style={{ textAlign: "center", color: "#64748b" }}>
          Đang tải danh sách chỗ nghỉ...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px" }}>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontWeight: 800,
                color: "#1e293b",
                marginBottom: 4,
                fontSize: "1.5rem",
              }}
            >
              Quản lý Chỗ nghỉ
            </h1>
            <p style={{ color: "#64748b", margin: 0 }}>
              Giám sát toàn bộ chỗ nghỉ, homestay và villa đăng ký trên nền tảng.
            </p>
          </div>

          <Link href="/admin/quick-manage-links">
            <button className="btn-outline-hs">Mở Quản lý Liên kết Nhanh</button>
          </Link>
        </div>
      </div>

      {notice && (
        <div
          style={{
            marginBottom: 18,
            padding: "12px 16px",
            borderRadius: 10,
            background: "#eff6ff",
            color: "#1d4ed8",
            fontWeight: 600,
          }}
        >
          {notice}
        </div>
      )}

      <div className="row g-3 mb-4">
        {[
          { label: "Tổng số", value: properties.length, color: "#2563eb", bg: "#eff6ff" },
          {
            label: "Đã phê duyệt",
            value: properties.filter((property) => property.status === "approved").length,
            color: "#16a34a",
            bg: "#dcfce7",
          },
          {
            label: "Chờ phê duyệt",
            value: properties.filter((property) => property.status === "pending").length,
            color: "#d97706",
            bg: "#fef3c7",
          },
          {
            label: "Bị từ chối",
            value: properties.filter((property) => property.status === "rejected").length,
            color: "#dc2626",
            bg: "#fee2e2",
          },
        ].map((item) => (
          <div key={item.label} className="col-6 col-md-3">
            <div
              style={{
                background: item.bg,
                borderRadius: 10,
                padding: "14px 18px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: item.color,
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: item.color,
                  fontWeight: 600,
                }}
              >
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            className="hs-form-control"
            placeholder="Tìm theo tên homestay, địa điểm hoặc tên chủ nhà..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <Filter size={14} color="#64748b" />
          {STATUS_OPTIONS.map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: "0.8rem",
                border: `1.5px solid ${
                  statusFilter === item.key ? "#2563eb" : "#e2e8f0"
                }`,
                background: statusFilter === item.key ? "#eff6ff" : "#fff",
                color: statusFilter === item.key ? "#2563eb" : "#64748b",
                fontWeight: statusFilter === item.key ? 700 : 500,
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hs-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid #e2e8f0",
            fontSize: "0.85rem",
            color: "#64748b",
          }}
        >
          Hiển thị {paginatedProperties.length} trên tổng số {filtered.length} chỗ nghỉ phù hợp
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="hs-table">
            <thead>
              <tr>
                <th>Chỗ nghỉ</th>
                <th>Chủ nhà</th>
                <th>Địa điểm</th>
                <th>Loại hình</th>
                <th>Giá / đêm</th>
                <th>Đánh giá</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}
                  >
                    Không tìm thấy chỗ nghỉ nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedProperties.map((property) => (
                  <tr key={property.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Image
                          src={property.image}
                          alt={property.title}
                          width={46}
                          height={46}
                          sizes="46px"
                          unoptimized={isBackendUploadImage(property.image)}
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 8,
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#1e293b",
                              fontSize: "0.88rem",
                              maxWidth: 160,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {property.title}
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                            {property.bedrooms} phòng ngủ • Tối đa {property.maxGuests} khách
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.87rem", color: "#475569" }}>
                      {property.hostName}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "0.85rem",
                          color: "#64748b",
                        }}
                      >
                        <MapPin size={12} color="#94a3b8" />
                        {property.city}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#eff6ff",
                          color: "#2563eb",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: 20,
                        }}
                      >
                        {property.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: "#1e293b" }}>
                      {formatCurrency(property.price)}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontWeight: 700, fontSize: "0.87rem" }}>
                          {Number(property.rating).toFixed(1)}
                        </span>
                        <span style={{ color: "#94a3b8", fontSize: "0.77rem" }}>
                          ({property.reviews})
                        </span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={property.status} />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link href={`/admin/properties/${property.id}`} title="Xem chi tiết">
                          <button
                            style={{
                              padding: "6px 9px",
                              borderRadius: 7,
                              border: "1px solid #e2e8f0",
                              background: "#fff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Eye size={13} color="#64748b" />
                          </button>
                        </Link>
                        <Link href={`/admin/edit-property/${property.id}`} title="Chỉnh sửa chỗ nghỉ">
                          <button
                            style={{
                              padding: "6px 9px",
                              borderRadius: 7,
                              border: "none",
                              background: "#eff6ff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Edit2 size={13} color="#2563eb" />
                          </button>
                        </Link>
                        {property.status === "approved" &&
                          property.manageToken &&
                          property.manageTokenActive && (
                          <Link
                            href={`/quick-manage/${property.manageToken}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Quản lý nhanh tại quầy"
                          >
                            <button
                              style={{
                                padding: "6px 9px",
                                borderRadius: 7,
                                border: "1px solid #bfdbfe",
                                background: "#eff6ff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <ExternalLink size={13} color="#2563eb" />
                            </button>
                          </Link>
                        )}
                        {deleteConfirm === property.id ? (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              onClick={() => handleDelete(property.id)}
                              style={{
                                padding: "5px 8px",
                                borderRadius: 7,
                                border: "none",
                                background: "#dc2626",
                                color: "#fff",
                                fontSize: "0.77rem",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Xóa
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              style={{
                                padding: "5px 8px",
                                borderRadius: 7,
                                border: "none",
                                background: "#f1f5f9",
                                color: "#64748b",
                                fontSize: "0.77rem",
                                cursor: "pointer",
                              }}
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(property.id)}
                            title="Xóa chỗ nghỉ"
                            style={{
                              padding: "6px 9px",
                              borderRadius: 7,
                              border: "none",
                              background: "#fee2e2",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Trash2 size={13} color="#dc2626" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <PaginationControls
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={ITEMS_PER_PAGE}
          itemLabel="chỗ nghỉ"
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
