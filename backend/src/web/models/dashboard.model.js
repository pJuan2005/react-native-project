const db = require("../common/db");
const { buildVariantUrl } = require("../common/propertyUpload");
const {
  calculateRevenueTotals,
  normalizeMoney,
  resolveRevenueSplitForRow,
} = require("../common/bookingFinance");
const PlatformSetting = require("./platform-setting.model");

const Dashboard = {};

function toNumber(value) {
  return Number(value || 0);
}

function formatMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function formatMonthLabel(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
  });
}

function buildMonthlySeries(monthlyTotals, monthCount) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1), 1);

  return Array.from({ length: monthCount }, (_, index) => {
    const currentDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + index,
      1,
    );
    const period = formatMonthKey(currentDate);
    const currentTotals = monthlyTotals.get(period) || {
      grossRevenue: 0,
      platformRevenue: 0,
      hostPayout: 0,
      bookings: 0,
    };

    return {
      month: formatMonthLabel(currentDate),
      period,
      revenue: currentTotals.grossRevenue,
      grossRevenue: currentTotals.grossRevenue,
      platformRevenue: currentTotals.platformRevenue,
      hostPayout: currentTotals.hostPayout,
      bookings: currentTotals.bookings,
    };
  });
}

async function getConfirmedRevenueRows(query, params) {
  const [rows] = await db.promise().query(query, params);

  return rows.map((row) => ({
    totalPrice: toNumber(row.totalPrice),
    commissionRateApplied: Number(row.commissionRateApplied || 0),
    commissionAmount: toNumber(row.commissionAmount),
    hostPayoutAmount: toNumber(row.hostPayoutAmount),
    source: row.source || "guest_online",
  }));
}

function createEmptyMonthlyTotals() {
  return {
    grossRevenue: 0,
    platformRevenue: 0,
    hostPayout: 0,
    bookings: 0,
  };
}

function buildRevenueMapByMonth(rows, commissionRate) {
  const totalsByMonth = new Map();

  for (const row of rows) {
    const period = String(row.period || "");
    if (!period) {
      continue;
    }

    const currentTotals = totalsByMonth.get(period) || createEmptyMonthlyTotals();
    const split = resolveRevenueSplitForRow(row, commissionRate);

    currentTotals.grossRevenue = normalizeMoney(
      currentTotals.grossRevenue + split.grossRevenue,
    );
    currentTotals.platformRevenue = normalizeMoney(
      currentTotals.platformRevenue + split.platformRevenue,
    );
    currentTotals.hostPayout = normalizeMoney(
      currentTotals.hostPayout + split.hostPayout,
    );
    currentTotals.bookings += 1;

    totalsByMonth.set(period, currentTotals);
  }

  return totalsByMonth;
}

async function getHostSummary(hostId, platformSettings) {
  const [propertyResult, bookingResult, reviewResult] = await Promise.all([
    db.promise().query(
      `SELECT
        COUNT(*) AS propertyCount,
        COUNT(
          CASE
            WHEN YEAR(created_at) = YEAR(CURDATE())
              AND MONTH(created_at) = MONTH(CURDATE())
            THEN 1
          END
        ) AS propertiesThisMonth
       FROM properties
       WHERE host_id = ?
         AND is_deleted = 0`,
      [hostId],
    ),
    db.promise().query(
      `SELECT
        COUNT(*) AS bookingCount,
        COUNT(CASE WHEN payment_status = 'proof_uploaded' THEN 1 END) AS pendingProofCount,
        COUNT(
          CASE
            WHEN YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)
            THEN 1
          END
        ) AS bookingsThisWeek
       FROM bookings
       WHERE property_id IN (
         SELECT id
         FROM properties
         WHERE host_id = ?
           AND is_deleted = 0
       )`,
      [hostId],
    ),
    db.promise().query(
      `SELECT
        COUNT(*) AS reviewCount,
        COALESCE(AVG(r.rating), 0) AS averageRating
       FROM reviews r
       WHERE r.property_id IN (
         SELECT id
         FROM properties
         WHERE host_id = ?
           AND is_deleted = 0
       )`,
      [hostId],
    ),
  ]);
  const propertySummary = propertyResult[0]?.[0] || {};
  const bookingSummary = bookingResult[0]?.[0] || {};
  const reviewSummary = reviewResult[0]?.[0] || {};
  const revenueRows = await getConfirmedRevenueRows(
    `SELECT
      b.total_price AS totalPrice,
      b.commission_rate_applied AS commissionRateApplied,
      b.commission_amount AS commissionAmount,
      b.host_payout_amount AS hostPayoutAmount,
      b.source AS source
     FROM bookings b
     JOIN properties p ON p.id = b.property_id
     WHERE p.host_id = ?
       AND p.is_deleted = 0
       AND b.status = 'confirmed'`,
    [hostId],
  );
  const revenueTotals = calculateRevenueTotals(
    revenueRows,
    platformSettings.platformCommissionRate,
  );

  return {
    propertyCount: toNumber(propertySummary?.propertyCount),
    bookingCount: toNumber(bookingSummary?.bookingCount),
    pendingProofCount: toNumber(bookingSummary?.pendingProofCount),
    reviewCount: toNumber(reviewSummary?.reviewCount),
    propertiesThisMonth: toNumber(propertySummary?.propertiesThisMonth),
    bookingsThisWeek: toNumber(bookingSummary?.bookingsThisWeek),
    grossRevenue: revenueTotals.grossRevenue,
    totalRevenue: revenueTotals.hostPayout,
    platformFeeAmount: revenueTotals.platformRevenue,
    platformCommissionRate: revenueTotals.platformCommissionRate,
    averageRating: Number(reviewSummary?.averageRating || 0),
  };
}

