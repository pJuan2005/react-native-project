USE `homestay_db`;

INSERT INTO `users` (`name`, `email`, `password_hash`, `phone`, `address`, `birth_date`, `avatar_url`)
VALUES ('Phạm Xuân Chuẩn', 'phamchuan2608@gmail.com', '', '0901234567', 'Hà Nội, Việt Nam', '2000-01-01', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80')
ON DUPLICATE KEY UPDATE `name` = `name`;
