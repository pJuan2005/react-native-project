-- =====================================================
-- HOMESTAY & PROPERTY COMPREHENSIVE SEED DATA
-- Database: homestay_db
-- Target: MariaDB / MySQL 8.0+
-- Coverage: Single Source of Truth `properties` + Core Child Tables
-- =====================================================

USE `homestay_db`;

-- Disable Foreign Key checks temporarily for clean seed execution
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM `booking_messages`;
DELETE FROM `booking_conversations`;
DELETE FROM `withdrawals`;
DELETE FROM `bank_accounts`;
DELETE FROM `refunds`;
DELETE FROM `wallet_transactions`;
DELETE FROM `wallets`;
DELETE FROM `audit_logs`;
DELETE FROM `disputes`;
DELETE FROM `host_verifications`;
DELETE FROM `point_transactions`;
DELETE FROM `user_devices`;
DELETE FROM `notifications`;
DELETE FROM `reviews`;
DELETE FROM `favorites`;
DELETE FROM `payments`;
DELETE FROM `bookings`;
DELETE FROM `promotions`;
DELETE FROM `property_amenities`;
DELETE FROM `property_images`;
DELETE FROM `properties`;
DELETE FROM `amenities`;
DELETE FROM `homestay_types`;
DELETE FROM `locations`;
DELETE FROM `users`;

