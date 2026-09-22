const db = require("../common/db");
const { buildVariantUrl } = require("../common/propertyUpload");

const Booking = {};

function buildBookingCode(bookingId, createdAt = new Date()) {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `BK${year}${month}${day}${String(bookingId).padStart(4, "0")}`;
}

function buildPaymentReference(bookingId) {
  return `HSBK${String(bookingId).padStart(6, "0")}`;
}

function formatDateOnly(value) {
  if (!value) {
    return "";
  }

  const formatFromDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatFromDate(value);
  }

  const stringValue = String(value);
  const matchedDate = stringValue.match(/^\d{4}-\d{2}-\d{2}/);
  if (matchedDate) {
    return matchedDate[0];
  }

  const parsed = new Date(stringValue);
  if (!Number.isNaN(parsed.getTime())) {
    return formatFromDate(parsed);
  }

  return stringValue;
}

function mapBookingRow(row) {
  return {
    id: Number(row.id),
    bookingCode: row.bookingCode,
    propertyId: Number(row.propertyId),
    propertyTitle: row.propertyTitle,
    propertyLocation: row.propertyLocation,
    propertyImage: buildVariantUrl(row.propertyImage, "thumb"),
    guestId:
      row.guestId === null || row.guestId === undefined
        ? null
        : Number(row.guestId),
    guestName: row.guestName,
    guestEmail: row.guestEmail,
    guestPhone: row.guestPhone || "",
    hostId: Number(row.hostId),
    hostName: row.hostName,
    checkIn: formatDateOnly(row.checkIn),
    checkOut: formatDateOnly(row.checkOut),
    nights: Number(row.nights || 0),
    guests: Number(row.guests || 0),
    totalPrice: Number(row.totalPrice || 0),
    status: row.status,
    source: row.source || "guest_online",
    createdBy:
      row.createdBy === null || row.createdBy === undefined
        ? null
        : Number(row.createdBy),
    paymentMethod: row.paymentMethod || "bank_transfer",
    paymentReference: row.paymentReference,
    paymentStatus: row.paymentStatus || "unpaid",
    paymentProofImage: row.paymentProofImage,
    paymentSubmittedAt: row.paymentSubmittedAt,
    confirmedBy: row.confirmedBy ? Number(row.confirmedBy) : null,
    confirmedByName: row.confirmedByName || null,
    confirmedAt: row.confirmedAt,
    rejectionReason: row.rejectionReason || "",
    hostNote: row.hostNote || "",
    checkinInstructions: row.checkinInstructions || "",
    commissionRateApplied: Number(row.commissionRateApplied || 0),
    commissionAmount: Number(row.commissionAmount || 0),
    hostPayoutAmount: Number(row.hostPayoutAmount || 0),
    reviewId: row.reviewId ? Number(row.reviewId) : null,
    reviewRating: row.reviewRating ? Number(row.reviewRating) : null,
    reviewCreatedAt: row.reviewCreatedAt || null,
    createdAt: row.createdAt,
  };
}

