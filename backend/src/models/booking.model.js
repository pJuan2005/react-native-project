const db = require('../config/database');

class BookingModel {
  static async findAll({ status, source, hostId, propertyId, homestayId, search, limit, offset } = {}) {
    const targetPropertyId = propertyId || homestayId;
    let sql = `
      SELECT
        b.id,
        b.booking_code,
        b.user_id,
        b.guest_id,
        COALESCE(u.name, b.guest_name_snapshot, b.guest_name, 'Khách tại quầy') AS customer_name,
        COALESCE(u.email, '') AS customer_email,
        COALESCE(u.phone, b.guest_phone_snapshot, b.guest_phone, '') AS customer_phone,
        b.guest_name,
        b.guest_phone,
        b.property_id,
        b.property_id AS homestay_id,
        p.name AS property_title,
        p.name AS homestay_name,
        p.host_id,
        COALESCE(l.name, p.city) AS location_name,
        b.check_in,
        b.check_out,
        b.guests,
        b.nights,
        b.price_per_night,
        b.discount_amount,
        b.total_price,
        b.commission_rate,
        b.commission_amount,
        b.host_payout_amount,
        b.status,
        b.source,
        b.payment_status,
        b.notes,
        b.host_note,
        pay.payment_method,
        COALESCE(MAX(pay.status), b.payment_status) AS payment_status,
        COALESCE(MAX(pay.status), b.payment_status) AS payment_status_display,
        COALESCE(MAX(pay.proof_image_url), b.payment_proof_image) AS proof_image_url,
        pay.transaction_code,
        b.created_at
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN payments pay ON pay.booking_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND b.status = ?';
      params.push(status);
    }
    if (source && source !== 'all') {
      sql += ' AND b.source = ?';
      params.push(source);
    }
    if (hostId) {
      sql += ' AND p.host_id = ?';
      params.push(hostId);
    }
    if (targetPropertyId) {
      sql += ' AND b.property_id = ?';
      params.push(targetPropertyId);
    }
    if (search) {
      sql += ' AND (b.booking_code LIKE ? OR u.name LIKE ? OR b.guest_name LIKE ? OR p.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' GROUP BY b.id ORDER BY b.created_at DESC';

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
        b.guest_id,
        COALESCE(u.name, b.guest_name_snapshot, b.guest_name, 'Khách tại quầy') AS customer_name,
        COALESCE(u.email, '') AS customer_email,
        COALESCE(u.phone, b.guest_phone_snapshot, b.guest_phone, '') AS customer_phone,
        b.guest_name,
        b.guest_phone,
        b.property_id,
        b.property_id AS homestay_id,
        p.name AS property_title,
        p.name AS homestay_name,
        p.host_id,
        COALESCE(pi.image_url, p.cover_image) AS property_image,
        COALESCE(pi.image_url, p.cover_image) AS homestay_image,
        COALESCE(l.name, p.city) AS location_name,
        COALESCE(t.name, 'Homestay') AS type_name,
        b.check_in,
        b.check_out,
        b.guests,
        b.nights,
        b.price_per_night,
        b.promotion_id,
        prom.code AS promotion_code,
        prom.title AS promotion_title,
        b.discount_amount,
        b.total_price,
        b.commission_rate,
        b.commission_amount,
        b.host_payout_amount,
        b.status,
        b.source,
        b.payment_status,
        b.notes,
        b.host_note,
        b.cancelled_at,
        b.cancelled_reason,
        pay.payment_method,
        COALESCE(pay.status, b.payment_status) AS payment_status,
        COALESCE(pay.status, b.payment_status) AS payment_status_display,
        pay.proof_image_url,
        pay.transaction_code,
        b.created_at
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN homestay_types t ON p.type_id = t.id
      LEFT JOIN property_images pi ON pi.property_id = p.id AND pi.is_primary = 1
      LEFT JOIN promotions prom ON b.promotion_id = prom.id
      LEFT JOIN payments pay ON pay.booking_id = b.id
      WHERE b.id = ? OR b.booking_code = ?
      GROUP BY b.id`,
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
        b.property_id,
        b.property_id AS homestay_id,
        p.name AS homestay_name,
        p.name AS property_title,
        COALESCE(p.cover_image, MAX(pi.image_url)) AS homestay_image,
        COALESCE(p.cover_image, MAX(pi.image_url)) AS property_image,
        COALESCE(l.name, p.city) AS location_name,
        COALESCE(t.name, 'Homestay') AS type_name,
        b.check_in,
        b.check_out,
        b.guests,
        b.nights,
        b.price_per_night,
        b.promotion_id,
        prom.code AS voucher_code,
        b.discount_amount,
        b.total_price,
        b.status,
        b.source,
        b.payment_status,
        b.notes,
        COALESCE(MAX(pay.payment_method), b.payment_method, 'bank_transfer') AS payment_method,
        COALESCE(MAX(pay.status), b.payment_status, 'unpaid') AS payment_status,
        COALESCE(MAX(pay.status), b.payment_status, 'unpaid') AS payment_status_display,
        COALESCE(MAX(pay.proof_image_url), b.payment_proof_image) AS proof_image_url,
        b.created_at
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN homestay_types t ON p.type_id = t.id
      LEFT JOIN property_images pi ON pi.property_id = p.id AND pi.is_primary = 1
      LEFT JOIN promotions prom ON b.promotion_id = prom.id
      LEFT JOIN payments pay ON pay.booking_id = b.id
      WHERE b.user_id = ?
    `;
    const params = [userId];

    if (status && status !== 'all') {
      sql += ' AND b.status = ?';
      params.push(status);
    }

    sql += ' GROUP BY b.id ORDER BY b.created_at DESC';

    const [rows] = await db.query(sql, params);
    return rows;
  }

  // Khách đặt phòng (Online) - Concurrency Safe với MySQL Transaction & Row Locking (FOR UPDATE)
  static async createBooking({
    userId,
    propertyId,
    homestayId,
    checkIn,
    checkOut,
    guests,
    promotionId = null,
    voucherCode = null,
    paymentMethod = 'bank_transfer',
    notes = '',
  }) {
    const targetPropertyId = propertyId || homestayId;
    if (!targetPropertyId) {
      throw new Error('Chỗ nghỉ không hợp lệ');
    }

    let conn;
    try {
      conn = await db.getConnection();
      await conn.beginTransaction();
    } catch (_) {
      conn = null;
    }
    const runner = conn || db;

    try {
      // 1. Get Property with row lock
      const [pRows] = await runner.query(
        'SELECT id, name, price_per_night, max_guests, is_active, host_id FROM properties WHERE id = ? AND is_deleted = 0 FOR UPDATE',
        [targetPropertyId]
      );
      if (pRows.length === 0 || !pRows[0].is_active) {
        throw new Error('Chỗ nghỉ không tồn tại hoặc đã ngừng kinh doanh');
      }
      const property = pRows[0];
      const propertyTitle = property.name;

      if (guests > property.max_guests) {
        throw new Error(`Số lượng khách vượt quá sức chứa tối đa (${property.max_guests} người)`);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const checkInDate = new Date(checkIn);
      checkInDate.setHours(0, 0, 0, 0);

      const checkOutDate = new Date(checkOut);
      checkOutDate.setHours(0, 0, 0, 0);

      if (checkInDate < today) {
        throw new Error('Ngày nhận phòng không thể trước ngày hiện tại');
      }

      if (checkOutDate <= checkInDate) {
        throw new Error('Ngày trả phòng phải sau ngày nhận phòng');
      }

      // 2. Check Overbooking với row lock FOR UPDATE
      const [conflicts] = await runner.query(
        `SELECT COUNT(*) AS conflict_count
         FROM bookings
         WHERE property_id = ?
           AND status IN ('pending', 'confirmed')
           AND check_in < ?
           AND check_out > ?
         FOR UPDATE`,
        [targetPropertyId, checkOut, checkIn]
      );

      if (conflicts[0].conflict_count > 0) {
        throw new Error('Chỗ nghỉ đã có khách đặt trong khoảng thời gian này');
      }

      // 3. Compute Nights and Raw Total
      const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
      const pricePerNight = parseFloat(property.price_per_night || property.price);
      const rawTotal = pricePerNight * nights;
      let discountAmount = 0;

      // 4. Calculate Promotion Discount
      let matchedPromotionId = null;
      const promoQuery = promotionId || voucherCode;
      if (promoQuery) {
        const isNum = !isNaN(Number(promoQuery));
        const [promoRows] = await runner.query(
          `SELECT id, code, discount_type, discount_value, max_discount_amount, min_booking_amount
           FROM promotions
           WHERE (id = ? OR UPPER(code) = ?) AND is_active = 1 AND NOW() BETWEEN start_date AND end_date`,
          [isNum ? Number(promoQuery) : 0, String(promoQuery).trim().toUpperCase()]
        );
        if (promoRows.length > 0) {
          const promo = promoRows[0];
          matchedPromotionId = promo.id;
          if (rawTotal >= parseFloat(promo.min_booking_amount || 0)) {
            if (promo.discount_type === 'percent') {
              discountAmount = (rawTotal * parseFloat(promo.discount_value)) / 100;
              if (promo.max_discount_amount && discountAmount > parseFloat(promo.max_discount_amount)) {
                discountAmount = parseFloat(promo.max_discount_amount);
              }
            } else {
              discountAmount = parseFloat(promo.discount_value);
            }
            await runner.query('UPDATE promotions SET used_count = used_count + 1 WHERE id = ?', [promo.id]);
          }
        }
      }

      const finalTotal = Math.max(0, rawTotal - discountAmount);

      // Tính hoa hồng nền tảng (Online: 10%)
      let commissionRate = 10.00;
      try {
        const [settingRows] = await runner.query(
          "SELECT setting_value FROM app_settings WHERE setting_key = 'platform_commission_rate'"
        );
        if (settingRows.length > 0) {
          const val = parseFloat(settingRows[0].setting_value);
          if (!isNaN(val) && val > 0) {
            commissionRate = val <= 1 ? val * 100 : val;
          }
        }
      } catch (_) {}

      const commissionAmount = Math.round((finalTotal * commissionRate) / 100);
      const hostPayoutAmount = finalTotal - commissionAmount;

      const bookingCode = `BK${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(1000 + Math.random() * 9000)}`;

      // 5. Insert Booking
      const [result] = await runner.query(
        `INSERT INTO bookings (
          booking_code, user_id, guest_id, property_id, check_in, check_out,
          guests, nights, price_per_night, promotion_id, discount_amount,
          total_price, commission_rate, commission_amount, host_payout_amount,
          status, source, payment_method, payment_status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'guest_online', ?, 'unpaid', ?)`,
        [
          bookingCode,
          userId,
          userId,
          targetPropertyId,
          checkIn,
          checkOut,
          guests || 1,
          nights,
          pricePerNight,
          matchedPromotionId || null,
          discountAmount,
          finalTotal,
          commissionRate,
          commissionAmount,
          hostPayoutAmount,
          paymentMethod || 'bank_transfer',
          notes || '',
        ]
      );

      const bookingId = result.insertId;

      // 6. Insert Payment Record
      await runner.query(
        `INSERT INTO payments (booking_id, payment_method, amount, status, paid_at)
         VALUES (?, ?, ?, 'pending', NULL)`,
        [bookingId, paymentMethod || 'bank_transfer', finalTotal]
      );

      // 7. Reward Points
      const earnedPoints = Math.max(10, Math.floor(finalTotal / 10000));
      if (userId) {
        await runner.query('UPDATE users SET reward_points = reward_points + ? WHERE id = ?', [earnedPoints, userId]);
        await runner.query(
          'INSERT INTO point_transactions (user_id, title, points, type, reference_id) VALUES (?, ?, ?, "earn", ?)',
          [userId, `Tích lũy ${earnedPoints} điểm từ đơn đặt phòng ${bookingCode} (${propertyTitle})`, earnedPoints, bookingId]
        );

        // 8. In-App Notification
        await runner.query(
          `INSERT INTO notifications (user_id, title, content, type, reference_id)
           VALUES (?, 'Đã tạo đơn đặt phòng! ⏳', ?, 'booking_status', ?)`,
          [
            userId,
            `Đơn đặt phòng ${bookingCode} tại ${propertyTitle} đã được ghi nhận (+${earnedPoints} điểm thưởng). Vui lòng thanh toán để Admin duyệt đơn.`,
            bookingId,
          ]
        );
      }

      if (conn) {
        await conn.commit();
      }

      return {
        id: String(bookingId),
        bookingCode,
        homestayName: propertyTitle,
        propertyTitle,
        checkIn,
        checkOut,
        guests,
        nights,
        pricePerNight,
        discountAmount,
        totalPrice: finalTotal,
        commissionRate,
        commissionAmount,
        hostPayoutAmount,
        status: 'pending',
        source: 'guest_online',
        paymentMethod,
      };
    } catch (err) {
      if (conn) {
        await conn.rollback();
      }
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  // Chủ Chỗ nghỉ tạo đơn đặt phòng trực tiếp tại quầy (Walk-in Direct Booking)
  static async createDirectBooking({
    propertyId,
    homestayId,
    guestName,
    guestPhone,
    checkIn,
    checkOut,
    guests = 1,
    paymentMethod = 'cash',
    status = 'confirmed',
    hostNote = '',
    createdBy = null,
  }) {
    const targetPropertyId = propertyId || homestayId;
    if (!targetPropertyId) {
      throw new Error('Chỗ nghỉ không hợp lệ');
    }
    if (!guestName || !guestName.trim()) {
      throw new Error('Vui lòng nhập họ và tên khách hàng');
    }
    if (!guestPhone || !guestPhone.trim()) {
      throw new Error('Vui lòng nhập số điện thoại khách hàng');
    }
    if (!checkIn || !checkOut) {
      throw new Error('Vui lòng chọn ngày nhận phòng và trả phòng');
    }

    let conn;
    try {
      conn = await db.getConnection();
      await conn.beginTransaction();
    } catch (_) {
      conn = null;
    }
    const runner = conn || db;

    try {
      // 1. Get Property with row lock
      const [pRows] = await runner.query(
        'SELECT id, name, price_per_night, max_guests, is_active, host_id FROM properties WHERE id = ? AND is_deleted = 0 FOR UPDATE',
        [targetPropertyId]
      );
      if (pRows.length === 0 || !pRows[0].is_active) {
        throw new Error('Chỗ nghỉ không tồn tại hoặc đã ngừng kinh doanh');
      }
      const property = pRows[0];
      const propertyTitle = property.name;

      if (guests > property.max_guests) {
        throw new Error(`Số lượng khách vượt quá sức chứa tối đa (${property.max_guests} người)`);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const checkInDate = new Date(checkIn);
      checkInDate.setHours(0, 0, 0, 0);

      const checkOutDate = new Date(checkOut);
      checkOutDate.setHours(0, 0, 0, 0);

      if (checkInDate < today) {
        throw new Error('Ngày nhận phòng không thể trước ngày hiện tại');
      }

      if (checkOutDate <= checkInDate) {
        throw new Error('Ngày trả phòng phải sau ngày nhận phòng');
      }

      // 2. Check Overbooking
      const [conflicts] = await runner.query(
        `SELECT COUNT(*) AS conflict_count
         FROM bookings
         WHERE property_id = ?
           AND status IN ('pending', 'confirmed')
           AND check_in < ?
           AND check_out > ?
         FOR UPDATE`,
        [targetPropertyId, checkOut, checkIn]
      );

      if (conflicts[0].conflict_count > 0) {
        throw new Error('Chỗ nghỉ đã có khách đặt trong khoảng thời gian này');
      }

      // 3. Compute Nights and Pricing
      const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
      const pricePerNight = parseFloat(property.price_per_night || property.price);
      const totalPrice = pricePerNight * nights;

      // Hoa hồng tại quầy (Direct: 5%)
      let directCommissionRate = 5.00;
      try {
        const [settingRows] = await runner.query(
          "SELECT setting_value FROM app_settings WHERE setting_key = 'direct_commission_rate'"
        );
        if (settingRows.length > 0) {
          const val = parseFloat(settingRows[0].setting_value);
          if (!isNaN(val) && val > 0) {
            directCommissionRate = val <= 1 ? val * 100 : val;
          }
        }
      } catch (_) {}

      const commissionAmount = Math.round((totalPrice * directCommissionRate) / 100);
      const hostPayoutAmount = totalPrice - commissionAmount;

      const bookingCode = `HD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(1000 + Math.random() * 9000)}`;

      // 4. Insert Booking
      const [result] = await runner.query(
        `INSERT INTO bookings (
          booking_code, user_id, guest_name, guest_name_snapshot, guest_phone, guest_phone_snapshot,
          property_id, check_in, check_out, guests, nights, price_per_night,
          discount_amount, total_price, commission_rate, commission_amount, host_payout_amount,
          status, source, payment_method, payment_status, notes, host_note, created_by
        ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.00, ?, ?, ?, ?, ?, 'host_direct', ?, ?, 'Khách đặt trực tiếp tại quầy', ?, ?)`,
        [
          bookingCode,
          guestName.trim(),
          guestName.trim(),
          guestPhone.trim(),
          guestPhone.trim(),
          targetPropertyId,
          checkIn,
          checkOut,
          guests,
          nights,
          pricePerNight,
          totalPrice,
          directCommissionRate,
          commissionAmount,
          hostPayoutAmount,
          status || 'confirmed',
          paymentMethod || 'cash',
          status === 'confirmed' ? 'verified' : 'unpaid',
          hostNote || '',
          createdBy || property.host_id || null,
        ]
      );

      const bookingId = result.insertId;

      // 5. Insert Payment
      const paymentStatus = status === 'confirmed' ? 'completed' : 'pending';
      await runner.query(
        `INSERT INTO payments (booking_id, payment_method, amount, status, paid_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          bookingId,
          paymentMethod || 'cash',
          totalPrice,
          paymentStatus,
          paymentStatus === 'completed' ? new Date() : null,
        ]
      );

      if (conn) {
        await conn.commit();
      }

      return {
        id: String(bookingId),
        bookingCode,
        homestayName: propertyTitle,
        propertyTitle,
        guestName,
        guestPhone,
        checkIn,
        checkOut,
        guests,
        nights,
        pricePerNight,
        totalPrice,
        commissionRate: directCommissionRate,
        commissionAmount,
        hostPayoutAmount,
        status,
        source: 'host_direct',
        paymentMethod,
        paymentStatus,
      };
    } catch (err) {
      if (conn) {
        await conn.rollback();
      }
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
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

    await db.query(
      `UPDATE payments
       SET proof_image_url = ?, payment_method = 'bank_transfer', transaction_code = COALESCE(?, transaction_code), status = 'completed', paid_at = NOW(), updated_at = NOW()
       WHERE booking_id = ?`,
      [proofImageUrl, transactionCode || `FT${Date.now().toString().slice(-8)}`, booking.id]
    );

    await db.query(
      `UPDATE bookings
       SET payment_status = 'proof_uploaded', payment_proof_image = ?, payment_submitted_at = NOW(),
           notes = CONCAT(IFNULL(notes, ''), ' [Đã thanh toán CK, chờ Admin duyệt]')
       WHERE id = ?`,
      [proofImageUrl, booking.id]
    );

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
      message: 'Thanh toán thành công! Minh chứng chuyển khoản đã được ghi nhận. Đơn đang chờ Quản trị viên duyệt.',
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
      return true;
    }

    await db.query(
      'UPDATE bookings SET status = "cancelled", payment_status = "rejected", cancelled_at = NOW(), cancelled_reason = ? WHERE id = ?',
      [reason, booking.id]
    );

    await db.query(
      'UPDATE payments SET status = "refunded", updated_at = NOW() WHERE booking_id = ?',
      [booking.id]
    );

    return true;
  }

  static async updateStatus(id, status, cancelledReason = null) {
    if (status === 'cancelled') {
      const [result] = await db.query(
        'UPDATE bookings SET status = ?, payment_status = "rejected", cancelled_at = NOW(), cancelled_reason = ? WHERE id = ?',
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
      await db.query(
        "UPDATE bookings SET payment_status = 'verified' WHERE id = ?",
        [id]
      );
    }

    return result.affectedRows > 0;
  }

  static async getUnavailableDates(propertyId) {
    const [rows] = await db.query(
      `SELECT check_in, check_out, booking_code, status, source
       FROM bookings
       WHERE property_id = ? AND status IN ('pending', 'confirmed')
       ORDER BY check_in ASC`,
      [propertyId]
    );
    return rows;
  }

  static async getMonthlyRevenueStats() {
    const [rows] = await db.query(`
      SELECT
        DATE_FORMAT(created_at, '%m/%Y') AS month,
        DATE_FORMAT(created_at, '%Y-%m') AS raw_month,
        COUNT(id) AS booking_count,
        SUM(CASE WHEN status IN ('confirmed', 'completed') THEN total_price ELSE 0 END) AS revenue,
        SUM(CASE WHEN status IN ('confirmed', 'completed') THEN commission_amount ELSE 0 END) AS commission
      FROM bookings
      GROUP BY raw_month, month
      ORDER BY raw_month DESC
      LIMIT 6
    `);
    return rows.reverse();
  }

  static async getCounts() {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN source = 'guest_online' THEN 1 ELSE 0 END) AS onlineCount,
        SUM(CASE WHEN source = 'host_direct' THEN 1 ELSE 0 END) AS directCount,
        SUM(CASE WHEN status IN ('confirmed', 'completed') THEN total_price ELSE 0 END) AS grossRevenue,
        SUM(CASE WHEN status IN ('confirmed', 'completed') THEN commission_amount ELSE 0 END) AS commissionEarned,
        SUM(CASE WHEN status IN ('confirmed', 'completed') THEN host_payout_amount ELSE 0 END) AS hostPayouts
      FROM bookings
    `);
    return rows[0] || {};
  }
}

module.exports = BookingModel;
