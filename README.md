# 🏡 HomeStay - Nền Tảng Đặt Phòng & Quản Lý Homestay Đa Nền Tảng (Cross-Platform)

> **Đồ án môn học:** Lập trình di động đa nền tảng (Cross-Platform Mobile Development)  
> **Kiến trúc hệ thống:** Mobile App (React Native / Expo) + Web Portal (Next.js 16) + Backend REST API (Node.js / Express) + Cơ sở dữ liệu quan hệ (MySQL / MariaDB).

---

## 📌 Mục lục

- [1. Giới thiệu tổng quan](#1-giới-thiệu-tổng-quan)
- [2. Kiến trúc hệ sinh thái](#2-kiến-trúc-hệ-sinh-thái)
- [3. Tính năng cốt lõi theo vai trò](#3-tính-năng-cốt-lõi-theo-vai-trò)
  - [3.1. Ứng dụng di động (Mobile App - Du khách)](#31-ứng-dụng-di-động-mobile-app---du-khách)
  - [3.2. Cổng thông tin Chủ nhà (Host Portal)](#32-cổng-thông-tin-chủ-nhà-host-portal)
  - [3.3. Cổng Quản trị viên sàn (Admin Portal)](#33-cổng-quản-trị-viên-sàn-admin-portal)
- [4. Công nghệ sử dụng](#4-công-nghệ-sử-dụng)
- [5. Cấu trúc thư mục dự án](#5-cấu-trúc-thư-mục-dự-án)
- [6. Hướng dẫn cài đặt và khởi chạy](#6-hướng-dẫn-cài-đặt-và-khởi-chạy)
  - [Bước 1: Khởi tạo Cơ sở dữ liệu MySQL](#bước-1-khởi-tạo-cơ-sở-dữ-liệu-mysql)
  - [Bước 2: Khởi chạy Backend Server (Port 3000)](#bước-2-khởi-chạy-backend-server-port-3000)
  - [Bước 3: Khởi chạy Web Portal (Port 3001)](#bước-3-khởi-chạy-web-portal-port-3001)
  - [Bước 4: Khởi chạy Mobile App (Port 8081 / Expo Go)](#bước-4-khởi-chạy-mobile-app-port-8081--expo-go)
- [7. Tài khoản thử nghiệm (Demo Credentials)](#7-tài-khoản-thử-nghiệm-demo-credentials)
- [8. Danh mục API Endpoints chính](#8-danh-mục-api-endpoints-chính)

---

## 1. Giới thiệu tổng quan

**HomeStay Platform** là một nền tảng du lịch và lưu trú toàn diện, đáp ứng đầy đủ chu trình nghiệp vụ thực tế từ:
1. **Du khách (Guest):** Khám phá điểm đến, xem chi tiết phòng, kiểm tra lịch trống thời gian thực, đặt phòng chống trùng lịch (Anti-Overbooking), thanh toán chuyển khoản quét mã VietQR, hủy phòng tự động hoàn tiền vào ví, chat với chủ nhà, gửi khiếu nại và tích điểm thưởng.
2. **Chủ nhà (Host):** Đăng ký mở bán homestay, tải ảnh & tiện nghi, quản lý đặt phòng, tạo đơn tại quầy (Direct Walk-in Booking), theo dõi doanh thu và xác minh danh tính căn cước công dân (KYC CCCD 2 mặt).
3. **Quản trị viên sàn (Admin):** Phê duyệt kiểm duyệt chất lượng homestay mới, đối soát biên lai chuyển khoản ngân hàng, duyệt lệnh rút tiền về tài khoản người dùng, xử lý khiếu nại tranh chấp và truy vết nhật ký kiểm toán hệ thống (Audit Trail).

---

## 2. Kiến trúc hệ sinh thái

```text
+-----------------------------------------------------------------------------------+
|                               HỆ SINH THÁI NỀN TẢNG                              |
+--------------------------+------------------------------+-------------------------+
|     📱 MOBILE CLIENT     |        💻 WEB PORTAL         |    ⚙️ BACKEND SERVER     |
|   (React Native Expo)    |       (Next.js 16 App)       |   (Node.js / Express)   |
|   - Dành cho Khách hàng  |   - Guest / Host / Admin     |   - RESTful API         |
|   - iOS / Android / Web  |   - Port 3001                |   - Port 3000           |
+--------------------------+------------------------------+-------------------------+
                                          |
                                          v
                    +-------------------------------------------+
                    |           🗄️ CƠ SỞ DỮ LIỆU MYSQL          |
                    |   - 26 bảng chuẩn quan hệ (Schema DDL)     |
                    |   - Row Locking FOR UPDATE chống race     |
                    |   - Sổ cái tài chính (Ledger) & Ví tiền   |
                    +-------------------------------------------+
```

---

## 3. Tính năng cốt lõi theo vai trò

### 3.1. 📱 Ứng dụng di động (Mobile App - Du khách)
* **Xác thực & Bảo mật:** Đăng nhập, đăng ký thành viên mới nhận ngay Voucher chào mừng 10% và điểm thưởng.
* **Khám phá điểm đến:** Tìm kiếm thông minh theo tỉnh thành (Đà Lạt, Sa Pa, Phú Quốc, Hội An, Côn Đảo,...), phân loại theo hình thức (*Villa, Homestay, Resort, Cabin, Eco Homestay*).
* **Lịch đặt phòng trực quan (Interactive Calendar Picker):** Chọn ngày nhận/trả phòng, tự động tính số đêm và tổng tiền, khóa chặn các ngày đã có khách đặt trước.
* **Cơ chế chống găm phòng:** Tự động giải phóng các phòng giữ chỗ quá 15 phút chưa thanh toán.
* **Thanh toán chuyển khoản VietQR:** Tự động tạo mã thanh toán chuyển khoản kèm upload ảnh biên lai đối soát.
* **Chính sách hủy phòng hoàn tiền tự động (Cancellation Policy):**
  - Hủy $\ge 72$ giờ trước check-in: Hoàn **70%** giá trị phòng vào Ví điện tử của khách; 30% phí hủy chia Sàn 10% hoa hồng + Chủ nhà nhận 20% bồi thường.
  - Hủy $< 72$ giờ: Không hoàn tiền; 10% sàn + 90% bồi thường cho Chủ nhà.
  - Đơn chưa thanh toán: Hủy miễn phí 100%.
* **Ví điện tử & Rút tiền:** Theo dõi số dư khả dụng, lịch sử cộng/trừ tiền minh bạch, tạo yêu cầu rút tiền về tài khoản ngân hàng cá nhân với bàn phím số tiện lợi.
* **Kênh trò chuyện (Chat):** Nhắn tin trao đổi trực tiếp giữa khách và chủ nhà trước chuyến đi.
* **Khiếu nại & Trợ giúp (Disputes):** Gửi báo cáo sự cố kèm hình ảnh tới Ban Quản Trị để được can thiệp bảo vệ quyền lợi.
* **Tích điểm thành viên & Ví Voucher:** Tích lũy điểm khi hoàn tất chuyến đi hoặc đánh giá 5★ để quy đổi các voucher ưu đãi 100k, 250k, 500k.

### 3.2. 🏡 Cổng thông tin Chủ nhà (Host Portal)
* **Đăng ký trở thành Chủ nhà:** Phân quyền vai trò Host riêng biệt.
* **Xác minh danh tính (KYC CCCD 2 mặt):** Chọn tải trực tiếp ảnh mặt trước & mặt sau CCCD từ máy tính (hỗ trợ nút dùng ảnh mẫu thử nghiệm nhanh 1 chạm).
* **Đăng chỗ nghỉ mới:** Tải ảnh đại diện, ảnh thư viện, chọn loại hình, tiện nghi tiếng Việt, địa chỉ và giá thuê mỗi đêm.
* **Quản lý danh sách chỗ nghỉ:** Chỉnh sửa thông tin, xem trạng thái phê duyệt (*Chờ duyệt, Đã duyệt*), chống hiển thị dữ liệu ảo.
* **Quản lý đặt phòng:** Theo dõi danh sách khách đặt phòng, tạo đơn đặt phòng trực tiếp tại quầy (Direct Walk-in Booking).

### 3.3. 🛡️ Cổng Quản trị viên sàn (Admin Portal)
* **Dashboard thống kê:** Biểu đồ doanh thu hàng tháng, tổng số đơn đặt phòng, tỷ lệ lấp đầy chỗ nghỉ và tăng trưởng người dùng.
* **Phê duyệt chỗ nghỉ:** Xem xét hồ sơ homestay mới đăng của các chủ nhà và bấm phê duyệt để mở bán trên toàn hệ thống.
* **Xác minh Chủ nhà (Host Verifications):** Xem số CCCD, hình ảnh 2 mặt giấy tờ tùy thân của Host để cấp tích xanh uy tín hoặc từ chối kèm lý do.
* **Quản lý đặt phòng & Kiểm tra biên lai:** Xem ảnh chuyển khoản ngân hàng của khách và bấm **"Duyệt phòng"** để xác nhận đơn thành công.
* **Quản lý rút tiền (Withdrawals Management):** Xem danh sách lệnh rút tiền từ ví, kiểm tra số tài khoản ngân hàng và bấm **"Duyệt chuyển tiền"** hoặc **"Từ chối"** (hệ thống tự động hoàn 100% tiền lại vào ví khách).
* **Quản lý Khiếu nại (Disputes):** Tiếp nhận khiếu nại từ khách, điều tra và phân xử công bằng.
* **Nhật ký kiểm toán (Audit Trail):** Lưu vết toàn bộ hoạt động nhạy cảm (duyệt phòng, hủy đơn, chuyển tiền, cấp quyền).

---

## 4. Công nghệ sử dụng

| Phân hệ | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Mobile App** | React Native 0.81, Expo SDK 54 | Expo Router (File-based routing), TypeScript, React Context, Reanimated, Responsive Utility |
| **Web Portal** | Next.js 16, React 19 | Turbopack/Webpack, TypeScript, Tailwind CSS, Lucide Icons, Chart.js, Recharts, Three.js |
| **Backend API** | Node.js, Express.js | Kiến trúc 3 tầng (Routes - Controllers - Services/Models), JWT Authentication, CORS, Rate Limit |
| **Cơ sở dữ liệu** | MySQL 8.0+ / MariaDB | 26 bảng quan hệ, InnoDB, Connection Pooling (`mysql2`), Row-level lock `FOR UPDATE`, Single Source of Truth |

---

## 5. Cấu trúc thư mục dự án

```text
appw3/
├── app/                        # 📱 Mobile App (React Native / Expo Router)
│   ├── (tabs)/                 # 5 Tabs chính: index (Trang chủ), locations, homestays, bookings, users
│   ├── homestay/[id].tsx       # Chi tiết homestay & lịch đặt phòng
│   ├── location/[id].tsx       # Homestay theo địa điểm
│   ├── bookings.tsx            # Chi tiết đặt phòng & thanh toán
│   ├── wallet.tsx              # Ví điện tử & yêu cầu rút tiền
│   ├── bank-accounts.tsx       # Liên kết tài khoản ngân hàng nhận tiền
│   ├── chat/[id].tsx           # Nhắn tin với chủ nhà
│   ├── dispute/[id].tsx        # Gửi khiếu nại sự cố
│   ├── disputes.tsx            # Danh sách khiếu nại cá nhân
│   ├── login.tsx               # Màn hình đăng nhập
│   ├── register.tsx            # Màn hình đăng ký thành viên
│   └── _layout.tsx             # Root Layout & Auth Gate
├── backend/                    # 🚀 Máy chủ REST API (Node.js Express)
│   ├── src/
│   │   ├── config/             # database.js, env.js, generateSeed.js
│   │   ├── controllers/        # auth, booking, cancellation, dispute, wallet, host-verification...
│   │   ├── models/             # booking.model.js, user.model.js, homestay.model.js...
│   │   ├── services/           # booking, cancellation, wallet, dispute, risk, audit...
│   │   ├── routes/             # Định tuyến API
│   │   ├── web/                # Module API chuyên biệt phục vụ Web Portal (Host / Admin)
│   │   └── app.js, server.js   # Cấu hình Express và lắng nghe cổng 3000
│   └── package.json            # Dependencies Backend
├── web/                        # 💻 Web Portal (Next.js 16 - Port 3001)
│   ├── app/
│   │   ├── (guest)/            # Giao diện dành cho khách du lịch
│   │   ├── host/               # Cổng Chủ nhà (chỗ nghỉ, đặt phòng, hồ sơ, KYC)
│   │   ├── admin/              # Cổng Quản trị viên (dashboard, duyệt phòng, rút tiền, khiếu nại, audit)
│   │   └── auth/               # Đăng nhập & Đăng ký (Guest/Host)
│   ├── components/             # Reusable Web UI Components
│   ├── services/               # API clients kết nối tới Backend
│   └── package.json            # Dependencies Web Portal
├── database/                   # 🗄️ Cơ sở dữ liệu chuẩn
│   ├── schema.sql              # Cấu trúc 26 bảng CSDL chuẩn
│   └── seed.sql                # Dữ liệu mẫu hoàn chỉnh 500+ bản ghi
├── components/                 # UI Components dùng chung cho Mobile
├── contexts/                   # State Management Mobile: AuthContext, BookingContext, ThemeContext
├── constants/                  # Hằng số, mock data & màu sắc giao diện
├── config/                     # api.ts (Cấu hình IP máy chủ)
├── package.json                # Dependencies Mobile App
└── README.md                   # Tài liệu hướng dẫn dự án
```

---

## 6. Hướng dẫn cài đặt và khởi chạy

### Bước 1: Khởi tạo Cơ sở dữ liệu MySQL

1. Khởi động dịch vụ **MySQL / MariaDB** (qua XAMPP Control Panel hoặc MySQL Server độc lập).
2. Mở trình duyệt vào **phpMyAdmin** (`http://localhost/phpmyadmin`).
3. Tạo database mới tên là `homestay_db`:
   ```sql
   CREATE DATABASE homestay_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Chọn database `homestay_db`, chuyển sang tab **Import**:
   - Chọn file `database/schema.sql` $\to$ Bấm **Import** (hoặc Thực hiện).
   - Tiếp tục chọn file `database/seed.sql` $\to$ Bấm **Import** (hoặc Thực hiện).
   *(Dữ liệu mẫu 520 chỗ nghỉ, 520 đơn phòng, 3120 ảnh chuẩn sẽ được nạp vào hệ thống).*

---

### Bước 2: Khởi chạy Backend Server (Port 3000)

1. Mở cửa sổ dòng lệnh (Terminal/PowerShell), di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Kiểm tra file `.env` (mặc định đã được cấu hình sẵn kết nối MySQL `root` mật khẩu rỗng và cổng 3000).
3. Khởi động server:
   ```bash
   npm run dev
   ```
   *Máy chủ API sẽ chạy tại: `http://localhost:3000` (Kiểm tra tại `http://localhost:3000/api/health`).*

---

### Bước 3: Khởi chạy Web Portal (Port 3001)

1. Mở một cửa sổ dòng lệnh mới, di chuyển vào thư mục `web`:
   ```bash
   cd web
   npm install
   ```
2. Khởi động Web Portal:
   ```bash
   npm run dev:webpack
   ```
   *Cổng Web sẽ chạy tại: `http://localhost:3001` (Bao gồm Cổng Khách hàng, Cổng Chủ nhà `/host` và Cổng Quản trị viên `/admin`).*

---

### Bước 4: Khởi chạy Mobile App (Port 8081 / Expo Go)

1. Mở cửa sổ dòng lệnh tại thư mục gốc của dự án (`appw3`):
   ```bash
   npm install
   ```
2. Cấu hình địa chỉ IP Backend trong file `config/api.ts`:
   - Mở file `config/api.ts`.
   - Cập nhật biến `API_BASE_URL` trỏ tới IP mạng LAN của máy tính bạn (nếu chạy trên điện thoại thật qua Expo Go) hoặc giữ nguyên `http://localhost:3000` (nếu chạy giả lập/trình duyệt).
3. Khởi chạy ứng dụng:
   ```bash
   npx expo start
   ```
4. Trải nghiệm:
   - **Trình duyệt Web:** Bấm phím `w` trên terminal $\to$ Mở tại `http://localhost:8081`.
   - **Điện thoại thật:** Mở app **Expo Go**, quét mã QR trên terminal.
   - **Giả lập Android:** Bấm phím `a`.

---

## 7. Tài khoản thử nghiệm (Demo Credentials)

| Vai trò | Email đăng nhập | Mật khẩu | Phạm vi sử dụng |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@mail.com` | `123456` | Web Admin (`/admin`): Duyệt homestay, duyệt tiền rút, đối soát biên lai, xử lý khiếu nại |
| **Chủ nhà (Host 1)** | `host1@mail.com` | `123456` | Web Host (`/host`): Quản lý homestay, nộp CCCD, quản lý khách đặt |
| **Chủ nhà (Host 2)** | `chuan.nguyen118@gmail.com` | `123456` | Web Host (`/host`): Tài khoản Host Nguyễn Gia Chuẩn |
| **Khách hàng (Customer)** | `phamchuan2608@gmail.com` | `123456` | Mobile App & Web: Đặt phòng, ví tiền, rút tiền, hủy hoàn 70% |
| **Khách hàng (Customer 2)**| `huong@gmail.com` | `123456` | Mobile App & Web: Đặt phòng, đánh giá, khiếu nại |

---

## 8. Danh mục API Endpoints chính

### 🔐 Xác thực & Người dùng
* `POST /api/auth/login`: Đăng nhập tài khoản.
* `POST /api/auth/register`: Đăng ký thành viên mới (Guest/Host).
* `GET /api/users/:id` & `PUT /api/users/:id`: Lấy và cập nhật hồ sơ cá nhân.

### 🏡 Chỗ nghỉ (Properties / Homestays)
* `GET /api/homestays`: Lấy danh sách chỗ nghỉ kèm bộ lọc địa điểm, loại hình, giá.
* `GET /api/homestays/:id`: Xem chi tiết chỗ nghỉ, tiện nghi và lịch kín phòng.
* `POST /api/host/properties`: Chủ nhà đăng chỗ nghỉ mới (`status = pending`).
* `PUT /api/admin/properties/:id/status`: Admin phê duyệt hoặc từ chối chỗ nghỉ.

### 📅 Đặt phòng & Thanh toán
* `POST /api/bookings`: Đặt phòng mới (Transaction Row Lock `FOR UPDATE` chống Overbooking).
* `GET /api/bookings/my-bookings`: Danh sách phòng đã đặt của du khách.
* `POST /api/bookings/:id/payment-proof`: Tải lên minh chứng chuyển khoản VietQR.
* `GET /api/bookings/:id/cancellation-preview`: Xem trước số tiền hoàn theo thời gian thực ($\ge 72h$).
* `POST /api/bookings/:id/cancel`: Hủy phòng và tự động cộng 70% tiền hoàn vào Ví.

### 💳 Ví điện tử & Rút tiền (Wallet & Withdrawals)
* `GET /api/wallet?userId=:id`: Lấy số dư ví, tiền chờ rút.
* `GET /api/wallet/transactions?userId=:id`: Lịch sử giao dịch sổ cái (Ledger).
* `POST /api/wallet/withdraw`: Tạo yêu cầu rút tiền về tài khoản ngân hàng.
* `GET /api/admin/withdrawals`: Admin lấy danh sách lệnh rút tiền.
* `PUT /api/admin/withdrawals/:id/process`: Admin xác nhận chuyển tiền hoặc từ chối (hoàn lại ví).

### 🛡️ Xác minh danh tính Chủ nhà (Host KYC)
* `POST /api/host/verification`: Chủ nhà gửi ảnh 2 mặt CCCD và giấy phép kinh doanh.
* `GET /api/host/verification`: Xem trạng thái xác minh danh tính.
* `GET /api/admin/host-verifications`: Admin xem danh sách hồ sơ CCCD cần duyệt.
* `PUT /api/admin/host-verifications/:hostId/review`: Admin phê duyệt cấp tích xanh hoặc từ chối.

### 💬 Trò chuyện & Khiếu nại (Chat & Disputes)
* `GET /api/bookings/:id/chat`: Lịch sử tin nhắn giữa Khách và Chủ nhà.
* `POST /api/bookings/:id/chat/messages`: Gửi tin nhắn mới.
* `POST /api/disputes`: Gửi khiếu nại và yêu cầu trợ giúp tới Ban Quản Trị.
* `PUT /api/disputes/:id/resolve`: Admin phân xử và giải quyết khiếu nại.
