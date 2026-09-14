# 🏗️ KIẾN TRÚC HỆ THỐNG HOMESTAY BOOKING (SYSTEM ARCHITECTURE)

Tài liệu này giải thích chi tiết kiến trúc tổng thể, luồng dữ liệu (Data Flow) và cách phân chia ranh giới rõ ràng giữa **Ứng dụng Di động (Mobile App)**, **Trang Quản trị (Web Admin)** và **Máy chủ API (Node.js Express & MySQL Database)**.

---

## 1. Sơ đồ Kiến trúc Tổng thể (Overall Architecture)

```text
┌────────────────────────────────────────────────────────┐
│               1. CLIENT APPS (NGƯỜI DÙNG)              │
│                                                        │
│  📱 Mobile App (React Native - Expo SDK 54)           │
│     • Dành cho: Khách hàng tìm & đặt homestay          │
│     • Giao diện: Touch UI, Haptics, Calendar, Wishlist │
│                                                        │
│  💻 Web Admin Dashboard (admin-web / HTML5 + Tailwind) │
│     • Dành cho: Quản trị viên & Nhân viên CSKH         │
│     • Giao diện: Biểu đồ doanh thu, Bảng duyệt đơn     │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / RESTful API (JSON)
                           ▼
┌────────────────────────────────────────────────────────┐
│               2. BACKEND API SERVER (TRUNG TÂM)        │
│                                                        │
│  🚀 Node.js + Express.js REST API (Port 3000)          │
│     ├── /api/homestays     (Client - Xem danh sách, ảnh)│
│     ├── /api/users         (Client - Profile, Avatar)  │
│     └── /api/admin/*       (Admin  - Duyệt đơn, Thống kê│
│                             doanh thu, Thêm homestay)  │
│     ├── Connection Pool (`mysql2/promise`)             │
│     └── Middleware: CORS, JSON Parser, Dotenv          │
└──────────────────────────┬─────────────────────────────┘
                           │ SQL Queries / Stored Procedures
                           ▼
┌────────────────────────────────────────────────────────┐
│               3. DATABASE LAYER (LƯU TRỮ DUY NHẤT)     │
│                                                        │
│  🗄️ MySQL / MariaDB (Database: homestay_db)           │
│     • 15 Bảng thực thể quan hệ                         │
│     • Views: v_homestays_detail, v_user_bookings...    │
│     • Triggers: Tự động đếm homestay, tính rating      │
│     • Procedure: sp_create_booking (Chống overbooking) │
└────────────────────────────────────────────────────────┘
```

---

## 2. Luồng Nghiệp vụ Thực tế giữa Mobile và Web Admin

### 🔄 Kịch bản: Khách đặt phòng trên Điện thoại ➔ Admin duyệt đơn trên Web

1. **Khách hàng thao tác trên Điện thoại (React Native App)**:
   - Khách mở ứng dụng di động, duyệt danh sách homestay và xem chi tiết homestay.
   - Khách chọn ngày Check-in/Check-out, số lượng khách, chọn Voucher giảm giá và bấm **"Đặt phòng ngay"**.
   - Mobile App gửi request `POST /api/client/bookings` (hoặc gọi procedure `sp_create_booking`) lên Backend.
   - Đơn đặt được lưu vào CSDL với trạng thái ban đầu là `pending` (hoặc `confirmed`), kèm theo bản ghi thanh toán `payments` và cộng điểm thưởng `point_transactions`.

2. **Admin nhận thông tin và xử lý trên Máy tính (Web Admin)**:
   - Quản trị viên truy cập trang quản trị tại: `http://localhost:3000/admin`.
   - Bảng điều khiển Dashboard tự động hiển thị số lượng **Đơn chờ duyệt** nhảy số trên badge.
   - Admin vào tab **"Quản lý Đặt phòng"**, kiểm tra chi tiết khách hàng và bấm nút **"Duyệt"** (chuyển sang `confirmed`) hoặc **"Hủy"**.
   - Web Admin gửi request `PUT /api/admin/bookings/:id/status` lên Backend để cập nhật CSDL và tự động bắn thông báo `notifications` tới khách hàng.

