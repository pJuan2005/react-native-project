"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  DollarSign,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import {
  getAdminReports,
  type AdminReportsData,
} from "@/services/dashboardService";

const COLORS = ["#2563EB", "#16a34a", "#d97706", "#7c3aed", "#dc2626", "#0891b2"];
const STATUS_COLORS = ["#16a34a", "#d97706", "#dc2626", "#7c3aed"];

function formatCurrency(value: number | string | undefined) {
  const amount = Number(value || 0);
  return `$${amount.toLocaleString()}`;
}

function formatCompactCurrency(value: number | string | undefined) {
  const amount = Number(value || 0);
  return `$${(amount / 1000).toFixed(0)}k`;
}

function formatReportTooltip(
  value: number | string | undefined,
  name: string | number | undefined,
) {
  const label = String(name || "");
  return [
    label === "revenue" ? formatCurrency(value) : Number(value || 0),
    label === "revenue" ? "Revenue" : "Bookings",
  ] as const;
}

function formatLegendLabel(value: string | number | undefined) {
  return String(value) === "revenue" ? "Revenue" : "Bookings";
}

function formatPeriodLabel(period: string) {
  if (!period) {
    return "";
  }

  const date = new Date(period);
  if (Number.isNaN(date.getTime())) {
    return period;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      setPageError("");

      try {
        const data = await getAdminReports();
        setReports(data);
      } catch (error) {
        setPageError(
          error instanceof Error
            ? error.message
            : "Unable to load the reports right now.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadReports();
  }, []);

  const summary = reports?.summary || {
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
  const monthlyPerformance = reports?.monthlyPerformance || [];
  const bookingStatus = reports?.bookingStatus || [];
  const propertyTypes = reports?.propertyTypes || [];
  const topHosts = reports?.topHosts || [];

  const bookingStatusTotals = useMemo(() => {
    return bookingStatus.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.name] = Number(item.value || 0);
      return accumulator;
    }, {});
  }, [bookingStatus]);

  const totalRevenueResolved =
    summary.grossRevenue > 0
      ? summary.grossRevenue
      : summary.totalRevenue > 0
      ? summary.totalRevenue
      : monthlyPerformance.reduce((sum, point) => sum + Number(point.revenue || 0), 0);
  const platformRevenueResolved =
    summary.platformRevenue > 0
      ? summary.platformRevenue
      : Number((totalRevenueResolved * (summary.platformCommissionRate || 0.1)).toFixed(2));
  const hostPayoutResolved =
    summary.hostPayoutTotal > 0
      ? summary.hostPayoutTotal
      : Number((totalRevenueResolved - platformRevenueResolved).toFixed(2));
  const totalBookingsResolved =
    summary.totalBookings > 0
      ? summary.totalBookings
      : bookingStatus.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const confirmedBookingsResolved =
    summary.confirmedBookings > 0
      ? summary.confirmedBookings
      : Number(bookingStatusTotals.confirmed || 0);
  const pendingBookingsResolved =
    summary.pendingBookings > 0
      ? summary.pendingBookings
      : Number(bookingStatusTotals.pending || 0);
  const cancelledBookingsResolved =
    summary.cancelledBookings > 0
      ? summary.cancelledBookings
      : Number(bookingStatusTotals.cancelled || 0);
  const activeHostsResolved =
    summary.activeHosts > 0 ? summary.activeHosts : topHosts.length;
  const activeUsersResolved =
    summary.activeUsers > 0
      ? summary.activeUsers
      : Math.max(summary.totalUsers, activeHostsResolved);

  const averageBookingValue = useMemo(() => {
    if (confirmedBookingsResolved === 0) {
      return 0;
    }

    return Math.round(totalRevenueResolved / confirmedBookingsResolved);
  }, [confirmedBookingsResolved, totalRevenueResolved]);

  return (
    <div style={{ padding: "28px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
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
            }}
          >
            Reports & Analytics
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Live performance insights based on your real platform data.
          </p>
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
        {[
          {
            icon: <DollarSign size={20} color="#2563EB" />,
            bg: "#eff6ff",
            label: "Gross Revenue",
            value: formatCurrency(totalRevenueResolved),
            change: "Confirmed bookings only",
          },
          {
            icon: <DollarSign size={20} color="#16a34a" />,
            bg: "#dcfce7",
            label: "Platform Profit",
            value: formatCurrency(platformRevenueResolved),
            change: `${Math.round((summary.platformCommissionRate || 0.1) * 100)}% commission · ${activeHostsResolved} active hosts`,
          },
          {
            icon: <CalendarDays size={20} color="#d97706" />,
            bg: "#fef3c7",
            label: "Total Bookings",
            value: totalBookingsResolved,
            change: `${pendingBookingsResolved} pending · ${cancelledBookingsResolved} cancelled`,
          },
          {
            icon: <TrendingUp size={20} color="#7c3aed" />,
            bg: "#f3e8ff",
            label: "Average Confirmed Booking",
            value: formatCurrency(averageBookingValue),
            change: `Host payouts ${formatCurrency(hostPayoutResolved)}`,
          },
        ].map((kpi) => (
          <div key={kpi.label} className="col-xl-3 col-md-6">
            <div className="hs-stat-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
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
                    {kpi.label}
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      color: "#1e293b",
                    }}
                  >
                    {isLoading ? "..." : kpi.value}
                  </div>
                </div>
                <div className="hs-stat-icon" style={{ background: kpi.bg }}>
                  {kpi.icon}
                </div>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                {kpi.change}
              </div>
            </div>
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
                  Revenue vs. Bookings
                </h3>
                <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
                  Last {monthlyPerformance.length || 0} months comparison
                </div>
              </div>
            </div>
            <div style={{ padding: "20px" }}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyPerformance}>
                  <defs>
                    <linearGradient id="reportsRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="reportsBookingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
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
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatCompactCurrency}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    formatter={(value, name) =>
                      formatReportTooltip(
                        value as number | string | undefined,
                        name as string | number | undefined,
                      )
                    }
                  />
                  <Legend formatter={(value) => formatLegendLabel(value as string | number | undefined)} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fill="url(#reportsRevenueGradient)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#16a34a"
                    strokeWidth={2}
                    fill="url(#reportsBookingGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="hs-card" style={{ marginBottom: 16 }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #e2e8f0" }}>
              <h3
                style={{
                  fontWeight: 700,
                  color: "#1e293b",
                  margin: 0,
                  fontSize: "1rem",
                }}
              >
                Booking Status
              </h3>
            </div>
            <div style={{ padding: "16px" }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={bookingStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                    fontSize={11}
                  >
                    {bookingStatus.map((_, index) => (
                      <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

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
                Property Types
              </h3>
            </div>
            <div style={{ padding: "16px" }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={propertyTypes} cx="50%" cy="50%" outerRadius={60} dataKey="value">
                    {propertyTypes.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: "0.75rem" }} />
                </PieChart>
              </ResponsiveContainer>
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
                Monthly Bookings Trend
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
                  <Bar dataKey="bookings" fill="#2563EB" radius={[4, 4, 0, 0]} name="Bookings" />
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
                alignItems: "center",
                gap: 8,
              }}
            >
              <Trophy size={16} color="#d97706" />
              <h3
                style={{
                  fontWeight: 700,
                  color: "#1e293b",
                  margin: 0,
                  fontSize: "1rem",
                }}
              >
                Top Performing Hosts
              </h3>
            </div>
            <div>
              {isLoading ? (
                <div style={{ padding: "24px 20px", color: "#94a3b8", fontSize: "0.84rem" }}>
                  Loading host rankings...
                </div>
              ) : topHosts.length ? (
                topHosts.map((host, index) => (
                  <div
                    key={host.id}
                    style={{
                      padding: "12px 20px",
                      borderBottom:
                        index < topHosts.length - 1 ? "1px solid #f8fafc" : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background:
                          index === 0
                            ? "#fef3c7"
                            : index === 1
                            ? "#f3f4f6"
                            : "#fef3c7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        flexShrink: 0,
                        color:
                          index === 0 ? "#d97706" : index === 1 ? "#64748b" : "#92400e",
                        border: `2px solid ${
                          index === 0 ? "#fbbf24" : index === 1 ? "#d1d5db" : "#d97706"
                        }`,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                        {host.name}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.77rem" }}>
                        {host.properties} properties · {host.bookings} bookings
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: 800,
                          color: "#16a34a",
                          fontSize: "0.95rem",
                        }}
                      >
                        {formatCurrency(host.revenue)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>host payout</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: "24px 20px", color: "#94a3b8", fontSize: "0.84rem" }}>
                  No host performance data available yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hs-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #e2e8f0" }}>
          <h3
            style={{
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
              fontSize: "1rem",
            }}
          >
            Monthly Revenue Breakdown
          </h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="hs-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Gross Revenue</th>
                <th>Platform Profit</th>
                <th>Host Payout</th>
                <th>Bookings</th>
                <th>Avg. Per Booking</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {monthlyPerformance.map((row, index) => {
                const previousRevenue =
                  index > 0
                    ? monthlyPerformance[index - 1].grossRevenue
                    : row.grossRevenue;
                const monthlyGrossRevenue = row.grossRevenue || row.revenue;
                const monthlyPlatformProfit =
                  row.platformRevenue ??
                  Number(
                    (
                      monthlyGrossRevenue *
                      (summary.platformCommissionRate || 0.1)
                    ).toFixed(2),
                  );
                const monthlyHostPayout =
                  row.hostPayout ??
                  Number((monthlyGrossRevenue - monthlyPlatformProfit).toFixed(2));
                const growth =
                  index === 0 || previousRevenue === 0
                    ? 0
                    : Math.round(
                        ((monthlyGrossRevenue - previousRevenue) / previousRevenue) *
                          100,
                      );
                const averagePerBooking =
                  row.bookings > 0
                    ? Math.round(monthlyGrossRevenue / row.bookings)
                    : 0;

                return (
                  <tr key={row.period}>
                    <td style={{ fontWeight: 700, color: "#1e293b" }}>
                      {formatPeriodLabel(row.period)}
                    </td>
                    <td style={{ fontWeight: 700, color: "#1e293b" }}>
                      {formatCurrency(monthlyGrossRevenue)}
                    </td>
                    <td>{formatCurrency(monthlyPlatformProfit)}</td>
                    <td>{formatCurrency(monthlyHostPayout)}</td>
                    <td>{row.bookings}</td>
                    <td>{formatCurrency(averagePerBooking)}</td>
                    <td>
                      {growth === 0 ? (
                        <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>—</span>
                      ) : (
                        <span
                          style={{
                            color: growth > 0 ? "#16a34a" : "#dc2626",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                          }}
                        >
                          {growth > 0 ? "↑" : "↓"} {Math.abs(growth)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!monthlyPerformance.length && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                    No report data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