ALTER TABLE `booking_messages` AUTO_INCREMENT = 1;
ALTER TABLE `booking_conversations` AUTO_INCREMENT = 1;
ALTER TABLE `withdrawals` AUTO_INCREMENT = 1;
ALTER TABLE `bank_accounts` AUTO_INCREMENT = 1;
ALTER TABLE `refunds` AUTO_INCREMENT = 1;
ALTER TABLE `wallet_transactions` AUTO_INCREMENT = 1;
ALTER TABLE `wallets` AUTO_INCREMENT = 1;
ALTER TABLE `point_transactions` AUTO_INCREMENT = 1;
ALTER TABLE `user_devices` AUTO_INCREMENT = 1;
ALTER TABLE `notifications` AUTO_INCREMENT = 1;
ALTER TABLE `reviews` AUTO_INCREMENT = 1;
ALTER TABLE `favorites` AUTO_INCREMENT = 1;
ALTER TABLE `payments` AUTO_INCREMENT = 1;
ALTER TABLE `bookings` AUTO_INCREMENT = 1;
ALTER TABLE `promotions` AUTO_INCREMENT = 1;
ALTER TABLE `property_images` AUTO_INCREMENT = 1;
ALTER TABLE `properties` AUTO_INCREMENT = 1;
ALTER TABLE `amenities` AUTO_INCREMENT = 1;
ALTER TABLE `homestay_types` AUTO_INCREMENT = 1;
ALTER TABLE `locations` AUTO_INCREMENT = 1;
ALTER TABLE `users` AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. SEED USERS (Admin, Host, Staff, Customers)
-- Password mặc định: "123456" ($2a$10$w8T9J5jR1234567890abcdefghijklmnopqrstuvwxyz123456 / bcrypt)
-- =====================================================
INSERT INTO `users` (`id`, `name`, `full_name`, `email`, `password`, `password_hash`, `role`, `status`, `phone`, `address`, `location`, `birth_date`, `avatar_url`, `reward_points`, `is_verified`, `is_active`) VALUES
(1, 'Admin User', 'Admin User', 'admin@mail.com', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', 'admin', 'active', '0988888888', 'Hoàn Kiếm, Hà Nội', 'Hà Nội', '1995-05-15', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80', 1000, 1, 1),
(2, 'Nguyen Van A (Host)', 'Nguyen Van A', 'host1@mail.com', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', 'host', 'active', '0900000002', 'Đà Lạt, Lâm Đồng', 'Đà Lạt', '1990-03-10', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80', 500, 1, 1),
(3, 'Tran Thi B (Host)', 'Tran Thi B', 'host2@mail.com', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', 'host', 'active', '0900000003', 'Phú Quốc, Kiên Giang', 'Phú Quốc', '1992-07-22', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 650, 1, 1),
(4, 'Phạm Xuân Chuẩn', 'Phạm Xuân Chuẩn', 'phamchuan2608@gmail.com', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', 'customer', 'active', '0901234567', 'Cầu Giấy, Hà Nội', 'Hà Nội', '2000-01-01', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80', 450, 1, 1),
(5, 'Trần Minh Đức', 'Trần Minh Đức', 'duc.tran@gmail.com', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', 'customer', 'active', '0912345678', 'Quận 1, TP. Hồ Chí Minh', 'TP. HCM', '1996-10-12', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 600, 1, 1),
(6, 'Lê Hoàng Yến', 'Lê Hoàng Yến', 'yen.le@gmail.com', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', 'customer', 'active', '0933445566', 'Ngô Quyền, Hải Phòng', 'Hải Phòng', '1999-03-25', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80', 150, 1, 1),
(7, 'Đặng Hoàng Nam', 'Đặng Hoàng Nam', 'nam.dang@gmail.com', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', 'customer', 'active', '0944556677', 'Thanh Khê, Đà Nẵng', 'Đà Nẵng', '1997-12-05', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 80, 1, 1),
(8, 'Hương Nguyễn', 'Hương Nguyễn', 'huong@gmail.com', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', '$2a$10$f6b9g95N187uCjR3849x4OmU8k9c81iM19qZ5u4Xo1EaF5o5P1eU2', 'customer', 'active', '0912888999', 'Hà Nội', 'Hà Nội', '1998-05-10', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 250, 1, 1);

-- =====================================================
-- 2. SEED LOCATIONS (6 Điểm đến du lịch nổi tiếng)
-- =====================================================
INSERT INTO `locations` (`id`, `name`, `description`, `icon`, `image_url`, `property_count`, `homestay_count`, `is_active`, `sort_order`) VALUES
(1, 'Đà Lạt', 'Thành phố ngàn hoa và sương mây lãng mạn', 'leaf-outline', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80', 3, 3, 1, 1),
(2, 'Sa Pa', 'Ruộng bậc thang & núi non Tây Bắc hùng vĩ', 'compass-outline', 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80', 1, 1, 1, 2),
(3, 'Phú Quốc', 'Đảo ngọc biển xanh cát trắng nắng vàng', 'water-outline', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80', 1, 1, 1, 3),
(4, 'Hội An', 'Phố cổ đèn lồng lung linh bên bờ sông Hoài', 'home-outline', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80', 2, 2, 1, 4),
(5, 'Nha Trang', 'Thành phố vịnh biển xanh tươi mát miền Trung', 'water-outline', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80', 2, 2, 1, 5),
(6, 'Ninh Bình', 'Vùng đất di sản Tràng An - Tam Cốc non nước hữu tình', 'map-outline', 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80', 1, 1, 1, 6);

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
-- 5. SEED PROPERTIES (10 Chỗ nghỉ chuẩn - Canonical Columns Only)
-- Không có title, property_type, price, featured, approval_status
-- =====================================================
INSERT INTO `properties` (
  `id`, `host_id`, `name`, `description`, `type_id`, `price_per_night`,
  `old_price`, `location_id`, `street_address`, `city`, `country`,
  `max_guests`, `bedrooms`, `bathrooms`, `rating`, `review_count`,
  `is_new`, `is_featured`, `is_active`, `is_deleted`, `status`,
  `cover_image`, `manage_token`
) VALUES
(1, 2, 'Villa Lavender Dream', 'Villa Lavender Dream tọa lạc giữa đồi hoa lavender thơ mộng tại Đà Lạt. Sở hữu hồ bơi nước ấm riêng, sân BBQ ngoài trời cực chill, không gian sang trọng rất thích hợp cho gia đình hoặc nhóm bạn nghỉ dưỡng cuối tuần.', 1, 2500000.00, 3200000.00, 1, 'Đường Mai Anh Đào, Phường 8', 'Đà Lạt', 'Vietnam', 8, 4, 3, 4.90, 156, 0, 1, 1, 0, 'approved', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80', 'HMTOKEN_0001'),
(2, 2, 'Homestay Cloud Nine', 'Cloud Nine mang lại trải nghiệm "săn mây tại giường" mỗi sáng sớm. Nội thất gỗ thông tự nhiên ấm cúng, ban công panorama nhìn thẳng ra thung lũng sương mù Đà Lạt.', 2, 1800000.00, NULL, 1, 'Đường Hùng Vương, Phường 11', 'Đà Lạt', 'Vietnam', 6, 3, 2, 4.80, 203, 0, 1, 1, 0, 'approved', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80', 'HMTOKEN_0002'),
(3, 3, 'Seaside Bliss Luxury Villa', 'Biệt thự biển sang trọng tại Bãi Khem, Phú Quốc. Chỉ vài bước chân là chạm tới làn nước trong xanh, có hồ bơi tràn bờ vô cực, phòng ngủ view hoàng hôn lãng mạn.', 1, 3500000.00, 4200000.00, 3, 'Bãi Khem, An Thới', 'Phú Quốc', 'Vietnam', 10, 5, 4, 4.95, 89, 1, 1, 1, 0, 'approved', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80', 'HMTOKEN_0003'),
(4, 2, 'Rice Terrace Mountain Homestay', 'Nằm trọn trong lòng thung lũng Mường Hoa, Sa Pa. Ngắm nhìn trọn vẹn ruộng bậc thang vàng óng mùa lúa chín, thưởng thức ẩm thực bản địa người H’Mông độc đáo.', 2, 1200000.00, NULL, 2, 'Bản Tả Van, Mường Hoa', 'Sa Pa', 'Vietnam', 4, 2, 1, 4.75, 134, 1, 0, 1, 0, 'approved', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80', 'HMTOKEN_0004'),
(5, 2, 'Ancient Town Riverside Homestay', 'Nằm yên bình bên dòng sông Thu Bồn, cách Chùa Cầu Hội An chỉ 5 phút tản bộ. Không gian rợp bóng đèn lồng, cung cấp xe đạp miễn phí dạo quanh phố cổ.', 2, 2100000.00, NULL, 4, 'Đường Nguyễn Tri Phương, Cẩm Nam', 'Hội An', 'Vietnam', 6, 3, 2, 4.85, 178, 0, 1, 1, 0, 'approved', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80', 'HMTOKEN_0005'),
(6, 3, 'Ocean View Nha Trang Resort', 'Khu nghỉ dưỡng cao cấp trên sườn đồi vịnh Nha Trang. Tận hưởng view biển 180 độ, bãi tắm riêng, hồ bơi và quầy bar hoàng hôn đẳng cấp.', 3, 2800000.00, 3500000.00, 5, 'Đường Phạm Văn Đồng, Vĩnh Hải', 'Nha Trang', 'Vietnam', 4, 2, 2, 4.65, 92, 1, 0, 1, 0, 'approved', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=80', 'HMTOKEN_0006'),
(7, 2, 'Pine Hill Rustic Cabin', 'Ngôi nhà gỗ mộc giấu mình trong rừng thông nguyên sinh Đà Lạt. Buổi tối đốt lò sưởi ấm áp, nướng khoai và thưởng thức tách trà atiso nóng bên người thương.', 4, 950000.00, NULL, 1, 'Đường Triệu Việt Vương, Phường 4', 'Đà Lạt', 'Vietnam', 4, 2, 1, 4.55, 67, 0, 0, 1, 0, 'approved', 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80', 'HMTOKEN_0007'),
(8, 2, 'Bamboo Eco Green House', 'Homestay sinh thái xây dựng 100% từ tre và vật liệu bền vững tại Hội An. Tham gia lớp học nấu ăn truyền thống, làm gốm và tập yoga đón bình minh.', 5, 1500000.00, NULL, 4, 'Làng rau Trà Quế, Cẩm Hà', 'Hội An', 'Vietnam', 5, 2, 2, 4.70, 112, 0, 0, 1, 0, 'approved', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80', 'HMTOKEN_0008'),
(9, 2, 'Tràng An Valley Lotus Retreat', 'Ẩn mình giữa núi đá vôi hùng vĩ và đầm sen ngát hương Ninh Bình. Chèo thuyền kayak miễn phí, trải nghiệm không gian thanh bình tuyệt đối.', 5, 1650000.00, 2000000.00, 6, 'Khu du lịch sinh thái Tràng An', 'Ninh Bình', 'Vietnam', 4, 2, 1, 4.90, 84, 1, 1, 1, 0, 'approved', 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80', 'HMTOKEN_0009'),
(10, 3, 'Sunset Cliff Villa Nha Trang', 'Biệt thự vách đá nhìn thẳng ra biển xanh Nha Trang. Trang bị phòng xông hơi, bàn bida, rạp chiếu phim mini cho chuyến đi đáng nhớ.', 1, 4200000.00, 5000000.00, 5, 'Khu biệt thự An Viên, Vĩnh Tường', 'Nha Trang', 'Vietnam', 12, 6, 5, 4.90, 45, 0, 1, 1, 0, 'approved', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80', 'HMTOKEN_0010');

-- =====================================================
-- 6. SEED PROPERTY IMAGES (6-8 hình ảnh sắc nét cho từng property)
-- =====================================================
INSERT INTO `property_images` (`property_id`, `image_url`, `is_primary`, `sort_order`) VALUES
-- Property 1: Villa Lavender Dream (7 ảnh)
(1, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80', 1, 1),
(1, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80', 0, 2),
(1, 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=900&q=80', 0, 3),
(1, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80', 0, 4),
(1, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80', 0, 5),
(1, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80', 0, 6),
(1, 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=80', 0, 7),

-- Property 2: Homestay Cloud Nine (7 ảnh)
(2, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80', 1, 1),
(2, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80', 0, 2),
(2, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80', 0, 3),
(2, 'https://images.unsplash.com/photo-1540518614846-7ede433c4b13?auto=format&fit=crop&w=900&q=80', 0, 4),
(2, 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=900&q=80', 0, 5),
(2, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80', 0, 6),
(2, 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=80', 0, 7),

-- Property 3: Seaside Bliss Luxury Villa (7 ảnh)
(3, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80', 1, 1),
(3, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80', 0, 2),
(3, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80', 0, 3),
(3, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80', 0, 4),
(3, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80', 0, 5),
(3, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80', 0, 6),
(3, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80', 0, 7),

-- Property 4: Rice Terrace Mountain Homestay (6 ảnh)
(4, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80', 1, 1),
(4, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80', 0, 2),
(4, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80', 0, 3),
(4, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80', 0, 4),
(4, 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80', 0, 5),
(4, 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=900&q=80', 0, 6),

-- Property 5: Ancient Town Riverside Homestay (6 ảnh)
(5, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80', 1, 1),
(5, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80', 0, 2),
(5, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80', 0, 3),
(5, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80', 0, 4),
(5, 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80', 0, 5),
(5, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80', 0, 6),

-- Property 6: Ocean View Nha Trang Resort (6 ảnh)
(6, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=80', 1, 1),
(6, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80', 0, 2),
(6, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80', 0, 3),
(6, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80', 0, 4),
(6, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80', 0, 5),
(6, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80', 0, 6),

-- Property 7: Pine Hill Rustic Cabin (6 ảnh)
(7, 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80', 1, 1),
(7, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80', 0, 2),
(7, 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=80', 0, 3),
(7, 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80', 0, 4),
(7, 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=900&q=80', 0, 5),
(7, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80', 0, 6),

-- Property 8: Bamboo Eco Green House (6 ảnh)
(8, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80', 1, 1),
(8, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80', 0, 2),
(8, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80', 0, 3),
(8, 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80', 0, 4),
(8, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80', 0, 5),
(8, 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=900&q=80', 0, 6),

-- Property 9: Tràng An Valley Lotus Retreat (6 ảnh)
(9, 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80', 1, 1),
(9, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80', 0, 2),
(9, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80', 0, 3),
(9, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80', 0, 4),
(9, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80', 0, 5),
(9, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80', 0, 6),

-- Property 10: Sunset Cliff Villa Nha Trang (7 ảnh)
(10, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80', 1, 1),
(10, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80', 0, 2),
(10, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=80', 0, 3),
(10, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80', 0, 4),
(10, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80', 0, 5),
(10, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80', 0, 6),
(10, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80', 0, 7);

-- =====================================================
-- 7. SEED PROPERTY AMENITIES (Liên kết tiện nghi)
-- =====================================================
INSERT INTO `property_amenities` (`property_id`, `amenity_id`) VALUES
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

-- =====================================================
-- 8. SEED PROMOTIONS (Mã giảm giá & Voucher)
-- =====================================================
INSERT INTO `promotions` (`id`, `code`, `title`, `description`, `discount_type`, `discount_value`, `max_discount_amount`, `min_booking_amount`, `required_points`, `start_date`, `end_date`, `usage_limit`, `used_count`, `is_active`) VALUES
(1, 'WELCOME10', 'Ưu đãi chào mừng bạn mới', 'Giảm 10% tối đa 300.000₫ cho tất cả chỗ nghỉ', 'percent', 10.00, 300000.00, 0.00, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1000, 35, 1),
(2, 'HELLOHOLIDAY', 'Voucher Lễ Hội 2026', 'Giảm trực tiếp 200.000₫ cho đơn đặt phòng từ 1.500.000₫', 'fixed', 200000.00, NULL, 1500000.00, 0, '2026-06-01 00:00:00', '2026-12-31 23:59:59', 500, 48, 1),
(3, 'WEEKEND15', 'Ưu đãi đặt phòng cuối tuần', 'Giảm 15% tối đa 400.000₫ cho chuyến đi từ 2 đêm', 'percent', 15.00, 400000.00, 2000000.00, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 300, 21, 1),
(4, 'POINT100K', 'Voucher Đổi Thưởng 100.000 ₫', 'Quy đổi bằng 200 điểm thưởng tích lũy', 'fixed', 100000.00, NULL, 0.00, 200, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 9999, 12, 1),
(5, 'POINT250K', 'Voucher Đổi Thưởng 250.000 ₫', 'Quy đổi bằng 450 điểm thưởng tích lũy', 'fixed', 250000.00, NULL, 1200000.00, 450, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 9999, 8, 1),
(6, 'POINT500K', 'Voucher VIP Đổi Thưởng 500.000 ₫', 'Quy đổi bằng 800 điểm thưởng tích lũy', 'fixed', 500000.00, NULL, 2500000.00, 800, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 9999, 3, 1);

-- =====================================================
-- 9. SEED BOOKINGS (Lịch sử đặt phòng tham chiếu `property_id`)
-- =====================================================
INSERT INTO `bookings` (
  `id`, `booking_code`, `user_id`, `guest_id`, `property_id`,
  `check_in`, `check_out`, `guests`, `nights`, `price_per_night`,
  `promotion_id`, `discount_amount`, `total_price`, `commission_rate`,
  `commission_amount`, `host_payout_amount`, `status`, `source`,
  `payment_method`, `payment_status`, `notes`, `created_at`
) VALUES
(1, 'BK2026071001', 4, 4, 5, '2026-07-20', '2026-07-22', 3, 2, 2100000.00, 1, 300000.00, 3900000.00, 10.00, 390000.00, 3510000.00, 'completed', 'guest_online', 'bank_transfer', 'verified', 'Khách yêu cầu phòng tầng cao view sông', '2026-07-10 09:30:00'),
(2, 'BK2026082002', 4, 4, 1, '2026-09-15', '2026-09-17', 4, 2, 2500000.00, 2, 200000.00, 4800000.00, 10.00, 480000.00, 4320000.00, 'confirmed', 'guest_online', 'bank_transfer', 'verified', 'Chuẩn bị thêm 1 set nướng BBQ', '2026-08-20 14:15:00'),
(3, 'BK2026082503', 4, 4, 3, '2026-10-01', '2026-10-04', 6, 3, 3500000.00, 3, 400000.00, 10100000.00, 10.00, 1010000.00, 9090000.00, 'pending', 'guest_online', 'bank_transfer', 'proof_uploaded', 'Cần xe đón từ sân bay Phú Quốc', '2026-08-25 18:45:00'),
(4, 'BK2026082804', 5, 5, 6, '2026-09-02', '2026-09-04', 2, 2, 2800000.00, 2, 200000.00, 5400000.00, 10.00, 540000.00, 4860000.00, 'completed', 'guest_online', 'bank_transfer', 'verified', 'Kỷ niệm ngày cưới, setup hoa hồng', '2026-08-28 11:20:00'),
(5, 'BK2026090105', 6, 6, 2, '2026-09-10', '2026-09-12', 4, 2, 1800000.00, NULL, 0.00, 3600000.00, 10.00, 360000.00, 3240000.00, 'cancelled', 'guest_online', 'bank_transfer', 'rejected', 'Có việc bận đột xuất không đi được', '2026-09-01 16:10:00'),
(6, 'BK2026090506', 7, 7, 9, '2026-09-20', '2026-09-22', 2, 2, 1650000.00, 1, 300000.00, 3000000.00, 10.00, 300000.00, 2700000.00, 'confirmed', 'guest_online', 'bank_transfer', 'verified', 'Check in sớm khoảng 11h trưa', '2026-09-05 08:30:00');

UPDATE `bookings` SET `cancelled_at` = '2026-09-02 10:00:00', `cancelled_reason` = 'Khách hủy trước hạn 7 ngày' WHERE `id` = 5;

-- =====================================================
-- 10. SEED PAYMENTS (Đa dạng cổng thanh toán)
-- =====================================================
INSERT INTO `payments` (`id`, `booking_id`, `payment_method`, `transaction_code`, `proof_image_url`, `amount`, `status`, `paid_at`, `created_at`) VALUES
(1, 1, 'bank_transfer', 'FT260710001', '/uploads/proofs/sample_proof_1.jpg', 3900000.00, 'completed', '2026-07-10 10:00:00', '2026-07-10 09:30:00'),
(2, 2, 'bank_transfer', 'FT260820002', '/uploads/proofs/sample_proof_2.jpg', 4800000.00, 'completed', '2026-08-20 14:30:00', '2026-08-20 14:15:00'),
(3, 3, 'bank_transfer', 'FT260825003', '/uploads/proofs/sample_proof_3.jpg', 10100000.00, 'pending', NULL, '2026-08-25 18:45:00'),
(4, 4, 'bank_transfer', 'FT260828004', '/uploads/proofs/sample_proof_4.jpg', 5400000.00, 'completed', '2026-08-28 11:45:00', '2026-08-28 11:20:00'),
(5, 5, 'bank_transfer', 'FT260901005', NULL, 3600000.00, 'refunded', NULL, '2026-09-01 16:10:00'),
(6, 6, 'bank_transfer', 'FT260905006', '/uploads/proofs/sample_proof_6.jpg', 3000000.00, 'completed', '2026-09-05 09:00:00', '2026-09-05 08:30:00');

-- =====================================================
-- 11. SEED FAVORITES (Wishlist của khách hàng)
-- =====================================================
INSERT INTO `favorites` (`id`, `user_id`, `property_id`, `created_at`) VALUES
(1, 4, 1, '2026-07-01 08:00:00'),
(2, 4, 3, '2026-07-02 09:15:00'),
(3, 4, 5, '2026-07-05 14:30:00'),
(4, 5, 2, '2026-07-10 11:00:00'),
(5, 5, 6, '2026-07-12 16:20:00'),
(6, 6, 9, '2026-07-15 10:45:00'),
(7, 7, 10, '2026-07-18 19:10:00');

-- =====================================================
-- 12. SEED REVIEWS (Đánh giá thực tế cho các property)
-- =====================================================
INSERT INTO `reviews` (`id`, `user_id`, `guest_id`, `property_id`, `booking_id`, `rating`, `comment`, `is_verified`, `is_active`, `created_at`) VALUES
(1, 4, 4, 5, 1, 5, 'Homestay nằm cạnh bờ sông cực kỳ lãng mạn. Phố cổ Hội An về đêm đẹp mê hồn. Chủ nhà chu đáo tặng cả trái cây tươi!', 1, 1, '2026-07-23 10:00:00'),
(2, 5, 5, 6, 4, 5, 'Resort chuẩn 5 sao view biển Nha Trang tuyệt đỉnh! Hồ bơi vô cực ngắm hoàng hôn siêu đẹp. Nhất định sẽ quay lại.', 1, 1, '2026-09-05 15:30:00'),
(3, 4, 4, 1, 2, 5, 'Villa Lavender Dream quá đẹp và sang trọng. Nước hồ bơi ấm áp, trẻ con bơi không sợ lạnh. Nướng BBQ ngoài đồi hoa rất chill.', 1, 1, '2026-09-18 09:20:00'),
(4, 6, 6, 2, NULL, 5, 'Sáng sớm mở cửa sổ ra là mây tràn vào phòng. Không khí trong lành, decor gỗ thông rất thơm và ấm cúng.', 1, 1, '2026-08-10 14:00:00'),
(5, 7, 7, 3, NULL, 5, 'Bãi Khem cát trắng như kem, nước biển trong vắt. Biệt thự đẹp từng centimet, dịch vụ phục vụ chu đáo tận tình.', 1, 1, '2026-08-15 17:40:00'),
(6, 5, 5, 9, NULL, 5, 'Ninh Bình non nước hữu tình. Ngồi uống trà sen ngắm núi đá vôi thật sự chữa lành tâm hồn!', 1, 1, '2026-08-20 08:30:00');

-- =====================================================
-- 13. SEED NOTIFICATIONS (Thông báo mẫu)
-- =====================================================
INSERT INTO `notifications` (`id`, `user_id`, `title`, `content`, `type`, `reference_id`, `is_read`, `created_at`) VALUES
(1, 4, 'Chào mừng bạn mới! 🌿', 'Chào mừng Phạm Xuân Chuẩn gia nhập nền tảng Homestay. Nhận ngay voucher WELCOME10 giảm 10% cho chuyến đi đầu tiên.', 'promotion', 1, 1, '2026-07-01 00:00:00'),
(2, 4, 'Đặt phòng thành công! 🎉', 'Đơn đặt phòng BK2026071001 tại Ancient Town Riverside Homestay đã hoàn tất.', 'booking_status', 1, 1, '2026-07-10 10:00:00'),
(3, 4, 'Tích lũy điểm thưởng 💎', 'Bạn nhận được +390 điểm thưởng thành viên từ chuyến đi Hội An.', 'points', 1, 1, '2026-07-23 10:00:00'),
(4, 4, 'Xác nhận đơn phòng ⏳', 'Đơn đặt phòng BK2026082002 tại Villa Lavender Dream đã được xác nhận.', 'booking_status', 2, 0, '2026-08-20 14:30:00');

-- =====================================================
-- 14. SEED POINT TRANSACTIONS (Lịch sử tích/đổi điểm)
-- =====================================================
INSERT INTO `point_transactions` (`id`, `user_id`, `title`, `points`, `type`, `reference_id`, `created_at`) VALUES
(1, 4, 'Thưởng thành viên đăng ký mới', 100, 'earn', NULL, '2026-07-01 00:00:00'),
(2, 4, 'Tích lũy điểm đơn BK2026071001', 390, 'earn', 1, '2026-07-10 10:00:00'),
(3, 4, 'Thưởng đánh giá 5★ chỗ nghỉ Hội An', 50, 'earn', 1, '2026-07-23 10:00:00'),
(4, 4, 'Đổi Voucher POINT100K giảm 100.000₫', -200, 'redeem', 4, '2026-08-01 15:00:00'),
(5, 4, 'Tích lũy điểm đơn BK2026082002', 480, 'earn', 2, '2026-08-20 14:30:00'),
(6, 4, 'Đổi Voucher POINT250K giảm 250.000₫', -450, 'redeem', 5, '2026-08-25 18:00:00');

-- =====================================================
-- 15. SEED HOST VERIFICATIONS & DISPUTES
-- =====================================================
INSERT INTO `host_verifications` (`host_id`, `id_card_number`, `id_card_front_url`, `id_card_back_url`, `business_license_url`, `status`, `created_at`) VALUES
(2, '001090012345', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=80', 'approved', NOW()),
(3, '001092054321', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=80', 'approved', NOW());

INSERT INTO `audit_logs` (`actor_id`, `actor_role`, `action`, `entity_type`, `entity_id`, `metadata`, `ip_address`, `created_at`) VALUES
(1, 'admin', 'system_init', 'platform', 1, 'Khởi tạo hệ thống hợp nhất Single Source of Truth Properties', '127.0.0.1', NOW());

-- =====================================================
-- 16. SEED WALLETS & TRANSACTIONS
-- =====================================================
INSERT INTO `wallets` (`id`, `user_id`, `balance`, `currency`, `status`, `created_at`) VALUES
(1, 1, 0.00, 'VND', 'active', NOW()),
(2, 2, 5700000.00, 'VND', 'active', NOW()),
(3, 3, 4860000.00, 'VND', 'active', NOW()),
(4, 4, 1400000.00, 'VND', 'active', NOW()),
(5, 5, 0.00, 'VND', 'active', NOW()),
(6, 6, 0.00, 'VND', 'active', NOW()),
(7, 7, 0.00, 'VND', 'active', NOW()),
(8, 8, 2100000.00, 'VND', 'active', NOW());

INSERT INTO `wallet_transactions` (`id`, `wallet_id`, `user_id`, `type`, `amount`, `balance_before`, `balance_after`, `reference_type`, `reference_id`, `description`, `status`, `created_at`) VALUES
(1, 4, 4, 'REFUND', 1400000.00, 0.00, 1400000.00, 'booking_refund', 1, 'Hoàn 70% tiền cọc hủy phòng #BK2026071001 theo chính sách', 'completed', NOW()),
(2, 8, 8, 'REFUND', 2100000.00, 0.00, 2100000.00, 'booking_refund', 6, 'Hoàn tiền phòng chuyến đi Sa Pa #BK2026090506', 'completed', NOW());

-- =====================================================
-- 17. SEED BANK ACCOUNTS
-- =====================================================
INSERT INTO `bank_accounts` (`id`, `user_id`, `bank_name`, `bank_code`, `account_number`, `account_holder_name`, `is_default`, `status`, `created_at`) VALUES
(1, 4, 'Techcombank', 'TCB', '19071766471019', 'PHAM XUAN CHUAN', 1, 'active', NOW()),
(2, 8, 'Vietcombank', 'VCB', '0011004567890', 'NGUYEN THI HUONG', 1, 'active', NOW());

-- =====================================================
-- 18. SEED REFUNDS
-- =====================================================
INSERT INTO `refunds` (`id`, `booking_id`, `user_id`, `total_paid`, `refund_amount`, `cancellation_fee`, `refund_percentage`, `policy_code`, `reason_code`, `reason_text`, `status`, `wallet_transaction_id`, `created_at`) VALUES
(1, 1, 4, 2000000.00, 1400000.00, 600000.00, 70.00, 'CANCEL_72H_70_PERCENT', 'CHANGE_OF_PLAN', 'Thay đổi kế hoạch gia đình', 'completed', 1, NOW());

-- =====================================================
-- 19. SEED BOOKING CHAT & MESSAGES
-- =====================================================
INSERT INTO `booking_conversations` (`id`, `booking_id`, `created_at`) VALUES
(1, 1, NOW()),
(2, 2, NOW());

INSERT INTO `booking_messages` (`id`, `conversation_id`, `sender_id`, `message`, `message_type`, `created_at`) VALUES
(1, 1, 1, 'Đặt phòng thành công! Bạn có thể trao đổi với chủ nhà tại đây.', 'system', NOW()),
(2, 1, 4, 'Chào chủ nhà, mấy giờ mình có thể nhận phòng được vậy ạ?', 'text', NOW()),
(3, 1, 2, 'Chào bạn! Thời gian nhận phòng tiêu chuẩn là 14h00 bạn nhé. Hân hạnh được đón tiếp bạn!', 'text', NOW()),
(4, 2, 1, 'Đặt phòng thành công! Bạn có thể trao đổi với chủ nhà tại đây.', 'system', NOW());

-- =====================================================
-- 20. SEED DISPUTES (Khiếu nại mẫu)
-- =====================================================
INSERT INTO `disputes` (`id`, `reporter_id`, `reporter_role`, `target_type`, `target_id`, `booking_id`, `category`, `reason`, `description`, `status`, `created_at`) VALUES
(1, 4, 'guest', 'booking', 3, 3, 'PAYMENT_ISSUE', 'Vấn đề thanh toán & xác thực biên lai', 'Tôi đã quét mã VietQR thành công nhưng đơn phòng vẫn đang ở trạng thái chờ kiểm tra, nhờ hỗ trợ kiểm tra đối soát giúp.', 'pending', NOW());
