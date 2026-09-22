const db = require('../config/database');

const MOCK_PROMOTIONS = [
  { id: 1, code: 'WELCOME10', title: 'Ưu đãi chào mừng bạn mới', description: 'Giảm 10% tối đa 300.000₫ cho tất cả homestay', discount_type: 'percent', discount_value: '10.00', max_discount_amount: '300000.00', min_booking_amount: '0.00', required_points: 0, end_date: '2026-12-31T23:59:59.000Z' },
  { id: 2, code: 'HELLOHOLIDAY', title: 'Voucher Lễ Hội 2026', description: 'Giảm trực tiếp 200.000₫ cho đơn từ 1.500.000₫', discount_type: 'fixed', discount_value: '200000.00', max_discount_amount: null, min_booking_amount: '1500000.00', required_points: 0, end_date: '2026-12-31T23:59:59.000Z' },
  { id: 3, code: 'SUMMER2026', title: 'Mùa hè rực rỡ', description: 'Giảm 15% tối đa 500.000₫ cho các homestay biển', discount_type: 'percent', discount_value: '15.00', max_discount_amount: '500000.00', min_booking_amount: '2000000.00', required_points: 0, end_date: '2026-08-31T23:59:59.000Z' },
];

class PromotionModel {
  static async findAllActive() {
    try {
      // Chỉ trả về các voucher công khai / quà tặng miễn phí (không yêu cầu đổi điểm)
      const [rows] = await db.query(
        `SELECT id, code, title, description, discount_type, discount_value, max_discount_amount, min_booking_amount, required_points, end_date
         FROM promotions
         WHERE is_active = 1 AND (required_points = 0 OR required_points IS NULL) AND NOW() BETWEEN start_date AND end_date
         ORDER BY created_at DESC`
      );
      return rows.length > 0 ? rows : MOCK_PROMOTIONS;
    } catch (_) {
      return MOCK_PROMOTIONS;
    }
  }

  static async findMyVouchers(userId) {
    try {
      // 1. Lấy danh sách voucher công khai (miễn phí, không cần đổi điểm)
      const [publicPromos] = await db.query(
        `SELECT id, code, title, description, discount_type, discount_value, max_discount_amount, min_booking_amount, required_points, end_date
         FROM promotions
         WHERE is_active = 1 AND (required_points = 0 OR required_points IS NULL) AND NOW() BETWEEN start_date AND end_date
         ORDER BY created_at DESC`
      );

      if (!userId) return publicPromos;

      // 2. Lấy các voucher mà user này đã dùng điểm để quy đổi
      const [redeemedRows] = await db.query(
        `SELECT DISTINCT p.id, p.code, p.title, p.description, p.discount_type, p.discount_value, p.max_discount_amount, p.min_booking_amount, p.required_points, p.end_date
         FROM promotions p
         JOIN point_transactions pt ON pt.reference_id = p.id AND pt.user_id = ? AND pt.type = 'redeem'
         WHERE p.is_active = 1 AND NOW() BETWEEN p.start_date AND p.end_date`,
        [userId]
      );

      // 3. Lấy danh sách ID voucher mà người dùng này ĐÃ SỬ DỤNG trong các đơn đặt phòng (không tính đơn đã hủy)
      const [usedPromoRows] = await db.query(
        `SELECT promotion_id, COUNT(*) as used_times
         FROM bookings
         WHERE user_id = ? AND promotion_id IS NOT NULL AND status != 'cancelled'
         GROUP BY promotion_id`,
        [userId]
      );
      const usedPromoMap = new Map();
      usedPromoRows.forEach((r) => usedPromoMap.set(Number(r.promotion_id), Number(r.used_times)));

      // 4. Hợp nhất danh sách voucher hợp lệ của user (chỉ những voucher được quyền dùng và chưa bị dùng hết)
      const all = [];

      for (const p of publicPromos) {
        const timesUsed = usedPromoMap.get(Number(p.id)) || 0;
        if (timesUsed === 0) {
          all.push(p);
        }
      }

      for (const r of redeemedRows) {
        if (!all.some((item) => item.id === r.id)) {
          const timesUsed = usedPromoMap.get(Number(r.id)) || 0;
          const [[{ count: redeemTimes }]] = await db.query(
            `SELECT COUNT(*) as count FROM point_transactions WHERE user_id = ? AND reference_id = ? AND type = 'redeem'`,
            [userId, r.id]
          );
          if (redeemTimes > timesUsed) {
            all.push(r);
          }
        }
      }

      return all.length > 0 ? all : MOCK_PROMOTIONS;
    } catch (_) {
      return MOCK_PROMOTIONS;
    }
  }

  static async findRedeemable() {
    const [rows] = await db.query(
      `SELECT id, code, title, description, discount_type, discount_value, max_discount_amount, min_booking_amount, required_points, end_date
       FROM promotions
       WHERE is_active = 1 AND required_points > 0 AND NOW() BETWEEN start_date AND end_date
       ORDER BY required_points ASC`
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
      [userId, `Đổi điểm nhận ${promo.title} (${promo.code})`, -pointsCost, promotionId]
    );

    return {
      voucher: promo,
      remainingPoints: userRows[0].reward_points - pointsCost,
    };
  }
}

module.exports = PromotionModel;
