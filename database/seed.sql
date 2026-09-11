-- =====================================================
-- HOMESTAY BOOKING COMPREHENSIVE SEED DATA
-- Database: homestay_db
-- Target: MariaDB / MySQL 8.0+
-- Coverage: 15 Tables, Rich Dataset for Full Testing
-- =====================================================

USE `homestay_db`;

-- Disable Foreign Key checks temporarily for clean seed execution
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `point_transactions`;
TRUNCATE TABLE `user_devices`;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `reviews`;
TRUNCATE TABLE `favorites`;
TRUNCATE TABLE `payments`;
TRUNCATE TABLE `bookings`;
TRUNCATE TABLE `promotions`;
TRUNCATE TABLE `homestay_amenities`;
TRUNCATE TABLE `homestay_images`;
TRUNCATE TABLE `homestays`;
TRUNCATE TABLE `amenities`;
TRUNCATE TABLE `homestay_types`;
TRUNCATE TABLE `locations`;
TRUNCATE TABLE `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. SEED USERS (Admin, Staff, Customers)
-- Password mặc định: "password123" (hoặc hash bcrypt)
-- =====================================================
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `address`, `birth_date`, `avatar_url`, `reward_points`, `is_active`) VALUES
(1, 'Phạm Xuân Chuẩn', 'phamchuan2608@gmail.com', '$2a$10$w8T9J5jR1234567890abcdefghijklmnopqrstuvwxyz123456', 'customer', '0901234567', 'Cầu Giấy, Hà Nội', '2000-01-01', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80', 450, 1),
(2, 'Admin Quản Trị Hệ Thống', 'admin@homestay.com', '$2a$10$w8T9J5jR1234567890abcdefghijklmnopqrstuvwxyz123456', 'admin', '0988888888', 'Hoàn Kiếm, Hà Nội', '1995-05-15', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80', 1000, 1),
(3, 'Nguyễn Thu Trang (Quản lý CSKH)', 'staff.trang@homestay.com', '$2a$10$w8T9J5jR1234567890abcdefghijklmnopqrstuvwxyz123456', 'staff', '0977112233', 'Hải Châu, Đà Nẵng', '1998-08-20', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 200, 1),
(4, 'Trần Minh Đức', 'duc.tran@gmail.com', '$2a$10$w8T9J5jR1234567890abcdefghijklmnopqrstuvwxyz123456', 'customer', '0912345678', 'Quận 1, TP. Hồ Chí Minh', '1996-10-12', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 600, 1),
(5, 'Lê Hoàng Yến', 'yen.le@gmail.com', '$2a$10$w8T9J5jR1234567890abcdefghijklmnopqrstuvwxyz123456', 'customer', '0933445566', 'Ngo Quyen, Hải Phòng', '1999-03-25', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80', 150, 1),
(6, 'Đặng Hoàng Nam', 'nam.dang@gmail.com', '$2a$10$w8T9J5jR1234567890abcdefghijklmnopqrstuvwxyz123456', 'customer', '0944556677', 'Thanh Khê, Đà Nẵng', '1997-12-05', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 80, 1);

-- =====================================================
-- 2. SEED LOCATIONS (6 Điểm đến du lịch nổi tiếng)
-- =====================================================
INSERT INTO `locations` (`id`, `name`, `description`, `icon`, `image_url`, `homestay_count`, `is_active`, `sort_order`) VALUES
(1, 'Đà Lạt', 'Thành phố ngàn hoa và sương mây lãng mạn', 'leaf-outline', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80', 0, 1, 1),
(2, 'Sa Pa', 'Ruộng bậc thang & núi non Tây Bắc hùng vĩ', 'compass-outline', 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80', 0, 1, 2),
(3, 'Phú Quốc', 'Đảo ngọc biển xanh cát trắng nắng vàng', 'water-outline', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80', 0, 1, 3),
(4, 'Hội An', 'Phố cổ đèn lồng lung linh bên bờ sông Hoài', 'home-outline', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80', 0, 1, 4),
(5, 'Nha Trang', 'Thành phố vịnh biển xanh tươi mát miền Trung', 'water-outline', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80', 0, 1, 5),
(6, 'Ninh Bình', 'Vùng đất di sản Tràng An - Tam Cốc non nước hữu tình', 'map-outline', 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80', 0, 1, 6);

-- =====================================================
-- 3. SEED HOMESTAY TYPES (5 Loại hình chỗ nghỉ)
-- =====================================================
INSERT INTO `homestay_types` (`id`, `name`, `description`, `icon`, `is_active`, `sort_order`) VALUES
(1, 'Villa', 'Biệt thự riêng tư cao cấp với hồ bơi và khuôn viên rộng', 'business-outline', 1, 1),
(2, 'Homestay', 'Nhà nghỉ ấm cúng mang phong cách bản địa thân thiện', 'home-outline', 1, 2),
(3, 'Resort', 'Khu nghỉ dưỡng tiện nghi đẳng cấp với dịch vụ chăm sóc toàn diện', 'bed-outline', 1, 3),
(4, 'Cabin', 'Nhà gỗ mộc mạc giữa rừng thông hoặc sườn đồi thơ mộng', 'bonfire-outline', 1, 4),
(5, 'Eco Homestay', 'Mô hình nghỉ dưỡng sinh thái xanh, gần gũi thiên nhiên', 'leaf-outline', 1, 5);

-- =====================================================
-- 4. SEED AMENITIES (Danh mục tiện nghi)
-- =====================================================
INSERT INTO `amenities` (`id`, `name`, `icon`, `category`, `is_active`) VALUES
(1, 'Hồ bơi riêng', 'water-outline', 'Outdoor', 1),
(2, 'Khu nướng BBQ', 'flame-outline', 'Outdoor', 1),
(3, 'View núi / thung lũng', 'image-outline', 'View', 1),
(4, 'View biển trực diện', 'sunny-outline', 'View', 1),
(5, 'Bếp đầy đủ dụng cụ', 'restaurant-outline', 'Living', 1),
(6, 'WiFi tốc độ cao', 'wifi-outline', 'Tech', 1),
(7, 'Điều hòa 2 chiều', 'snow-outline', 'Living', 1),
(8, 'Bãi đỗ xe ô tô miễn phí', 'car-outline', 'Facility', 1),
(9, 'Máy giặt & sấy', 'shirt-outline', 'Living', 1),
(10, 'Xe đạp miễn phí', 'bicycle-outline', 'Facility', 1),
(11, 'Bình nóng lạnh', 'thermometer-outline', 'Living', 1),
(12, 'Dịch vụ Spa & Massage', 'flower-outline', 'Service', 1),
(13, 'Lò sưởi ấm cúng', 'bonfire-outline', 'Living', 1),
(14, 'Sân vườn thư giãn', 'leaf-outline', 'Outdoor', 1);

-- =====================================================
-- 5. SEED HOMESTAYS (10 Chỗ nghỉ đa dạng)
-- =====================================================
INSERT INTO `homestays` (`id`, `name`, `description`, `price`, `old_price`, `location_id`, `type_id`, `rating`, `review_count`, `max_guests`, `bedrooms`, `bathrooms`, `is_new`, `is_featured`, `is_active`) VALUES
(1, 'Villa Lavender Dream', 'Villa Lavender Dream tọa lạc giữa đồi hoa lavender thơ mộng tại Đà Lạt. Sở hữu hồ bơi nước ấm riêng, sân BBQ ngoài trời cực chill, không gian sang trọng rất thích hợp cho gia đình hoặc nhóm bạn nghỉ dưỡng cuối tuần.', 2500000.00, 3200000.00, 1, 1, 4.90, 156, 8, 4, 3, 0, 1, 1),
(2, 'Homestay Cloud Nine', 'Cloud Nine mang lại trải nghiệm "săn mây tại giường" mỗi sáng sớm. Nội thất gỗ thông tự nhiên ấm cúng, ban công panorama nhìn thẳng ra thung lũng sương mù Đà Lạt.', 1800000.00, NULL, 1, 2, 4.80, 203, 6, 3, 2, 0, 1, 1),
(3, 'Seaside Bliss Luxury Villa', 'Biệt thự biển sang trọng tại Bãi Khem, Phú Quốc. Chỉ vài bước chân là chạm tới làn nước trong xanh, có hồ bơi tràn bờ vô cực, phòng ngủ view hoàng hôn lãng mạn.', 3500000.00, 4200000.00, 3, 1, 4.95, 89, 10, 5, 4, 1, 1, 1),
(4, 'Rice Terrace Mountain Homestay', 'Nằm trọn trong lòng thung lũng Mường Hoa, Sa Pa. Ngắm nhìn trọn vẹn ruộng bậc thang vàng óng mùa lúa chín, thưởng thức ẩm thực bản địa người H’Mông độc đáo.', 1200000.00, NULL, 2, 2, 4.75, 134, 4, 2, 1, 1, 0, 1),
(5, 'Ancient Town Riverside Homestay', 'Nằm yên bình bên dòng sông Thu Bồn, cách Chùa Cầu Hội An chỉ 5 phút tản bộ. Không gian rợp bóng đèn lồng, cung cấp xe đạp miễn phí dạo quanh phố cổ.', 2100000.00, NULL, 4, 2, 4.85, 178, 6, 3, 2, 0, 1, 1),
(6, 'Ocean View Nha Trang Resort', 'Khu nghỉ dưỡng cao cấp trên sườn đồi vịnh Nha Trang. Tận hưởng view biển 180 độ, bãi tắm riêng, hồ bơi và quầy bar hoàng hôn đẳng cấp.', 2800000.00, 3500000.00, 5, 3, 4.65, 92, 4, 2, 2, 1, 0, 1),
(7, 'Pine Hill Rustic Cabin', 'Ngôi nhà gỗ mộc giấu mình trong rừng thông nguyên sinh Đà Lạt. Buổi tối đốt lò sưởi ấm áp, nướng khoai và thưởng thức tách trà atiso nóng bên người thương.', 950000.00, NULL, 1, 4, 4.55, 67, 4, 2, 1, 0, 0, 1),
(8, 'Bamboo Eco Green House', 'Homestay sinh thái xây dựng 100% từ tre và vật liệu bền vững tại Hội An. Tham gia lớp học nấu ăn truyền thống, làm gốm và tập yoga đón bình minh.', 1500000.00, NULL, 4, 5, 4.70, 112, 5, 2, 2, 0, 0, 1),
(9, 'Tràng An Valley Lotus Retreat', 'Ẩn mình giữa núi đá vôi hùng vĩ và đầm sen ngát hương Ninh Bình. Chèo thuyền kayak miễn phí, trải nghiệm không gian thanh bình tuyệt đối.', 1650000.00, 2000000.00, 6, 5, 4.90, 84, 4, 2, 1, 1, 1, 1),
(10, 'Sunset Cliff Villa Nha Trang', 'Biệt thự vách đá nhìn thẳng ra biển xanh Nha Trang. Trang bị phòng xông hơi, bàn bida, rạp chiếu phim mini cho chuyến đi đáng nhớ.', 4200000.00, 5000000.00, 5, 1, 4.90, 45, 12, 6, 5, 0, 1, 1);

-- =====================================================
-- 6. SEED HOMESTAY IMAGES (Thư viện hình ảnh sắc nét)
-- =====================================================
INSERT INTO `homestay_images` (`homestay_id`, `image_url`, `is_primary`, `sort_order`) VALUES
(1, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80', 1, 1),
(1, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80', 0, 2),
(1, 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=900&q=80', 0, 3),

(2, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80', 1, 1),
(2, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80', 0, 2),
(2, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80', 0, 3),

(3, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80', 1, 1),
(3, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80', 0, 2),
(3, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80', 0, 3),

(4, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80', 1, 1),
(4, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80', 0, 2),

(5, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80', 1, 1),
(5, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80', 0, 2),

(6, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=80', 1, 1),
(6, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80', 0, 2),

(7, 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80', 1, 1),
(7, 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=80', 0, 2),

(8, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80', 1, 1),
(9, 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80', 1, 1),
(10, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80', 1, 1);

-- =====================================================
-- 7. SEED HOMESTAY AMENITIES (Liên kết tiện nghi)
-- =====================================================
INSERT INTO `homestay_amenities` (`homestay_id`, `amenity_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 5), (1, 6), (1, 7), (1, 8), (1, 14),
(2, 2), (2, 3), (2, 5), (2, 6), (2, 9), (2, 11),
(3, 1), (3, 2), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 12),
(4, 3), (4, 5), (4, 6), (4, 10), (4, 11),
(5, 5), (5, 6), (5, 7), (5, 9), (5, 10), (5, 14),
(6, 1), (6, 4), (6, 6), (6, 7), (6, 8), (6, 12),
(7, 2), (7, 3), (7, 6), (7, 11), (7, 13), (7, 14),
(8, 5), (8, 6), (8, 10), (8, 14),
(9, 2), (9, 3), (9, 6), (9, 8), (9, 10), (9, 14),
(10, 1), (10, 2), (10, 4), (10, 5), (10, 6), (10, 7), (10, 8), (10, 12);

