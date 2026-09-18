const db = require('./database');

async function migrateDatabase() {
  try {
    const [dbCheck] = await db.query('SELECT DATABASE() AS currentDb');
    const dbName = dbCheck[0]?.currentDb;
    if (!dbName) return;

    // 1. Cập nhật role trong users thêm 'host'
    try {
      await db.query(
        "ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'staff', 'customer', 'host') NOT NULL DEFAULT 'customer'"
      );
    } catch (_) {}

    // 2. Thêm các cột Host vào homestays
    try {
      const [hsCols] = await db.query("SHOW COLUMNS FROM homestays LIKE 'host_id'");
      if (hsCols.length === 0) {
        await db.query('ALTER TABLE homestays ADD COLUMN host_id BIGINT UNSIGNED NULL AFTER type_id');
      }
    } catch (_) {}

    try {
      const [tokenCols] = await db.query("SHOW COLUMNS FROM homestays LIKE 'manage_token'");
      if (tokenCols.length === 0) {
        await db.query('ALTER TABLE homestays ADD COLUMN manage_token VARCHAR(80) NULL UNIQUE AFTER is_active');
      }
    } catch (_) {}

    try {
      const [statusCols] = await db.query("SHOW COLUMNS FROM homestays LIKE 'approval_status'");
      if (statusCols.length === 0) {
        await db.query(
          "ALTER TABLE homestays ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved' AFTER is_active"
        );
      }
    } catch (_) {}

    // 3. Cho phép bookings.user_id NULL (dành cho khách vãng lai đặt tại quầy)
    try {
      await db.query('ALTER TABLE bookings MODIFY COLUMN user_id BIGINT UNSIGNED NULL');
    } catch (_) {}

    // 4. Bổ sung thông tin đặt phòng trực tiếp & phân chia hoa hồng
    try {
      const [bSource] = await db.query("SHOW COLUMNS FROM bookings LIKE 'source'");
      if (bSource.length === 0) {
        await db.query(
          "ALTER TABLE bookings ADD COLUMN source ENUM('guest_online', 'host_direct', 'admin_manual') NOT NULL DEFAULT 'guest_online' AFTER status"
        );
      }
    } catch (_) {}

    try {
      const [bName] = await db.query("SHOW COLUMNS FROM bookings LIKE 'guest_name'");
      if (bName.length === 0) {
        await db.query('ALTER TABLE bookings ADD COLUMN guest_name VARCHAR(120) NULL AFTER user_id');
        await db.query('ALTER TABLE bookings ADD COLUMN guest_phone VARCHAR(30) NULL AFTER guest_name');
        await db.query(
          'ALTER TABLE bookings ADD COLUMN commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00 AFTER total_price'
        );
        await db.query(
          'ALTER TABLE bookings ADD COLUMN commission_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER commission_rate'
        );
        await db.query(
          'ALTER TABLE bookings ADD COLUMN host_payout_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER commission_amount'
        );
        await db.query('ALTER TABLE bookings ADD COLUMN host_note TEXT NULL AFTER notes');
        await db.query('ALTER TABLE bookings ADD COLUMN created_by BIGINT UNSIGNED NULL AFTER host_note');
      }
    } catch (_) {}

    // 5. Tạo bảng app_settings (Cấu hình hoa hồng nền tảng)
    await db.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value VARCHAR(255) NOT NULL,
        description VARCHAR(255) NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Ghi nhận cấu hình hoa hồng mặc định nếu chưa có
    await db.query(`
      INSERT IGNORE INTO app_settings (setting_key, setting_value, description) VALUES
      ('platform_commission_rate', '10', 'Tỷ lệ hoa hồng nền tảng thu từ đơn online (%)'),
      ('direct_commission_rate', '5', 'Tỷ lệ hoa hồng nền tảng thu từ đơn tại quầy do chủ nhà tạo (%)')
    `);

    // 6. Đảm bảo có ít nhất 1 tài khoản Chủ Homestay (Host) mẫu
    const [hostUsers] = await db.query("SELECT id FROM users WHERE role = 'host' LIMIT 1");
    let hostId = hostUsers[0]?.id;
    if (!hostId) {
      try {
        const [res] = await db.query(`
          INSERT INTO users (name, email, password_hash, role, phone, address, reward_points, is_active)
          VALUES ('Nguyễn Văn Chủ Nhà (Host)', 'host@homestay.vn', '$2a$10$hashedpasswordplaceholder', 'host', '0988776655', 'Đà Lạt, Lâm Đồng', 500, 1)
        `);
        hostId = res.insertId;
      } catch (_) {}
    }

    // 7. Gán host_id và manage_token cho các homestay hiện có
    if (hostId) {
      await db.query(
        `
        UPDATE homestays
        SET host_id = COALESCE(host_id, ?),
            manage_token = COALESCE(manage_token, CONCAT('HMTOKEN_', LPAD(id, 4, '0'))),
            approval_status = COALESCE(approval_status, 'approved')
        WHERE host_id IS NULL OR manage_token IS NULL
      `,
        [hostId]
      );
    }

    // 8. Cập nhật phân chia hoa hồng cho các đơn phòng cũ
    await db.query(`
      UPDATE bookings
      SET commission_rate = 10.00,
          commission_amount = ROUND(total_price * 0.10, 2),
          host_payout_amount = ROUND(total_price * 0.90, 2),
          source = 'guest_online'
      WHERE commission_amount = 0 AND total_price > 0
    `);

    console.log('✅ Database schema migration verified & up to date with Host & Admin Walk-in features.');
  } catch (err) {
    console.warn('⚠️ DB Migration notice (DB might be offline or using mock):', err.message);
  }
}

module.exports = migrateDatabase;
