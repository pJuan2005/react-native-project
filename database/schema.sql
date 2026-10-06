-- =====================================================
-- PROPERTY & HOMESTAY BOOKING COMPREHENSIVE DATABASE SCHEMA
-- Database: homestay_db
-- Target: MariaDB / MySQL 8.0+
-- Architecture: Single Source of Truth `properties` + Core Tables + Views + Triggers + Functions + Stored Procedures
-- =====================================================

CREATE DATABASE IF NOT EXISTS `homestay_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `homestay_db`;

-- Drop old views if exist
DROP VIEW IF EXISTS `v_admin_revenue_stats`;
DROP VIEW IF EXISTS `v_user_bookings`;
DROP VIEW IF EXISTS `v_properties_detail`;
DROP VIEW IF EXISTS `v_homestays_detail`;

-- Drop tables with foreign keys in correct order
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `disputes`;
DROP TABLE IF EXISTS `host_verifications`;
DROP TABLE IF EXISTS `app_settings`;
DROP TABLE IF EXISTS `point_transactions`;
DROP TABLE IF EXISTS `user_devices`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `promotions`;
DROP TABLE IF EXISTS `property_amenities`;
DROP TABLE IF EXISTS `property_images`;
DROP TABLE IF EXISTS `homestay_amenities`;
DROP TABLE IF EXISTS `homestay_images`;
DROP TABLE IF EXISTS `homestays`;
DROP TABLE IF EXISTS `properties`;
DROP TABLE IF EXISTS `amenities`;
DROP TABLE IF EXISTS `homestay_types`;
DROP TABLE IF EXISTS `locations`;
DROP TABLE IF EXISTS `users`;

-- =====================================================
-- 1. USERS TABLE (Quản lý Admin, Host, Nhân viên & Khách hàng)
-- =====================================================
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `full_name` VARCHAR(120) NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(255) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff', 'customer', 'host', 'guest') NOT NULL DEFAULT 'customer',
  `status` ENUM('active', 'blocked') NOT NULL DEFAULT 'active',
  `phone` VARCHAR(20) NULL,
  `address` VARCHAR(255) NULL,
  `location` VARCHAR(255) NULL,
  `website` VARCHAR(255) NULL,
  `languages` VARCHAR(255) NULL,
  `bio` TEXT NULL,
  `birth_date` DATE NULL,
  `avatar_url` TEXT NULL,
  `reward_points` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. LOCATIONS TABLE (Địa điểm / Vùng miền du lịch)
-- =====================================================
CREATE TABLE `locations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `icon` VARCHAR(50) NULL,
  `image_url` VARCHAR(500) NULL,
  `property_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `homestay_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_locations_name` (`name`),
  KEY `idx_locations_active` (`is_active`),
  KEY `idx_locations_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. HOMESTAY TYPES TABLE (Villa, Homestay, Resort, Cabin, Eco Homestay)
-- =====================================================
CREATE TABLE `homestay_types` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,
  `icon` VARCHAR(50) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_homestay_types_name` (`name`),
  KEY `idx_homestay_types_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. AMENITIES TABLE (Danh mục tiện nghi)
-- =====================================================
CREATE TABLE `amenities` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(50) NULL,
  `category` VARCHAR(50) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_amenities_name` (`name`),
  KEY `idx_amenities_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. PROPERTIES TABLE (Thực thể Chỗ nghỉ duy nhất - Canonical Schema)