-- Update homestay_count in locations manually for initial seed
UPDATE `locations` SET `homestay_count` = 3 WHERE `id` = 1; -- Đà Lạt
UPDATE `locations` SET `homestay_count` = 1 WHERE `id` = 2; -- Sa Pa
UPDATE `locations` SET `homestay_count` = 1 WHERE `id` = 3; -- Phú Quốc
UPDATE `locations` SET `homestay_count` = 2 WHERE `id` = 4; -- Hội An
UPDATE `locations` SET `homestay_count` = 2 WHERE `id` = 5; -- Nha Trang
UPDATE `locations` SET `homestay_count` = 1 WHERE `id` = 6; -- Ninh Bình

-- =====================================================
-- 8. SEED PROMOTIONS (Mã giảm giá & Voucher)
-- =====================================================
INSERT INTO `promotions` (`id`, `code`, `title`, `description`, `discount_type`, `discount_value`, `max_discount_amount`, `min_booking_amount`, `required_points`, `start_date`, `end_date`, `usage_limit`, `used_count`, `is_active`) VALUES
(1, 'WELCOME10', 'Ưu đãi chào mừng bạn mới', 'Giảm 10% tối đa 300.000₫ cho tất cả homestay', 'percent', 10.00, 300000.00, 0.00, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1000, 35, 1),
(2, 'HELLOHOLIDAY', 'Voucher Lễ Hội 2026', 'Giảm trực tiếp 200.000₫ cho đơn đặt phòng từ 1.500.000₫', 'fixed', 200000.00, NULL, 1500000.00, 0, '2026-06-01 00:00:00', '2026-12-31 23:59:59', 500, 48, 1),
(3, 'WEEKEND15', 'Ưu đãi đặt phòng cuối tuần', 'Giảm 15% tối đa 400.000₫ cho chuyến đi từ 2 đêm', 'percent', 15.00, 400000.00, 2000000.00, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 300, 21, 1),
(4, 'POINT100K', 'Voucher Đổi Thưởng 100.000 ₫', 'Quy đổi bằng 200 điểm thưởng tích lũy', 'fixed', 100000.00, NULL, 0.00, 200, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 9999, 12, 1),
(5, 'POINT250K', 'Voucher Đổi Thưởng 250.000 ₫', 'Quy đổi bằng 450 điểm thưởng tích lũy', 'fixed', 250000.00, NULL, 1200000.00, 450, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 9999, 8, 1),
(6, 'POINT500K', 'Voucher VIP Đổi Thưởng 500.000 ₫', 'Quy đổi bằng 800 điểm thưởng tích lũy', 'fixed', 500000.00, NULL, 2500000.00, 800, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 9999, 3, 1);

