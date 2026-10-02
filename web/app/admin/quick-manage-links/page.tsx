"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Copy,
  ExternalLink,
  KeyRound,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShieldOff,
  Users,
} from "lucide-react";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  getAdminProperties,
  regenerateAdminManageLink,
  type PropertySummary,
  updateAdminManageLinkState,
} from "@/services/propertyService";

const HOSTS_PER_PAGE = 6;
const LINKS_PER_PAGE = 6;

interface HostQuickLinkGroup {
  hostId: number;
  hostName: string;
  total: number;
  active: number;
  properties: PropertySummary[];
}

function getQuickManagePath(token: string) {
  return `/quick-manage/${token}`;
}

function getQuickManageUrl(token: string) {
  if (typeof window === "undefined") {
    return getQuickManagePath(token);
  }

  return `${window.location.origin}${getQuickManagePath(token)}`;
}

function downloadExcelCompatibleCsv(rows: string[][], filename: string) {
  const escapeCell = (value: string) => {
    const normalized = String(value ?? "");
    if (/[",\n]/.test(normalized)) {
      return `"${normalized.replace(/"/g, '""')}"`;
    }

    return normalized;
  };

  const content = rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
  const blob = new Blob([`﻿${content}`], {
    type: "text/csv;charset=utf-8;",
  });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}

export default function AdminQuickManageLinksPage() {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [hostSearch, setHostSearch] = useState("");
  const [selectedHostId, setSelectedHostId] = useState<string>("");
  const [hostPage, setHostPage] = useState(1);
  const [propertyPage, setPropertyPage] = useState(1);
  const [busyPropertyId, setBusyPropertyId] = useState<number | null>(null);

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      try {
        const data = await getAdminProperties();
        setProperties(data);
      } catch (error) {
        setNotice(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách liên kết quản lý nhanh lúc này.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  const approvedProperties = useMemo(
    () =>
      properties.filter(
        (property) => property.status === "approved" && property.manageToken,
      ),
    [properties],
  );

  const hostGroups = useMemo(() => {
    const grouped = approvedProperties.reduce<Record<string, HostQuickLinkGroup>>(
      (acc, property) => {
        const key = String(property.hostId);
        if (!acc[key]) {
          acc[key] = {
            hostId: property.hostId,
            hostName: property.hostName,
            total: 0,
            active: 0,
            properties: [],
          };
        }

        acc[key].total += 1;
        if (property.manageTokenActive) {
          acc[key].active += 1;
        }
        acc[key].properties.push(property);

        return acc;
      },
      {},
    );

    return Object.values(grouped)
      .map((host) => ({
        ...host,
        properties: [...host.properties].sort((left, right) =>
          left.title.localeCompare(right.title),
        ),
      }))
      .sort((left, right) => left.hostName.localeCompare(right.hostName));
  }, [approvedProperties]);

  const filteredHosts = useMemo(() => {
    const query = hostSearch.trim().toLowerCase();
    if (!query) {
      return hostGroups;
    }

    return hostGroups.filter((host) =>
      host.hostName.toLowerCase().includes(query),
    );
  }, [hostGroups, hostSearch]);

  useEffect(() => {
    setHostPage(1);
  }, [hostSearch]);

  useEffect(() => {
    if (
      selectedHostId &&
      filteredHosts.some((host) => String(host.hostId) === selectedHostId)
    ) {
      return;
    }

    setSelectedHostId(filteredHosts[0] ? String(filteredHosts[0].hostId) : "");
  }, [filteredHosts, selectedHostId]);

  useEffect(() => {
    setPropertyPage(1);
  }, [selectedHostId]);

  const totalHostPages = Math.max(
    1,
    Math.ceil(filteredHosts.length / HOSTS_PER_PAGE),
  );
  const safeHostPage = Math.min(hostPage, totalHostPages);
  const paginatedHosts = filteredHosts.slice(
    (safeHostPage - 1) * HOSTS_PER_PAGE,
    safeHostPage * HOSTS_PER_PAGE,
  );

  const selectedHost = useMemo(
    () =>
      filteredHosts.find((host) => String(host.hostId) === selectedHostId) ||
      null,
    [filteredHosts, selectedHostId],
  );

  const selectedHostProperties = selectedHost?.properties || [];
  const totalPropertyPages = Math.max(
    1,
    Math.ceil(selectedHostProperties.length / LINKS_PER_PAGE),
  );
  const safePropertyPage = Math.min(propertyPage, totalPropertyPages);
  const paginatedProperties = selectedHostProperties.slice(
    (safePropertyPage - 1) * LINKS_PER_PAGE,
    safePropertyPage * LINKS_PER_PAGE,
  );

  async function handleCopy(property: PropertySummary) {
    try {
      await navigator.clipboard.writeText(getQuickManageUrl(property.manageToken || ""));
      setNotice(`Đã sao chép liên kết quản lý nhanh cho "${property.title}".`);
    } catch (_error) {
      setNotice("Không thể sao chép liên kết trên trình duyệt này.");
    }
  }

  async function handleRegenerate(property: PropertySummary) {
    setBusyPropertyId(property.id);
    try {
      const response = await regenerateAdminManageLink(property.id);
      setProperties((current) =>
        current.map((item) =>
          item.id === property.id
            ? {
                ...item,
                manageToken: response.data.manageToken,
                manageTokenActive: response.data.manageTokenActive,
              }
            : item,
        ),
      );
      setNotice(`Đã tạo mới mã liên kết quản lý cho "${property.title}".`);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Không thể tạo mới mã liên kết quản lý lúc này.",
      );
    } finally {
      setBusyPropertyId(null);
    }
  }

  async function handleToggle(property: PropertySummary) {
    setBusyPropertyId(property.id);
    try {
      const nextActive = !property.manageTokenActive;
      const response = await updateAdminManageLinkState(property.id, nextActive);
      setProperties((current) =>
        current.map((item) =>
          item.id === property.id
            ? {
                ...item,
                manageTokenActive: response.data.manageTokenActive,
              }
            : item,
        ),
      );
      setNotice(
        `Đã ${nextActive ? "kích hoạt" : "vô hiệu hóa"} liên kết quản lý cho "${property.title}".`,
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái liên kết quản lý lúc này.",
      );
    } finally {
      setBusyPropertyId(null);
    }
  }

  function handleExportSelectedHost() {
    if (!selectedHost) {
      return;
    }

    const rows = [
      [
        "Mã chỗ nghỉ",
        "Tên chỗ nghỉ",
        "Chủ nhà",
        "Địa điểm",
        "Trạng thái duyệt",
        "Trạng thái liên kết",
        "Đường dẫn quản lý nhanh",
      ],
      ...selectedHost.properties.map((property) => [
        String(property.id),
        property.title,
        property.hostName,
        property.location,
        property.status,
        property.manageTokenActive ? "đang hoạt động" : "đã tắt",
        getQuickManageUrl(property.manageToken || ""),
      ]),
    ];

    downloadExcelCompatibleCsv(
      rows,
      `danh-sach-lien-ket-quan-ly-${selectedHost.hostName
        .replace(/\s+/g, "-")
        .toLowerCase()}.csv`,
    );
    setNotice(`Đã xuất tệp CSV Excel thành công cho chủ nhà ${selectedHost.hostName}.`);
  }

  return (
    <div style={{ padding: "28px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 24,
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
            Liên kết Quản lý Nhanh tại Quầy
          </h1>
          <p style={{ color: "#64748b", margin: 0, maxWidth: 760 }}>
            Quản lý và cấp quyền liên kết tự đăng ký nhận khách tại quầy (walk-in) dành riêng cho từng chủ homestay.
          </p>
        </div>

        <Link href="/admin/properties-manage">
          <button className="btn-outline-hs">Xem danh sách chỗ nghỉ</button>
        </Link>
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
        <div className="col-md-4">
          <div className="hs-stat-card">
            <div className="hs-stat-icon" style={{ background: "#eff6ff" }}>
              <Users size={22} color="#2563EB" />
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#64748b",
                fontWeight: 700,
                marginTop: 12,
              }}
            >
              Chủ nhà có liên kết quản lý
            </div>
            <div
              style={{
                fontSize: "1.55rem",
                fontWeight: 800,
                color: "#1e293b",
                marginTop: 4,
              }}
            >
              {hostGroups.length}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="hs-stat-card">
            <div className="hs-stat-icon" style={{ background: "#eff6ff" }}>
              <KeyRound size={22} color="#2563EB" />
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#64748b",
                fontWeight: 700,
                marginTop: 12,
              }}
            >
              Chỗ nghỉ đã cấp liên kết
            </div>
            <div
              style={{
                fontSize: "1.55rem",
                fontWeight: 800,
                color: "#1e293b",
                marginTop: 4,
              }}
            >
              {approvedProperties.length}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="hs-stat-card">
            <div className="hs-stat-icon" style={{ background: "#dcfce7" }}>
              <ShieldCheck size={22} color="#16a34a" />
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#64748b",
                fontWeight: 700,
                marginTop: 12,
              }}
            >
              Liên kết đang hoạt động
            </div>
            <div
              style={{
                fontSize: "1.55rem",
                fontWeight: 800,
                color: "#1e293b",
                marginTop: 4,
              }}
            >
              {
                approvedProperties.filter((property) => property.manageTokenActive)
                  .length
              }
            </div>
          </div>
        </div>
      </div>

      <div className="hs-card" style={{ overflow: "hidden", marginBottom: 24 }}>
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "#1e293b",
                fontSize: "1rem",
                marginBottom: 4,
              }}
            >
              Danh sách Chủ Homestay
            </div>
            <div style={{ color: "#64748b", fontSize: "0.82rem" }}>
              Tìm kiếm và chọn chủ nhà để quản lý danh sách liên kết tại quầy.
            </div>
          </div>

          <div style={{ position: "relative", width: "min(360px, 100%)" }}>
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
              placeholder="Tìm theo tên chủ nhà..."
              value={hostSearch}
              onChange={(event) => setHostSearch(event.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="hs-table">
            <thead>
              <tr>
                <th>Chủ nhà</th>
                <th>Chỗ nghỉ đã duyệt</th>
                <th>Liên kết đang bật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      padding: "48px",
                      color: "#94a3b8",
                    }}
                  >
                    Đang tải danh sách chủ nhà...
                  </td>
                </tr>
              ) : paginatedHosts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      padding: "48px",
                      color: "#94a3b8",
                    }}
                  >
                    Không tìm thấy chủ nhà nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedHosts.map((host) => {
                  const isSelected = selectedHostId === String(host.hostId);

                  return (
                    <tr key={host.hostId}>
                      <td>
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#1e293b",
                              fontSize: "0.88rem",
                            }}
                          >
                            {host.hostName}
                          </div>
                          <div
                            style={{
                              color: "#94a3b8",
                              fontSize: "0.75rem",
                            }}
                          >
                            Mã chủ nhà #{host.hostId}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: "0.86rem", color: "#475569" }}>
                        {host.total}
                      </td>
                      <td style={{ fontSize: "0.86rem", color: "#475569" }}>
                        {host.active}/{host.total}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setSelectedHostId(String(host.hostId))}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: `1px solid ${
                              isSelected ? "#2563eb" : "#dbeafe"
                            }`,
                            background: isSelected ? "#2563eb" : "#eff6ff",
                            color: isSelected ? "#fff" : "#2563eb",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {isSelected ? "Đang chọn" : "Xem liên kết"}
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

      <PaginationControls
        currentPage={safeHostPage}
        totalPages={totalHostPages}
        totalItems={filteredHosts.length}
        pageSize={HOSTS_PER_PAGE}
        itemLabel="chủ nhà"
        onPageChange={setHostPage}
      />

      <div className="hs-card" style={{ overflow: "hidden", marginTop: 24 }}>
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "#1e293b",
                fontSize: "1rem",
                marginBottom: 4,
              }}
            >
              {selectedHost
                ? `Liên kết quản lý của: ${selectedHost.hostName}`
                : "Liên kết quản lý của chủ nhà được chọn"}
            </div>
            <div style={{ color: "#64748b", fontSize: "0.82rem" }}>
              {selectedHost
                ? `${selectedHost.total} chỗ nghỉ đã duyệt · ${selectedHost.active} liên kết đang kích hoạt`
                : "Vui lòng chọn một chủ nhà ở bảng trên để xem và xuất liên kết."}
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportSelectedHost}
            disabled={!selectedHost}
            className="btn-primary-hs"
            style={{ opacity: selectedHost ? 1 : 0.6 }}
          >
            Xuất danh sách ra Excel (CSV)
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="hs-table">
            <thead>
              <tr>
                <th>Chỗ nghỉ</th>
                <th>Trạng thái duyệt</th>
                <th>Trạng thái liên kết</th>
                <th>Đường dẫn truy cập</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!selectedHost ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "48px",
                      color: "#94a3b8",
                    }}
                  >
                    Vui lòng chọn một chủ nhà phía trên để kiểm tra liên kết.
                  </td>
                </tr>
              ) : paginatedProperties.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "48px",
                      color: "#94a3b8",
                    }}
                  >
                    Chủ nhà này chưa có chỗ nghỉ nào được cấp liên kết quản lý.
                  </td>
                </tr>
              ) : (
                paginatedProperties.map((property) => {
                  const quickPath = getQuickManagePath(property.manageToken || "");
                  const busy = busyPropertyId === property.id;

                  return (
                    <tr key={property.id}>
                      <td>
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#1e293b",
                              fontSize: "0.88rem",
                            }}
                          >
                            {property.title}
                          </div>
                          <div
                            style={{
                              color: "#94a3b8",
                              fontSize: "0.75rem",
                            }}
                          >
                            {property.location}
                          </div>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={property.status} />
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: property.manageTokenActive
                              ? "#dcfce7"
                              : "#fee2e2",
                            color: property.manageTokenActive
                              ? "#166534"
                              : "#b91c1c",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                          }}
                        >
                          {property.manageTokenActive ? (
                            <ShieldCheck size={13} />
                          ) : (
                            <ShieldOff size={13} />
                          )}
                          {property.manageTokenActive ? "Đang bật" : "Đã tắt"}
                        </span>
                      </td>
                      <td style={{ maxWidth: 320 }}>
                        <code
                          style={{
                            display: "block",
                            fontSize: "0.75rem",
                            color: "#334155",
                            background: "#f8fafc",
                            borderRadius: 8,
                            padding: "8px 10px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={quickPath}
                        >
                          {quickPath}
                        </code>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleCopy(property)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: "1px solid #dbeafe",
                              background: "#eff6ff",
                              color: "#2563eb",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              cursor: "pointer",
                            }}
                          >
                            <Copy size={13} />
                            Sao chép
                          </button>
                          <Link href={quickPath} target="_blank" rel="noreferrer">
                            <button
                              type="button"
                              style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: "1px solid #e2e8f0",
                                background: "#fff",
                                color: "#334155",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                cursor: "pointer",
                              }}
                            >
                              <ExternalLink size={13} />
                              Mở
                            </button>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleToggle(property)}
                            disabled={busy}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: "none",
                              background: property.manageTokenActive
                                ? "#fee2e2"
                                : "#dcfce7",
                              color: property.manageTokenActive
                                ? "#b91c1c"
                                : "#166534",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              cursor: busy ? "wait" : "pointer",
                              opacity: busy ? 0.7 : 1,
                            }}
                          >
                            {property.manageTokenActive ? "Tắt" : "Bật"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRegenerate(property)}
                            disabled={busy}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: "none",
                              background: "#f8fafc",
                              color: "#475569",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              cursor: busy ? "wait" : "pointer",
                              opacity: busy ? 0.7 : 1,
                            }}
                          >
                            <RefreshCcw size={13} />
                            Tạo lại mã
                          </button>
                        </div>
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
