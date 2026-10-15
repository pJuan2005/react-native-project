-- ==============================================================================
-- SEED DATA CHUYÊN BIỆT DÀNH CHO BẢO VỆ ĐỒ ÁN / DEMO HỘI ĐỒNG
-- Tài khoản demo 1: phamchuan2608@gmail.com (ID: 4) - Mật khẩu: 123456
-- Tài khoản demo 2: huong@gmail.com        (ID: 8) - Mật khẩu: 123456
-- Đảm bảo mỗi màn hình có từ 40 - 60 bản ghi thực tế, cuộn mỏi tay, dữ liệu sống động
-- Tự động dùng CURDATE() để dù chạy vào bất kỳ ngày nào dữ liệu vẫn luôn chuẩn xác:
--   * Đang ở (staying): check_in <= CURDATE() và check_out >= CURDATE()
--   * Sắp tới (upcoming): check_in > CURDATE()
--   * Đã ở qua (completed): check_out < CURDATE()
--   * Đã hủy hoàn 70% ví (cancelled): có bản ghi refunds & wallet_transactions tương ứng
-- ==============================================================================

USE `homestay_db`;

-- TẮT TẠM THỜI KIỂM TRA KHÓA NGOẠI ĐỂ TRÁNH LỖI XUNG ĐỘT THỨ TỰ XÓA BẢN GHI
SET FOREIGN_KEY_CHECKS = 0;

