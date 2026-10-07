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

    try {
      await db.query('ALTER TABLE users MODIFY COLUMN avatar_url TEXT NULL');
      const [vCols] = await db.query("SHOW COLUMNS FROM users LIKE 'is_verified'");
      if (vCols.length === 0) {
        await db.query('ALTER TABLE users ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER is_active');
      }
    } catch (_) {}

    // Đồng bộ name <-> full_name, password_hash <-> password
    try {
      await db.query('UPDATE users SET full_name = COALESCE(full_name, name), password = COALESCE(password, password_hash), status = IF(is_active=1, "active", "blocked")');
    } catch (_) {}

    // 2. Tạo bảng homestay_types nếu chưa có
    await db.query(`
      CREATE TABLE IF NOT EXISTS homestay_types (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT NULL,
        icon VARCHAR(50) NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT UNSIGNED NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3. Tạo hoặc kiểm tra bảng properties (Nguồn sự thật duy nhất - Canonical Schema)
    await db.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        type_id BIGINT UNSIGNED NOT NULL DEFAULT 1,
        price_per_night DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        old_price DECIMAL(12,2) NULL,
        location_id BIGINT UNSIGNED NULL,
        street_address VARCHAR(255) NOT NULL DEFAULT 'Vietnam',
        city VARCHAR(100) NOT NULL DEFAULT 'Vietnam',
        country VARCHAR(100) NOT NULL DEFAULT 'Vietnam',
        latitude DECIMAL(10,8) NULL,
        longitude DECIMAL(11,8) NULL,
        max_guests INT UNSIGNED DEFAULT 2,
        bedrooms INT UNSIGNED DEFAULT 1,
        bathrooms INT UNSIGNED DEFAULT 1,
        rating DECIMAL(3,2) NOT NULL DEFAULT 5.00,
        review_count INT UNSIGNED NOT NULL DEFAULT 0,
        is_new TINYINT(1) NOT NULL DEFAULT 0,
        is_featured TINYINT(1) NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved',
        cover_image VARCHAR(500) DEFAULT NULL,
        manage_token VARCHAR(80) DEFAULT NULL,
        manage_token_active TINYINT(1) NOT NULL DEFAULT 1,
        manage_token_expires_at DATETIME DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_properties_manage_token (manage_token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Bổ sung các cột canonical nếu thiếu
    const safeAddColumn = async (colName, colDef) => {
      try {
        const [chk] = await db.query(`SHOW COLUMNS FROM properties LIKE '${colName}'`);
        if (chk.length === 0) {
          await db.query(`ALTER TABLE properties ADD COLUMN ${colDef}`);
        }
      } catch (err) {
        console.warn(`safeAddColumn ${colName} notice:`, err.message);
      }
    };

    await safeAddColumn('name', 'name VARCHAR(255) NOT NULL DEFAULT "Homestay" AFTER host_id');
    await safeAddColumn('type_id', 'type_id BIGINT UNSIGNED NOT NULL DEFAULT 1 AFTER description');
    await safeAddColumn('price_per_night', 'price_per_night DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER type_id');
    await safeAddColumn('old_price', 'old_price DECIMAL(12,2) NULL AFTER price_per_night');
    await safeAddColumn('location_id', 'location_id BIGINT UNSIGNED NULL AFTER old_price');
    await safeAddColumn('street_address', "street_address VARCHAR(255) NOT NULL DEFAULT 'Vietnam' AFTER location_id");
    await safeAddColumn('city', "city VARCHAR(100) NOT NULL DEFAULT 'Vietnam' AFTER street_address");
    await safeAddColumn('country', "country VARCHAR(100) NOT NULL DEFAULT 'Vietnam' AFTER city");
    await safeAddColumn('latitude', 'latitude DECIMAL(10,8) NULL AFTER country');
    await safeAddColumn('longitude', 'longitude DECIMAL(11,8) NULL AFTER latitude');
    await safeAddColumn('max_guests', 'max_guests INT UNSIGNED NOT NULL DEFAULT 2');
    await safeAddColumn('bedrooms', 'bedrooms INT UNSIGNED NOT NULL DEFAULT 1');
    await safeAddColumn('bathrooms', 'bathrooms INT UNSIGNED NOT NULL DEFAULT 1');
    await safeAddColumn('rating', 'rating DECIMAL(3,2) NOT NULL DEFAULT 5.00');
    await safeAddColumn('review_count', 'review_count INT UNSIGNED NOT NULL DEFAULT 0');
    await safeAddColumn('is_new', 'is_new TINYINT(1) NOT NULL DEFAULT 0');
    await safeAddColumn('is_featured', 'is_featured TINYINT(1) NOT NULL DEFAULT 0');
    await safeAddColumn('is_active', 'is_active TINYINT(1) NOT NULL DEFAULT 1');
    await safeAddColumn('is_deleted', 'is_deleted TINYINT(1) NOT NULL DEFAULT 0');
    await safeAddColumn('status', "status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved'");
    await safeAddColumn('cover_image', 'cover_image VARCHAR(500) NULL');
    await safeAddColumn('manage_token', 'manage_token VARCHAR(80) NULL');
    await safeAddColumn('manage_token_active', 'manage_token_active TINYINT(1) NOT NULL DEFAULT 1');
    await safeAddColumn('manage_token_expires_at', 'manage_token_expires_at DATETIME NULL');

    // 4. Migrate Data from Duplicate Columns if they still exist in properties
    try {
      const [titleChk] = await db.query("SHOW COLUMNS FROM properties LIKE 'title'");
      if (titleChk.length > 0) {
        await db.query("UPDATE properties SET name = COALESCE(NULLIF(name, ''), title) WHERE title IS NOT NULL");
      }
    } catch (_) {}

    try {
      const [priceChk] = await db.query("SHOW COLUMNS FROM properties LIKE 'price'");
      if (priceChk.length > 0) {
        await db.query("UPDATE properties SET price_per_night = COALESCE(NULLIF(price_per_night, 0), price) WHERE price IS NOT NULL");
      }
    } catch (_) {}

    try {
      const [featChk] = await db.query("SHOW COLUMNS FROM properties LIKE 'featured'");
      if (featChk.length > 0) {
        await db.query("UPDATE properties SET is_featured = featured WHERE featured IS NOT NULL");
      }
    } catch (_) {}

    try {
      const [apprChk] = await db.query("SHOW COLUMNS FROM properties LIKE 'approval_status'");
      if (apprChk.length > 0) {
        await db.query("UPDATE properties SET status = approval_status WHERE approval_status IS NOT NULL");
      }
    } catch (_) {}

    // 5. Migrate property_type to type_id if needed
    try {
      const [ptChk] = await db.query("SHOW COLUMNS FROM properties LIKE 'property_type'");
      if (ptChk.length > 0) {
        await db.query(`
          UPDATE properties p
          JOIN homestay_types t ON LOWER(t.name) = LOWER(p.property_type)
          SET p.type_id = t.id
          WHERE p.type_id IS NULL OR p.type_id = 0 OR p.type_id = 1
        `);
      }
    } catch (_) {}

    // 6. DROP DUPLICATE COLUMNS from properties table
    const safeDropColumn = async (colName) => {
      try {
        const [chk] = await db.query(`SHOW COLUMNS FROM properties LIKE '${colName}'`);
        if (chk.length > 0) {
          await db.query(`ALTER TABLE properties DROP COLUMN ${colName}`);
        }
      } catch (err) {
        console.warn(`safeDropColumn ${colName} notice:`, err.message);
      }
    };

    await safeDropColumn('title');
    await safeDropColumn('property_type');
    await safeDropColumn('price');
    await safeDropColumn('featured');
    await safeDropColumn('approval_status');

    // 7. Tạo bảng property_images & property_amenities nếu chưa có
    await db.query(`
      CREATE TABLE IF NOT EXISTS property_images (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        property_id BIGINT UNSIGNED NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        is_primary TINYINT(1) NOT NULL DEFAULT 0,
        sort_order INT UNSIGNED NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_pi_property (property_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    try {
      const [piCols] = await db.query("SHOW COLUMNS FROM property_images LIKE 'is_primary'");
      if (piCols.length === 0) {
        await db.query('ALTER TABLE property_images ADD COLUMN is_primary TINYINT(1) NOT NULL DEFAULT 0 AFTER image_url');
      }
    } catch (_) {}

    try {
      const [soCols] = await db.query("SHOW COLUMNS FROM property_images LIKE 'sort_order'");
      if (soCols.length === 0) {
        await db.query('ALTER TABLE property_images ADD COLUMN sort_order INT UNSIGNED NOT NULL DEFAULT 0 AFTER is_primary');
      }
    } catch (_) {}

    // Deduplicate any repeated image_url in property_images
    try {
      await db.query(`
        DELETE p1 FROM property_images p1
        JOIN property_images p2
          ON p1.property_id = p2.property_id
         AND p1.image_url = p2.image_url
         AND p1.id > p2.id
      `);
    } catch (_) {}

    try {
      await db.query(`
        ALTER TABLE property_images ADD UNIQUE KEY uk_property_images_url (property_id, image_url(250))
      `);
    } catch (_) {}

    await db.query(`
      CREATE TABLE IF NOT EXISTS property_amenities (
        property_id BIGINT UNSIGNED NOT NULL,
        amenity_id BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY (property_id, amenity_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 8. Nếu còn bảng homestays cũ, di chuyển dữ liệu sang properties rồi xóa homestays
    try {
      const [hsTable] = await db.query("SHOW TABLES LIKE 'homestays'");
      if (hsTable.length > 0) {
        await db.query(`
          INSERT INTO properties (
            id, host_id, name, description, type_id, price_per_night, old_price,
            location_id, street_address, city, country, max_guests, bedrooms, bathrooms,
            rating, review_count, is_new, is_featured, is_active, is_deleted, status,
            cover_image, manage_token
          )
          SELECT
            h.id,
            COALESCE(h.host_id, 2),
            h.name,
            h.description,
            COALESCE(h.type_id, 1),
            h.price,
            h.old_price,
            h.location_id,
            COALESCE(l.name, 'Vietnam'),
            COALESCE(l.name, 'Vietnam'),
            'Vietnam',
            h.max_guests,
            h.bedrooms,
            h.bathrooms,
            h.rating,
            h.review_count,
            h.is_new,
            h.is_featured,
            h.is_active,
            0,
            COALESCE(h.approval_status, 'approved'),
            COALESCE(hi.image_url, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'),
            COALESCE(h.manage_token, CONCAT('HMTOKEN_', LPAD(h.id, 4, '0')))
          FROM homestays h
          LEFT JOIN locations l ON h.location_id = l.id
          LEFT JOIN homestay_images hi ON hi.homestay_id = h.id AND hi.is_primary = 1
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            price_per_night = VALUES(price_per_night),
            location_id = VALUES(location_id),
            type_id = VALUES(type_id),
            cover_image = VALUES(cover_image)
        `);

        // Di chuyển homestay_images -> property_images
        try {
          await db.query(`
            INSERT IGNORE INTO property_images (property_id, image_url, is_primary, sort_order)
            SELECT homestay_id, image_url, is_primary, sort_order FROM homestay_images
          `);
        } catch (_) {}

        // Di chuyển homestay_amenities -> property_amenities
        try {
          await db.query(`
            INSERT IGNORE INTO property_amenities (property_id, amenity_id)
            SELECT homestay_id, amenity_id FROM homestay_amenities
          `);
        } catch (_) {}

        // Drop các khóa ngoại cũ trỏ vào homestays
        try { await db.query('ALTER TABLE bookings DROP FOREIGN KEY fk_bookings_homestay'); } catch (_) {}
        try { await db.query('ALTER TABLE favorites DROP FOREIGN KEY fk_favorites_homestay'); } catch (_) {}
        try { await db.query('ALTER TABLE reviews DROP FOREIGN KEY fk_reviews_homestay'); } catch (_) {}
        try { await db.query('ALTER TABLE homestay_images DROP FOREIGN KEY fk_homestay_images_homestay'); } catch (_) {}
        try { await db.query('ALTER TABLE homestay_amenities DROP FOREIGN KEY fk_homestay_amenities_homestay'); } catch (_) {}

        // Drop bảng homestays và child tables cũ
        try { await db.query('DROP TABLE IF EXISTS homestay_amenities'); } catch (_) {}
        try { await db.query('DROP TABLE IF EXISTS homestay_images'); } catch (_) {}
        try { await db.query('DROP TABLE IF EXISTS homestays'); } catch (_) {}
      }
    } catch (err) {
      console.warn('Sync homestays to properties notice:', err.message);
    }

    // 9. Cập nhật khóa ngoại trong bookings, favorites, reviews sang property_id
    try {
      const [bCols] = await db.query("SHOW COLUMNS FROM bookings LIKE 'property_id'");
      if (bCols.length === 0) {
        await db.query('ALTER TABLE bookings ADD COLUMN property_id BIGINT UNSIGNED NULL AFTER booking_code');
        await db.query('UPDATE bookings SET property_id = homestay_id WHERE property_id IS NULL AND homestay_id IS NOT NULL');
      } else {
        await db.query('UPDATE bookings SET property_id = homestay_id WHERE property_id IS NULL AND homestay_id IS NOT NULL');
      }
    } catch (_) {}

    try {
      const [fCols] = await db.query("SHOW COLUMNS FROM favorites LIKE 'property_id'");
      if (fCols.length === 0) {
        await db.query('ALTER TABLE favorites ADD COLUMN property_id BIGINT UNSIGNED NULL AFTER user_id');
        await db.query('UPDATE favorites SET property_id = homestay_id WHERE property_id IS NULL AND homestay_id IS NOT NULL');
      } else {
        await db.query('UPDATE favorites SET property_id = homestay_id WHERE property_id IS NULL AND homestay_id IS NOT NULL');
      }
    } catch (_) {}

    try {
      const [rCols] = await db.query("SHOW COLUMNS FROM reviews LIKE 'property_id'");
      if (rCols.length === 0) {
        await db.query('ALTER TABLE reviews ADD COLUMN property_id BIGINT UNSIGNED NULL AFTER user_id');
        await db.query('UPDATE reviews SET property_id = homestay_id WHERE property_id IS NULL AND homestay_id IS NOT NULL');
      } else {
        await db.query('UPDATE reviews SET property_id = homestay_id WHERE property_id IS NULL AND homestay_id IS NOT NULL');
      }
      const [rgCols] = await db.query("SHOW COLUMNS FROM reviews LIKE 'guest_id'");
      if (rgCols.length === 0) {
        await db.query('ALTER TABLE reviews ADD COLUMN guest_id BIGINT UNSIGNED NULL AFTER user_id');
        await db.query('UPDATE reviews SET guest_id = user_id WHERE guest_id IS NULL AND user_id IS NOT NULL');
      }
    } catch (_) {}

    // Bổ sung các foreign keys chuẩn vào properties
    try {
      await db.query('ALTER TABLE bookings ADD CONSTRAINT fk_bookings_property FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE RESTRICT ON UPDATE CASCADE');
    } catch (_) {}
    try {
      await db.query('ALTER TABLE favorites ADD CONSTRAINT fk_favorites_property FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE ON UPDATE CASCADE');
    } catch (_) {}
    try {
      await db.query('ALTER TABLE reviews ADD CONSTRAINT fk_reviews_property FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE ON UPDATE CASCADE');
    } catch (_) {}

    // Bổ sung các cột mở rộng cho bookings nếu thiếu
    const safeAddBookingCol = async (colName, colDef) => {
      try {
        const [chk] = await db.query(`SHOW COLUMNS FROM bookings LIKE '${colName}'`);
        if (chk.length === 0) {
          await db.query(`ALTER TABLE bookings ADD COLUMN ${colDef}`);
        }
      } catch (err) {
        console.warn(`safeAddBookingCol ${colName} notice:`, err.message);
      }
    };

    await safeAddBookingCol('property_id', 'property_id BIGINT UNSIGNED NULL AFTER booking_code');
    await safeAddBookingCol('guest_id', 'guest_id BIGINT UNSIGNED NULL AFTER user_id');
    await safeAddBookingCol('guest_name_snapshot', 'guest_name_snapshot VARCHAR(120) NULL AFTER guest_name');
    await safeAddBookingCol('guest_phone_snapshot', 'guest_phone_snapshot VARCHAR(30) NULL AFTER guest_phone');
    await safeAddBookingCol('payment_method', "payment_method ENUM('cash','bank_transfer','vnpay','momo') NOT NULL DEFAULT 'bank_transfer'");
    await safeAddBookingCol('payment_reference', 'payment_reference VARCHAR(80) NULL AFTER notes');
    await safeAddBookingCol('payment_status', "payment_status ENUM('unpaid','proof_uploaded','verified','rejected') NOT NULL DEFAULT 'unpaid'");
    await safeAddBookingCol('payment_proof_image', 'payment_proof_image VARCHAR(500) NULL');
    await safeAddBookingCol('payment_submitted_at', 'payment_submitted_at DATETIME NULL');
    await safeAddBookingCol('confirmed_by', 'confirmed_by BIGINT UNSIGNED NULL');
    await safeAddBookingCol('confirmed_at', 'confirmed_at DATETIME NULL');
    await safeAddBookingCol('rejection_reason', 'rejection_reason TEXT NULL');
    await safeAddBookingCol('checkin_instructions', 'checkin_instructions TEXT NULL');
    await safeAddBookingCol('commission_rate_applied', 'commission_rate_applied DECIMAL(6,4) NOT NULL DEFAULT 0.1000');
    await safeAddBookingCol('cancellation_reason_code', 'cancellation_reason_code VARCHAR(50) NULL');
    await safeAddBookingCol('cancellation_reason_text', 'cancellation_reason_text TEXT NULL');
    await safeAddBookingCol('refund_amount', 'refund_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00');
    await safeAddBookingCol('cancellation_fee', 'cancellation_fee DECIMAL(12,2) NOT NULL DEFAULT 0.00');
    await safeAddBookingCol('refund_percentage', 'refund_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00');
    await safeAddBookingCol('cancellation_policy_applied', 'cancellation_policy_applied VARCHAR(50) NULL');
    await safeAddBookingCol('cancelled_by', 'cancelled_by BIGINT UNSIGNED NULL');

    try {
      await db.query("ALTER TABLE bookings MODIFY COLUMN payment_status ENUM('unpaid', 'proof_uploaded', 'verified', 'partially_refunded', 'refunded', 'rejected') NOT NULL DEFAULT 'unpaid'");
    } catch (_) {}

    try {
      await db.query("ALTER TABLE payments MODIFY COLUMN status ENUM('pending', 'completed', 'partially_refunded', 'refunded', 'failed') NOT NULL DEFAULT 'pending'");
    } catch (_) {}

    // 10. Cập nhật view v_properties_detail, v_homestays_detail và v_user_bookings
    try {
      await db.query(`
        CREATE OR REPLACE VIEW v_properties_detail AS
        SELECT
          p.id,
          p.host_id,
          p.name AS title,
          p.name,
          p.description,
          COALESCE(t.name, 'Homestay') AS property_type,
          COALESCE(t.name, 'Homestay') AS type_name,
          p.price_per_night,
          p.price_per_night AS price,
          p.old_price,
          p.location_id,
          COALESCE(l.name, p.city) AS location_name,
          l.image_url AS location_image,
          p.type_id,
          p.street_address,
          p.city,
          p.country,
          p.latitude,
          p.longitude,
          p.rating,
          p.review_count,
          p.max_guests,
          p.bedrooms,
          p.bathrooms,
          p.is_new,
          p.is_featured,
          p.is_featured AS featured,
          p.is_active,
          p.is_deleted,
          p.status,
          p.status AS approval_status,
          p.cover_image,
          p.manage_token,
          p.manage_token_active,
          p.manage_token_expires_at,
          p.created_at,
          p.updated_at
        FROM properties p
        LEFT JOIN locations l ON p.location_id = l.id
        LEFT JOIN homestay_types t ON p.type_id = t.id
        WHERE p.is_deleted = 0
      `);

      await db.query(`CREATE OR REPLACE VIEW v_homestays_detail AS SELECT * FROM v_properties_detail`);

      await db.query(`
        CREATE OR REPLACE VIEW v_user_bookings AS
        SELECT
          b.id,
          b.booking_code,
          b.user_id,
          u.name AS user_name,
          u.email AS user_email,
          u.phone AS user_phone,
          b.property_id,
          b.property_id AS homestay_id,
          p.name AS property_title,
          p.name AS homestay_name,
          p.price_per_night AS property_price,
          p.price_per_night AS homestay_price,
          COALESCE(pi.image_url, p.cover_image) AS property_image,
          COALESCE(pi.image_url, p.cover_image) AS homestay_image,
          p.location_id,
          COALESCE(l.name, p.city) AS location_name,
          p.type_id,
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
          b.status,
          b.payment_status,
          b.payment_proof_image,
          b.notes,
          b.cancelled_at,
          b.cancelled_reason,
          pay.payment_method,
          pay.status AS payment_transaction_status,
          pay.transaction_code,
          b.created_at,
          b.updated_at
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        JOIN properties p ON b.property_id = p.id
        LEFT JOIN locations l ON p.location_id = l.id
        LEFT JOIN homestay_types t ON p.type_id = t.id
        LEFT JOIN property_images pi ON pi.property_id = p.id AND pi.is_primary = 1
        LEFT JOIN promotions prom ON b.promotion_id = prom.id
        LEFT JOIN payments pay ON pay.booking_id = b.id
      `);
    } catch (viewErr) {
      console.warn('View update notice:', viewErr.message);
    }

    // 11. Cấu hình bảng app_settings
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

    // 12. Seed tài khoản Admin & Host
    const hashedAdminPassword = await bcrypt.hash('123456', 10);
    await db.query(`
      INSERT INTO users (id, name, full_name, email, password_hash, password, role, phone, location, status, is_active)
      VALUES (1, 'Admin User', 'Admin User', 'admin@mail.com', ?, ?, 'admin', '0900000001', 'Vietnam', 'active', 1)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), password = VALUES(password), role = 'admin', full_name = VALUES(full_name)
    `, [hashedAdminPassword, hashedAdminPassword]);

    await db.query(`
      INSERT INTO users (id, name, full_name, email, password_hash, password, role, phone, location, status, is_active)
      VALUES (2, 'Nguyen Van A (Host)', 'Nguyen Van A', 'host1@mail.com', ?, ?, 'host', '0900000002', 'Ha Noi', 'active', 1)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), password = VALUES(password), role = 'host', full_name = VALUES(full_name)
    `, [hashedAdminPassword, hashedAdminPassword]);

    await db.query(`
      INSERT INTO users (id, name, full_name, email, password_hash, password, role, phone, location, status, is_active)
      VALUES (3, 'Tran Thi B (Host)', 'Tran Thi B', 'host2@mail.com', ?, ?, 'host', '0900000003', 'Da Nang', 'active', 1)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), password = VALUES(password), role = 'host', full_name = VALUES(full_name)
    `, [hashedAdminPassword, hashedAdminPassword]);

    await db.query(`
      INSERT INTO users (id, name, full_name, email, password_hash, password, role, phone, location, status, is_active)
      VALUES (8, 'Huong Nguyen', 'Huong Nguyen', 'huong@gmail.com', ?, ?, 'customer', '0912888999', 'Ha Noi', 'active', 1)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), password = VALUES(password), status = 'active', is_active = 1
    `, [hashedAdminPassword, hashedAdminPassword]);

    // 13. Bảng host_verifications, disputes, audit_logs
    await db.query(`
      CREATE TABLE IF NOT EXISTS host_verifications (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NOT NULL UNIQUE,
        id_card_number VARCHAR(50) NOT NULL,
        id_card_front_url VARCHAR(500) NOT NULL,
        id_card_back_url VARCHAR(500) NOT NULL,
        business_license_url VARCHAR(500) NULL,
        status ENUM('draft', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'draft',
        rejection_reason TEXT NULL,
        reviewed_by BIGINT UNSIGNED NULL,
        reviewed_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_hv_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS disputes (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        reporter_id BIGINT UNSIGNED NOT NULL,
        reporter_role ENUM('guest', 'host') NOT NULL DEFAULT 'guest',
        target_type ENUM('property', 'host', 'booking') NOT NULL,
        target_id BIGINT UNSIGNED NOT NULL,
        booking_id BIGINT UNSIGNED NULL,
        reason VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        evidence_url VARCHAR(500) NULL,
        status ENUM('pending', 'investigating', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending',
        admin_note TEXT NULL,
        resolution_action ENUM('none', 'refund', 'suspend_host', 'suspend_property', 'warning') NOT NULL DEFAULT 'none',
        resolved_by BIGINT UNSIGNED NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME NULL,
        KEY idx_disputes_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        actor_id BIGINT UNSIGNED NULL,
        actor_role VARCHAR(50) NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id BIGINT UNSIGNED NOT NULL,
        metadata TEXT NULL,
        ip_address VARCHAR(100) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_audit_entity (entity_type, entity_id),
        KEY idx_audit_actor (actor_id),
        KEY idx_audit_action (action)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 14. Bổ sung category vào disputes nếu chưa có
    try {
      const [dCat] = await db.query("SHOW COLUMNS FROM disputes LIKE 'category'");
      if (dCat.length === 0) {
        await db.query("ALTER TABLE disputes ADD COLUMN category VARCHAR(50) NULL AFTER booking_id");
      }
    } catch (_) {}

    // 15. Tạo các bảng Wallets, Wallet Transactions, Bank Accounts, Withdrawals, Refunds
    await db.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL UNIQUE,
        balance DECIMAL(14,2) NOT NULL DEFAULT 0.00,
        currency VARCHAR(10) NOT NULL DEFAULT 'VND',
        status ENUM('active', 'locked') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_wallets_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        wallet_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        type ENUM('REFUND', 'WITHDRAWAL', 'DEPOSIT', 'ADJUSTMENT') NOT NULL,
        amount DECIMAL(14,2) NOT NULL,
        balance_before DECIMAL(14,2) NOT NULL,
        balance_after DECIMAL(14,2) NOT NULL,
        reference_type VARCHAR(50) NOT NULL,
        reference_id BIGINT UNSIGNED NULL,
        description VARCHAR(255) NOT NULL,
        status ENUM('pending', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'completed',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_wallet_tx_wallet (wallet_id),
        KEY idx_wallet_tx_user (user_id),
        KEY idx_wallet_tx_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        bank_code VARCHAR(50) NOT NULL,
        account_number VARCHAR(50) NOT NULL,
        account_holder_name VARCHAR(100) NOT NULL,
        is_default TINYINT(1) NOT NULL DEFAULT 0,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_bank_accounts_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        wallet_id BIGINT UNSIGNED NOT NULL,
        bank_account_id BIGINT UNSIGNED NOT NULL,
        amount DECIMAL(14,2) NOT NULL,
        status ENUM('pending', 'approved', 'processing', 'completed', 'rejected', 'failed') NOT NULL DEFAULT 'pending',
        admin_note TEXT NULL,
        processed_by BIGINT UNSIGNED NULL,
        processed_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_withdrawals_user (user_id),
        KEY idx_withdrawals_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS refunds (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        booking_id BIGINT UNSIGNED NOT NULL UNIQUE,
        user_id BIGINT UNSIGNED NOT NULL,
        total_paid DECIMAL(12,2) NOT NULL,
        refund_amount DECIMAL(12,2) NOT NULL,
        cancellation_fee DECIMAL(12,2) NOT NULL,
        refund_percentage DECIMAL(5,2) NOT NULL,
        policy_code VARCHAR(50) NOT NULL,
        reason_code VARCHAR(50) NOT NULL,
        reason_text TEXT NULL,
        status ENUM('completed', 'failed') NOT NULL DEFAULT 'completed',
        wallet_transaction_id BIGINT UNSIGNED NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_refunds_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS booking_conversations (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        booking_id BIGINT UNSIGNED NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS booking_messages (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        conversation_id BIGINT UNSIGNED NOT NULL,
        sender_id BIGINT UNSIGNED NOT NULL,
        message TEXT NOT NULL,
        message_type ENUM('text', 'image', 'system') NOT NULL DEFAULT 'text',
        read_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_messages_conversation (conversation_id),
        KEY idx_messages_sender (sender_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

  } catch (err) {
    console.error('Database migration error:', err);
  }
}

module.exports = migrateDatabase;
