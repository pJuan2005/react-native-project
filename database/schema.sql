-- =====================================================
-- HOMESTAY BOOKING DATABASE SCHEMA
-- Database: homestay_db
-- MariaDB / MySQL
-- =====================================================

CREATE DATABASE IF NOT EXISTS `homestay_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `homestay_db`;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `address` VARCHAR(255) NULL,
  `birth_date` DATE NULL,
  `avatar_url` VARCHAR(500) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- LOCATIONS TABLE
-- =====================================================
CREATE TABLE `locations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `icon` VARCHAR(50) NULL,
  `image_url` VARCHAR(500) NULL,
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
-- HOMESTAY TYPES TABLE (Villa, Homestay, Cabin, Eco Homestay, Resort)
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
-- AMENITIES TABLE (Tiện nghi)
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
-- HOMESTAYS TABLE
-- =====================================================
CREATE TABLE `homestays` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `old_price` DECIMAL(12,2) NULL,
  `location_id` BIGINT UNSIGNED NOT NULL,
  `type_id` BIGINT UNSIGNED NOT NULL,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `review_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `max_guests` INT UNSIGNED NOT NULL DEFAULT 1,
  `bedrooms` INT UNSIGNED NOT NULL DEFAULT 1,
  `bathrooms` INT UNSIGNED NOT NULL DEFAULT 1,
  `is_new` TINYINT(1) NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_homestays_location` (`location_id`),
  KEY `idx_homestays_type` (`type_id`),
  KEY `idx_homestays_active` (`is_active`),
  KEY `idx_homestays_featured` (`is_featured`),
  KEY `idx_homestays_new` (`is_new`),
  KEY `idx_homestays_price` (`price`),
  KEY `idx_homestays_rating` (`rating`),
  CONSTRAINT `fk_homestays_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_homestays_type` FOREIGN KEY (`type_id`) REFERENCES `homestay_types` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- HOMESTAY IMAGES TABLE
-- =====================================================
CREATE TABLE `homestay_images` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `homestay_id` BIGINT UNSIGNED NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_homestay_images_homestay` (`homestay_id`),
  KEY `idx_homestay_images_primary` (`homestay_id`, `is_primary`),
  CONSTRAINT `fk_homestay_images_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- HOMESTAY AMENITIES (Many-to-Many)
