const db = require('../config/database');

class ReviewModel {
  static async findByPropertyId(propertyId) {
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
      JOIN users u ON COALESCE(r.user_id, r.guest_id) = u.id
      WHERE r.property_id = ? AND r.is_active = 1
      ORDER BY r.created_at DESC`,
      [propertyId]
    );
    return rows;
  }

  // Alias for backward compatibility
  static async findByHomestayId(homestayId) {
    return this.findByPropertyId(homestayId);
  }

  static async create({ userId, propertyId, homestayId, bookingId, rating, comment, points = 150 }) {
    const targetPropertyId = propertyId || homestayId;
    if (!targetPropertyId) {
      throw new Error('Thiếu mã chỗ nghỉ cần đánh giá');
    }
    const numRating = parseInt(rating, 10);
    if (!numRating || numRating < 1 || numRating > 5) {
      throw new Error('Số sao đánh giá phải từ 1 đến 5 sao');
    }
    const numPoints = parseInt(points, 10) || (numRating === 5 ? 150 : numRating === 4 ? 100 : numRating === 3 ? 60 : numRating === 2 ? 30 : 10);

    // 1. Kiểm tra xem booking này đã có đánh giá trong cơ sở dữ liệu chưa
    let existingReviewId = null;
    try {
      if (bookingId) {
        const [existing] = await db.query(
          'SELECT id FROM reviews WHERE booking_id = ? LIMIT 1',
          [bookingId]
        );
        if (existing && existing.length > 0) {
          existingReviewId = existing[0].id;
        }
      }
    } catch (_) {}

    let reviewId;
    if (existingReviewId) {
      // Đã có bản ghi -> Cập nhật lại số sao và nhận xét (tương thích mọi schema)
      await db.query(
        'UPDATE reviews SET rating = ?, comment = ?, is_active = 1 WHERE id = ?',
        [numRating, comment || '', existingReviewId]
      );
      reviewId = existingReviewId;
    } else {
      // Chưa có bản ghi -> Thêm mới an toàn
      const [result] = await db.query(
        `INSERT INTO reviews (user_id, property_id, booking_id, rating, comment, is_verified, is_active)
         VALUES (?, ?, ?, ?, ?, 1, 1)`,
        [userId || null, targetPropertyId, bookingId || null, numRating, comment || '']
      );
      reviewId = result.insertId;
    }

    // 2. Tự động tính toán lại điểm rating trung bình cho chỗ nghỉ
    try {
      const [avgRows] = await db.query(
        'SELECT AVG(rating) as avg_rating, COUNT(id) as cnt FROM reviews WHERE property_id = ? AND is_active = 1',
        [targetPropertyId]
      );
      if (avgRows && avgRows.length > 0 && avgRows[0].cnt > 0) {
        await db.query(
          'UPDATE properties SET rating = ?, review_count = ? WHERE id = ?',
          [parseFloat(avgRows[0].avg_rating).toFixed(2), avgRows[0].cnt, targetPropertyId]
        );
      }
    } catch (_) {}

    // 3. Tặng điểm thưởng thành viên theo số sao (5★: +150, 4★: +100, 3★: +60, 2★: +30, 1★: +10)
    if (userId) {
      try {
        await db.query('UPDATE users SET reward_points = reward_points + ? WHERE id = ?', [numPoints, userId]);
      } catch (_) {}

      try {
        await db.query(
          'INSERT INTO point_transactions (user_id, title, points, type) VALUES (?, ?, ?, "earn")',
          [userId, `Thưởng đánh giá ${numRating}★ chỗ nghỉ`, numPoints]
        );
      } catch (_) {}
    }

    return reviewId;
  }
}

module.exports = ReviewModel;