-- 1. ĐẢM BẢO 2 TÀI KHOẢN TỒN TẠI VÀ CÓ ROLE CUSTOMER, ĐÃ XÁC MINH
INSERT INTO `users` (`id`, `name`, `full_name`, `email`, `password`, `password_hash`, `role`, `status`, `phone`, `address`, `location`, `birth_date`, `avatar_url`, `reward_points`, `is_verified`, `is_active`)
VALUES
(4, 'Phạm Xuân Chuẩn', 'Phạm Xuân Chuẩn', 'phamchuan2608@gmail.com', '$2b$10$GWcdyAFw/spSpVTBGfpOnu/OEWqoGmtUFlpLBUuOpiup.fRZnahZ.', '$2b$10$GWcdyAFw/spSpVTBGfpOnu/OEWqoGmtUFlpLBUuOpiup.fRZnahZ.', 'customer', 'active', '0901234567', 'Cầu Giấy, Hà Nội', 'Hà Nội', '2000-01-01', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80', 1250, 1, 1),
(8, 'Hương Nguyễn', 'Hương Nguyễn', 'huong@gmail.com', '$2b$10$GWcdyAFw/spSpVTBGfpOnu/OEWqoGmtUFlpLBUuOpiup.fRZnahZ.', '$2b$10$GWcdyAFw/spSpVTBGfpOnu/OEWqoGmtUFlpLBUuOpiup.fRZnahZ.', 'customer', 'active', '0912888999', 'Hai Bà Trưng, Hà Nội', 'Hà Nội', '1998-05-10', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 850, 1, 1)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `full_name` = VALUES(`full_name`),
  `role` = 'customer',
  `status` = 'active',
  `reward_points` = VALUES(`reward_points`),
  `is_verified` = 1,
  `is_active` = 1;

-- 2. KHỞI TẠO VÍ ĐIỆN TỬ CHO 2 TÀI KHOẢN (SỐ DƯ DỒI DÀO ĐỂ DEMO RÚT TIỀN / HOÀN TIỀN)
INSERT INTO `wallets` (`id`, `user_id`, `balance`, `currency`, `status`)
VALUES
(4, 4, 3850000.00, 'VND', 'active'),
(8, 8, 2450000.00, 'VND', 'active')
ON DUPLICATE KEY UPDATE
  `balance` = VALUES(`balance`),
  `status` = 'active';

-- DỌN DẸP BẢN GHI CON LIÊN QUAN TRƯỚC
DELETE FROM `withdrawals` WHERE `user_id` IN (4, 8);
DELETE FROM `refunds` WHERE `user_id` IN (4, 8);
DELETE FROM `wallet_transactions` WHERE `user_id` IN (4, 8);
DELETE FROM `bookings` WHERE `user_id` IN (4, 8);
DELETE FROM `favorites` WHERE `user_id` IN (4, 8);
DELETE FROM `bank_accounts` WHERE `user_id` IN (4, 8);
DELETE FROM `reviews` WHERE `user_id` IN (4, 8);
DELETE FROM `point_transactions` WHERE `user_id` IN (4, 8);
DELETE FROM `booking_messages` WHERE `sender_id` IN (4, 8);
DELETE FROM `disputes` WHERE `reporter_id` IN (4, 8);

-- 3. LIÊN KẾT TÀI KHOẢN NGÂN HÀNG CHO 2 TÀI KHOẢN
INSERT INTO `bank_accounts` (`id`, `user_id`, `bank_name`, `bank_code`, `account_number`, `account_holder_name`, `is_default`, `status`) VALUES
(401, 4, 'Techcombank (TCB)', 'TCB', '19071766471019', 'PHAM XUAN CHUAN', 1, 'active'),
(402, 4, 'MB Bank (Quân Đội)', 'MB', '0901234567899', 'PHAM XUAN CHUAN', 0, 'active'),
(403, 4, 'Vietcombank (VCB)', 'VCB', '1012345678', 'PHAM XUAN CHUAN', 0, 'active'),
(801, 8, 'Vietcombank (VCB)', 'VCB', '0011004567890', 'NGUYEN THI HUONG', 1, 'active'),
(802, 8, 'Techcombank (TCB)', 'TCB', '19034567891011', 'NGUYEN THI HUONG', 0, 'active');

-- 4. TẠO 50+ BẢN GHI HOMESTAY YÊU THÍCH (FAVORITES) CHO CẢ 2 USER
INSERT IGNORE INTO `favorites` (`user_id`, `property_id`, `created_at`)
SELECT 4, p.id, DATE_SUB(NOW(), INTERVAL (p.id * 3) HOUR)
FROM properties p
WHERE p.is_deleted = 0 AND p.is_active = 1
LIMIT 55;

INSERT IGNORE INTO `favorites` (`user_id`, `property_id`, `created_at`)
SELECT 8, p.id, DATE_SUB(NOW(), INTERVAL (p.id * 4) HOUR)
FROM properties p
WHERE p.is_deleted = 0 AND p.is_active = 1
ORDER BY p.id DESC
LIMIT 50;

-- 5. TẠO 55+ BẢN GHI BOOKINGS CHUẨN MỰC
-- A. ĐƠN ĐANG Ở (CURRENTLY STAYING): Check-in hôm qua/hôm nay và Check-out 2-3 ngày nữa
INSERT INTO `bookings` (
  `id`, `booking_code`, `property_id`, `user_id`, `guest_name`, `guest_phone`,
  `check_in`, `check_out`, `guests`, `nights`, `price_per_night`, `discount_amount`, `total_price`,
  `commission_rate`, `commission_amount`, `host_payout_amount`, `status`, `source`,
  `payment_method`, `payment_status`, `payment_proof_image`, `notes`, `created_at`
) VALUES
-- User 4 đang ở homestay 1 (Đà Lạt)
(4001, 'BK-STAY-4001', 1, 4, 'Phạm Xuân Chuẩn', '0901234567',
 DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 2, 3, 1200000, 100000, 3500000,
 10.00, 350000, 3150000, 'confirmed', 'guest_online', 'bank_transfer', 'verified',
 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'Đang lưu trú tại homestay, view đồi thông cực chill', DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- User 4 đang ở homestay 2 (Phú Quốc)
(4002, 'BK-STAY-4002', 2, 4, 'Phạm Xuân Chuẩn', '0901234567',
 CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 2, 2, 1800000, 0, 3600000,
 10.00, 360000, 3240000, 'confirmed', 'guest_online', 'bank_transfer', 'verified',
 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'Check-in trưa nay, yêu cầu phòng tầng cao', DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- User 8 đang ở homestay 3 (Sa Pa)
(8001, 'BK-STAY-8001', 3, 8, 'Hương Nguyễn', '0912888999',
 DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 2, 2, 1500000, 150000, 2850000,
 10.00, 285000, 2565000, 'confirmed', 'guest_online', 'bank_transfer', 'verified',
 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'Đang ở Sa Pa săn mây rất đẹp', DATE_SUB(NOW(), INTERVAL 3 DAY));

-- B. ĐƠN SẮP TỚI (UPCOMING): Check-in trong tương lai (3 ngày đến 2 tháng tới)
INSERT INTO `bookings` (
  `id`, `booking_code`, `property_id`, `user_id`, `guest_name`, `guest_phone`,
  `check_in`, `check_out`, `guests`, `nights`, `price_per_night`, `discount_amount`, `total_price`,
  `commission_rate`, `commission_amount`, `host_payout_amount`, `status`, `source`,
  `payment_method`, `payment_status`, `payment_proof_image`, `notes`, `created_at`
) VALUES
-- User 4: Đơn đã duyệt (confirmed) sắp tới
(4010, 'BK-UP-4010', 4, 4, 'Phạm Xuân Chuẩn', '0901234567', DATE_ADD(CURDATE(), INTERVAL 4 DAY), DATE_ADD(CURDATE(), INTERVAL 6 DAY), 2, 2, 1100000, 0, 2200000, 10.00, 220000, 1980000, 'confirmed', 'guest_online', 'bank_transfer', 'verified', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'Kỳ nghỉ cuối tuần tới', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4011, 'BK-UP-4011', 5, 4, 'Phạm Xuân Chuẩn', '0901234567', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 13 DAY), 4, 3, 2100000, 200000, 6100000, 10.00, 610000, 5490000, 'confirmed', 'guest_online', 'bank_transfer', 'verified', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'Du lịch gia đình Hội An', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4012, 'BK-UP-4012', 6, 4, 'Phạm Xuân Chuẩn', '0901234567', DATE_ADD(CURDATE(), INTERVAL 18 DAY), DATE_ADD(CURDATE(), INTERVAL 20 DAY), 2, 2, 950000, 0, 1900000, 10.00, 190000, 1710000, 'confirmed', 'guest_online', 'bank_transfer', 'verified', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'Nghỉ dưỡng Côn Đảo', DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- User 4: Đơn đã gửi biên lai VietQR, chờ Web Admin duyệt (proof_uploaded)
(4013, 'BK-UP-4013', 7, 4, 'Phạm Xuân Chuẩn', '0901234567', DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY), 2, 2, 1400000, 140000, 2660000, 10.00, 266000, 2394000, 'pending', 'guest_online', 'bank_transfer', 'proof_uploaded', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'Đã chuyển khoản VietQR lúc sáng', NOW()),

-- User 4: Đơn mới đặt chờ thanh toán (unpaid)
(4014, 'BK-UP-4014', 8, 4, 'Phạm Xuân Chuẩn', '0901234567', DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_ADD(CURDATE(), INTERVAL 16 DAY), 2, 2, 850000, 0, 1700000, 10.00, 170000, 1530000, 'pending', 'guest_online', 'bank_transfer', 'unpaid', NULL, 'Giữ chỗ đang chờ chuyển khoản', NOW()),

-- User 8: Đơn sắp tới
(8010, 'BK-UP-8010', 9, 8, 'Hương Nguyễn', '0912888999', DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 2, 2, 1300000, 0, 2600000, 10.00, 260000, 2340000, 'confirmed', 'guest_online', 'bank_transfer', 'verified', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'Chuyến đi nghỉ mát', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8011, 'BK-UP-8011', 10, 8, 'Hương Nguyễn', '0912888999', DATE_ADD(CURDATE(), INTERVAL 12 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 3, 3, 1600000, 200000, 4600000, 10.00, 460000, 4140000, 'pending', 'guest_online', 'bank_transfer', 'proof_uploaded', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'Đã gửi biên lai VietQR qua app', NOW());

-- C. ĐƠN ĐÃ HOÀN TẤT TRONG QUÁ KHỨ (COMPLETED): 25+ đơn mỗi tài khoản
INSERT INTO `bookings` (
  `id`, `booking_code`, `property_id`, `user_id`, `guest_name`, `guest_phone`,
  `check_in`, `check_out`, `guests`, `nights`, `price_per_night`, `discount_amount`, `total_price`,
  `commission_rate`, `commission_amount`, `host_payout_amount`, `status`, `source`,
  `payment_method`, `payment_status`, `payment_proof_image`, `notes`, `created_at`
)
SELECT
  (4100 + n.n),
  CONCAT('BK-CMP-41', LPAD(n.n, 2, '0')),
  ((n.n % 30) + 1),
  4,
  'Phạm Xuân Chuẩn',
  '0901234567',
  DATE_SUB(CURDATE(), INTERVAL (n.n * 7 + 10) DAY),
  DATE_SUB(CURDATE(), INTERVAL (n.n * 7 + 8) DAY),
  2,
  2,
  (800000 + (n.n * 50000)),
  IF(n.n % 3 = 0, 100000, 0),
  (1600000 + (n.n * 100000) - IF(n.n % 3 = 0, 100000, 0)),
  10.00,
  (160000 + (n.n * 10000)),
  (1440000 + (n.n * 90000)),
  'completed',
  'guest_online',
  'bank_transfer',
  'verified',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
  'Chuyến đi đã hoàn thành xuất sắc',
  DATE_SUB(NOW(), INTERVAL (n.n * 7 + 15) DAY)
FROM (
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
  SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
  SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
  SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
  SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25
) n;

INSERT INTO `bookings` (
  `id`, `booking_code`, `property_id`, `user_id`, `guest_name`, `guest_phone`,
  `check_in`, `check_out`, `guests`, `nights`, `price_per_night`, `discount_amount`, `total_price`,
  `commission_rate`, `commission_amount`, `host_payout_amount`, `status`, `source`,
  `payment_method`, `payment_status`, `payment_proof_image`, `notes`, `created_at`
)
SELECT
  (8100 + n.n),
  CONCAT('BK-CMP-81', LPAD(n.n, 2, '0')),
  ((n.n % 25) + 5),
  8,
  'Hương Nguyễn',
  '0912888999',
  DATE_SUB(CURDATE(), INTERVAL (n.n * 6 + 12) DAY),
  DATE_SUB(CURDATE(), INTERVAL (n.n * 6 + 10) DAY),
  2,
  2,
  (900000 + (n.n * 40000)),
  0,
  (1800000 + (n.n * 80000)),
  10.00,
  (180000 + (n.n * 8000)),
  (1620000 + (n.n * 72000)),
  'completed',
  'guest_online',
  'bank_transfer',
  'verified',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
  'Đã trải nghiệm dịch vụ rất hài lòng',
  DATE_SUB(NOW(), INTERVAL (n.n * 6 + 18) DAY)
FROM (
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
  SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
  SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
  SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
) n;

-- D. ĐƠN ĐÃ HỦY (CANCELLED): Gồm đơn hủy trước >= 72h (được hoàn 70%) và đơn hủy sát ngày (0%)
INSERT INTO `bookings` (
  `id`, `booking_code`, `property_id`, `user_id`, `guest_name`, `guest_phone`,
  `check_in`, `check_out`, `guests`, `nights`, `price_per_night`, `discount_amount`, `total_price`,
  `commission_rate`, `commission_amount`, `host_payout_amount`, `status`, `source`,
  `payment_method`, `payment_status`, `payment_proof_image`,
  `cancellation_reason_code`, `cancellation_reason_text`, `refund_amount`, `cancellation_fee`, `refund_percentage`, `cancellation_policy_applied`,
  `cancelled_at`, `cancelled_reason`, `notes`, `created_at`
) VALUES
-- User 4: Hủy trước 72h -> Hoàn 70%
(4201, 'BK-CAN-4201', 11, 4, 'Phạm Xuân Chuẩn', '0901234567',
 DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY), 2, 2, 1000000, 0, 2000000,
 10.00, 200000, 1800000, 'cancelled', 'guest_online', 'bank_transfer', 'partially_refunded',
 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
 'CHANGE_OF_PLAN', 'Tôi thay đổi kế hoạch công tác', 1400000, 600000, 70.00, 'CANCEL_72H_70_PERCENT',
 DATE_SUB(NOW(), INTERVAL 10 DAY), 'Tôi thay đổi kế hoạch công tác', 'Hủy trước 4 ngày, hoàn 70% ví', DATE_SUB(NOW(), INTERVAL 12 DAY)),

(4202, 'BK-CAN-4202', 12, 4, 'Phạm Xuân Chuẩn', '0901234567',
 DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_SUB(CURDATE(), INTERVAL 13 DAY), 2, 2, 1500000, 0, 3000000,
 10.00, 300000, 2700000, 'cancelled', 'guest_online', 'bank_transfer', 'partially_refunded',
 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
 'SCHEDULE_ISSUE', 'Bận việc gia đình đột xuất', 2100000, 900000, 70.00, 'CANCEL_72H_70_PERCENT',
 DATE_SUB(NOW(), INTERVAL 20 DAY), 'Bận việc gia đình đột xuất', 'Hủy trước 5 ngày, hoàn 70%', DATE_SUB(NOW(), INTERVAL 22 DAY)),

(4203, 'BK-CAN-4203', 14, 4, 'Phạm Xuân Chuẩn', '0901234567',
 DATE_SUB(CURDATE(), INTERVAL 25 DAY), DATE_SUB(CURDATE(), INTERVAL 23 DAY), 3, 2, 1200000, 0, 2400000,
 10.00, 240000, 2160000, 'cancelled', 'guest_online', 'bank_transfer', 'partially_refunded',
 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
 'FOUND_ANOTHER_PLACE', 'Tìm được villa rộng hơn cho nhóm', 1680000, 720000, 70.00, 'CANCEL_72H_70_PERCENT',
 DATE_SUB(NOW(), INTERVAL 30 DAY), 'Tìm được chỗ ở khác', 'Hủy trước 6 ngày', DATE_SUB(NOW(), INTERVAL 32 DAY)),

-- User 4: Hủy sát ngày (< 72h) -> Hoàn 0%
(4204, 'BK-CAN-4204', 15, 4, 'Phạm Xuân Chuẩn', '0901234567',
 DATE_SUB(CURDATE(), INTERVAL 8 DAY), DATE_SUB(CURDATE(), INTERVAL 6 DAY), 2, 2, 1100000, 0, 2200000,
 10.00, 220000, 1980000, 'cancelled', 'guest_online', 'bank_transfer', 'verified',
 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
 'SCHEDULE_ISSUE', 'Hủy sát giờ do lỡ chuyến bay', 0, 2200000, 0.00, 'CANCEL_WITHIN_72H_NO_REFUND',
 DATE_SUB(NOW(), INTERVAL 9 DAY), 'Lỡ chuyến bay không tới kịp', 'Hủy sát giờ không hoàn cọc', DATE_SUB(NOW(), INTERVAL 10 DAY)),

-- User 4: Hủy đơn chưa thanh toán (Hủy miễn phí 100%)
(4205, 'BK-CAN-4205', 16, 4, 'Phạm Xuân Chuẩn', '0901234567',
 DATE_ADD(CURDATE(), INTERVAL 15 DAY), DATE_ADD(CURDATE(), INTERVAL 17 DAY), 2, 2, 900000, 0, 1800000,
 10.00, 180000, 1620000, 'cancelled', 'guest_online', 'bank_transfer', 'unpaid',
 NULL, 'CHANGE_OF_PLAN', 'Không sắp xếp được thời gian', 0, 0, 0.00, 'CANCEL_UNPAID_FREE',
 NOW(), 'Đơn chưa thanh toán - Hủy miễn phí 100%', 'Hủy đơn giữ chỗ', NOW()),

-- User 8: Đơn hủy
(8201, 'BK-CAN-8201', 17, 8, 'Hương Nguyễn', '0912888999',
 DATE_SUB(CURDATE(), INTERVAL 7 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY), 2, 2, 1200000, 0, 2400000,
 10.00, 240000, 2160000, 'cancelled', 'guest_online', 'bank_transfer', 'partially_refunded',
 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
 'CHANGE_OF_PLAN', 'Thay đổi kế hoạch nghỉ mát', 1680000, 720000, 70.00, 'CANCEL_72H_70_PERCENT',
 DATE_SUB(NOW(), INTERVAL 12 DAY), 'Thay đổi kế hoạch nghỉ mát', 'Hủy trước 5 ngày, hoàn 70%', DATE_SUB(NOW(), INTERVAL 14 DAY)),

(8202, 'BK-CAN-8202', 18, 8, 'Hương Nguyễn', '0912888999',
 DATE_SUB(CURDATE(), INTERVAL 18 DAY), DATE_SUB(CURDATE(), INTERVAL 16 DAY), 2, 2, 1000000, 0, 2000000,
 10.00, 200000, 1800000, 'cancelled', 'guest_online', 'bank_transfer', 'partially_refunded',
 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
 'PRICE_ISSUE', 'Chi phí phát sinh cao hơn dự tính', 1400000, 600000, 70.00, 'CANCEL_72H_70_PERCENT',
 DATE_SUB(NOW(), INTERVAL 24 DAY), 'Chi phí phát sinh cao', 'Hủy hoàn 70%', DATE_SUB(NOW(), INTERVAL 26 DAY));

-- 6. TẠO HỒ SƠ HOÀN TIỀN (REFUNDS) TƯƠNG ỨNG CHO CÁC ĐƠN HỦY
INSERT INTO `refunds` (`id`, `booking_id`, `user_id`, `total_paid`, `refund_amount`, `cancellation_fee`, `refund_percentage`, `policy_code`, `reason_code`, `reason_text`, `status`, `created_at`) VALUES
(401, 4201, 4, 2000000, 1400000, 600000, 70.00, 'CANCEL_72H_70_PERCENT', 'CHANGE_OF_PLAN', 'Tôi thay đổi kế hoạch công tác', 'completed', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(402, 4202, 4, 3000000, 2100000, 900000, 70.00, 'CANCEL_72H_70_PERCENT', 'SCHEDULE_ISSUE', 'Bận việc gia đình đột xuất', 'completed', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(403, 4203, 4, 2400000, 1680000, 720000, 70.00, 'CANCEL_72H_70_PERCENT', 'FOUND_ANOTHER_PLACE', 'Tìm được villa rộng hơn cho nhóm', 'completed', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(801, 8201, 8, 2400000, 1680000, 720000, 70.00, 'CANCEL_72H_70_PERCENT', 'CHANGE_OF_PLAN', 'Thay đổi kế hoạch nghỉ mát', 'completed', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(802, 8202, 8, 2000000, 1400000, 600000, 70.00, 'CANCEL_72H_70_PERCENT', 'PRICE_ISSUE', 'Chi phí phát sinh cao', 'completed', DATE_SUB(NOW(), INTERVAL 24 DAY));

-- 7. TẠO 50+ BẢN GHI BIẾN ĐỘNG SỐ DƯ SỔ CÁI (WALLET_TRANSACTIONS)
-- Giao dịch hoàn tiền (REFUND) từ các đơn hủy
INSERT INTO `wallet_transactions` (`wallet_id`, `user_id`, `type`, `amount`, `balance_before`, `balance_after`, `reference_type`, `reference_id`, `description`, `status`, `created_at`) VALUES
(4, 4, 'REFUND', 1400000, 2450000, 3850000, 'booking_refund', 4201, 'Hoàn tiền hủy phòng 70% (Mã đơn: BK-CAN-4201)', 'completed', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(4, 4, 'REFUND', 2100000, 1350000, 3450000, 'booking_refund', 4202, 'Hoàn tiền hủy phòng 70% (Mã đơn: BK-CAN-4202)', 'completed', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(4, 4, 'REFUND', 1680000, 670000, 2350000, 'booking_refund', 4203, 'Hoàn tiền hủy phòng 70% (Mã đơn: BK-CAN-4203)', 'completed', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(4, 4, 'WITHDRAWAL', 1000000, 3450000, 2450000, 'withdrawal', 401, 'Rút tiền về ngân hàng Techcombank (*1019)', 'completed', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(4, 4, 'WITHDRAWAL', 500000, 2350000, 1850000, 'withdrawal', 402, 'Rút tiền về ngân hàng MB Bank (*899)', 'completed', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(4, 4, 'DEPOSIT', 500000, 170000, 670000, 'manual_deposit', 4001, 'Nạp tiền vào ví qua chuyển khoản VietQR', 'completed', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(4, 4, 'DEPOSIT', 200000, 0, 200000, 'welcome_reward', 4002, 'Thưởng nạp ví thành viên mới', 'completed', DATE_SUB(NOW(), INTERVAL 40 DAY));

-- Thêm 45 giao dịch biến động số dư định kỳ cho User 4 (lịch sử dày đặc)
INSERT INTO `wallet_transactions` (`wallet_id`, `user_id`, `type`, `amount`, `balance_before`, `balance_after`, `reference_type`, `reference_id`, `description`, `status`, `created_at`)
SELECT
  4,
  4,
  CASE WHEN n.n % 4 = 0 THEN 'WITHDRAWAL' WHEN n.n % 4 = 1 THEN 'REFUND' ELSE 'DEPOSIT' END,
  (100000 + (n.n * 20000)),
  (2000000 + (n.n * 10000)),
  (2000000 + (n.n * 10000) + IF(n.n % 4 = 0, -(100000 + (n.n * 20000)), (100000 + (n.n * 20000)))),
  CASE WHEN n.n % 4 = 0 THEN 'withdrawal' WHEN n.n % 4 = 1 THEN 'booking_refund' ELSE 'bank_transfer_deposit' END,
  (4500 + n.n),
  CONCAT(CASE WHEN n.n % 4 = 0 THEN 'Rút tiền về tài khoản ngân hàng' WHEN n.n % 4 = 1 THEN 'Hoàn tiền bảo lưu phòng' ELSE 'Nạp tiền ví điện tử VietQR' END, ' #', n.n),
  'completed',
  DATE_SUB(NOW(), INTERVAL (n.n * 3 + 40) DAY)
FROM (
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
  SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
  SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
  SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
  SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
  SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION
  SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION
  SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40 UNION
  SELECT 41 UNION SELECT 42 UNION SELECT 43 UNION SELECT 44 UNION SELECT 45
) n;

-- Giao dịch ví cho User 8
INSERT INTO `wallet_transactions` (`wallet_id`, `user_id`, `type`, `amount`, `balance_before`, `balance_after`, `reference_type`, `reference_id`, `description`, `status`, `created_at`) VALUES
(8, 8, 'REFUND', 1680000, 770000, 2450000, 'booking_refund', 8201, 'Hoàn tiền hủy phòng 70% (Mã đơn: BK-CAN-8201)', 'completed', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(8, 8, 'REFUND', 1400000, 1050000, 2450000, 'booking_refund', 8202, 'Hoàn tiền hủy phòng 70% (Mã đơn: BK-CAN-8202)', 'completed', DATE_SUB(NOW(), INTERVAL 24 DAY)),
(8, 8, 'WITHDRAWAL', 800000, 1850000, 1050000, 'withdrawal', 801, 'Rút tiền về Vietcombank (*67890)', 'completed', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(8, 8, 'DEPOSIT', 500000, 270000, 770000, 'manual_deposit', 8001, 'Nạp tiền ví điện tử', 'completed', DATE_SUB(NOW(), INTERVAL 30 DAY));

-- 8. TẠO LỆNH RÚT TIỀN (WITHDRAWALS) - CÓ CẢ LỆNH ĐANG CHỜ DUYỆT ĐỂ DEMO TRỰC TIẾP
INSERT INTO `withdrawals` (`id`, `user_id`, `wallet_id`, `bank_account_id`, `amount`, `status`, `admin_note`, `processed_by`, `processed_at`, `created_at`) VALUES
-- Lệnh đang chờ duyệt (Pending) của Chuẩn -> Để lúc thuyết trình có thể mở Web Admin bấm "Duyệt chuyển tiền" ngay trước mắt thầy!
(401, 4, 4, 401, 500000, 'pending', NULL, NULL, NULL, NOW()),
-- Các lệnh đã xử lý thành công
(402, 4, 4, 401, 1000000, 'completed', 'Đã chuyển khoản qua Internet Banking thành công', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 16 DAY)),
(403, 4, 4, 402, 500000, 'completed', 'Đối soát khớp lệnh thành công', 1, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 26 DAY)),
-- Lệnh bị từ chối (và hệ thống đã hoàn lại ví)
(404, 4, 4, 403, 700000, 'rejected', 'Tên chủ tài khoản không khớp số CCCD đăng ký, đã hoàn lại 100% tiền vào ví', 1, DATE_SUB(NOW(), INTERVAL 32 DAY), DATE_SUB(NOW(), INTERVAL 33 DAY)),

-- User 8
(801, 8, 8, 801, 800000, 'completed', 'Chuyển tiền VCB thành công', 1, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 21 DAY));

-- 9. TẠO ĐÁNH GIÁ (REVIEWS) 5★ TỪ CHUẨN VÀ HƯƠNG CHO CÁC CHỖ NGHỈ
INSERT INTO `reviews` (`property_id`, `user_id`, `booking_id`, `rating`, `comment`, `is_verified`, `is_active`, `created_at`) VALUES
(1, 4, 4101, 5, 'Phòng rất đẹp, view nhìn ra thung lũng đồi thông cực chill. Chủ nhà nhiệt tình hỗ trợ check-in sớm. Chắc chắn sẽ quay lại!', 1, 1, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 4, 4102, 5, 'Villa hồ bơi riêng sạch sẽ, tiện nghi đầy đủ bếp nướng BBQ. Cả gia đình mình rất thích!', 1, 1, DATE_SUB(NOW(), INTERVAL 22 DAY)),
(3, 4, 4103, 5, 'Vị trí trung tâm tiện đi lại, phòng ấm áp và thơm tho. Giá cả hợp lý so với chất lượng.', 1, 1, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(4, 4, 4104, 4, 'Chỗ nghỉ yên tĩnh, không gian xanh mát. Điểm trừ nhẹ là dốc lên hơi cao một chút nhưng view bù lại rất đẹp.', 1, 1, DATE_SUB(NOW(), INTERVAL 38 DAY)),
(5, 4, 4105, 5, 'Trải nghiệm tuyệt vời! Ứng dụng đặt phòng rất tiện lợi, quét mã VietQR là xong ngay.', 1, 1, DATE_SUB(NOW(), INTERVAL 45 DAY)),
(3, 8, 8101, 5, 'Homestay Sa Pa săn mây tuyệt đỉnh. Chủ nhà chuẩn bị bữa sáng rất chu đáo.', 1, 1, DATE_SUB(NOW(), INTERVAL 18 DAY)),
(4, 8, 8102, 5, 'Phòng decor phong cách vintage rất xinh, chụp ảnh góc nào cũng đẹp.', 1, 1, DATE_SUB(NOW(), INTERVAL 28 DAY));

-- 10. TẠO LỊCH SỬ TÍCH ĐIỂM VÀ ĐỔI VOUCHER (POINT_TRANSACTIONS)
INSERT INTO `point_transactions` (`user_id`, `title`, `points`, `type`, `created_at`) VALUES
(4, 'Thưởng thành viên mới đăng ký', 200, 'earn', DATE_SUB(NOW(), INTERVAL 60 DAY)),
(4, 'Hoàn thành kỳ nghỉ tại Homestay #1', 150, 'earn', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(4, 'Đánh giá 5 sao đóng góp cộng đồng', 150, 'earn', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(4, 'Hoàn thành kỳ nghỉ tại Homestay #2', 150, 'earn', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(4, 'Đổi Voucher giảm giá 100.000đ', -200, 'redeem', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 'Hoàn thành kỳ nghỉ tại Homestay #3', 150, 'earn', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(8, 'Thưởng thành viên mới', 200, 'earn', DATE_SUB(NOW(), INTERVAL 50 DAY)),
(8, 'Hoàn thành chuyến đi Sa Pa', 150, 'earn', DATE_SUB(NOW(), INTERVAL 18 DAY));

-- 11. TẠO CUỘC TRÒ CHUYỆN (CHAT) VỚI CHỦ NHÀ CHO ĐƠN ĐANG Ở (BK-STAY-4001)
DELETE FROM `booking_conversations` WHERE `booking_id` IN (4001, 8001);

INSERT INTO `booking_conversations` (`id`, `booking_id`, `created_at`) VALUES
(4001, 4001, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(8001, 8001, DATE_SUB(NOW(), INTERVAL 2 DAY));

INSERT INTO `booking_messages` (`conversation_id`, `sender_id`, `message`, `message_type`, `created_at`) VALUES
(4001, 4, 'Dạ chào chủ nhà, khoảng 14h chiều nay mình tới homestay nhận phòng nhé!', 'text', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4001, 2, 'Chào bạn Chuẩn nha! Phòng bên mình đã dọn dẹp sạch sẽ và xông tinh dầu sẵn rồi. Khi nào tới dốc bạn gọi số mình ra đón nhé!', 'text', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4001, 4, 'Vâng cảm ơn anh, đường lên có dễ đi không ạ?', 'text', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4001, 2, 'Đường nhựa ô tô 16 chỗ vào tận sân nhé bạn ơi, bạn cứ đi theo định vị trên app là chuẩn xác 100%.', 'text', DATE_SUB(NOW(), INTERVAL 20 HOUR)),
(4001, 4, 'Dạ mình đã nhận phòng rồi, phòng đẹp và view đồi thông xuất sắc lắm ạ!', 'text', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(4001, 2, 'Cảm ơn bạn! Chúc bạn và người thân có kỳ nghỉ thật tuyệt vời nha!', 'text', DATE_SUB(NOW(), INTERVAL 4 HOUR));

-- 12. TẠO 1 BẢN GHI KHIẾU NẠI (DISPUTES) ĐỂ DEMO PHÂN HỆ TRUST & SAFETY
INSERT INTO `disputes` (`id`, `reporter_id`, `reporter_role`, `target_type`, `target_id`, `booking_id`, `category`, `reason`, `description`, `evidence_url`, `status`, `admin_note`, `resolution_action`, `resolved_by`, `created_at`, `resolved_at`) VALUES
(401, 4, 'guest', 'booking', 4101, 4101, 'facility', 'Máy nước nóng phòng tắm bị rò nước', 'Trong đêm đầu tiên ở homestay, bình nước nóng phòng tắm số 2 bị rò rỉ nước nhỏ giọt. Chủ nhà đã khắc phục vào sáng hôm sau.', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', 'resolved', 'Admin đã tiếp nhận, chủ nhà đã hỗ trợ kịp thời và tặng bữa sáng miễn phí cho khách. Khách đồng ý đóng khiếu nại.', 'none', 1, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY));

-- BẬT LẠI KIỂM TRA KHÓA NGOẠI
SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- HOÀN TẤT NẠP DỮ LIỆU DEMO BẢO VỆ ĐỒ ÁN!
-- ==============================================================================