-- Không lưu các cột duplicate: title, property_type, price, featured, approval_status
-- =====================================================
CREATE TABLE `properties` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `host_id` BIGINT UNSIGNED NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `type_id` BIGINT UNSIGNED NOT NULL,
  `price_per_night` DECIMAL(12,2) NOT NULL,
  `old_price` DECIMAL(12,2) NULL,
  `location_id` BIGINT UNSIGNED NULL,
  `street_address` VARCHAR(255) NOT NULL DEFAULT 'Vietnam',
  `city` VARCHAR(100) NOT NULL DEFAULT 'Vietnam',
  `country` VARCHAR(100) NOT NULL DEFAULT 'Vietnam',
  `latitude` DECIMAL(10,8) NULL,
  `longitude` DECIMAL(11,8) NULL,
  `max_guests` INT UNSIGNED NOT NULL DEFAULT 2,
  `bedrooms` INT UNSIGNED NOT NULL DEFAULT 1,
  `bathrooms` INT UNSIGNED NOT NULL DEFAULT 1,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  `review_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_new` TINYINT(1) NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
  `cover_image` VARCHAR(500) NULL,
  `manage_token` VARCHAR(80) NULL,
  `manage_token_active` TINYINT(1) NOT NULL DEFAULT 1,
  `manage_token_expires_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_properties_manage_token` (`manage_token`),
  KEY `idx_properties_host` (`host_id`),
  KEY `idx_properties_location` (`location_id`),
  KEY `idx_properties_type` (`type_id`),
  KEY `idx_properties_status` (`status`),
  KEY `idx_properties_active` (`is_active`, `is_deleted`),
  KEY `idx_properties_price` (`price_per_night`),
  KEY `idx_properties_rating` (`rating`),
  CONSTRAINT `fk_properties_host` FOREIGN KEY (`host_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_properties_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_properties_type` FOREIGN KEY (`type_id`) REFERENCES `homestay_types` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. PROPERTY IMAGES TABLE (Thư viện hình ảnh Chỗ nghỉ)
-- =====================================================
CREATE TABLE `property_images` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `property_id` BIGINT UNSIGNED NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_property_images_property` (`property_id`),
  KEY `idx_property_images_primary` (`property_id`, `is_primary`),
  CONSTRAINT `fk_property_images_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. PROPERTY AMENITIES TABLE (Liên kết N-N Tiện nghi Chỗ nghỉ)
-- =====================================================
CREATE TABLE `property_amenities` (
  `property_id` BIGINT UNSIGNED NOT NULL,
  `amenity_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`property_id`, `amenity_id`),
  CONSTRAINT `fk_property_amenities_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_property_amenities_amenity` FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. PROMOTIONS TABLE (Mã giảm giá & Voucher khuyến mãi)
-- =====================================================
CREATE TABLE `promotions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `discount_type` ENUM('percent', 'fixed') NOT NULL DEFAULT 'percent',
  `discount_value` DECIMAL(12,2) NOT NULL,
  `max_discount_amount` DECIMAL(12,2) NULL COMMENT 'Mức giảm tối đa với discount_type = percent',
  `min_booking_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `required_points` INT UNSIGNED NULL DEFAULT 0 COMMENT 'Số điểm cần quy đổi nếu là voucher đổi điểm',
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `usage_limit` INT UNSIGNED NULL DEFAULT NULL,
  `used_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promotions_code` (`code`),
  KEY `idx_promotions_active` (`is_active`, `start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. BOOKINGS TABLE (Đơn đặt phòng)
-- =====================================================
CREATE TABLE `bookings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `booking_code` VARCHAR(30) NOT NULL,
  `property_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NULL,
  `guest_id` BIGINT UNSIGNED NULL,
  `guest_name` VARCHAR(120) NULL,
  `guest_name_snapshot` VARCHAR(120) NULL,
  `guest_phone` VARCHAR(30) NULL,
  `guest_phone_snapshot` VARCHAR(30) NULL,
  `check_in` DATE NOT NULL,
  `check_out` DATE NOT NULL,
  `guests` INT UNSIGNED NOT NULL DEFAULT 1,
  `nights` INT UNSIGNED NOT NULL DEFAULT 1,
  `price_per_night` DECIMAL(12,2) NOT NULL,
  `promotion_id` BIGINT UNSIGNED NULL,
  `discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_price` DECIMAL(12,2) NOT NULL,
  `commission_rate` DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  `commission_rate_applied` DECIMAL(6,4) NOT NULL DEFAULT 0.1000,
  `commission_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `host_payout_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
  `source` ENUM('guest_online', 'host_direct', 'admin_manual') NOT NULL DEFAULT 'guest_online',
  `payment_method` ENUM('cash', 'bank_transfer', 'vnpay', 'momo') NOT NULL DEFAULT 'bank_transfer',
  `payment_reference` VARCHAR(80) NULL,
  `payment_status` ENUM('unpaid', 'proof_uploaded', 'verified', 'rejected') NOT NULL DEFAULT 'unpaid',
  `payment_proof_image` VARCHAR(500) NULL,
  `payment_submitted_at` DATETIME NULL,
  `confirmed_by` BIGINT UNSIGNED NULL,
  `confirmed_at` DATETIME NULL,
  `rejection_reason` TEXT NULL,
  `checkin_instructions` TEXT NULL,
  `notes` TEXT NULL,
  `host_note` TEXT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `cancelled_at` TIMESTAMP NULL,
  `cancelled_reason` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bookings_code` (`booking_code`),
  KEY `idx_bookings_property` (`property_id`),
  KEY `idx_bookings_user` (`user_id`),
  KEY `idx_bookings_guest` (`guest_id`),
  KEY `idx_bookings_status` (`status`),
  KEY `idx_bookings_source` (`source`),
  KEY `idx_bookings_payment_status` (`payment_status`),
  KEY `idx_bookings_dates` (`check_in`, `check_out`),
  KEY `idx_bookings_promotion` (`promotion_id`),
  CONSTRAINT `fk_bookings_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_bookings_dates` CHECK (`check_out` > `check_in`),
  CONSTRAINT `chk_bookings_guests` CHECK (`guests` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. PAYMENTS TABLE (Giao dịch thanh toán)
-- =====================================================
CREATE TABLE `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `booking_id` BIGINT UNSIGNED NOT NULL,
  `payment_method` ENUM('cash', 'bank_transfer', 'vnpay', 'momo') NOT NULL DEFAULT 'bank_transfer',
  `transaction_code` VARCHAR(100) NULL COMMENT 'Mã tham chiếu ngân hàng hoặc mã cổng thanh toán',
  `proof_image_url` VARCHAR(500) NULL COMMENT 'Ảnh chụp biên lai chuyển khoản ngân hàng',
  `amount` DECIMAL(12,2) NOT NULL,
  `status` ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `paid_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_booking` (`booking_id`),
  KEY `idx_payments_status` (`status`),
  CONSTRAINT `fk_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. FAVORITES TABLE (Danh sách yêu thích / Wishlist)
-- =====================================================
CREATE TABLE `favorites` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `property_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_favorites_user_property` (`user_id`, `property_id`),
  KEY `idx_favorites_user` (`user_id`),
  KEY `idx_favorites_property` (`property_id`),
  CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favorites_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 12. REVIEWS TABLE (Đánh giá & Nhận xét)
-- =====================================================
CREATE TABLE `reviews` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `guest_id` BIGINT UNSIGNED NULL,
  `property_id` BIGINT UNSIGNED NOT NULL,
  `booking_id` BIGINT UNSIGNED NULL,
  `rating` TINYINT UNSIGNED NOT NULL,
  `comment` TEXT NULL,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_property` (`property_id`),
  KEY `idx_reviews_user` (`user_id`),
  KEY `idx_reviews_booking` (`booking_id`),
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_reviews_rating` CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 13. NOTIFICATIONS TABLE (Thông báo In-app cho Mobile & Web)
-- =====================================================
CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `type` ENUM('booking_status', 'promotion', 'points', 'system') NOT NULL DEFAULT 'booking_status',
  `reference_id` BIGINT UNSIGNED NULL COMMENT 'ID của booking, promotion hoặc transaction liên quan',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_read` (`user_id`, `is_read`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 14. USER DEVICES TABLE (Lưu FCM Push Token cho thiết bị Mobile)
-- =====================================================
CREATE TABLE `user_devices` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `device_token` VARCHAR(255) NOT NULL,
  `device_type` ENUM('android', 'ios', 'web') NOT NULL DEFAULT 'android',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_device_token` (`user_id`, `device_token`),
  CONSTRAINT `fk_user_devices_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 15. POINT TRANSACTIONS TABLE (Lịch sử Tích điểm & Đổi Voucher)
-- =====================================================
CREATE TABLE `point_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `points` INT NOT NULL COMMENT 'Dương (+) là cộng điểm, Âm (-) là trừ điểm khi đổi quà',
  `type` ENUM('earn', 'redeem') NOT NULL DEFAULT 'earn',
  `reference_id` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_points_user` (`user_id`),
  CONSTRAINT `fk_point_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 16. APP SETTINGS TABLE (Cấu hình tài chính & hoa hồng nền tảng)
-- =====================================================
CREATE TABLE `app_settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_settings_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `app_settings` (`setting_key`, `setting_value`, `description`) VALUES
('platform_commission_rate', '10', 'Tỷ lệ hoa hồng nền tảng thu từ đơn online (%)'),
('direct_commission_rate', '5', 'Tỷ lệ hoa hồng nền tảng thu từ đơn tại quầy do chủ nhà tạo (%)'),
('usd_to_vnd_rate', '25000', 'Tỷ giá quy đổi USD sang VND');

-- =====================================================
-- 17. HOST VERIFICATIONS TABLE (Hồ sơ xác minh danh tính Chủ nhà)
-- =====================================================
CREATE TABLE `host_verifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `host_id` BIGINT UNSIGNED NOT NULL,
  `id_card_number` VARCHAR(50) NOT NULL,
  `id_card_front_url` VARCHAR(500) NOT NULL,
  `id_card_back_url` VARCHAR(500) NOT NULL,
  `business_license_url` VARCHAR(500) NULL,
  `status` ENUM('draft', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'draft',
  `rejection_reason` TEXT NULL,
  `reviewed_by` BIGINT UNSIGNED NULL,
  `reviewed_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_host_verifications_host` (`host_id`),
  KEY `idx_host_verifications_status` (`status`),
  CONSTRAINT `fk_host_verifications_host` FOREIGN KEY (`host_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 18. DISPUTES TABLE (Báo cáo & Khiếu nại Trust & Safety)
-- =====================================================
CREATE TABLE `disputes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reporter_id` BIGINT UNSIGNED NOT NULL,
  `reporter_role` ENUM('guest', 'host') NOT NULL DEFAULT 'guest',
  `target_type` ENUM('property', 'host', 'booking') NOT NULL,
  `target_id` BIGINT UNSIGNED NOT NULL,
  `booking_id` BIGINT UNSIGNED NULL,
  `reason` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `evidence_url` VARCHAR(500) NULL,
  `status` ENUM('pending', 'investigating', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending',
  `admin_note` TEXT NULL,
  `resolution_action` ENUM('none', 'refund', 'suspend_host', 'suspend_property', 'warning') NOT NULL DEFAULT 'none',
  `resolved_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `idx_disputes_status` (`status`),
  KEY `idx_disputes_target` (`target_type`, `target_id`),
  KEY `idx_disputes_reporter` (`reporter_id`),
  CONSTRAINT `fk_disputes_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 19. AUDIT LOGS TABLE (Nhật ký kiểm toán hệ thống)
-- =====================================================
CREATE TABLE `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `actor_id` BIGINT UNSIGNED NULL,
  `actor_role` VARCHAR(50) NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(100) NOT NULL,
  `entity_id` BIGINT UNSIGNED NOT NULL,
  `metadata` TEXT NULL,
  `ip_address` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_entity` (`entity_type`, `entity_id`),
  KEY `idx_audit_actor` (`actor_id`),
  KEY `idx_audit_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VIEWS FOR MOBILE & WEB ADMIN
-- =====================================================

-- VIEW 1: Chi tiết property/chỗ nghỉ đầy đủ (Ánh xạ DTO tương thích cho cả Mobile & Web)
CREATE OR REPLACE VIEW `v_properties_detail` AS
SELECT
  p.`id`,
  p.`host_id`,
  p.`name` AS `title`,
  p.`name`,
  p.`description`,
  COALESCE(t.`name`, 'Homestay') AS `property_type`,
  COALESCE(t.`name`, 'Homestay') AS `type_name`,
  p.`price_per_night`,
  p.`price_per_night` AS `price`,
  p.`old_price`,
  p.`location_id`,
  COALESCE(l.`name`, p.`city`) AS `location_name`,
  l.`image_url` AS `location_image`,
  p.`type_id`,
  p.`street_address`,
  p.`city`,
  p.`country`,
  p.`latitude`,
  p.`longitude`,
  p.`rating`,
  p.`review_count`,
  p.`max_guests`,
  p.`bedrooms`,
  p.`bathrooms`,
  p.`is_new`,
  p.`is_featured`,
  p.`is_featured` AS `featured`,
  p.`is_active`,
  p.`is_deleted`,
  p.`status`,
  p.`status` AS `approval_status`,
  p.`cover_image`,
  p.`manage_token`,
  p.`manage_token_active`,
  p.`manage_token_expires_at`,
  p.`created_at`,
  p.`updated_at`
FROM `properties` p
LEFT JOIN `locations` l ON p.`location_id` = l.`id`
LEFT JOIN `homestay_types` t ON p.`type_id` = t.`id`
WHERE p.`is_deleted` = 0;

-- Alias View cho tương thích ngược nếu còn client cũ tham chiếu
CREATE OR REPLACE VIEW `v_homestays_detail` AS
SELECT * FROM `v_properties_detail`;

-- VIEW 2: Lịch sử đặt phòng người dùng
CREATE OR REPLACE VIEW `v_user_bookings` AS
SELECT
  b.`id`,
  b.`booking_code`,
  b.`user_id`,
  u.`name` AS `user_name`,
  u.`email` AS `user_email`,
  u.`phone` AS `user_phone`,
  b.`property_id`,
  b.`property_id` AS `homestay_id`,
  p.`name` AS `property_title`,
  p.`name` AS `homestay_name`,
  p.`price_per_night` AS `property_price`,
  p.`price_per_night` AS `homestay_price`,
  COALESCE(pi.`image_url`, p.`cover_image`) AS `property_image`,
  COALESCE(pi.`image_url`, p.`cover_image`) AS `homestay_image`,
  p.`location_id`,
  COALESCE(l.`name`, p.`city`) AS `location_name`,
  p.`type_id`,
  COALESCE(t.`name`, 'Homestay') AS `type_name`,
  b.`check_in`,
  b.`check_out`,
  b.`guests`,
  b.`nights`,
  b.`price_per_night`,
  b.`promotion_id`,
  prom.`code` AS `promotion_code`,
  prom.`title` AS `promotion_title`,
  b.`discount_amount`,
  b.`total_price`,
  b.`status`,
  b.`payment_status`,
  b.`payment_proof_image`,
  b.`notes`,
  b.`cancelled_at`,
  b.`cancelled_reason`,
  pay.`payment_method`,
  pay.`status` AS `payment_transaction_status`,
  pay.`transaction_code`,
  b.`created_at`,
  b.`updated_at`
FROM `bookings` b
LEFT JOIN `users` u ON b.`user_id` = u.`id`
JOIN `properties` p ON b.`property_id` = p.`id`
LEFT JOIN `locations` l ON p.`location_id` = l.`id`
LEFT JOIN `homestay_types` t ON p.`type_id` = t.`id`
LEFT JOIN `property_images` pi ON pi.`property_id` = p.`id` AND pi.`is_primary` = 1
LEFT JOIN `promotions` prom ON b.`promotion_id` = prom.`id`
LEFT JOIN `payments` pay ON pay.`booking_id` = b.`id`;

-- VIEW 3: Thống kê doanh thu cho Web Admin
CREATE OR REPLACE VIEW `v_admin_revenue_stats` AS
SELECT
  DATE_FORMAT(b.`created_at`, '%Y-%m') AS `month_year`,
  COUNT(b.`id`) AS `total_bookings`,
  SUM(CASE WHEN b.`status` IN ('confirmed', 'completed') THEN 1 ELSE 0 END) AS `successful_bookings`,
  SUM(CASE WHEN b.`status` = 'cancelled' THEN 1 ELSE 0 END) AS `cancelled_bookings`,
  SUM(CASE WHEN b.`status` IN ('confirmed', 'completed') THEN b.`total_price` ELSE 0 END) AS `gross_revenue`,
  SUM(CASE WHEN b.`status` IN ('confirmed', 'completed') THEN b.`discount_amount` ELSE 0 END) AS `total_discounts_given`,
  SUM(CASE WHEN pay.`status` = 'completed' THEN pay.`amount` ELSE 0 END) AS `collected_revenue`
FROM `bookings` b
LEFT JOIN `payments` pay ON pay.`booking_id` = b.`id`
GROUP BY DATE_FORMAT(b.`created_at`, '%Y-%m')
ORDER BY `month_year` DESC;

-- =====================================================
-- TRIGGERS
-- =====================================================
DELIMITER //

-- Trigger 1: Tăng số lượng property theo địa điểm khi thêm mới
CREATE TRIGGER `trg_properties_after_insert`
AFTER INSERT ON `properties`
FOR EACH ROW
BEGIN
  IF NEW.is_active = 1 AND NEW.is_deleted = 0 AND NEW.location_id IS NOT NULL THEN
    UPDATE `locations`
    SET `property_count` = `property_count` + 1,
        `homestay_count` = `homestay_count` + 1
    WHERE `id` = NEW.location_id;
  END IF;
END//

-- Trigger 2: Cập nhật số lượng property khi thay đổi trạng thái hoặc địa điểm
CREATE TRIGGER `trg_properties_after_update`
AFTER UPDATE ON `properties`
FOR EACH ROW
BEGIN
  IF (OLD.is_active != NEW.is_active OR OLD.is_deleted != NEW.is_deleted) THEN
    IF NEW.is_active = 1 AND NEW.is_deleted = 0 AND NEW.location_id IS NOT NULL THEN
      UPDATE `locations`
      SET `property_count` = `property_count` + 1,
          `homestay_count` = `homestay_count` + 1
      WHERE `id` = NEW.location_id;
    ELSEIF OLD.location_id IS NOT NULL THEN
      UPDATE `locations`
      SET `property_count` = GREATEST(0, `property_count` - 1),
          `homestay_count` = GREATEST(0, `homestay_count` - 1)
      WHERE `id` = OLD.location_id;
    END IF;
  END IF;

  IF OLD.location_id != NEW.location_id AND NEW.is_active = 1 AND NEW.is_deleted = 0 THEN
    IF OLD.location_id IS NOT NULL THEN
      UPDATE `locations`
      SET `property_count` = GREATEST(0, `property_count` - 1),
          `homestay_count` = GREATEST(0, `homestay_count` - 1)
      WHERE `id` = OLD.location_id;
    END IF;
    IF NEW.location_id IS NOT NULL THEN
      UPDATE `locations`
      SET `property_count` = `property_count` + 1,
          `homestay_count` = `homestay_count` + 1
      WHERE `id` = NEW.location_id;
    END IF;
  END IF;
END//

-- Trigger 3: Giảm số lượng property khi xóa
CREATE TRIGGER `trg_properties_after_delete`
AFTER DELETE ON `properties`
FOR EACH ROW
BEGIN
  IF OLD.is_active = 1 AND OLD.is_deleted = 0 AND OLD.location_id IS NOT NULL THEN
    UPDATE `locations`
    SET `property_count` = GREATEST(0, `property_count` - 1),
        `homestay_count` = GREATEST(0, `homestay_count` - 1)
    WHERE `id` = OLD.location_id;
  END IF;
END//

-- Trigger 4: Tự động cập nhật rating & review_count sau khi có đánh giá mới
CREATE TRIGGER `trg_reviews_after_insert`
AFTER INSERT ON `reviews`
FOR EACH ROW
BEGIN
  DECLARE v_avg_rating DECIMAL(3,2);
  DECLARE v_count INT;

  SELECT AVG(rating), COUNT(id)
  INTO v_avg_rating, v_count
  FROM `reviews`
  WHERE `property_id` = NEW.property_id AND `is_active` = 1;

  UPDATE `properties`
  SET `rating` = IFNULL(v_avg_rating, 5.00),
      `review_count` = v_count
  WHERE `id` = NEW.property_id;
END//

DELIMITER ;

-- =====================================================
-- FUNCTION: fn_check_property_available
-- =====================================================
DELIMITER //

CREATE FUNCTION `fn_check_property_available`(
  p_property_id BIGINT UNSIGNED,
  p_check_in DATE,
  p_check_out DATE
) RETURNS TINYINT(1)
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE v_conflicts INT DEFAULT 0;

  SELECT COUNT(*)
  INTO v_conflicts
  FROM `bookings`
  WHERE `property_id` = p_property_id
    AND `status` IN ('pending', 'confirmed')
    AND `check_in` < p_check_out
    AND `check_out` > p_check_in;

  RETURN CASE WHEN v_conflicts = 0 THEN 1 ELSE 0 END;
END//

-- Alias function cho tương thích ngược
CREATE FUNCTION `fn_check_homestay_available`(
  p_homestay_id BIGINT UNSIGNED,
  p_check_in DATE,
  p_check_out DATE
) RETURNS TINYINT(1)
READS SQL DATA
DETERMINISTIC
BEGIN
  RETURN fn_check_property_available(p_homestay_id, p_check_in, p_check_out);
END//

DELIMITER ;

-- =====================================================
-- STORED PROCEDURE: sp_create_booking
-- =====================================================
DELIMITER //

CREATE PROCEDURE `sp_create_booking`(
  IN p_user_id BIGINT UNSIGNED,
  IN p_property_id BIGINT UNSIGNED,
  IN p_check_in DATE,
  IN p_check_out DATE,
  IN p_guests INT UNSIGNED,
  IN p_promotion_id BIGINT UNSIGNED,
  IN p_payment_method ENUM('cash', 'bank_transfer', 'vnpay', 'momo'),
  IN p_notes TEXT,
  OUT p_booking_id BIGINT UNSIGNED,
  OUT p_booking_code VARCHAR(30),
  OUT p_final_total DECIMAL(12,2),
  OUT p_error_message VARCHAR(255)
)
BEGIN
  DECLARE v_price DECIMAL(12,2);
  DECLARE v_max_guests INT UNSIGNED;
  DECLARE v_nights INT UNSIGNED;
  DECLARE v_raw_total DECIMAL(12,2);
  DECLARE v_discount DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_available TINYINT(1);
  DECLARE v_promo_type ENUM('percent', 'fixed');
  DECLARE v_promo_val DECIMAL(12,2);
  DECLARE v_promo_max DECIMAL(12,2);
  DECLARE v_promo_min DECIMAL(12,2);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_error_message = 'Database error occurred during booking process';
    SET p_booking_id = 0;
  END;

  START TRANSACTION;

  -- 1. Get Property Info
  SELECT `price_per_night`, `max_guests`
  INTO v_price, v_max_guests
  FROM `properties`
  WHERE `id` = p_property_id AND `is_active` = 1 AND `is_deleted` = 0
  FOR UPDATE;

  IF v_price IS NULL THEN
    SET p_error_message = 'Chỗ nghỉ không tồn tại hoặc đã tạm dừng hoạt động';
    SET p_booking_id = 0;
    ROLLBACK;
  ELSEIF p_guests > v_max_guests THEN
    SET p_error_message = CONCAT('Số khách vượt quá tối đa: ', v_max_guests, ' người');
    SET p_booking_id = 0;
    ROLLBACK;
  ELSEIF p_check_out <= p_check_in THEN
    SET p_error_message = 'Ngày trả phòng phải sau ngày nhận phòng';
    SET p_booking_id = 0;
    ROLLBACK;
  ELSE
    -- 2. Check Overbooking
    SET v_available = fn_check_property_available(p_property_id, p_check_in, p_check_out);
    IF v_available = 0 THEN
      SET p_error_message = 'Chỗ nghỉ đã có khách đặt trong khoảng thời gian này';
      SET p_booking_id = 0;
      ROLLBACK;
    ELSE
      -- 3. Compute Nights & Raw Total
      SET v_nights = DATEDIFF(p_check_out, p_check_in);
      SET v_raw_total = v_price * v_nights;

      -- 4. Calculate Promotion Discount if applied
      IF p_promotion_id IS NOT NULL AND p_promotion_id > 0 THEN
        SELECT `discount_type`, `discount_value`, `max_discount_amount`, `min_booking_amount`
        INTO v_promo_type, v_promo_val, v_promo_max, v_promo_min
        FROM `promotions`
        WHERE `id` = p_promotion_id AND `is_active` = 1 AND NOW() BETWEEN `start_date` AND `end_date`;

        IF v_promo_val IS NOT NULL AND v_raw_total >= v_promo_min THEN
          IF v_promo_type = 'percent' THEN
            SET v_discount = (v_raw_total * v_promo_val) / 100;
            IF v_promo_max IS NOT NULL AND v_discount > v_promo_max THEN
              SET v_discount = v_promo_max;
            END IF;
          ELSE
            SET v_discount = v_promo_val;
          END IF;
          -- Increment usage count
          UPDATE `promotions` SET `used_count` = `used_count` + 1 WHERE `id` = p_promotion_id;
        END IF;
      END IF;

      SET p_final_total = GREATEST(0, v_raw_total - v_discount);
      SET p_booking_code = CONCAT('BK', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 10000), 4, '0'));

      -- 5. Insert Booking
      INSERT INTO `bookings` (
        `booking_code`, `user_id`, `guest_id`, `property_id`,
        `check_in`, `check_out`, `guests`, `nights`,
        `price_per_night`, `promotion_id`, `discount_amount`,
        `total_price`, `status`, `notes`
      ) VALUES (
        p_booking_code, p_user_id, p_user_id, p_property_id,
        p_check_in, p_check_out, p_guests, v_nights,
        v_price, p_promotion_id, v_discount,
        p_final_total, 'confirmed', p_notes
      );

      SET p_booking_id = LAST_INSERT_ID();

      -- 6. Insert Payment Record
      INSERT INTO `payments` (
        `booking_id`, `payment_method`, `amount`, `status`, `paid_at`
      ) VALUES (
        p_booking_id,
        IFNULL(p_payment_method, 'bank_transfer'),
        p_final_total,
        IF(p_payment_method IN ('vnpay', 'momo'), 'completed', 'pending'),
        IF(p_payment_method IN ('vnpay', 'momo'), NOW(), NULL)
      );

      -- 7. Add Reward Points for user
      UPDATE `users` SET `reward_points` = `reward_points` + GREATEST(10, FLOOR(p_final_total / 10000)) WHERE `id` = p_user_id;

      INSERT INTO `point_transactions` (`user_id`, `title`, `points`, `type`, `reference_id`)
      VALUES (p_user_id, CONCAT('Thưởng đặt phòng ', p_booking_code), GREATEST(10, FLOOR(p_final_total / 10000)), 'earn', p_booking_id);

      -- 8. Add In-app Notification for user
      INSERT INTO `notifications` (`user_id`, `title`, `content`, `type`, `reference_id`)
      VALUES (
        p_user_id,
        'Đặt phòng thành công! 🎉',
        CONCAT('Đơn đặt phòng ', p_booking_code, ' của bạn đã được xác nhận. Nhận phòng ngày ', DATE_FORMAT(p_check_in, '%d/%m/%Y'), '.'),
        'booking_status',
        p_booking_id
      );

      SET p_error_message = '';
      COMMIT;
    END IF;
  END IF;
END//

DELIMITER ;