async function getHostRecentBookings(hostId, limit = 5) {
  const [rows] = await db.promise().query(
    `SELECT
      b.id,
      COALESCE(guest.full_name, b.guest_name_snapshot, 'Walk-in Guest') AS guestName,
      b.guests,
      p.title AS propertyTitle,
      DATE_FORMAT(b.check_in, '%Y-%m-%d') AS checkIn,
      DATE_FORMAT(b.check_out, '%Y-%m-%d') AS checkOut,
      b.total_price AS totalPrice,
      b.status
     FROM bookings b
     JOIN properties p ON p.id = b.property_id
     LEFT JOIN users guest ON guest.id = b.guest_id
     WHERE p.host_id = ?
       AND p.is_deleted = 0
     ORDER BY b.created_at DESC, b.id DESC
     LIMIT ?`,
    [hostId, limit],
  );

  return rows.map((row) => ({
    id: toNumber(row.id),
    guestName: row.guestName,
    guests: toNumber(row.guests),
    propertyTitle: row.propertyTitle,
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    totalPrice: toNumber(row.totalPrice),
    status: row.status,
  }));
}

async function getHostProperties(hostId, limit = 5) {
  const [rows] = await db.promise().query(
    `SELECT
      p.id,
      p.title,
      p.cover_image AS image,
      p.price_per_night AS price,
      p.status,
      COALESCE(AVG(r.rating), 0) AS rating
     FROM properties p
     LEFT JOIN reviews r ON r.property_id = p.id
     WHERE p.host_id = ?
       AND p.is_deleted = 0
     GROUP BY p.id
     ORDER BY p.created_at DESC, p.id DESC
     LIMIT ?`,
    [hostId, limit],
  );

  return rows.map((row) => ({
    id: toNumber(row.id),
    title: row.title,
    image: buildVariantUrl(row.image, "thumb"),
    price: toNumber(row.price),
    status: row.status,
    rating: Number(row.rating || 0),
  }));
}

