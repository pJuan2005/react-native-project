-- Seed data for homestay_db

USE `homestay_db`;

-- Locations
INSERT INTO `locations` (`name`, `description`, `icon`, `homestay_count`, `is_active`) VALUES
('Đà Lạt', 'Thành phố ngàn hoa mát mẻ quanh năm', 'leaf-outline', 3, 1),
('Sa Pa', 'Sapa sương mơ, đà lạt miền Bắc', 'mountain-outline', 1, 1),
('Phú Quốc', 'Hòn ngọc ngào đảo biển xanh', 'water-outline', 1, 1),
('Hội An', 'Phố cổ ngàn đèn lồng lung linh', 'home-outline', 2, 1),
('Nha Trang', 'Thành phố biển xinh đẹp miền Trung', 'water-outline', 1, 1);

-- Homestay Types
INSERT INTO `homestay_types` (`name`, `description`, `is_active`) VALUES
('Villa', 'Biệt thự cao cấp', 1),
('Homestay', 'Homestay truyền thống', 1),
('Cabin', 'Cabin trong rừng', 1),
('Eco Homestay', 'Homestay sinh thái', 1),
('Resort', 'Khu nghỉ dưỡng', 1);

-- Amenities
INSERT INTO `amenities` (`name`, `icon`, `category`) VALUES
('WiFi', 'wifi-outline', 'Tiện nghi'),
('Điều hòa', 'snow-outline', 'Tiện nghi'),
('Bếp đầy đủ', 'restaurant-outline', 'Tiện nghi'),
('Hồ bơi', 'water-outline', 'Giải trí'),
('BBQ', 'flame-outline', 'Giải trí'),
('View núi', 'mountain-outline', 'Vị trí'),
('Sân vườn', 'leaf-outline', 'Ngoài trời'),
('Bãi đỗ xe', 'car-outline', 'Dịch vụ'),
('Nóng lạnh', 'thermometer-outline', 'Tiện nghi'),
('Máy giặt', 'shirt-outline', 'Tiện nghi');

-- Homestays
INSERT INTO `homestays` (`name`, `description`, `price`, `old_price`, `location_id`, `type_id`, `rating`, `review_count`, `max_guests`, `bedrooms`, `bathrooms`, `is_new`, `is_featured`, `is_active`) VALUES
('Villa Lavender Dream', 'Villa Lavender Dream nằm giữa đồi lavender thơ mộng tại Đà Lạt. Không gian rộng rãi, view núi tuyệt đẹp, hồ bơi riêng và khu BBQ ngoài trời.', 2500000, 3200000, 1, 1, 4.90, 156, 8, 4, 3, 0, 1, 1),
('Homestay Cloud Nine', 'Cloud Nine mang đến trải nghiệm "đứng trên mây" với view sương mây tuyệt đẹp mỗi sáng sớm.', 1800000, NULL, 1, 2, 4.80, 203, 6, 3, 2, 0, 1, 1),
('Seaside Bliss Villa', 'Seaside Bliss Villa tọa lạc ngay bãi biển Khem đẹp nhất Phú Quốc.', 3500000, 4200000, 3, 1, 4.90, 89, 10, 5, 4, 1, 1, 1),
('Rice Terrace Homestay', 'Homestay truyền thống người Mông tại Sa Pa với view ruộng bậc thang tuyệt đẹp.', 1200000, NULL, 2, 2, 4.70, 134, 4, 2, 1, 1, 0, 1),
('Ancient Town Riverside', 'Ancient Town Riverside tọa lạc ngay bên sông Thu Bồn, chỉ 5 phút đi bộ đến phố cổ Hội An.', 2100000, NULL, 4, 2, 4.80, 178, 6, 3, 2, 0, 1, 1),
('Ocean View Resort', 'Ocean View Resort Nha Trang với view biển panoramic 180 độ.', 2800000, 3500000, 5, 5, 4.60, 92, 4, 2, 2, 1, 0, 1),
('Pine Hill Cabin', 'Pine Hill Cabin giấu mình trong rừng thông Đà Lạt mát mẻ.', 950000, NULL, 1, 3, 4.50, 67, 4, 2, 1, 0, 0, 1),
('Bamboo Eco Homestay', 'Bamboo Eco Homestay Hội An với kiến trúc tre bambu độc đáo.', 1500000, NULL, 4, 4, 4.70, 112, 5, 2, 2, 0, 0, 1);

-- Homestay Images (primary images)
INSERT INTO `homestay_images` (`homestay_id`, `image_url`, `is_primary`, `sort_order`) VALUES
(1, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80', 1, 0),
(2, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80', 1, 0),
(3, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80', 1, 0),
(4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80', 1, 0),
(5, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80', 1, 0),
(6, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80', 1, 0),
(7, 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80', 1, 0),
(8, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80', 1, 0);

-- Homestay Amenities
INSERT INTO `homestay_amenities` (`homestay_id`, `amenity_id`) VALUES
(1, 1), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
(2, 1), (2, 9), (2, 5), (2, 6), (2, 10),
(3, 1), (3, 2), (3, 4), (3, 5), (3, 7), (3, 8),
(4, 1), (4, 9), (4, 6),
(5, 1), (5, 2), (5, 7), (5, 10),
(6, 1), (6, 2), (6, 4), (6, 8),
(7, 1), (7, 5), (7, 6),
(8, 1), (8, 2), (8, 7);
