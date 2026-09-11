# 🏨 Homestay Booking API (Node.js + Express + MySQL)

Backend API cho ứng dụng di động đặt phòng Homestay và hệ thống Web Quản trị.

## 📌 Yêu cầu hệ thống
- **Node.js**: Phiên bản 18 trở lên
- **MySQL / MariaDB** (qua XAMPP hoặc MySQL Server độc lập)

---

## 💾 Cấu trúc Cơ sở Dữ liệu

Database bao gồm **15 bảng thực thể**, **3 Views**, **4 Triggers**, **1 Function** và **1 Stored Procedure**:
1. `users`: Quản lý tài khoản Admin, Staff, Customer và điểm tích lũy (`reward_points`).
2. `locations`: Điểm đến du lịch (*Đà Lạt, Sa Pa, Phú Quốc, Hội An, Nha Trang, Ninh Bình*).
3. `homestay_types`: Loại hình (*Villa, Homestay, Resort, Cabin, Eco Homestay*).
4. `amenities`: Danh mục tiện nghi (*Hồ bơi, BBQ, View núi/biển, Bếp, Spa, Xe đạp...*).
5. `homestays`: Danh sách homestay.
6. `homestay_images`: Thư viện ảnh homestay.
7. `homestay_amenities`: Liên kết N-N homestay và tiện nghi.
8. `promotions`: Mã giảm giá / Voucher (% hoặc số tiền cố định, đổi bằng điểm).
9. `bookings`: Lịch sử đặt phòng (`pending`, `confirmed`, `completed`, `cancelled`).
10. `payments`: Giao dịch thanh toán (`vnpay`, `momo`, `bank_transfer`, `cash`).
11. `favorites`: Danh sách yêu thích (Wishlist).
12. `reviews`: Đánh giá 1-5 sao và nhận xét chỗ nghỉ.
13. `notifications`: Thông báo In-app cho ứng dụng di động.
14. `user_devices`: Lưu FCM Push Token gửi thông báo đẩy.
15. `point_transactions`: Lịch sử cộng/trừ điểm thưởng.

---

## 🚀 Khởi tạo Database

Tất cả đã được tổ chức thành **đúng 1 file Schema** và **đúng 1 file Seed**:

```bash
# 1. Tạo cấu trúc bảng, views, triggers và stored procedures
mysql -u root -p < schema.sql

# 2. Import dữ liệu mẫu phong phú
mysql -u root -p homestay_db < seed.sql
```
*(Hoặc mở phpMyAdmin ➔ Import file `schema.sql` rồi import tiếp `seed.sql`).*

---

## ⚙️ Cài đặt & Chạy Server

1. Cài đặt dependencies:
   ```bash
   npm install
   ```

2. Cấu hình file `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=homestay_db
   PORT=3000
   ```

3. Khởi động máy chủ:
   ```bash
   npm run dev
   ```
   *Máy chủ chạy tại `http://localhost:3000` (Health check: `http://localhost:3000/api/health`).*

---

## 📡 Danh sách API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/health` | Kiểm tra trạng thái máy chủ |
| `GET` | `/api/homestays` | Lấy danh sách homestay kèm ảnh, địa điểm và tiện nghi |
| `GET` | `/api/homestays/:id` | Lấy thông tin chi tiết một homestay theo ID |
| `GET` | `/api/users/:id` | Lấy thông tin tài khoản người dùng |
| `PUT` | `/api/users/:id` | Cập nhật thông tin hồ sơ & ảnh đại diện người dùng |