async function getAdminSummary(platformSettings) {
  const [userResult, propertyResult, bookingResult] = await Promise.all([
    db.promise().query(
      `SELECT
        COUNT(*) AS totalUsers,
        COUNT(CASE WHEN role = 'host' THEN 1 END) AS totalHosts,
        COUNT(CASE WHEN role = 'guest' THEN 1 END) AS totalGuests,
        COUNT(CASE WHEN status = 'active' THEN 1 END) AS activeUsers,
        COUNT(CASE WHEN role = 'host' AND status = 'active' THEN 1 END) AS activeHosts
       FROM users`,
    ),
    db.promise().query(
      `SELECT
        COUNT(*) AS totalProperties,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) AS approvedProperties,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pendingProperties
       FROM properties
       WHERE is_deleted = 0`,
    ),
    db.promise().query(
      `SELECT
        COUNT(*) AS totalBookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) AS confirmedBookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pendingBookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelledBookings
       FROM bookings`,
    ),
  ]);
  const userSummary = userResult[0]?.[0] || {};
  const propertySummary = propertyResult[0]?.[0] || {};
  const bookingSummary = bookingResult[0]?.[0] || {};
  const revenueRows = await getConfirmedRevenueRows(
    `SELECT
      total_price AS totalPrice,
      commission_rate_applied AS commissionRateApplied,
      commission_amount AS commissionAmount,
      host_payout_amount AS hostPayoutAmount,
      source
     FROM bookings
     WHERE status = 'confirmed'`,
    [],
  );
  const revenueTotals = calculateRevenueTotals(
    revenueRows,
    platformSettings.platformCommissionRate,
  );

  return {
    totalUsers: toNumber(userSummary?.totalUsers),
    totalHosts: toNumber(userSummary?.totalHosts),
    totalGuests: toNumber(userSummary?.totalGuests),
    activeUsers: toNumber(userSummary?.activeUsers),
    activeHosts: toNumber(userSummary?.activeHosts),
    totalProperties: toNumber(propertySummary?.totalProperties),
    approvedProperties: toNumber(propertySummary?.approvedProperties),
    pendingProperties: toNumber(propertySummary?.pendingProperties),
    totalBookings: toNumber(bookingSummary?.totalBookings),
    confirmedBookings: toNumber(bookingSummary?.confirmedBookings),
    pendingBookings: toNumber(bookingSummary?.pendingBookings),
    cancelledBookings: toNumber(bookingSummary?.cancelledBookings),
    totalRevenue: revenueTotals.grossRevenue,
    grossRevenue: revenueTotals.grossRevenue,
    platformRevenue: revenueTotals.platformRevenue,
    hostPayoutTotal: revenueTotals.hostPayout,
    platformCommissionRate: revenueTotals.platformCommissionRate,
  };
}

async function getMonthlyPerformance(platformSettings, monthCount = 7) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1), 1);
  const [rows] = await db.promise().query(
    `SELECT
      DATE_FORMAT(check_in, '%Y-%m-01') AS period,
      total_price AS totalPrice,
      commission_rate_applied AS commissionRateApplied,
      commission_amount AS commissionAmount,
      host_payout_amount AS hostPayoutAmount,
      source
     FROM bookings
     WHERE status = 'confirmed'
       AND check_in >= ?
     ORDER BY period ASC`,
    [formatMonthKey(startDate)],
  );

  return buildMonthlySeries(
    buildRevenueMapByMonth(rows, platformSettings.platformCommissionRate),
    monthCount,
  );
}

async function getRecentBookings(limit = 6) {
  const [rows] = await db.promise().query(
    `SELECT
      b.id,
      COALESCE(guest.full_name, b.guest_name_snapshot, 'Walk-in Guest') AS guestName,
      DATE_FORMAT(b.check_in, '%Y-%m-%d') AS checkIn,
      DATE_FORMAT(b.check_out, '%Y-%m-%d') AS checkOut,
      b.total_price AS totalPrice,
      b.status
     FROM bookings b
     LEFT JOIN users guest ON guest.id = b.guest_id
     JOIN properties p ON p.id = b.property_id
     WHERE p.is_deleted = 0
     ORDER BY b.created_at DESC, b.id DESC
     LIMIT ?`,
    [limit],
  );

  return rows.map((row) => ({
    id: toNumber(row.id),
    guestName: row.guestName,
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    totalPrice: toNumber(row.totalPrice),
    status: row.status,
  }));
}

async function getBookingStatusBreakdown() {
  const [rows] = await db.promise().query(
    `SELECT status, COUNT(*) AS total
     FROM bookings
     GROUP BY status
     ORDER BY FIELD(status, 'confirmed', 'pending', 'cancelled')`,
  );

  return rows.map((row) => ({
    name: String(row.status || ""),
    value: toNumber(row.total),
  }));
}

async function getPropertyTypeBreakdown() {
  const [rows] = await db.promise().query(
    `SELECT
      property_type AS name,
      COUNT(*) AS value
     FROM properties
     WHERE is_deleted = 0
     GROUP BY property_type
     ORDER BY value DESC, property_type ASC`,
  );

  return rows.map((row) => ({
    name: row.name || "Other",
    value: toNumber(row.value),
  }));
}

