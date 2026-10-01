"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  DollarSign,
  Star,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  getHostDashboard,
  type HostDashboardData,
} from "@/services/dashboardService";
import { isBackendUploadImage } from "@/lib/image";
import { getHostProperties, type PropertySummary } from "@/services/propertyService";

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

function getQuickManageUrl(token: string) {
  if (typeof window === "undefined") {
    return `/quick-manage/${token}`;
  }

  return `${window.location.origin}/quick-manage/${token}`;
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
  const blob = new Blob([`\uFEFF${content}`], {
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

export default function HostDashboardPage() {
  const { user, isInitializing } = useAuth();
  const [dashboard, setDashboard] = useState<HostDashboardData | null>(null);
  const [hostProperties, setHostProperties] = useState<PropertySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    if (isInitializing || !user || user.role !== "Host") {
      return;
    }

    const hostUser = user;

    async function loadDashboard() {
      setIsLoading(true);
      setPageError("");

      try {
        const [data, properties] = await Promise.all([
          getHostDashboard(),
          getHostProperties(hostUser.id),
        ]);
        setDashboard(data);
        setHostProperties(properties);
      } catch (error) {
        setPageError(
          error instanceof Error
            ? error.message
            : "Unable to load the host dashboard right now.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [isInitializing, user]);

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
        Loading host dashboard...
      </div>
    );
  }

  const displayName = user.name || "Host";
  const firstName = displayName.split(" ")[0] || displayName;
  const summary = dashboard?.summary || {
    propertyCount: 0,
    bookingCount: 0,
    pendingProofCount: 0,
    reviewCount: 0,
    propertiesThisMonth: 0,
    bookingsThisWeek: 0,
    grossRevenue: 0,
    totalRevenue: 0,
    platformFeeAmount: 0,
    platformCommissionRate: 0.1,
    averageRating: 0,
  };

  const exportableQuickLinks = hostProperties.filter(
    (property) =>
      property.status === "approved" &&
      property.manageToken &&
      property.manageTokenActive,
  );

  function handleExportQuickLinks() {
    const rows = [
      [
        "Property ID",
        "Property Title",
        "Location",
        "Quick Link URL",
      ],
      ...exportableQuickLinks.map((property) => [
        String(property.id),
        property.title,
        property.location,
        getQuickManageUrl(property.manageToken || ""),
      ]),
    ];

    downloadExcelCompatibleCsv(rows, "host-quick-manage-links.csv");
  }

  const stats = [
    {
      icon: <Building2 size={22} color="#2563EB" />,
      bg: "#eff6ff",
      label: "My Properties",
      value: summary.propertyCount,
      change: `${summary.propertiesThisMonth} added this month`,
    },
    {
      icon: <CalendarDays size={22} color="#16a34a" />,
      bg: "#dcfce7",
      label: "Total Bookings",
      value: summary.bookingCount,
      change: `${summary.bookingsThisWeek} new this week`,
    },
    {
      icon: <DollarSign size={22} color="#d97706" />,
      bg: "#fef3c7",
      label: "Host Payout",
      value: formatCurrency(summary.totalRevenue),
      change: `Gross ${formatCurrency(summary.grossRevenue)} · Platform fee ${formatCurrency(summary.platformFeeAmount)}`,
    },
    {
      icon: <TrendingUp size={22} color="#7c3aed" />,
      bg: "#f3e8ff",
      label: "Average Rating",
      value: `${summary.averageRating.toFixed(1)} / 5`,
      change: `Based on ${summary.reviewCount} reviews`,
    },
  ];

  return (
    <div style={{ padding: "28px" }}>
      <div
        style={{
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
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
            Welcome back, {firstName}
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Here is a live overview of your hosting activity.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
            marginLeft: "auto",
          }}
        >
          <Link href="/host/my-properties">
            <button className="btn-outline-hs">Manage Quick Links</button>
          </Link>
          <button
            type="button"
            onClick={handleExportQuickLinks}
            className="btn-primary-hs"
            style={{ opacity: exportableQuickLinks.length ? 1 : 0.6 }}
            disabled={!exportableQuickLinks.length}
          >
            Export Quick Links
          </button>
        </div>
      </div>

      {pageError && (
        <div
          style={{
            marginBottom: 18,
            borderRadius: 12,
            padding: "12px 14px",
            border: "1px solid #fecaca",
            background: "#fef2f2",
            color: "#b91c1c",
            fontSize: "0.84rem",
          }}
        >
          {pageError}
        </div>
      )}

      <div className="row g-3 mb-4">
        {stats.map((stat) => (
          <div key={stat.label} className="col-xl-3 col-md-6">
            <div className="hs-stat-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#64748b",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    {stat.label}
                  </div>
                  <div
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 800,
                      color: "#1e293b",
                    }}
                  >
                    {stat.value}
                  </div>
                </div>
                <div className="hs-stat-icon" style={{ background: stat.bg }}>
                  {stat.icon}
                </div>
              </div>
              <div style={{ fontSize: "0.77rem", color: "#64748b", fontWeight: 600 }}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="hs-card">
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  fontWeight: 700,
                  color: "#1e293b",
                  margin: 0,
                  fontSize: "1rem",
                }}
              >
                Recent Bookings
              </h3>
              <Link href="/host/manage-booking">
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563EB",
                    fontSize: "0.83rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  View All <ArrowRight size={13} />
                </button>
              </Link>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="hs-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Property</th>
                    <th>Dates</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                        Loading bookings...
                      </td>
                    </tr>
                  ) : dashboard?.recentBookings.length ? (
                    dashboard.recentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "#eff6ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                color: "#2563EB",
                              }}
                            >
                              {booking.guestName
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "#1e293b",
                                  fontSize: "0.87rem",
                                }}
                              >
                                {booking.guestName}
                              </div>
                              <div style={{ color: "#94a3b8", fontSize: "0.76rem" }}>
                                {booking.guests} guests
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: "0.85rem", color: "#475569", maxWidth: 180 }}>
                          <div
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {booking.propertyTitle}
                          </div>
                        </td>
                        <td style={{ fontSize: "0.82rem", color: "#64748b" }}>
                          {booking.checkIn} to {booking.checkOut}
                        </td>
                        <td>
                          <strong style={{ color: "#1e293b" }}>
                            {formatCurrency(booking.totalPrice)}
                          </strong>
                        </td>
                        <td>
                          <StatusBadge status={booking.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                        No bookings have been created for your listings yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="hs-card">
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  fontWeight: 700,
                  color: "#1e293b",
                  margin: 0,
                  fontSize: "1rem",
                }}
              >
                My Properties
              </h3>
              <Link href="/host/my-properties">
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563EB",
                    fontSize: "0.83rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  View All <ArrowRight size={13} />
                </button>
              </Link>
            </div>

            <div>
              {isLoading ? (
                <div style={{ padding: "24px 18px", color: "#94a3b8", fontSize: "0.84rem" }}>
                  Loading properties...
                </div>
              ) : dashboard?.properties.length ? (
                dashboard.properties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/host/properties/${property.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                    style={{
                      padding: "12px 18px",
                      borderBottom: "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                    }}
                  >
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
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#1e293b",
                          fontSize: "0.85rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {property.title}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 3,
                        }}
                      >
                        <Star size={11} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: "0.77rem", color: "#64748b" }}>
                          {property.rating.toFixed(1)} · {formatCurrency(property.price)}/night
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={property.status} />
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ padding: "24px 18px", color: "#94a3b8", fontSize: "0.84rem" }}>
                  You have not created any properties yet.
                </div>
              )}

              <div style={{ padding: "14px 18px" }}>
                <Link href="/host/add-property">
                  <button
                    className="btn-primary-hs"
                    style={{ width: "100%", fontSize: "0.85rem" }}
                  >
                    Add New Property
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: "16px 18px",
              background: "#eff6ff",
              borderRadius: 12,
              border: "1px solid #bfdbfe",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: 6,
                fontSize: "0.9rem",
              }}
            >
              Hosting Focus
            </div>
            <ul
              style={{
                margin: 0,
                padding: "0 0 0 16px",
                color: "#475569",
                fontSize: "0.82rem",
                lineHeight: 1.9,
              }}
            >
              <li>{summary.pendingProofCount} bookings are waiting for payment review.</li>
              <li>Keep your instructions updated for smoother check-in.</li>
              <li>Fresh photos and fast replies help maintain strong ratings.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