-- =====================================================
-- 9. SEED BOOKINGS (Lịch sử đặt phòng đủ mọi trạng thái)
-- =====================================================
INSERT INTO `bookings` (`id`, `booking_code`, `user_id`, `homestay_id`, `check_in`, `check_out`, `guests`, `nights`, `price_per_night`, `promotion_id`, `discount_amount`, `total_price`, `status`, `notes`, `created_at`) VALUES
(1, 'BK2026071001', 1, 5, '2026-07-20', '2026-07-22', 3, 2, 2100000.00, 1, 300000.00, 3900000.00, 'completed', 'Khách yêu cầu phòng tầng cao view sông', '2026-07-10 09:30:00'),
(2, 'BK2026082002', 1, 1, '2026-09-15', '2026-09-17', 4, 2, 2500000.00, 2, 200000.00, 4800000.00, 'confirmed', 'Chuẩn bị thêm 1 set nướng BBQ', '2026-08-20 14:15:00'),
(3, 'BK2026082503', 1, 3, '2026-10-01', '2026-10-04', 6, 3, 3500000.00, 3, 400000.00, 10100000.00, 'pending', 'Cần xe đón từ sân bay Phú Quốc', '2026-08-25 18:45:00'),
(4, 'BK2026082804', 4, 6, '2026-09-02', '2026-09-04', 2, 2, 2800000.00, 2, 200000.00, 5400000.00, 'completed', 'Kỷ niệm ngày cưới, setup hoa hồng', '2026-08-28 11:20:00'),
(5, 'BK2026090105', 5, 2, '2026-09-10', '2026-09-12', 4, 2, 1800000.00, NULL, 0.00, 3600000.00, 'cancelled', 'Có việc bận đột xuất không đi được', '2026-09-01 16:10:00'),
(6, 'BK2026090506', 6, 9, '2026-09-20', '2026-09-22', 2, 2, 1650000.00, 1, 300000.00, 3000000.00, 'confirmed', 'Check in sớm khoảng 11h trưa', '2026-09-05 08:30:00');