async function getTopHosts(platformSettings, limit = 5) {
  const [rows] = await db.promise().query(
    `SELECT
      u.id,
      u.full_name AS name,
      COUNT(DISTINCT p.id) AS properties,
      COUNT(DISTINCT b.id) AS bookings
     FROM users u
     JOIN properties p
       ON p.host_id = u.id
      AND p.is_deleted = 0
     LEFT JOIN bookings b ON b.property_id = p.id
     WHERE u.role = 'host'
     GROUP BY u.id
      ORDER BY bookings DESC, properties DESC, u.full_name ASC`,
  );

  const [revenueRows] = await db.promise().query(
    `SELECT
      p.host_id AS hostId,
      b.total_price AS totalPrice,
      b.commission_rate_applied AS commissionRateApplied,
      b.commission_amount AS commissionAmount,
      b.host_payout_amount AS hostPayoutAmount,
      b.source AS source
     FROM bookings b
     JOIN properties p
       ON p.id = b.property_id
      AND p.is_deleted = 0
     WHERE b.status = 'confirmed'`,
  );

  const revenueByHost = new Map();

  for (const row of revenueRows) {
    const hostId = toNumber(row.hostId);
    const currentTotals = revenueByHost.get(hostId) || {
      grossRevenue: 0,
      platformRevenue: 0,
      hostPayout: 0,
    };
    const split = resolveRevenueSplitForRow(
      row,
      platformSettings.platformCommissionRate,
    );

    currentTotals.grossRevenue = normalizeMoney(
      currentTotals.grossRevenue + split.grossRevenue,
    );
    currentTotals.platformRevenue = normalizeMoney(
      currentTotals.platformRevenue + split.platformRevenue,
    );
    currentTotals.hostPayout = normalizeMoney(
      currentTotals.hostPayout + split.hostPayout,
    );

    revenueByHost.set(hostId, currentTotals);
  }

  return rows.map((row) => {
    const revenueTotals = revenueByHost.get(toNumber(row.id)) || {
      grossRevenue: 0,
      platformRevenue: 0,
      hostPayout: 0,
    };

    return {
      id: toNumber(row.id),
      name: row.name,
      properties: toNumber(row.properties),
      bookings: toNumber(row.bookings),
      revenue: revenueTotals.hostPayout,
      grossRevenue: revenueTotals.grossRevenue,
      platformRevenue: revenueTotals.platformRevenue,
    };
  }).sort((left, right) => {
    if (right.revenue !== left.revenue) {
      return right.revenue - left.revenue;
    }

    if (right.bookings !== left.bookings) {
      return right.bookings - left.bookings;
    }

    return right.properties - left.properties;
  }).slice(0, limit);
}

Dashboard.getHostDashboard = async (hostId) => {
  const platformSettings = await PlatformSetting.getPlatformSettings();
  const [summary, recentBookings, properties] = await Promise.all([
    getHostSummary(hostId, platformSettings),
    getHostRecentBookings(hostId),
    getHostProperties(hostId),
  ]);

  return {
    summary,
    recentBookings,
    properties,
  };
};

Dashboard.getAdminDashboard = async () => {
  const platformSettings = await PlatformSetting.getPlatformSettings();
  const [summary, monthlyPerformance, recentBookings] = await Promise.all([
    getAdminSummary(platformSettings),
    getMonthlyPerformance(platformSettings, 7),
    getRecentBookings(6),
  ]);

  return {
    summary,
    monthlyPerformance,
    recentBookings,
  };
};

Dashboard.getAdminReports = async () => {
  const platformSettings = await PlatformSetting.getPlatformSettings();
  const [summary, monthlyPerformance, bookingStatus, propertyTypes, topHosts] =
    await Promise.all([
      getAdminSummary(platformSettings),
      getMonthlyPerformance(platformSettings, 7),
      getBookingStatusBreakdown(),
      getPropertyTypeBreakdown(),
      getTopHosts(platformSettings, 5),
    ]);

  return {
    summary,
    monthlyPerformance,
    bookingStatus,
    propertyTypes,
    topHosts,
  };
};

module.exports = Dashboard;