-- =====================================================
CREATE TABLE `homestay_amenities` (
  `homestay_id` BIGINT UNSIGNED NOT NULL,
  `amenity_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`homestay_id`, `amenity_id`),
  CONSTRAINT `fk_homestay_amenities_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_homestay_amenities_amenity` FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE `bookings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `booking_code` VARCHAR(20) NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `homestay_id` BIGINT UNSIGNED NOT NULL,
  `check_in` DATE NOT NULL,
  `check_out` DATE NOT NULL,
  `guests` INT UNSIGNED NOT NULL DEFAULT 1,
  `nights` INT UNSIGNED NOT NULL DEFAULT 1,
  `price_per_night` DECIMAL(12,2) NOT NULL,
  `total_price` DECIMAL(12,2) NOT NULL,
  `status` ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
  `notes` TEXT NULL,
  `cancelled_at` TIMESTAMP NULL,
  `cancelled_reason` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bookings_code` (`booking_code`),
  KEY `idx_bookings_user` (`user_id`),
  KEY `idx_bookings_homestay` (`homestay_id`),
  KEY `idx_bookings_status` (`status`),
  KEY `idx_bookings_dates` (`check_in`, `check_out`),
  KEY `idx_bookings_user_status` (`user_id`, `status`),
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_bookings_dates` CHECK (`check_out` > `check_in`),
  CONSTRAINT `chk_bookings_guests` CHECK (`guests` > 0),
  CONSTRAINT `chk_bookings_price` CHECK (`total_price` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- FAVORITES / WISHLIST TABLE
-- =====================================================
CREATE TABLE `favorites` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `homestay_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_favorites_user_homestay` (`user_id`, `homestay_id`),
  KEY `idx_favorites_user` (`user_id`),
  KEY `idx_favorites_homestay` (`homestay_id`),
  CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favorites_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- REVIEWS TABLE (For future expansion)
-- =====================================================
CREATE TABLE `reviews` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `homestay_id` BIGINT UNSIGNED NOT NULL,
  `booking_id` BIGINT UNSIGNED NULL,
  `rating` TINYINT UNSIGNED NOT NULL,
  `comment` TEXT NULL,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_homestay` (`homestay_id`),
  KEY `idx_reviews_user` (`user_id`),
  KEY `idx_reviews_booking` (`booking_id`),
  KEY `idx_reviews_active` (`is_active`),
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_reviews_rating` CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INDEXES FOR SEARCH/FILTER PERFORMANCE
-- =====================================================
CREATE INDEX `idx_homestays_search` ON `homestays` (`name`(50), `description`(100));
CREATE INDEX `idx_homestays_location_type` ON `homestays` (`location_id`, `type_id`, `is_active`);
CREATE INDEX `idx_homestays_location_price` ON `homestays` (`location_id`, `price`, `is_active`);

-- =====================================================
-- VIEW: Homestay with full details (for API)
-- =====================================================
CREATE OR REPLACE VIEW `v_homestays_detail` AS
SELECT
  h.`id`,
  h.`name`,
  h.`description`,
  h.`price`,
  h.`old_price`,
  h.`location_id`,
  l.`name` AS `location_name`,
  l.`image_url` AS `location_image`,
  h.`type_id`,
  t.`name` AS `type_name`,
  h.`rating`,
  h.`review_count`,
  h.`max_guests`,
  h.`bedrooms`,
  h.`bathrooms`,
  h.`is_new`,
  h.`is_featured`,
  h.`is_active`,
  h.`created_at`,
  h.`updated_at`
FROM `homestays` h
JOIN `locations` l ON h.`location_id` = l.`id`
JOIN `homestay_types` t ON h.`type_id` = t.`id`
WHERE h.`is_active` = 1;

-- =====================================================
-- VIEW: User bookings with homestay info
-- =====================================================
CREATE OR REPLACE VIEW `v_user_bookings` AS
SELECT
  b.`id`,
  b.`booking_code`,
  b.`user_id`,
  b.`homestay_id`,
  h.`name` AS `homestay_name`,
  h.`price` AS `homestay_price`,
  hi.`image_url` AS `homestay_image`,
  h.`location_id`,
  l.`name` AS `location_name`,
  h.`type_id`,
  t.`name` AS `type_name`,
  b.`check_in`,
  b.`check_out`,
  b.`guests`,
  b.`nights`,
  b.`price_per_night`,
  b.`total_price`,
  b.`status`,
  b.`notes`,
  b.`created_at`,
  b.`updated_at`
FROM `bookings` b
JOIN `homestays` h ON b.`homestay_id` = h.`id`
JOIN `locations` l ON h.`location_id` = l.`id`
JOIN `homestay_types` t ON h.`type_id` = t.`id`
LEFT JOIN `homestay_images` hi ON hi.`homestay_id` = h.`id` AND hi.`is_primary` = 1
WHERE b.`status` != 'cancelled';

-- =====================================================
-- TRIGGER: Update homestay_count in locations
-- =====================================================
DELIMITER //

CREATE TRIGGER `trg_homestays_after_insert`
AFTER INSERT ON `homestays`
FOR EACH ROW
BEGIN
  IF NEW.is_active = 1 THEN
    UPDATE `locations` SET `homestay_count` = `homestay_count` + 1 WHERE `id` = NEW.location_id;
  END IF;
END//

CREATE TRIGGER `trg_homestays_after_update`
AFTER UPDATE ON `homestays`
FOR EACH ROW
BEGIN
  IF OLD.is_active != NEW.is_active THEN
    IF NEW.is_active = 1 THEN
      UPDATE `locations` SET `homestay_count` = `homestay_count` + 1 WHERE `id` = NEW.location_id;
    ELSE
      UPDATE `locations` SET `homestay_count` = `homestay_count` - 1 WHERE `id` = NEW.location_id;
    END IF;
  END IF;
  IF OLD.location_id != NEW.location_id THEN
    IF OLD.is_active = 1 THEN
      UPDATE `locations` SET `homestay_count` = `homestay_count` - 1 WHERE `id` = OLD.location_id;
    END IF;
    IF NEW.is_active = 1 THEN
      UPDATE `locations` SET `homestay_count` = `homestay_count` + 1 WHERE `id` = NEW.location_id;
    END IF;
  END IF;
END//

CREATE TRIGGER `trg_homestays_after_delete`
AFTER DELETE ON `homestays`
FOR EACH ROW
BEGIN
  IF OLD.is_active = 1 THEN
    UPDATE `locations` SET `homestay_count` = `homestay_count` - 1 WHERE `id` = OLD.location_id;
  END IF;
END//

DELIMITER ;

-- =====================================================
-- FUNCTION: Check homestay availability for date range
-- =====================================================
DELIMITER //

CREATE FUNCTION `fn_check_homestay_available`(
  p_homestay_id BIGINT UNSIGNED,
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
  WHERE `homestay_id` = p_homestay_id
    AND `status` IN ('pending', 'confirmed')
    AND `check_in` < p_check_out
    AND `check_out` > p_check_in;

  RETURN CASE WHEN v_conflicts = 0 THEN 1 ELSE 0 END;
END//

DELIMITER ;

-- =====================================================
-- PROCEDURE: Create booking with availability check
-- =====================================================
DELIMITER //

CREATE PROCEDURE `sp_create_booking`(
  IN p_user_id BIGINT UNSIGNED,
  IN p_homestay_id BIGINT UNSIGNED,
  IN p_check_in DATE,
  IN p_check_out DATE,
  IN p_guests INT UNSIGNED,
  OUT p_booking_id BIGINT UNSIGNED,
  OUT p_error_message VARCHAR(255)
)
BEGIN
  DECLARE v_price DECIMAL(12,2);
  DECLARE v_max_guests INT UNSIGNED;
  DECLARE v_nights INT UNSIGNED;
  DECLARE v_total DECIMAL(12,2);
  DECLARE v_booking_code VARCHAR(20);
  DECLARE v_available TINYINT(1);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_error_message = 'Database error occurred';
    SET p_booking_id = 0;
  END;

  START TRANSACTION;

  -- Get homestay price and max guests
  SELECT `price`, `max_guests`
  INTO v_price, v_max_guests
  FROM `homestays`
  WHERE `id` = p_homestay_id AND `is_active` = 1
  FOR UPDATE;

  IF v_price IS NULL THEN
    SET p_error_message = 'Homestay not found or inactive';
    SET p_booking_id = 0;
    ROLLBACK;
  ELSEIF p_guests > v_max_guests THEN
    SET p_error_message = CONCAT('Maximum guests allowed: ', v_max_guests);
    SET p_booking_id = 0;
    ROLLBACK;
  ELSEIF p_check_out <= p_check_in THEN
    SET p_error_message = 'Check-out must be after check-in';
    SET p_booking_id = 0;
    ROLLBACK;
  ELSE
    -- Check availability
    SET v_available = fn_check_homestay_available(p_homestay_id, p_check_in, p_check_out);
    IF v_available = 0 THEN
      SET p_error_message = 'Homestay not available for selected dates';
      SET p_booking_id = 0;
      ROLLBACK;
    ELSE
      SET v_nights = DATEDIFF(p_check_out, p_check_in);
      SET v_total = v_price * v_nights;
      SET v_booking_code = CONCAT('BK', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 10000), 4, '0'));

      INSERT INTO `bookings` (
        `booking_code`, `user_id`, `homestay_id`,
        `check_in`, `check_out`, `guests`, `nights`,
        `price_per_night`, `total_price`, `status`
      ) VALUES (
        v_booking_code, p_user_id, p_homestay_id,
        p_check_in, p_check_out, p_guests, v_nights,
        v_price, v_total, 'pending'
      );

      SET p_booking_id = LAST_INSERT_ID();
      SET p_error_message = '';
      COMMIT;
    END IF;
  END IF;
END//

DELIMITER ;