async function getBookingList(whereClause, params = []) {
  const [rows] = await db.promise().query(
    `SELECT
      b.id,
      COALESCE(
        b.booking_code,
        CONCAT('BK', DATE_FORMAT(b.created_at, '%Y%m%d'), LPAD(b.id, 4, '0'))
      ) AS bookingCode,
      b.property_id AS propertyId,
      p.title AS propertyTitle,
      CONCAT(p.street_address, ', ', p.city, ', ', p.country) AS propertyLocation,
      p.cover_image AS propertyImage,
      p.host_id AS hostId,
      host.full_name AS hostName,
      guest.id AS guestId,
      COALESCE(guest.full_name, b.guest_name_snapshot, 'Walk-in Guest') AS guestName,
      COALESCE(guest.email, '') AS guestEmail,
      COALESCE(guest.phone, b.guest_phone_snapshot, '') AS guestPhone,
      b.check_in AS checkIn,
      b.check_out AS checkOut,
      COALESCE(b.nights, DATEDIFF(b.check_out, b.check_in)) AS nights,
      b.guests,
      b.total_price AS totalPrice,
      b.status,
      COALESCE(b.source, 'guest_online') AS source,
      b.created_by AS createdBy,
      COALESCE(b.payment_method, 'bank_transfer') AS paymentMethod,
      COALESCE(
        b.payment_reference,
        CONCAT('HSBK', LPAD(b.id, 6, '0'))
      ) AS paymentReference,
      COALESCE(
        b.payment_status,
        CASE
          WHEN b.status = 'confirmed' THEN 'verified'
          WHEN b.status = 'cancelled' THEN 'rejected'
          ELSE 'unpaid'
        END
      ) AS paymentStatus,
      b.payment_proof_image AS paymentProofImage,
      b.payment_submitted_at AS paymentSubmittedAt,
      b.confirmed_by AS confirmedBy,
      reviewer.full_name AS confirmedByName,
      b.confirmed_at AS confirmedAt,
      b.rejection_reason AS rejectionReason,
      b.host_note AS hostNote,
      b.checkin_instructions AS checkinInstructions,
      COALESCE(b.commission_rate_applied, 0) AS commissionRateApplied,
      COALESCE(b.commission_amount, 0) AS commissionAmount,
      COALESCE(b.host_payout_amount, 0) AS hostPayoutAmount,
      review.id AS reviewId,
      review.rating AS reviewRating,
      review.created_at AS reviewCreatedAt,
      b.created_at AS createdAt
     FROM bookings b
     JOIN properties p ON p.id = b.property_id
     LEFT JOIN users guest ON guest.id = b.guest_id
     JOIN users host ON host.id = p.host_id
     LEFT JOIN users reviewer ON reviewer.id = b.confirmed_by
     LEFT JOIN reviews review ON review.booking_id = b.id
     WHERE ${whereClause} AND p.is_deleted = 0
     ORDER BY b.created_at DESC`,
    params,
  );

  return rows.map(mapBookingRow);
}

async function getBookingDetail(whereClause, params = []) {
  const rows = await getBookingList(whereClause, params);
  return rows[0] || null;
}

Booking.getBookableProperty = async (propertyId) => {
  const [rows] = await db.promise().query(
    `SELECT
      id,
      host_id AS hostId,
      title,
      price_per_night AS pricePerNight,
      max_guests AS maxGuests,
      status
     FROM properties
     WHERE id = ? AND status = 'approved' AND is_deleted = 0
     LIMIT 1`,
    [propertyId],
  );

  if (rows.length === 0) {
    return null;
  }

  return {
    id: Number(rows[0].id),
    hostId: Number(rows[0].hostId),
    title: rows[0].title,
    pricePerNight: Number(rows[0].pricePerNight || 0),
    maxGuests: Number(rows[0].maxGuests || 0),
    status: rows[0].status,
  };
};

Booking.hasDateConflict = async (propertyId, checkIn, checkOut) => {
  const [rows] = await db.promise().query(
    `SELECT COUNT(*) AS total
     FROM bookings
     WHERE property_id = ?
       AND status IN ('pending', 'confirmed')
       AND check_in < ?
       AND check_out > ?`,
    [propertyId, checkOut, checkIn],
  );

  return Number(rows[0]?.total || 0) > 0;
};

