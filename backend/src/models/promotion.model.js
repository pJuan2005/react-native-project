const db = require('../config/database');

class PromotionModel {
  static async findAllActive() {
    const [rows] = await db.query(
      `SELECT id, code, title, description, discount_type, discount_value, max_discount_amount, min_booking_amount, required_points, end_date
       FROM promotions
       WHERE is_active = 1 AND NOW() BETWEEN start_date AND end_date
       ORDER BY created_at DESC`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT id, code, title, description, discount_type, discount_value, max_discount_amount, min_booking_amount, required_points, start_date, end_date, usage_limit, used_count
       FROM promotions
       WHERE id = ? AND is_active = 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByCode(code) {
    const [rows] = await db.query(
      `SELECT id, code, title, description, discount_type, discount_value, max_discount_amount, min_booking_amount, required_points, start_date, end_date, usage_limit, used_count
       FROM promotions
       WHERE code = ? AND is_active = 1`,
      [code.trim().toUpperCase()]
    );
    return rows[0] || null;
  }

  static async redeemWithPoints(userId, promotionId) {
    const promo = await this.findById(promotionId);
    if (!promo) {
      throw new Error('Mã giảm giá không tồn tại');
    }
    const pointsCost = promo.required_points || 0;
    if (pointsCost <= 0) {
      throw new Error('Voucher này là quà tặng miễn phí, không cần đổi điểm');
    }

    // Check user points
    const [userRows] = await db.query('SELECT reward_points FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0 || userRows[0].reward_points < pointsCost) {
      throw new Error(`Bạn cần tối thiểu ${pointsCost} điểm để đổi voucher này`);
    }

    // Deduct points
    await db.query('UPDATE users SET reward_points = reward_points - ? WHERE id = ?', [pointsCost, userId]);
    await db.query(
      'INSERT INTO point_transactions (user_id, title, points, type, reference_id) VALUES (?, ?, ?, "redeem", ?)',
      [userId, `Đổi điểm nhận ${promo.title} (${promo.code})`, pointsCost, promotionId]
    );

    return {
      voucher: promo,
      remainingPoints: userRows[0].reward_points - pointsCost,
    };
  }
}

module.exports = PromotionModel;
