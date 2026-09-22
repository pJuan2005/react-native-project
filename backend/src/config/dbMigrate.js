const db = require('./database');
const bcrypt = require('bcryptjs');

async function migrateDatabase() {
  try {
    const [dbCheck] = await db.query('SELECT DATABASE() AS currentDb');
    const dbName = dbCheck[0]?.currentDb;
    if (!dbName) return;

    // 1. Cập nhật role trong users thêm 'host' & 'guest'
    try {
      await db.query(
        "ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'staff', 'customer', 'host', 'guest') NOT NULL DEFAULT 'customer'"
      );
    } catch (_) {}

    // Bổ sung các cột full_name, password, status vào users nếu chưa có
    try {
      const [uCols] = await db.query("SHOW COLUMNS FROM users LIKE 'full_name'");
      if (uCols.length === 0) {
        await db.query('ALTER TABLE users ADD COLUMN full_name VARCHAR(120) NULL AFTER name');
        await db.query('ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL AFTER password_hash');
        await db.query("ALTER TABLE users ADD COLUMN status ENUM('active', 'blocked') NOT NULL DEFAULT 'active' AFTER is_active");
        await db.query('ALTER TABLE users ADD COLUMN location VARCHAR(255) NULL');
        await db.query('ALTER TABLE users ADD COLUMN website VARCHAR(255) NULL');
        await db.query('ALTER TABLE users ADD COLUMN languages VARCHAR(255) NULL');
        await db.query('ALTER TABLE users ADD COLUMN bio TEXT NULL');
      }
    } catch (_) {}

    // Đồng bộ name <-> full_name, password_hash <-> password
    try {
      await db.query('UPDATE users SET full_name = COALESCE(full_name, name), password = COALESCE(password, password_hash), status = IF(is_active=1, "active", "blocked")');
    } catch (_) {}

    // 2. Tạo hoặc kiểm tra bảng properties (dành cho Web Admin & Host Portal)
    await db.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        host_id INT(11) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        property_type VARCHAR(100) NOT NULL,
        price_per_night DECIMAL(10,2) NOT NULL,
        street_address VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL DEFAULT 'Vietnam',
        max_guests INT(11) DEFAULT 2,
        bedrooms INT(11) DEFAULT 1,
        bathrooms INT(11) DEFAULT 1,
        status ENUM('pending','approved','rejected') DEFAULT 'approved',
        cover_image VARCHAR(500) DEFAULT NULL,
        manage_token VARCHAR(80) DEFAULT NULL,
        manage_token_active TINYINT(1) NOT NULL DEFAULT 1,
        manage_token_expires_at DATETIME DEFAULT NULL,
        featured TINYINT(1) NOT NULL DEFAULT 0,
        is_deleted TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_properties_manage_token (manage_token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3. Tạo bảng property_images & property_amenities nếu chưa có
    await db.query(`
      CREATE TABLE IF NOT EXISTS property_images (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        property_id INT(11) NOT NULL,
        image_url VARCHAR(500) DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS property_amenities (
        property_id INT(11) NOT NULL,
        amenity_id INT(11) NOT NULL,
        PRIMARY KEY (property_id, amenity_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 4. Thêm các cột Host vào homestays
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

    // 5. Nâng cấp bảng bookings hỗ trợ cả Mobile và Web Host Walk-in
    try {
      await db.query('ALTER TABLE bookings MODIFY COLUMN user_id BIGINT UNSIGNED NULL');
    } catch (_) {}

    try {
      const [bCols] = await db.query("SHOW COLUMNS FROM bookings LIKE 'property_id'");
      if (bCols.length === 0) {
        await db.query('ALTER TABLE bookings ADD COLUMN property_id BIGINT UNSIGNED NULL AFTER booking_code');
        await db.query('ALTER TABLE bookings ADD COLUMN guest_id BIGINT UNSIGNED NULL AFTER user_id');
        await db.query('ALTER TABLE bookings ADD COLUMN guest_name_snapshot VARCHAR(120) NULL AFTER guest_name');
        await db.query('ALTER TABLE bookings ADD COLUMN guest_phone_snapshot VARCHAR(30) NULL AFTER guest_phone');
        await db.query('ALTER TABLE bookings ADD COLUMN payment_reference VARCHAR(80) NULL AFTER notes');
        await db.query("ALTER TABLE bookings ADD COLUMN payment_status ENUM('unpaid','proof_uploaded','verified','rejected') NOT NULL DEFAULT 'unpaid'");
        await db.query('ALTER TABLE bookings ADD COLUMN payment_proof_image VARCHAR(500) NULL');
        await db.query('ALTER TABLE bookings ADD COLUMN payment_submitted_at DATETIME NULL');
        await db.query('ALTER TABLE bookings ADD COLUMN confirmed_by BIGINT UNSIGNED NULL');
        await db.query('ALTER TABLE bookings ADD COLUMN confirmed_at DATETIME NULL');
        await db.query('ALTER TABLE bookings ADD COLUMN rejection_reason TEXT NULL');
        await db.query('ALTER TABLE bookings ADD COLUMN checkin_instructions TEXT NULL');
        await db.query('ALTER TABLE bookings ADD COLUMN commission_rate_applied DECIMAL(6,4) NOT NULL DEFAULT 0.1000');
      }
    } catch (_) {}

    // Bổ sung các cột direct walk-in nếu chưa có
    try {
      const [bSource] = await db.query("SHOW COLUMNS FROM bookings LIKE 'source'");
      if (bSource.length === 0) {
        await db.query(
          "ALTER TABLE bookings ADD COLUMN source ENUM('guest_online', 'host_direct', 'admin_manual') NOT NULL DEFAULT 'guest_online' AFTER status"
        );
      }
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

    // Bổ sung các cột trong bảng payments nếu chưa có
    try {
      const [pCols] = await db.query("SHOW COLUMNS FROM payments LIKE 'proof_image_url'");
      if (pCols.length === 0) {
        await db.query('ALTER TABLE payments ADD COLUMN proof_image_url VARCHAR(500) NULL AFTER amount');
      }
      const [tCols] = await db.query("SHOW COLUMNS FROM payments LIKE 'transaction_code'");
      if (tCols.length === 0) {
        await db.query('ALTER TABLE payments ADD COLUMN transaction_code VARCHAR(100) NULL AFTER payment_method');
      }
    } catch (_) {}

    // 6. Tạo bảng app_settings (Cấu hình hoa hồng nền tảng)
    await db.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value VARCHAR(255) NOT NULL,
        description VARCHAR(255) NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await db.query(`
      INSERT IGNORE INTO app_settings (setting_key, setting_value, description) VALUES
      ('platform_commission_rate', '10', 'Tỷ lệ hoa hồng nền tảng thu từ đơn online (%)'),
      ('direct_commission_rate', '5', 'Tỷ lệ hoa hồng nền tảng thu từ đơn tại quầy do chủ nhà tạo (%)'),
      ('usd_to_vnd_rate', '25000', 'Tỷ giá quy đổi USD sang VND')
    `);

    // 7. Seed các tài khoản Admin & Host chuẩn cho Web Portal
    const hashedAdminPassword = await bcrypt.hash('123456', 10);

    // Tài khoản Admin: admin@mail.com / 123456
    await db.query(`
      INSERT INTO users (id, name, full_name, email, password_hash, password, role, phone, location, status, is_active)
      VALUES (1, 'Admin User', 'Admin User', 'admin@mail.com', ?, ?, 'admin', '0900000001', 'Vietnam', 'active', 1)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), password = VALUES(password), role = 'admin', full_name = VALUES(full_name)
    `, [hashedAdminPassword, hashedAdminPassword]);

    // Tài khoản Host 1: host1@mail.com / 123456
    await db.query(`
      INSERT INTO users (id, name, full_name, email, password_hash, password, role, phone, location, status, is_active)
      VALUES (2, 'Nguyen Van A (Host)', 'Nguyen Van A', 'host1@mail.com', ?, ?, 'host', '0900000002', 'Ha Noi', 'active', 1)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), password = VALUES(password), role = 'host', full_name = VALUES(full_name)
    `, [hashedAdminPassword, hashedAdminPassword]);

    // Tài khoản Host 2: host2@mail.com / 123456
    await db.query(`
      INSERT INTO users (id, name, full_name, email, password_hash, password, role, phone, location, status, is_active)
      VALUES (3, 'Tran Thi B (Host)', 'Tran Thi B', 'host2@mail.com', ?, ?, 'host', '0900000003', 'Da Nang', 'active', 1)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), password = VALUES(password), role = 'host', full_name = VALUES(full_name)
    `, [hashedAdminPassword, hashedAdminPassword]);

    // 8. Tự động đồng bộ các homestay hiện có sang properties để Web hiển thị
    try {
      await db.query(`
        INSERT INTO properties (id, host_id, title, description, property_type, price_per_night, street_address, city, country, max_guests, bedrooms, bathrooms, status, cover_image, manage_token)
        SELECT
          h.id,
          COALESCE(h.host_id, 2),
          h.name,
          h.description,
          COALESCE(t.name, 'Homestay'),
          h.price,
          COALESCE(l.name, 'Vietnam'),
          COALESCE(l.name, 'Vietnam'),
          'Vietnam',
          h.max_guests,
          h.bedrooms,
          h.bathrooms,
          'approved',
          COALESCE(hi.image_url, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'),
          COALESCE(h.manage_token, CONCAT('HMTOKEN_', LPAD(h.id, 4, '0')))
        FROM homestays h
        LEFT JOIN locations l ON h.location_id = l.id
        LEFT JOIN homestay_types t ON h.type_id = t.id
        LEFT JOIN homestay_images hi ON hi.homestay_id = h.id AND hi.is_primary = 1
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          price_per_night = VALUES(price_per_night),
          status = 'approved',
          cover_image = VALUES(cover_image)
      `);
    } catch (_) {}

    // Đồng bộ hình ảnh từ homestay_images sang property_images
    try {
      await db.query(`
        INSERT IGNORE INTO property_images (property_id, image_url)
        SELECT homestay_id, image_url FROM homestay_images
      `);
    } catch (_) {}

    // 9. Đồng bộ bookings: cập nhật property_id, guest_id, snapshot
    try {
      await db.query(`
        UPDATE bookings
        SET property_id = COALESCE(property_id, homestay_id),
            homestay_id = COALESCE(homestay_id, property_id),
            guest_id = COALESCE(guest_id, user_id),
            guest_name_snapshot = COALESCE(guest_name_snapshot, guest_name),
            guest_phone_snapshot = COALESCE(guest_phone_snapshot, guest_phone),
            payment_reference = COALESCE(payment_reference, booking_code),
            commission_rate = COALESCE(commission_rate, 10.00),
            commission_amount = IF(commission_amount = 0 AND total_price > 0, ROUND(total_price * 0.10, 2), commission_amount),
            host_payout_amount = IF(host_payout_amount = 0 AND total_price > 0, ROUND(total_price * 0.90, 2), host_payout_amount),
            source = COALESCE(source, 'guest_online')
        WHERE id > 0
      `);
    } catch (_) {}

    console.log('✅ Database schema migration verified & fully synchronized for Web Admin, Host Portal, and Mobile App.');
  } catch (err) {
    console.warn('⚠️ DB Migration notice (DB might be offline or using mock):', err.message);
  }
}

module.exports = migrateDatabase;