UPDATE `bookings` SET `cancelled_at` = '2026-09-02 10:00:00', `cancelled_reason` = 'Khách hủy trước hạn 7 ngày' WHERE `id` = 5;

-- =====================================================
-- 10. SEED PAYMENTS (Đa dạng cổng thanh toán)
-- =====================================================
INSERT INTO `payments` (`id`, `booking_id`, `payment_method`, `transaction_code`, `amount`, `status`, `paid_at`, `created_at`) VALUES
(1, 1, 'vnpay', 'VNP20260710114592', 3900000.00, 'completed', '2026-07-10 09:35:00', '2026-07-10 09:30:00'),
(2, 2, 'momo', 'MOMO20260820849201', 4800000.00, 'completed', '2026-08-20 14:18:00', '2026-08-20 14:15:00'),
(3, 3, 'bank_transfer', 'MBBANK_FT262381920', 10100000.00, 'pending', NULL, '2026-08-25 18:45:00'),
(4, 4, 'vnpay', 'VNP20260828994812', 5400000.00, 'completed', '2026-08-28 11:22:00', '2026-08-28 11:20:00'),
(5, 5, 'momo', 'MOMO20260901334910', 3600000.00, 'refunded', '2026-09-01 16:15:00', '2026-09-01 16:10:00'),
(6, 6, 'cash', NULL, 3000000.00, 'pending', NULL, '2026-09-05 08:30:00');

