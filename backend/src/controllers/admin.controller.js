const pool = require('../config/db');

// GET /api/admin/dashboard - Thống kê tổng quan cho Web Admin
const getDashboardStats = async (req, res) => {
  try {
    // 1. Thống kê tổng số lượng
    const [[{ total_homestays }]] = await pool.query('SELECT COUNT(*) AS total_homestays FROM homestays WHERE is_active = 1');
    const [[{ total_customers }]] = await pool.query("SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'");
    const [[{ total_bookings }]] = await pool.query('SELECT COUNT(*) AS total_bookings FROM bookings');
    const [[{ pending_bookings }]] = await pool.query("SELECT COUNT(*) AS pending_bookings FROM bookings WHERE status = 'pending'");

    // 2. Thống kê tổng doanh thu từ các đơn thành công
    const [[{ gross_revenue }]] = await pool.query(
      "SELECT IFNULL(SUM(total_price), 0) AS gross_revenue FROM bookings WHERE status IN ('confirmed', 'completed')"
    );

    // 3. Doanh thu theo từng tháng (cho biểu đồ Chart.js)
    const [monthlyRevenue] = await pool.query(`
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

    // 4. Danh sách 6 đơn đặt phòng gần nhất
    const [recentBookings] = await pool.query(`
      SELECT
        b.id,
        b.booking_code,
        u.name AS customer_name,
        u.phone AS customer_phone,
        h.name AS homestay_name,
        b.check_in,
        b.check_out,
        b.total_price,
        b.status,
        b.created_at
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN homestays h ON b.homestay_id = h.id
      ORDER BY b.created_at DESC
      LIMIT 6
    `);

    res.json({
      success: true,
      data: {
        summary: {
          totalHomestays: total_homestays,
          totalCustomers: total_customers,
          totalBookings: total_bookings,
          pendingBookings: pending_bookings,
          grossRevenue: parseFloat(gross_revenue),
        },
        monthlyRevenue,
        recentBookings,
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy dữ liệu thống kê quản trị' });
  }
};

// GET /api/admin/bookings - Danh sách tất cả đơn đặt phòng (kèm bộ lọc)
const getAllBookings = async (req, res) => {
  try {
    const { status, search } = req.query;
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

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách đơn đặt phòng' });
  }
};

// PUT /api/admin/bookings/:id/status - Duyệt / Hoàn tất / Hủy đơn đặt phòng
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancelled_reason } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const [existing] = await pool.query('SELECT id, user_id, booking_code FROM bookings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt phòng' });
    }

    const booking = existing[0];

    if (status === 'cancelled') {
      await pool.query(
        'UPDATE bookings SET status = ?, cancelled_at = NOW(), cancelled_reason = ? WHERE id = ?',
        [status, cancelled_reason || 'Quản trị viên hủy đơn', id]
      );
    } else {
      await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    }

    // Gửi thông báo in-app cho khách hàng khi Admin duyệt trạng thái
    const statusText = status === 'confirmed' ? 'đã được Xác nhận' : status === 'completed' ? 'đã Hoàn thành' : 'đã bị Hủy';
    await pool.query(
      'INSERT INTO notifications (user_id, title, content, type, reference_id) VALUES (?, ?, ?, ?, ?)',
      [
        booking.user_id,
        `Cập nhật đơn đặt phòng ${booking.booking_code}`,
        `Đơn đặt phòng ${booking.booking_code} của bạn ${statusText}.`,
        'booking_status',
        id,
      ]
    );

    res.json({ success: true, message: `Cập nhật trạng thái đơn sang "${status}" thành công!` });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật trạng thái đơn' });
  }
};

// POST /api/admin/homestays - Thêm mới Homestay
const createHomestay = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      old_price,
      location_id,
      type_id,
      max_guests,
      bedrooms,
      bathrooms,
      image_url,
      is_featured,
      is_new,
    } = req.body;

    if (!name || !price || !location_id || !type_id) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' });
    }

    const [result] = await pool.query(
      `INSERT INTO homestays (name, description, price, old_price, location_id, type_id, max_guests, bedrooms, bathrooms, is_featured, is_new)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || '',
        price,
        old_price || null,
        location_id,
        type_id,
        max_guests || 2,
        bedrooms || 1,
        bathrooms || 1,
        is_featured ? 1 : 0,
        is_new ? 1 : 0,
      ]
    );

    const homestayId = result.insertId;

    if (image_url) {
      await pool.query(
        'INSERT INTO homestay_images (homestay_id, image_url, is_primary, sort_order) VALUES (?, ?, 1, 1)',
        [homestayId, image_url]
      );
    }

    res.json({ success: true, message: 'Thêm homestay mới thành công!', data: { id: homestayId } });
  } catch (error) {
    console.error('Error creating homestay:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi thêm homestay mới' });
  }
};

// DELETE /api/admin/homestays/:id - Xóa homestay
const deleteHomestay = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE homestays SET is_active = 0 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đã ngừng kinh doanh homestay thành công!' });
  } catch (error) {
    console.error('Error deleting homestay:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa homestay' });
  }
};

module.exports = {
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  createHomestay,
  deleteHomestay,
};
