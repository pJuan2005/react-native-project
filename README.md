# 🏡 Ứng Dụng Đặt Phòng Homestay (Homestay Booking App)

Ứng dụng di động đặt phòng Homestay và nghỉ dưỡng được xây dựng bằng **React Native (Expo)** kết hợp với **Node.js (Express REST API)** và cơ sở dữ liệu **MySQL / MariaDB**. Ứng dụng cung cấp trải nghiệm tìm kiếm, khám phá các địa điểm du lịch nổi tiếng, xem chi tiết homestay, đặt phòng trực tuyến và quản lý hồ sơ cá nhân.

---

## 📌 Mục lục

- [Tổng quan dự án](#-tổng-quan-dự-án)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc thư mục dự án](#-cấu-trúc-thư-mục-dự-án)
- [Lộ trình phát triển theo tuần (Weekly Roadmap)](#-lộ-trình-phát-triển-theo-tuần-weekly-roadmap)
- [Hướng dẫn cài đặt và chạy ứng dụng](#-hướng-dẫn-cài-đặt-và-chạy-ứng-dụng)
  - [1. Yêu cầu môi trường](#1-yêu-cầu-môi-trường)
  - [2. Cấu hình cơ sở dữ liệu](#2-cấu-hình-cơ-sở-dữ-liệu)
  - [3. Cài đặt và khởi chạy Backend](#3-cài-đặt-và-khởi-chạy-backend)
  - [4. Cài đặt và khởi chạy Mobile App (Frontend)](#4-cài-đặt-và-khởi-chạy-mobile-app-frontend)
- [Danh sách API Endpoints](#-danh-sách-api-endpoints)

---

## 📱 Tổng quan dự án

Dự án phát triển một nền tảng đặt phòng homestay hoàn chỉnh gồm 2 phần:
1. **Frontend (Mobile App)**: Xây dựng bằng React Native với Expo Router (File-based Routing), hỗ trợ đa nền tảng (Android, iOS).
2. **Backend (RESTful API Server)**: Xây dựng bằng Node.js & Express.js, kết nối MariaDB / MySQL với kiến trúc module phân tầng (Routes - Controllers - Config - Database Views/Procedures).

---

## ✨ Tính năng chính

### 1. 🏠 Trang chủ (Home)
- Banner ưu đãi khuyến mãi cho khách đặt sớm.
- Thanh tìm kiếm nhanh homestay, địa điểm du lịch.
- Danh mục khám phá theo địa điểm (Đà Lạt, Sa Pa, Phú Quốc, Hội An, Nha Trang,...).
- Danh sách homestay nổi bật (Featured Homestays) và homestay mới (New Arrivals).
- Thao tác nhanh thêm/bỏ lưu yêu thích trực tiếp từ thẻ homestay.

### 2. 📍 Khám phá theo địa điểm (Locations)
- Danh sách các điểm đến du lịch kèm hình ảnh và số lượng homestay có sẵn.
- Tìm kiếm địa điểm theo tên.
- Xem danh sách toàn bộ homestay thuộc từng địa điểm cụ thể.

### 3. 🔍 Danh sách & Bộ lọc Homestay (Homestays)
- Hiển thị danh sách homestay dạng danh sách trực quan.
- Lọc theo loại hình lưu trú: *Villa, Homestay, Resort, Cabin, Eco Homestay*.
- Tìm kiếm linh hoạt theo tên homestay hoặc địa điểm.
- Sắp xếp linh hoạt theo: *Mặc định, Giá (tăng dần), Đánh giá Rating (giảm dần)*.

### 4. 📄 Chi tiết Homestay (Homestay Detail)
- Thư viện hình ảnh sắc nét kèm hiệu ứng chấm chuyển ảnh.
- Hiển thị đầy đủ thông tin: giá tiền, giá gốc giảm giá, địa chỉ, loại hình, số lượng phòng ngủ/phòng tắm, sức chứa tối đa.
- Danh sách tiện nghi chi tiết (*Hồ bơi riêng, BBQ, View núi/biển, Bếp đầy đủ, WiFi, Xe đưa đón,...*).
- Chọn ngày nhận phòng (Check-in), ngày trả phòng (Check-out) và số lượng khách.
- Tự động tính toán số đêm và tổng tiền thanh toán theo thời gian thực.
- Thao tác lưu vào danh sách yêu thích hoặc xác nhận đặt phòng.

### 5. 📅 Quản lý Đặt phòng & Yêu thích (Bookings & Wishlist)
- Hiển thị danh sách các phòng đã đặt kèm chi tiết ngày nhận/trả phòng, số khách và tổng tiền.
- Danh sách homestay đã lưu vào mục yêu thích (Wishlist).
- Xóa đặt phòng / hủy homestay khỏi danh sách.
- Tổng kết chi phí và nút thanh toán trực quan.

### 6. 👤 Trang cá nhân (User Profile)
- Xem thông tin tài khoản người dùng (Họ tên, Email, Số điện thoại, Địa chỉ, Ngày sinh).
- Chức năng chỉnh sửa và cập nhật hồ sơ cá nhân trực tiếp (gọi API `PUT /api/users/:id`).
- Chuyển đổi tab nhanh giữa: *Hồ sơ*, *Lịch sử đặt phòng*, *Danh sách yêu thích*.
- Các mục hỗ trợ, cài đặt và nút đăng xuất.

---

## 🛠 Công nghệ sử dụng

### Frontend (Mobile App)
- **Framework**: React Native 0.81, Expo SDK 54
- **Routing**: Expo Router (File-based navigation)
- **Language**: TypeScript
- **State Management**: React Context API (`BookingContext`)
- **UI & Icons**: Ionicons (`@expo/vector-icons`), Expo Image, React Native Reanimated
- **Device Features**: Expo Haptics (phản hồi rung xúc giác khi bấm tab)

### Backend & Database
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MySQL / MariaDB (hỗ trợ Views, Triggers tự động cập nhật số lượng homestay, Stored Procedures tạo đơn đặt phòng, Functions kiểm tra phòng trống)
- **Database Driver**: `mysql2/promise` (Connection Pooling)
- **Middleware**: CORS, Dotenv, Body Parser

---

## 📂 Cấu trúc thư mục dự án

```text
├── app/                        # Giao diện ứng dụng (Expo Router)
│   ├── (tabs)/                 # Tab Navigation chính
│   │   ├── _layout.tsx         # Cấu hình Bottom Tab Bar
│   │   ├── index.tsx           # Tab Trang chủ
│   │   ├── locations.tsx       # Tab Khám phá địa điểm
│   │   ├── homestays.tsx       # Tab Danh sách & tìm kiếm homestay
│   │   └── users.tsx           # Tab Trang cá nhân & quản lý
│   ├── homestay/[id].tsx       # Màn hình chi tiết homestay & đặt phòng
│   ├── location/[id].tsx       # Màn hình homestay theo địa điểm
│   ├── category/[id].tsx       # Alias hỗ trợ danh mục địa điểm
│   ├── product/[id].tsx        # Alias chi tiết homestay
│   ├── user/[id].tsx           # Alias trang người dùng
│   ├── bookings.tsx            # Màn hình quản lý đặt phòng & giỏ hàng
│   ├── modal.tsx               # Màn hình modal chung
│   └── _layout.tsx             # Root Stack Layout & BookingProvider
├── components/                 # Các UI Components tái sử dụng
│   ├── haptic-tab.tsx          # Tab button có phản hồi rung xúc giác
│   ├── product-image.tsx       # Component hiển thị ảnh homestay/địa điểm
│   ├── themed-text.tsx         # Text hỗ trợ Dark/Light theme
│   ├── themed-view.tsx         # View hỗ trợ Dark/Light theme
│   └── ui/                     # Các components UI cơ bản
├── contexts/                   # Quản lý State toàn cục
│   └── BookingContext.tsx      # Quản lý danh sách đặt phòng và yêu thích
├── constants/                  # Hằng số & Dữ liệu mẫu
│   ├── mockData.ts             # Dữ liệu fallback & kiểu dữ liệu TypeScript
│   └── theme.ts                # Bảng màu sắc & giao diện
├── hooks/                      # Custom React Hooks
│   ├── use-color-scheme.ts     # Hook nhận biết Dark/Light Mode
│   └── use-theme-color.ts      # Hook lấy màu theo theme
├── src/
│   └── config/
│       └── api.ts              # Cấu hình URL kết nối Backend API
├── database/                   # CSDL nâng cao
│   └── schema.sql              # Schema DDL, Views, Triggers, Stored Procedures
├── backend/                    # Mã nguồn máy chủ Node.js / Express
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Cấu hình kết nối MySQL Connection Pool
│   │   ├── controllers/
│   │   │   ├── homestay.controller.js  # Xử lý API homestay
│   │   │   └── users.controller.js     # Xử lý API người dùng
│   │   ├── routes/
│   │   │   ├── homestay.routes.js      # Định tuyến homestay
│   │   │   └── users.routes.js         # Định tuyến user
│   │   └── server.js           # Khởi tạo Express Server & Middleware
│   ├── seed.sql                # Dữ liệu mẫu (Homestays, Locations, Users,...)
│   ├── .env.example            # Mẫu cấu hình môi trường backend
│   └── package.json            # Cấu hình dependencies Backend
├── .gitignore                  # Cấu hình file/thư mục bỏ qua khi commit Git
├── app.json                    # Cấu hình ứng dụng Expo (App Name, Icon, Splash)
├── package.json                # Dependencies của ứng dụng Frontend
├── tsconfig.json               # Cấu hình TypeScript
└── README.md                   # Tài liệu hướng dẫn & mô tả dự án
```

---

## 🗓 Lộ trình phát triển theo tuần (Weekly Roadmap)

Dự án được xây dựng và triển khai theo từng giai đoạn tuần tự:

```text
+-------------------------------------------------------------------------------+
|                               LỘ TRÌNH PHÁT TRIỂN                             |
+--------+----------------------------------------------------------------------+
| Tuần 1 | Khởi tạo dự án Expo, thiết kế Wireframe UI/UX & cấu hình TypeScript  |
| Tuần 2 | Thiết kế Database (MySQL), xây dựng Backend REST API với Express.js  |
| Tuần 3 | Xây dựng Bottom Tabs Navigation, màn hình Home & màn hình Locations |
| Tuần 4 | Xây dựng màn hình Homestays, tính năng tìm kiếm, lọc & sắp xếp       |
| Tuần 5 | Xây dựng màn hình Chi tiết Homestay, bộ chọn ngày & BookingContext   |
| Tuần 6 | Xây dựng màn hình Trang cá nhân (Profile) & API cập nhật thông tin   |
| Tuần 7 | Tích hợp hoàn thiện FE - BE, kiểm thử, tối ưu & hoàn thiện báo cáo   |
+--------+----------------------------------------------------------------------+
```

### 🔹 Tuần 1: Khảo sát & Khởi tạo dự án
- [x] Lựa chọn đề tài: *Ứng dụng đặt phòng Homestay trên nền tảng di động*.
- [x] Phân tích yêu cầu chức năng và luồng trải nghiệm người dùng (User Flow).
- [x] Khởi tạo cấu trúc dự án React Native với Expo SDK 54 & TypeScript.
- [x] Cấu hình hệ thống theme, màu sắc, phông chữ và các thành phần UI nền tảng.

### 🔹 Tuần 2: Thiết kế Cơ sở Dữ liệu & Xây dựng Backend API
- [x] Thiết kế lược đồ CSDL quan hệ: `users`, `locations`, `homestay_types`, `amenities`, `homestays`, `homestay_images`, `homestay_amenities`, `bookings`, `favorites`, `reviews`.
- [x] Viết Database Triggers (tự động đếm số homestay theo địa điểm), Views (`v_homestays_detail`, `v_user_bookings`), Stored Procedure đặt phòng và Function kiểm tra lịch trống.
- [x] Xây dựng máy chủ Node.js / Express REST API với Connection Pool (`mysql2`).
- [x] Xây dựng các API cơ bản: `GET /api/homestays`, `GET /api/homestays/:id`, `GET /api/health`.

### 🔹 Tuần 3: Xây dựng Navigation & Giao diện Trang chủ, Địa điểm
- [x] Thiết kế hệ thống điều hướng với Expo Router và Tab Layout (Home, Locations, Homestays, Profile).
- [x] Thêm haptic feedback khi chuyển đổi các tab trên thiết bị di động.
- [x] Xây dựng giao diện Trang chủ (`HomeScreen`): Banner quảng cáo, tìm kiếm nhanh, địa điểm nổi bật theo chiều ngang, homestay mới nhất.
- [x] Xây dựng màn hình Địa điểm (`LocationsScreen`): danh sách vùng miền du lịch và số lượng homestay.

### 🔹 Tuần 4: Xây dựng màn hình Tìm kiếm & Lọc Homestay
- [x] Xây dựng màn hình Danh sách Homestay (`HomestaysScreen`).
- [x] Tích hợp thanh tìm kiếm tức thời theo từ khóa (tên homestay, vị trí).
- [x] Tích hợp bộ lọc danh mục theo loại hình (Villa, Cabin, Resort, Eco Homestay,...).
- [x] Tích hợp bộ sắp xếp theo giá tiền và điểm đánh giá sao (Rating).
- [x] Kết nối dữ liệu động từ Backend API vào giao diện danh sách.

### 🔹 Tuần 5: Xây dựng Chi tiết Homestay & Tính năng Đặt phòng
- [x] Xây dựng màn hình Chi tiết Homestay (`HomestayDetail`): Carousel ảnh, thông tin phòng ngủ/phòng tắm, danh sách tiện nghi có icon trực quan.
- [x] Phát triển bộ chọn ngày nhận phòng (Check-in) và ngày trả phòng (Check-out).
- [x] Xây dựng bộ đếm số lượng khách (Stepper) có giới hạn theo sức chứa tối đa của homestay.
- [x] Tự động tính toán tổng số đêm và tổng tiền phải trả theo thời gian thực.
- [x] Xây dựng State Management với `BookingContext` để quản lý giỏ đặt phòng và danh sách yêu thích (Wishlist).
- [x] Xây dựng màn hình Quản lý Đặt phòng (`BookingsScreen`) và tổng hợp chi phí.

### 🔹 Tuần 6: Xây dựng Trang cá nhân & Tích hợp Quản lý tài khoản
- [x] Xây dựng màn hình Trang cá nhân (`ProfileScreen`) với giao diện thông tin cá nhân.
- [x] Xây dựng các tab con: *Hồ sơ cá nhân*, *Lịch sử đặt phòng*, *Danh sách yêu thích*.
- [x] Viết API `GET /api/users/:id` và `PUT /api/users/:id` ở Backend để lấy và cập nhật thông tin user.
- [x] Tích hợp form chỉnh sửa hồ sơ người dùng trực tiếp trên ứng dụng (cập nhật Họ tên, Email, SĐT, Địa chỉ).

### 🔹 Tuần 7: Tích hợp hoàn thiện, Kiểm thử & Đóng gói
- [x] Tích hợp đồng bộ toàn bộ luồng dữ liệu giữa Frontend và Backend.
- [x] Xử lý trạng thái Loading (ActivityIndicator) và màn hình báo lỗi khi mất kết nối mạng.
- [x] Bổ sung dữ liệu dự phòng (Fallback mock data) khi không chạy backend server.
- [x] Tối ưu hóa file cấu hình Git (`.gitignore`) và chuẩn hóa cấu trúc dự án để đẩy lên GitHub theo từng milestone.
- [x] Viết tài liệu hướng dẫn triển khai và báo cáo kỹ thuật.

---

## 🚀 Hướng dẫn cài đặt và chạy ứng dụng

### 1. Yêu cầu môi trường
- **Node.js**: Phiên bản 18 trở lên ([Tải về](https://nodejs.org/))
- **MySQL / MariaDB**: Có thể dùng qua [XAMPP](https://www.apachefriends.org/) hoặc MySQL Server độc lập
- **Git**: [Tải về](https://git-scm.com/)
- **Điện thoại di động**: Cài đặt ứng dụng **Expo Go** (trên Google Play Store hoặc Apple App Store) hoặc dùng Trình giả lập Android Studio / iOS Simulator.

---

### 2. Cấu hình cơ sở dữ liệu

1. Khởi động dịch vụ **MySQL / MariaDB** (Ví dụ: bấm Start module MySQL trong XAMPP Control Panel).
2. Mở công cụ quản lý CSDL (như **phpMyAdmin** tại `http://localhost/phpmyadmin` hoặc **HeidiSQL / MySQL Workbench**).
3. Tạo cơ sở dữ liệu mới có tên:
   ```sql
   CREATE DATABASE homestay_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Import file schema và dữ liệu mẫu:
   - Cách 1 (qua giao diện phpMyAdmin): Chọn database `homestay_db` -> bấm tab **Import** -> Chọn file `backend/seed.sql` (hoặc `database/schema.sql` rồi `backend/seed.sql`) -> Bấm **Import**.
   - Cách 2 (qua Terminal / Command Prompt):
     ```bash
     mysql -u root -p homestay_db < database/schema.sql
     mysql -u root -p homestay_db < backend/seed.sql
     ```

---

### 3. Cài đặt và khởi chạy Backend

1. Mở cửa sổ dòng lệnh và di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```

2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```

3. Tạo file `.env` từ file mẫu `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Kiểm tra và cập nhật thông tin kết nối CSDL trong file `.env` nếu mật khẩu MySQL của bạn khác mặc định:*
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=homestay_db
   PORT=3000
   ```

4. Khởi động máy chủ Backend:
   ```bash
   npm run dev
   ```
   *Server sẽ chạy tại địa chỉ: `http://localhost:3000` (hoặc `http://0.0.0.0:3000`).*
   - Kiểm tra server hoạt động: mở trình duyệt truy cập `http://localhost:3000/api/health` -> nhận được `{"success":true,"message":"Server is running"}`.

---

### 4. Cài đặt và khởi chạy Mobile App (Frontend)

1. Mở một cửa sổ dòng lệnh mới tại thư mục gốc của dự án:
   ```bash
   npm install
   ```

2. Cấu hình địa chỉ IP máy chủ Backend:
   - Mở file `src/config/api.ts`.
   - Đổi địa chỉ IP `192.168.x.x` thành địa chỉ IP mạng LAN nội bộ của máy tính bạn (xem bằng lệnh `ipconfig` trên Windows hoặc `ifconfig` trên macOS/Linux):
   ```typescript
   const API_BASE_URL = 'http://<IP_MÁY_TÍNH_CỦA_BẠN>:3000';
   export default API_BASE_URL;
   ```
   *(Lưu ý: Điện thoại và máy tính phải kết nối chung một mạng Wi-Fi để ứng dụng trên điện thoại gọi được API).*

3. Khởi chạy ứng dụng Expo:
   ```bash
   npx expo start
   ```

4. Trải nghiệm ứng dụng:
   - **Trên điện thoại thật**: Mở ứng dụng **Expo Go**, quét mã QR hiển thị trên màn hình terminal.
   - **Trên Android Emulator**: Bấm phím `a` trên terminal.
   - **Trên iOS Simulator**: Bấm phím `i` trên terminal.
   - **Trên Trình duyệt Web**: Bấm phím `w` trên terminal.

---

## 📡 Danh sách API Endpoints

| Method | Endpoint | Tham số / Body | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Không | Kiểm tra trạng thái hoạt động của máy chủ |
| `GET` | `/api/homestays` | Không | Lấy danh sách toàn bộ homestay (kèm địa điểm, tiện nghi, ảnh) |
| `GET` | `/api/homestays/:id` | `id` (Param) | Lấy thông tin chi tiết một homestay theo ID |
| `GET` | `/api/users/:id` | `id` (Param) | Lấy thông tin tài khoản người dùng theo ID |
| `PUT` | `/api/users/:id` | `{ name, email, phone, address }` | Cập nhật thông tin tài khoản người dùng |