-- =====================================================
-- 11. SEED FAVORITES (Wishlist của người dùng)
-- =====================================================
INSERT INTO `favorites` (`user_id`, `homestay_id`, `created_at`) VALUES
(1, 1, '2026-08-15 10:20:00'),
(1, 3, '2026-08-18 14:40:00'),
(1, 9, '2026-09-02 09:15:00'),
(4, 10, '2026-08-30 20:10:00'),
(5, 7, '2026-09-01 15:00:00');

-- =====================================================
-- 12. SEED REVIEWS (Đánh giá thật sau chuyến đi)
-- =====================================================
INSERT INTO `reviews` (`id`, `user_id`, `homestay_id`, `booking_id`, `rating`, `comment`, `is_verified`, `is_active`, `created_at`) VALUES
(1, 1, 5, 1, 5, 'Homestay tuyệt đẹp, chủ nhà nhiệt tình hướng dẫn đường đi và chỗ ăn ngon ở Hội An. Nhất định sẽ quay lại!', 1, 1, '2026-07-23 10:00:00'),
(2, 4, 6, 4, 5, 'View biển Nha Trang cực đỉnh, phòng sạch sẽ và thơm tho. Dịch vụ spa rất thư giãn.', 1, 1, '2026-09-05 14:30:00'),
(3, 5, 1, NULL, 5, 'Hồ bơi nước ấm bơi tối rất thích, không gian thoáng đãng đầy hoa.', 1, 1, '2026-08-10 16:20:00'),
(4, 6, 2, NULL, 4, 'Săn mây ngay ban công cực chill, buổi sáng hơi se lạnh nhưng có máy sưởi đầy đủ.', 1, 1, '2026-08-18 09:40:00');

