const db = require('../config/database');

class BookingModel {
  static async findAll({ status, search, limit, offset } = {}) {
    let sql = `
      SELECT
        b.id,
        b.booking_code,
        b.user_id,
        u.name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone,
        b.homestay_id,
        h.name AS homestay_name,
        l.name AS location_name,
        b.check_in,
        b.check_out,
        b.guests,
        b.nights,
        b.price_per_night,
        b.discount_amount,
        b.total_price,
        b.status,
        b.notes,
        pay.payment_method,
        pay.status AS payment_status,
        b.created_at
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN homestays h ON b.homestay_id = h.id
      JOIN locations l ON h.location_id = l.id
      LEFT JOIN payments pay ON pay.booking_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND b.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (b.booking_code LIKE ? OR u.name LIKE ? OR h.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY b.created_at DESC';

    if (limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit, 10), parseInt(offset || 0, 10));
    }

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async findByUserId(userId) {
    const [rows] = await db.query(
      `SELECT
        b.id,
        b.booking_code,
        b.user_id,
        b.homestay_id,
        h.name AS homestay_name,
        hi.image_url AS homestay_image,
        l.name AS location_name,
        t.name AS type_name,
        b.check_in,
        b.check_out,
        b.guests,
        b.nights,
        b.total_price,
        b.discount_amount,
        b.status,
        b.created_at
      FROM bookings b
      JOIN homestays h ON b.homestay_id = h.id
      JOIN locations l ON h.location_id = l.id
      JOIN homestay_types t ON h.type_id = t.id
      LEFT JOIN homestay_images hi ON hi.homestay_id = h.id AND hi.is_primary = 1
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC`,
      [userId]
    );
    return rows;
  }

  static async updateStatus(id, status, cancelledReason = null) {
    if (status === 'cancelled') {
      const [result] = await db.query(
        'UPDATE bookings SET status = ?, cancelled_at = NOW(), cancelled_reason = ? WHERE id = ?',
        [status, cancelledReason || 'Quản trị viên hủy đơn', id]
      );
      return result.affectedRows > 0;
    }

    const [result] = await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  }

  static async getMonthlyRevenueStats() {
    const [rows] = await db.query(`
      SELECT
        DATE_FORMAT(created_at, '%m/%Y') AS month,
        DATE_FORMAT(created_at, '%Y-%m') AS raw_month,
        COUNT(id) AS booking_count,
        SUM(CASE WHEN status IN ('confirmed', 'completed') THEN total_price ELSE 0 END) AS revenue
      FROM bookings
      GROUP BY raw_month, month
      ORDER BY raw_month ASC
      LIMIT 12
    `);
    return rows;
  }

  static async getCounts() {
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM bookings');
    const [[{ pending }]] = await db.query("SELECT COUNT(*) AS pending FROM bookings WHERE status = 'pending'");
    const [[{ revenue }]] = await db.query(
      "SELECT IFNULL(SUM(total_price), 0) AS revenue FROM bookings WHERE status IN ('confirmed', 'completed')"
    );
    return {
      total,
      pending,
      grossRevenue: parseFloat(revenue),
    };
  }
}

module.exports = BookingModel;
