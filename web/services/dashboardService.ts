import { apiRequest, buildAssetUrl } from "@/lib/apiClient";

export interface HostDashboardSummary {
  propertyCount: number;
  bookingCount: number;
  pendingProofCount: number;
  reviewCount: number;
  propertiesThisMonth: number;
  bookingsThisWeek: number;
  grossRevenue: number;
  totalRevenue: number;
  platformFeeAmount: number;
  platformCommissionRate: number;
  averageRating: number;
}

export interface HostDashboardBooking {
  id: number;
  guestName: string;
  guests: number;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
}

export interface HostDashboardProperty {
  id: number;
  title: string;
  image: string;
  price: number;
  status: string;
  rating: number;
}

export interface HostDashboardData {
  summary: HostDashboardSummary;
  recentBookings: HostDashboardBooking[];
  properties: HostDashboardProperty[];
}

export interface AdminDashboardSummary {
  totalUsers: number;
  totalHosts: number;
  totalGuests: number;
  activeUsers: number;
  activeHosts: number;
  totalProperties: number;
  approvedProperties: number;
  pendingProperties: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  grossRevenue: number;
  platformRevenue: number;
  hostPayoutTotal: number;
  platformCommissionRate: number;
}

export interface MonthlyPerformancePoint {
  month: string;
  period: string;
  revenue: number;
  grossRevenue: number;
  platformRevenue: number;
  hostPayout: number;
  bookings: number;
}

export interface AdminRecentBooking {
  id: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
}

export interface AdminDashboardData {
  summary: AdminDashboardSummary;
  monthlyPerformance: MonthlyPerformancePoint[];
  recentBookings: AdminRecentBooking[];
}

export interface ChartBreakdownItem {
  name: string;
  value: number;
}

export interface TopHostRecord {
  id: number;
  name: string;
  properties: number;
  bookings: number;
  revenue: number;
  grossRevenue: number;
  platformRevenue: number;
}

export interface AdminReportsData {
  summary: AdminDashboardSummary;
  monthlyPerformance: MonthlyPerformancePoint[];
  bookingStatus: ChartBreakdownItem[];
  propertyTypes: ChartBreakdownItem[];
  topHosts: TopHostRecord[];
}

function mapHostDashboard(data: any): HostDashboardData {
  return {
    summary: {
      propertyCount: Number(data?.summary?.propertyCount || 0),
      bookingCount: Number(data?.summary?.bookingCount || 0),
      pendingProofCount: Number(data?.summary?.pendingProofCount || 0),
      reviewCount: Number(data?.summary?.reviewCount || 0),
      propertiesThisMonth: Number(data?.summary?.propertiesThisMonth || 0),
      bookingsThisWeek: Number(data?.summary?.bookingsThisWeek || 0),
      grossRevenue: Number(data?.summary?.grossRevenue || 0),
      totalRevenue: Number(data?.summary?.totalRevenue || 0),
      platformFeeAmount: Number(data?.summary?.platformFeeAmount || 0),
      platformCommissionRate: Number(data?.summary?.platformCommissionRate || 0),
      averageRating: Number(data?.summary?.averageRating || 0),
    },
    recentBookings: Array.isArray(data?.recentBookings)
      ? data.recentBookings.map((booking: any) => ({
          id: Number(booking.id),
          guestName: String(booking.guestName || ""),
          guests: Number(booking.guests || 0),
          propertyTitle: String(booking.propertyTitle || ""),
          checkIn: String(booking.checkIn || ""),
          checkOut: String(booking.checkOut || ""),
          totalPrice: Number(booking.totalPrice || 0),
          status: String(booking.status || "pending"),
        }))
      : [],
    properties: Array.isArray(data?.properties)
      ? data.properties.map((property: any) => ({
          id: Number(property.id),
          title: String(property.title || ""),
          image: buildAssetUrl(property.image || ""),
          price: Number(property.price || 0),
          status: String(property.status || "pending"),
          rating: Number(property.rating || 0),
        }))
      : [],
  };
}

function mapAdminSummary(summary: any): AdminDashboardSummary {
  return {
    totalUsers: Number(summary?.totalUsers || 0),
    totalHosts: Number(summary?.totalHosts || 0),
    totalGuests: Number(summary?.totalGuests || 0),
    activeUsers: Number(summary?.activeUsers || 0),
    activeHosts: Number(summary?.activeHosts || 0),
    totalProperties: Number(summary?.totalProperties || 0),
    approvedProperties: Number(summary?.approvedProperties || 0),
    pendingProperties: Number(summary?.pendingProperties || 0),
    totalBookings: Number(summary?.totalBookings || 0),
    confirmedBookings: Number(summary?.confirmedBookings || 0),
    pendingBookings: Number(summary?.pendingBookings || 0),
    cancelledBookings: Number(summary?.cancelledBookings || 0),
    totalRevenue: Number(summary?.totalRevenue || 0),
    grossRevenue: Number(summary?.grossRevenue || 0),
    platformRevenue: Number(summary?.platformRevenue || 0),
    hostPayoutTotal: Number(summary?.hostPayoutTotal || 0),
    platformCommissionRate: Number(summary?.platformCommissionRate || 0),
  };
}

function mapMonthlyPerformance(data: any): MonthlyPerformancePoint[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((point) => ({
    month: String(point.month || ""),
    period: String(point.period || ""),
    revenue: Number(point.revenue || 0),
    grossRevenue: Number(point.grossRevenue || point.revenue || 0),
    platformRevenue: Number(point.platformRevenue || 0),
    hostPayout: Number(point.hostPayout || 0),
    bookings: Number(point.bookings || 0),
  }));
}

function mapRecentBookings(data: any): AdminRecentBooking[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((booking) => ({
    id: Number(booking.id),
    guestName: String(booking.guestName || ""),
    checkIn: String(booking.checkIn || ""),
    checkOut: String(booking.checkOut || ""),
    totalPrice: Number(booking.totalPrice || 0),
    status: String(booking.status || "pending"),
  }));
}

function mapBreakdown(data: any): ChartBreakdownItem[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => ({
    name: String(item.name || ""),
    value: Number(item.value || 0),
  }));
}

function mapTopHosts(data: any): TopHostRecord[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((host) => ({
    id: Number(host.id),
    name: String(host.name || ""),
    properties: Number(host.properties || 0),
    bookings: Number(host.bookings || 0),
    revenue: Number(host.revenue || 0),
    grossRevenue: Number(host.grossRevenue || 0),
    platformRevenue: Number(host.platformRevenue || 0),
  }));
}

export async function getHostDashboard() {
  const response = await apiRequest<any>("/api/host/dashboard");
  return mapHostDashboard(response);
}

export async function getAdminDashboard() {
  const response = await apiRequest<any>("/api/admin/dashboard");
  return {
    summary: mapAdminSummary(response?.summary),
    monthlyPerformance: mapMonthlyPerformance(response?.monthlyPerformance),
    recentBookings: mapRecentBookings(response?.recentBookings),
  } satisfies AdminDashboardData;
}

export async function getAdminReports() {
  const response = await apiRequest<any>("/api/admin/reports");
  return {
    summary: mapAdminSummary(response?.summary),
    monthlyPerformance: mapMonthlyPerformance(response?.monthlyPerformance),
    bookingStatus: mapBreakdown(response?.bookingStatus),
    propertyTypes: mapBreakdown(response?.propertyTypes),
    topHosts: mapTopHosts(response?.topHosts),
  } satisfies AdminReportsData;
}
