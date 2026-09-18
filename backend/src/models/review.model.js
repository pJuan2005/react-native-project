const db = require('../config/database');

class ReviewModel {
  static async findByHomestayId(homestayId) {
    const [rows] = await db.query(
      `SELECT
        r.id,
        r.rating,
        r.comment,
        r.is_verified,
        r.created_at,
        u.id AS user_id,
        u.name AS user_name,
        u.avatar_url AS user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.homestay_id = ? AND r.is_active = 1
      ORDER BY r.created_at DESC`,
      [homestayId]
    );
    return rows;
  }

  static async create({ userId, homestayId, bookingId, rating, comment }) {
    if (rating < 1 || rating > 5) {
      throw new Error('Số sao đánh giá phải từ 1 đến 5 sao');
    }

    const [result] = await db.query(
      `INSERT INTO reviews (user_id, homestay_id, booking_id, rating, comment, is_verified, is_active)
       VALUES (?, ?, ?, ?, ?, 1, 1)`,
      [userId, homestayId, bookingId || null, rating, comment || '']
    );

    const reviewId = result.insertId;

    // Trigger in DB automatically updates average rating in homestays table!
    // Also reward points (+50 points for reviewing)
    await db.query('UPDATE users SET reward_points = reward_points + 50 WHERE id = ?', [userId]);
    await db.query(
      'INSERT INTO point_transactions (user_id, title, points, type, reference_id) VALUES (?, "Thưởng đánh giá 5★ chỗ nghỉ", 50, "earn", ?)',
      [userId, reviewId]
    );

    return reviewId;
  }
}

module.exports = ReviewModel;