Booking.create = async (payload) => {
  const [result] = await db.promise().query(
    `INSERT INTO bookings (
      property_id,
      guest_id,
      guest_name_snapshot,
      guest_phone_snapshot,
      check_in,
      check_out,
      nights,
      guests,
      total_price,
      status,
      source,
      created_by,
      payment_method,
      payment_status,
      commission_rate_applied,
      commission_amount,
      host_payout_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    [
      payload.propertyId,
      payload.guestId || null,
      payload.guestNameSnapshot || null,
      payload.guestPhoneSnapshot || null,
      payload.checkIn,
      payload.checkOut,
      payload.nights,
      payload.guests,
      payload.totalPrice,
      payload.status || "pending",
      payload.source || "guest_online",
      payload.createdBy || null,
      payload.paymentMethod || "bank_transfer",
      payload.paymentStatus || "unpaid",
      payload.commissionRateApplied || 0,
      payload.commissionAmount || 0,
      payload.hostPayoutAmount || 0,
    ],
  );

  const bookingId = Number(result.insertId);
  const bookingCode = buildBookingCode(bookingId);
  const paymentReference = buildPaymentReference(bookingId);

  await db.promise().query(
    `UPDATE bookings
     SET booking_code = ?, payment_reference = ?
     WHERE id = ?`,
    [bookingCode, paymentReference, bookingId],
  );

  return bookingId;
};

Booking.getByGuest = async (guestId) =>
  getBookingList("b.guest_id = ?", [guestId]);

Booking.getGuestById = async (bookingId, guestId) =>
  getBookingDetail("b.id = ? AND b.guest_id = ?", [bookingId, guestId]);

Booking.getByHost = async (hostId) =>
  getBookingList("p.host_id = ?", [hostId]);

Booking.getByProperty = async (propertyId) =>
  getBookingList("b.property_id = ?", [propertyId]);

Booking.getHostById = async (bookingId, hostId) =>
  getBookingDetail("b.id = ? AND p.host_id = ?", [bookingId, hostId]);

Booking.getAllAdmin = async () => getBookingList("1 = 1");

Booking.getAdminById = async (bookingId) =>
  getBookingDetail("b.id = ?", [bookingId]);

Booking.updatePaymentProof = async (bookingId, guestId, paymentProofImage) => {
  const [result] = await db.promise().query(
    `UPDATE bookings
     SET
       payment_proof_image = ?,
       payment_status = 'proof_uploaded',
       payment_submitted_at = NOW(),
       rejection_reason = NULL
     WHERE id = ? AND guest_id = ?`,
    [paymentProofImage, bookingId, guestId],
  );

  return result.affectedRows > 0;
};

Booking.cancelByGuest = async (bookingId, guestId) => {
  const [result] = await db.promise().query(
    `UPDATE bookings
     SET
       status = 'cancelled',
       payment_status = CASE
         WHEN payment_status = 'verified' THEN payment_status
         ELSE 'rejected'
       END,
       rejection_reason = 'Cancelled by guest'
     WHERE id = ? AND guest_id = ?`,
    [bookingId, guestId],
  );

  return result.affectedRows > 0;
};

Booking.confirmByHost = async (
  bookingId,
  hostId,
  reviewerId,
  { hostNote, checkinInstructions },
) => {
  const [result] = await db.promise().query(
    `UPDATE bookings b
     JOIN properties p ON p.id = b.property_id
     SET
       b.status = 'confirmed',
       b.payment_status = 'verified',
       b.confirmed_by = ?,
       b.confirmed_at = NOW(),
       b.rejection_reason = NULL,
       b.host_note = ?,
       b.checkin_instructions = ?
     WHERE b.id = ?
       AND p.host_id = ?
       AND b.status = 'pending'
       AND b.payment_status = 'proof_uploaded'`,
    [reviewerId, hostNote || null, checkinInstructions || null, bookingId, hostId],
  );

  return result.affectedRows > 0;
};

Booking.rejectByHost = async (
  bookingId,
  hostId,
  reviewerId,
  { rejectionReason, hostNote },
) => {
  const [result] = await db.promise().query(
    `UPDATE bookings b
     JOIN properties p ON p.id = b.property_id
     SET
       b.status = 'cancelled',
       b.payment_status = 'rejected',
       b.confirmed_by = ?,
       b.confirmed_at = NOW(),
       b.rejection_reason = ?,
       b.host_note = ?
     WHERE b.id = ?
       AND p.host_id = ?
       AND b.status = 'pending'
       AND b.payment_status = 'proof_uploaded'`,
    [reviewerId, rejectionReason || null, hostNote || null, bookingId, hostId],
  );

  return result.affectedRows > 0;
};

Booking.confirmByAdmin = async (
  bookingId,
  reviewerId,
  { hostNote, checkinInstructions },
) => {
  const [result] = await db.promise().query(
    `UPDATE bookings
     SET
       status = 'confirmed',
       payment_status = 'verified',
       confirmed_by = ?,
       confirmed_at = NOW(),
       rejection_reason = NULL,
       host_note = ?,
       checkin_instructions = ?
     WHERE id = ?
       AND status = 'pending'
       AND payment_status = 'proof_uploaded'`,
    [reviewerId, hostNote || null, checkinInstructions || null, bookingId],
  );

  return result.affectedRows > 0;
};

Booking.rejectByAdmin = async (
  bookingId,
  reviewerId,
  { rejectionReason, hostNote },
) => {
  const [result] = await db.promise().query(
    `UPDATE bookings
     SET
       status = 'cancelled',
       payment_status = 'rejected',
       confirmed_by = ?,
       confirmed_at = NOW(),
       rejection_reason = ?,
       host_note = ?
     WHERE id = ?
       AND status = 'pending'
       AND payment_status = 'proof_uploaded'`,
    [reviewerId, rejectionReason || null, hostNote || null, bookingId],
  );

  return result.affectedRows > 0;
};

module.exports = Booking;
