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
        pay.proof_image_url,
        pay.transaction_code,
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

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT
        b.id,
        b.booking_code,
        b.user_id,
        u.name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone,
        b.homestay_id,
        h.name AS homestay_name,
        hi.image_url AS homestay_image,
        l.name AS location_name,
        t.name AS type_name,
        b.check_in,
        b.check_out,
        b.guests,
        b.nights,
        b.price_per_night,
        b.promotion_id,
        p.code AS promotion_code,
        p.title AS promotion_title,
        b.discount_amount,
        b.total_price,
        b.status,
        b.notes,
        b.cancelled_at,
        b.cancelled_reason,
        pay.payment_method,
        pay.status AS payment_status,
        pay.proof_image_url,
        pay.transaction_code,
        b.created_at
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN homestays h ON b.homestay_id = h.id
      JOIN locations l ON h.location_id = l.id
      JOIN homestay_types t ON h.type_id = t.id
      LEFT JOIN homestay_images hi ON hi.homestay_id = h.id AND hi.is_primary = 1
      LEFT JOIN promotions p ON b.promotion_id = p.id
      LEFT JOIN payments pay ON pay.booking_id = b.id
      WHERE b.id = ? OR b.booking_code = ?`,
      [id, id]
    );
    return rows[0] || null;
  }

  static async findByUserId(userId, status = null) {
    let sql = `
      SELECT
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
        b.price_per_night,
        b.promotion_id,
        p.code AS voucher_code,
        b.discount_amount,
        b.total_price,
        b.status,
        b.notes,
        pay.payment_method,
        pay.status AS payment_status,
        pay.proof_image_url,
        b.created_at
      FROM bookings b
      JOIN homestays h ON b.homestay_id = h.id
      JOIN locations l ON h.location_id = l.id
      JOIN homestay_types t ON h.type_id = t.id
      LEFT JOIN homestay_images hi ON hi.homestay_id = h.id AND hi.is_primary = 1
      LEFT JOIN promotions p ON b.promotion_id = p.id
      LEFT JOIN payments pay ON pay.booking_id = b.id
      WHERE b.user_id = ?
    `;
    const params = [userId];

    if (status && status !== 'all') {
      sql += ' AND b.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY b.created_at DESC';

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async createBooking({
    userId,
    homestayId,
    checkIn,
    checkOut,
    guests,
    promotionId = null,
    paymentMethod = 'cash',
    notes = '',
  }) {
    // 1. Get Homestay
    const [hRows] = await db.query(
      'SELECT id, name, price, max_guests, is_active FROM homestays WHERE id = ?',
      [homestayId]
    );
    if (hRows.length === 0 || !hRows[0].is_active) {
      throw new Error('Homestay không tồn tại hoặc đã ngừng kinh doanh');
    }
    const homestay = hRows[0];

    if (guests > homestay.max_guests) {
      throw new Error(`Số lượng khách vượt quá sức chứa tối đa (${homestay.max_guests} người)`);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      throw new Error('Ngày trả phòng phải sau ngày nhận phòng');
    }

    // 2. Check Overbooking
    const [conflicts] = await db.query(
      `SELECT COUNT(*) AS conflict_count
       FROM bookings
       WHERE homestay_id = ?
         AND status IN ('pending', 'confirmed')
         AND check_in < ?
         AND check_out > ?`,
      [homestayId, checkOut, checkIn]
    );

    if (conflicts[0].conflict_count > 0) {
      throw new Error('Homestay đã có khách đặt trong khoảng thời gian này');
    }

    // 3. Compute Nights and Raw Total
    const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
    const pricePerNight = parseFloat(homestay.price);
    const rawTotal = pricePerNight * nights;
    let discountAmount = 0;

    // 4. Calculate Promotion Discount
    if (promotionId) {
      const [promoRows] = await db.query(
        'SELECT id, code, discount_type, discount_value, max_discount_amount, min_booking_amount FROM promotions WHERE id = ? AND is_active = 1 AND NOW() BETWEEN start_date AND end_date',
        [promotionId]
      );
      if (promoRows.length > 0) {
        const promo = promoRows[0];
        if (rawTotal >= parseFloat(promo.min_booking_amount || 0)) {
          if (promo.discount_type === 'percent') {
            discountAmount = (rawTotal * parseFloat(promo.discount_value)) / 100;
            if (promo.max_discount_amount && discountAmount > parseFloat(promo.max_discount_amount)) {
              discountAmount = parseFloat(promo.max_discount_amount);
            }
          } else {
            discountAmount = parseFloat(promo.discount_value);
          }
          await db.query('UPDATE promotions SET used_count = used_count + 1 WHERE id = ?', [promo.id]);
        }
      }
    }

    const finalTotal = Math.max(0, rawTotal - discountAmount);
    const bookingCode = `BK${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Insert Booking với status mặc định = 'pending' (Chờ thanh toán / Chờ Web Admin duyệt)
    const [result] = await db.query(
      `INSERT INTO bookings (
        booking_code, user_id, homestay_id, check_in, check_out,
        guests, nights, price_per_night, promotion_id, discount_amount,
        total_price, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        bookingCode,
        userId,
        homestayId,
        checkIn,
        checkOut,
        guests || 1,
        nights,
        pricePerNight,
        promotionId || null,
        discountAmount,
        finalTotal,
        notes || '',
      ]
    );

    const bookingId = result.insertId;

    // 6. Insert Payment Record
    await db.query(
      `INSERT INTO payments (booking_id, payment_method, amount, status, paid_at)
       VALUES (?, ?, ?, 'pending', NULL)`,
      [
        bookingId,
        paymentMethod || 'cash',
        finalTotal,
      ]
    );

    // 7. Reward Points (+100)
    await db.query('UPDATE users SET reward_points = reward_points + 100 WHERE id = ?', [userId]);
    await db.query(
      'INSERT INTO point_transactions (user_id, title, points, type, reference_id) VALUES (?, ?, 100, "earn", ?)',
      [userId, `Thưởng đặt phòng ${bookingCode} (${homestay.name})`, bookingId]
    );

    // 8. In-App Notification
    await db.query(
      `INSERT INTO notifications (user_id, title, content, type, reference_id)
       VALUES (?, 'Đã tạo đơn đặt phòng! ⏳', ?, 'booking_status', ?)`,
      [
        userId,
        `Đơn đặt phòng ${bookingCode} tại ${homestay.name} đã được ghi nhận. Vui lòng thanh toán để Admin duyệt đơn.`,
        bookingId,
      ]
    );

    return {
      id: String(bookingId),
      bookingCode,
      homestayName: homestay.name,
      checkIn,
      checkOut,
      guests,
      nights,
      pricePerNight,
      discountAmount,
      totalPrice: finalTotal,
      status: 'pending',
      paymentMethod,
    };
  }

  static async uploadPaymentProof(bookingId, userId, proofImageUrl, transactionCode = null) {
    const [rows] = await db.query(
      'SELECT id, user_id, booking_code, status FROM bookings WHERE id = ? OR booking_code = ?',
      [bookingId, bookingId]
    );
    if (rows.length === 0) {
      throw new Error('Không tìm thấy đơn đặt phòng');
    }
    const booking = rows[0];
    if (userId && String(booking.user_id) !== String(userId)) {
      throw new Error('Bạn không có quyền thao tác trên đơn đặt phòng này');
    }

    // Cập nhật trạng thái thanh toán = 'completed' (Thanh toán thành công)
    // Trạng thái đặt phòng (booking.status) vẫn giữ là 'pending' (Chờ Web Admin chấp nhận)
    await db.query(
      `UPDATE payments
       SET proof_image_url = ?, payment_method = 'bank_transfer', transaction_code = COALESCE(?, transaction_code), status = 'completed', paid_at = NOW(), updated_at = NOW()
       WHERE booking_id = ?`,
      [proofImageUrl, transactionCode || `FT${Date.now().toString().slice(-8)}`, booking.id]
    );

    // Ghi chú vào đơn đặt phòng
    await db.query(
      `UPDATE bookings
       SET notes = CONCAT(IFNULL(notes, ''), ' [Đã thanh toán CK, chờ Admin duyệt]')
       WHERE id = ?`,
      [booking.id]
    );

    // Thêm thông báo trong ứng dụng cho khách hàng
    if (booking.user_id) {
      await db.query(
        `INSERT INTO notifications (user_id, title, content, type, reference_id)
         VALUES (?, 'Thanh toán thành công! 💳', ?, 'booking_status', ?)`,
        [
          booking.user_id,
          `Đã ghi nhận minh chứng chuyển khoản cho đơn ${booking.booking_code}. Thanh toán thành công! Vui lòng chờ Web Admin kiểm tra và duyệt để chuyển sang trạng thái Đặt phòng thành công.`,
          booking.id,
        ]
      );
    }

    return {
      bookingId: booking.id,
      bookingCode: booking.booking_code,
      proofImageUrl,
      paymentStatus: 'completed',
      bookingStatus: booking.status,
      message: 'Thanh toán thành công! Minh chứng chuyển khoản đã được ghi nhận. Đơn đang chờ Quản trị viên (Web Admin) duyệt.',
    };
  }

  static async cancelBookingByUser(bookingId, userId, reason = 'Khách hủy đơn trên app') {
    const [rows] = await db.query(
      'SELECT id, user_id, status FROM bookings WHERE id = ? OR booking_code = ?',
      [bookingId, bookingId]
    );
    if (rows.length === 0) {
      throw new Error('Không tìm thấy đơn đặt phòng');
    }
    const booking = rows[0];
    if (userId && String(booking.user_id) !== String(userId)) {
      throw new Error('Bạn không có quyền hủy đơn đặt phòng này');
    }
    if (booking.status === 'completed') {
      throw new Error('Không thể hủy chuyến đi đã hoàn thành');
    }
    if (booking.status === 'cancelled') {
      return true; // Đã hủy từ trước
    }

    await db.query(
      'UPDATE bookings SET status = "cancelled", cancelled_at = NOW(), cancelled_reason = ? WHERE id = ?',
      [reason, booking.id]
    );

    // Cập nhật trạng thái thanh toán sang refunded nếu đã thanh toán
    await db.query(
      'UPDATE payments SET status = "refunded", updated_at = NOW() WHERE booking_id = ?',
      [booking.id]
    );

    return true;
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

    if (status === 'confirmed' || status === 'completed') {
      await db.query(
        "UPDATE payments SET status = 'completed', paid_at = COALESCE(paid_at, NOW()) WHERE booking_id = ?",
        [id]
      );
    }

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
