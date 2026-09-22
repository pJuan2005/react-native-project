"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  getAdminDashboard,
  type AdminDashboardData,
} from "@/services/dashboardService";

function formatCurrency(value: number | string | undefined) {
  const amount = Number(value || 0);
  return `$${amount.toLocaleString()}`;
}

function formatCompactCurrency(value: number | string | undefined) {
  const amount = Number(value || 0);
  return `$${(amount / 1000).toFixed(0)}k`;
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      setPageError("");

      try {
        const data = await getAdminDashboard();
        setDashboard(data);
      } catch (error) {
        setPageError(
          error instanceof Error
            ? error.message
            : "Unable to load the admin dashboard right now.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const summary = dashboard?.summary || {
    totalUsers: 0,
    totalHosts: 0,
    totalGuests: 0,
    activeUsers: 0,
    activeHosts: 0,
    totalProperties: 0,
    approvedProperties: 0,
    pendingProperties: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    grossRevenue: 0,
    platformRevenue: 0,
    hostPayoutTotal: 0,
    platformCommissionRate: 0.1,
  };
  const monthlyPerformance = dashboard?.monthlyPerformance || [];
  const recentBookings = dashboard?.recentBookings || [];

  const stats = [
    {
      icon: <Users size={22} color="#2563EB" />,
      bg: "#eff6ff",
      label: "Total Users",
      value: summary.totalUsers,
      sub: `${summary.totalGuests} guests on the platform`,
      link: "/admin/user",
    },
    {
      icon: <Building2 size={22} color="#7c3aed" />,
      bg: "#f3e8ff",
      label: "Total Hosts",
      value: summary.totalHosts,
      sub: `${summary.pendingProperties} properties waiting for approval`,
      link: "/admin/property-approvals",
    },
    {
      icon: <Building2 size={22} color="#16a34a" />,
      bg: "#dcfce7",
      label: "Properties",
      value: summary.totalProperties,
      sub: `${summary.approvedProperties} approved listings`,
      link: "/admin/properties-manage",
    },
    {
      icon: <DollarSign size={22} color="#d97706" />,
      bg: "#fef3c7",
      label: "Gross Revenue",
      value: formatCurrency(summary.grossRevenue || summary.totalRevenue),
      sub: `Platform profit ${formatCurrency(summary.platformRevenue)} · Host payouts ${formatCurrency(summary.hostPayoutTotal)}`,
      link: "/admin/manage-reports",
    },
  ];

  return (
    <div style={{ padding: "28px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontWeight: 800,
            color: "#1e293b",
            marginBottom: 4,
            fontSize: "1.5rem",
          }}
        >
          Admin Dashboard
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Live platform overview and key metrics from your database.
        </p>
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
            <Link href={stat.link} style={{ textDecoration: "none" }}>
              <div
                className="hs-stat-card"
                style={{ cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = "translateY(0)";
                }}
              >
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
                        fontSize: "0.78rem",
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
                      {isLoading ? "..." : stat.value}
                    </div>
                  </div>
                  <div className="hs-stat-icon" style={{ background: stat.bg }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{ fontSize: "0.77rem", color: "#64748b" }}>{stat.sub}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
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
              <div>
                <h3
                  style={{
                    fontWeight: 700,
                    color: "#1e293b",
                    margin: 0,
                    fontSize: "1rem",
                  }}
                >
                  Revenue Trend
                </h3>
                <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: 2 }}>
                  Monthly revenue overview based on booking check-in dates
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#dcfce7",
                  borderRadius: 20,
                  padding: "4px 10px",
                }}
              >
                <TrendingUp size={12} color="#16a34a" />
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: "#16a34a",
                    fontWeight: 700,
                  }}
                >
                  Last {monthlyPerformance.length || 0} months
                </span>
              </div>
            </div>
            <div style={{ padding: "20px" }}>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthlyPerformance}>
                  <defs>
                    <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatCompactCurrency}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(value as number | string | undefined),
                      "Revenue",
                    ]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fill="url(#adminRevenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="hs-card" style={{ height: "100%" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #e2e8f0" }}>
              <h3
                style={{
                  fontWeight: 700,
                  color: "#1e293b",
                  margin: 0,
                  fontSize: "1rem",
                }}
              >
                Platform Summary
              </h3>
            </div>
            <div style={{ padding: "20px" }}>
              {[
                {
                  label: "Total Bookings",
                  value: summary.totalBookings,
                  icon: <CalendarDays size={16} color="#2563EB" />,
                },
                {
                  label: "Confirmed",
                  value: summary.confirmedBookings,
                  icon: <CheckCircle size={16} color="#16a34a" />,
                },
                {
                  label: "Pending",
                  value: summary.pendingBookings,
                  icon: <Clock size={16} color="#d97706" />,
                },
                {
                  label: "Platform Profit",
                  value: formatCurrency(summary.platformRevenue),
                  icon: <DollarSign size={16} color="#d97706" />,
                },
                {
                  label: "Host Payouts",
                  value: formatCurrency(summary.hostPayoutTotal),
                  icon: <TrendingUp size={16} color="#7c3aed" />,
                },
                {
                  label: "Active Users",
                  value: summary.activeUsers,
                  icon: <Users size={16} color="#7c3aed" />,
                },
                {
                  label: "Pending Approvals",
                  value: summary.pendingProperties,
                  icon: <Building2 size={16} color="#dc2626" />,
                },
              ].map((item, index) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: index < 6 ? "1px solid #f8fafc" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: "0.87rem",
                      color: "#475569",
                    }}
                  >
                    {item.icon} {item.label}
                  </div>
                  <span style={{ fontWeight: 800, color: "#1e293b" }}>{item.value}</span>
                </div>
              ))}

              <Link href="/admin/property-approvals">
                <button
                  className="btn-primary-hs"
                  style={{ width: "100%", marginTop: 16, fontSize: "0.85rem" }}
                >
                  Review Pending Approvals
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="hs-card">
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #e2e8f0" }}>
              <h3
                style={{
                  fontWeight: 700,
                  color: "#1e293b",
                  margin: 0,
                  fontSize: "1rem",
                }}
              >
                Monthly Bookings
              </h3>
            </div>
            <div style={{ padding: "20px" }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="bookings" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
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
              <Link href="/admin/manage-booking">
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
            <div style={{ overflow: "hidden" }}>
              {isLoading ? (
                <div style={{ padding: "24px 18px", color: "#94a3b8", fontSize: "0.84rem" }}>
                  Loading recent bookings...
                </div>
              ) : recentBookings.length ? (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    style={{
                      padding: "10px 18px",
                      borderBottom: "1px solid #f8fafc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          color: "#2563EB",
                          fontSize: "0.8rem",
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
                        <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                          {booking.checkIn} to {booking.checkOut}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#1e293b",
                          fontSize: "0.9rem",
                        }}
                      >
                        {formatCurrency(booking.totalPrice)}
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: "24px 18px", color: "#94a3b8", fontSize: "0.84rem" }}>
                  No bookings available yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