3. **Biểu đồ Doanh thu tự động cập nhật**:
   - Doanh thu từ các đơn được duyệt thành công sẽ được tính toán ngay lập tức vào **Biểu đồ Doanh thu (Chart.js)** và thẻ thống kê **Tổng doanh thu** trên Dashboard của Web Admin.

---

## 3. Phân chia Cấu trúc Thư mục Dự án

Dự án được cấu trúc dạng Monorepo chuẩn mực, phân tách độc lập và rõ ràng:

```text
├── app/                  # 📱 FRONTEND MOBILE APP (React Native / Expo Router)
│   ├── (tabs)/           # 5 Tabs: Trang chủ, Địa điểm, Homestay, Đặt phòng, Cá nhân
│   ├── homestay/[id].tsx # Chi tiết homestay & Lịch chọn ngày, áp Voucher
│   └── _layout.tsx       # Root layout & Context Provider
│
├── admin-web/            # 💻 FRONTEND WEB ADMIN (Tailwind CSS + Chart.js SPA)
│   └── index.html        # Dashboard, Duyệt đơn booking, Thêm homestay, Quản lý voucher
│
├── backend/              # 🚀 BACKEND REST API (Node.js + Express 3-Tier Layered)
│   ├── src/
│   │   ├── config/       # database.js, env.js
│   │   ├── models/       # user, homestay, booking, location, promotion models
│   │   ├── services/     # auth, homestay, user, admin services
│   │   ├── controllers/  # auth, homestay, user, admin controllers
│   │   ├── middlewares/  # auth.middleware.js, error.middleware.js
│   │   ├── routes/       # auth, homestay, user, admin routes & index.js
│   │   ├── utils/        # response.js, hash.js
│   │   ├── app.js        # Express app setup & middleware mounting
│   │   └── server.js     # Server entrypoint & port listening
│   └── package.json
│
└── database/             # 🗄️ CƠ SỞ DỮ LIỆU CHUẨN (Single Source of Truth)
    ├── schema.sql        # Schema DDL (15 Tables, Views, Triggers, Procedures)
    └── seed.sql          # Dữ liệu nạp mẫu phong phú (100% MySQL/phpMyAdmin Compatible)
```

---

## 4. Danh mục API Endpoints

### 📱 APIs Dành cho Ứng dụng Di động (Mobile App)
| Method | Endpoint | Mô tả |
|:---|:---|:---|
| `GET` | `/api/health` | Kiểm tra trạng thái máy chủ |
| `GET` | `/api/homestays` | Lấy danh sách homestay kèm ảnh, vị trí, tiện nghi |
| `GET` | `/api/homestays/:id` | Lấy chi tiết thông tin 1 homestay theo ID |
| `GET` | `/api/users/:id` | Lấy thông tin tài khoản & điểm thưởng người dùng |
| `PUT` | `/api/users/:id` | Cập nhật thông tin hồ sơ & ảnh đại diện |

### 💻 APIs Dành cho Trang Quản trị (Web Admin)
| Method | Endpoint | Mô tả |
|:---|:---|:---|
| `GET` | `/api/admin/dashboard` | Thống kê tổng doanh thu, tổng đơn, homestay, khách hàng, biểu đồ tháng |
| `GET` | `/api/admin/bookings` | Danh sách đơn đặt phòng kèm bộ lọc trạng thái (`pending`, `confirmed`, `completed`, `cancelled`) |
| `PUT` | `/api/admin/bookings/:id/status` | Duyệt / Hoàn tất / Hủy đơn đặt phòng |
| `POST` | `/api/admin/homestays` | Thêm mới homestay lên hệ thống |
| `DELETE` | `/api/admin/homestays/:id` | Ngừng kinh doanh homestay |