-- =====================================================
-- 13. SEED NOTIFICATIONS (Thông báo cho khách hàng)
-- =====================================================
INSERT INTO `notifications` (`id`, `user_id`, `title`, `content`, `type`, `reference_id`, `is_read`, `created_at`) VALUES
(1, 1, 'Chào mừng thành viên mới! 🎉', 'Bạn đã nhận được 150 điểm thưởng và voucher WELCOME10 giảm 10% khi đăng ký tài khoản.', 'system', NULL, 1, '2026-07-01 08:00:00'),
(2, 1, 'Đặt phòng thành công (BK2026071001)', 'Đơn đặt phòng Ancient Town Riverside đã được xác nhận. Chúc bạn có kỳ nghỉ vui vẻ!', 'booking_status', 1, 1, '2026-07-10 09:35:00'),
(3, 1, 'Thưởng +150 điểm đánh giá ⭐', 'Cảm ơn bạn đã đánh giá chuyến đi Hội An. Điểm thưởng đã được cộng vào ví của bạn!', 'points', 1, 1, '2026-07-23 10:05:00'),
(4, 1, 'Nhắc nhở nhận phòng sắp tới 🏡', 'Đơn đặt phòng Villa Lavender Dream (BK2026082002) sẽ nhận phòng vào ngày 15/09/2026.', 'booking_status', 2, 0, '2026-09-10 08:00:00'),
(5, 1, 'Ưu đãi Lễ Hội 2026 mới phát hành 🎟️', 'Nhận ngay Voucher HELLOHOLIDAY giảm 200.000₫ cho tất cả homestay trên toàn quốc!', 'promotion', 2, 0, '2026-09-01 09:00:00');

-- =====================================================
-- 14. SEED USER DEVICES (FCM Push Tokens)
-- =====================================================
INSERT INTO `user_devices` (`id`, `user_id`, `device_token`, `device_type`, `is_active`) VALUES
(1, 1, 'fcm_token_iphone15_pro_max_phamchuan_2026_xyz', 'ios', 1),
(2, 4, 'fcm_token_samsung_galaxy_s24_ultra_duc_2026_abc', 'android', 1),
(3, 5, 'fcm_token_pixel_8_pro_yen_2026_uvw', 'android', 1);

-- =====================================================
-- 15. SEED POINT TRANSACTIONS (Lịch sử điểm thưởng)
-- =====================================================
INSERT INTO `point_transactions` (`id`, `user_id`, `title`, `points`, `type`, `reference_id`, `created_at`) VALUES
(1, 1, 'Thưởng thành viên mới', 150, 'earn', NULL, '2026-07-01 08:00:00'),
(2, 1, 'Thưởng hoàn thành chuyến đi Hội An (BK2026071001)', 100, 'earn', 1, '2026-07-22 12:00:00'),
(3, 1, 'Đánh giá 5 sao chỗ nghỉ', 50, 'earn', 1, '2026-07-23 10:00:00'),
(4, 1, 'Thưởng đặt phòng Đà Lạt (BK2026082002)', 100, 'earn', 2, '2026-08-20 14:15:00'),
(5, 1, 'Thưởng đặt phòng Phú Quốc (BK2026082503)', 100, 'earn', 3, '2026-08-25 18:45:00'),
(6, 1, 'Đổi điểm nhận Voucher POINT100K', -150, 'redeem', 4, '2026-08-26 10:00:00');
