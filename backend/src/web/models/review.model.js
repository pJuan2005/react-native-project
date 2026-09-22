const db = require("../common/db");

const Review = {};

Review.findByBookingId = async (bookingId) => {
  const [rows] = await db.promise().query(
    `SELECT
      r.id,
      r.booking_id AS bookingId,
      r.property_id AS propertyId,
      r.guest_id AS guestId,
      r.rating,
      r.comment,
      r.created_at AS createdAt,
      u.full_name AS authorName
     FROM reviews r
     JOIN users u ON u.id = r.guest_id
     WHERE r.booking_id = ?
     LIMIT 1`,
    [bookingId],
  );

  return rows[0] || null;
};

Review.create = async ({ bookingId, propertyId, guestId, rating, comment }) => {
  const [result] = await db.promise().query(
    `INSERT INTO reviews (
      booking_id,
      property_id,
      guest_id,
      rating,
      comment
    ) VALUES (?, ?, ?, ?, ?)`,
    [bookingId, propertyId, guestId, rating, comment],
  );

  return Number(result.insertId);
};

module.exports = Review;
