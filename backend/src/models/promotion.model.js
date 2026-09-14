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

  static async findByCode(code) {
    const [rows] = await db.query(
      `SELECT id, code, title, description, discount_type, discount_value, max_discount_amount, min_booking_amount, required_points, start_date, end_date, usage_limit, used_count
       FROM promotions
       WHERE code = ? AND is_active = 1`,
      [code.trim().toUpperCase()]
    );
    return rows[0] || null;
  }
}

module.exports = PromotionModel;
