# BÁO CÁO PHÂN TÍCH TOÀN DIỆN NGHIỆP VỤ & KIẾN TRÚC HỆ THỐNG
# HOMESTAY BOOKING & MULTI-ROLE MANAGEMENT PLATFORM

> **Dự án**: Nền tảng Đặt phòng & Quản lý Homestay Đa Phân Hệ (Mobile App Guest + Next.js Web Admin & Host Portal + REST API Backend + MySQL)  
> **Tài liệu**: Bản đặc tả nghiệp vụ, luồng hoạt động, cấu trúc CSDL và các thuật toán cốt lõi.  
> **Phiên bản**: 3.0 (Sản phẩm hoàn thiện tích hợp đầy đủ 3 phân hệ).

---

## MỤC LỤC
1. [TỔNG QUAN BÀI TOÁN & BỐI CẢNH NGHIỆP VỤ](#1-tổng-quan-bài-toán--bối-cảnh-nghiệp-vụ)
2. [MÔ HÌNH CHỦ THỂ & MA TRẬN PHÂN QUYỀN (RBAC)](#2-mô-hình-chủ-thể--ma-trận-phân-quyền-rbac)
3. [CƠ SỞ DỮ LIỆU & QUAN HỆ THỰC THỂ (DATA ARCHITECTURE)](#3-cơ-sở-dữ-liệu--quan-hệ-thực-thể-data-architecture)
4. [CÁC LUỒNG HOẠT ĐỘNG CHÍNH (BUSINESS WORKFLOWS)](#4-các-luồng-hoạt-động-chính-business-workflows)
   - [4.1. Luồng Xác minh Danh tính Chủ nhà (Host Identity Verification)](#41-luồng-xác-minh-danh-tính-chủ-nhà-host-identity-verification)
   - [4.2. Luồng Kiểm duyệt Chỗ nghỉ (Property Moderation Lifecycle)](#42-luồng-kiểm-duyệt-chỗ-nghỉ-property-moderation-lifecycle)
   - [4.3. Luồng Đặt phòng Online từ Mobile App (Guest Online Booking)](#43-luồng-đặt-phòng-online-từ-mobile-app-guest-online-booking)
   - [4.4. Luồng Đặt phòng Trực tiếp tại Quầy (Host Walk-in Direct Booking)](#44-luồng-đặt-phòng-trực-tiếp-tại-quầy-host-walk-in-direct-booking)
   - [4.5. Cơ chế Đồng bộ & Chống Trùng Lịch Hai Chiều (Cross-Platform Sync)](#45-cơ-chế-đồng-bộ--chống-trùng-lịch-hai-chiều-cross-platform-sync)
   - [4.6. Luồng Thanh toán, Biên lai Chuyển khoản & Duyệt tài chính](#46-luồng-thanh-toán-biên-lai-chuyển-khoản--duyệt-tài-chính)
   - [4.7. Mô hình Phân chia Dòng tiền & Hoa hồng Nền tảng (Revenue Split)](#47-mô-hình-phân-chia-dòng-tiền--hoa-hồng-nền-tảng-revenue-split)
   - [4.8. Máy trạng thái Đặt phòng (Booking State Machine)](#48-máy-trạng-thái-đặt-phòng-booking-state-machine)
   - [4.9. Chính sách Hủy phòng & Hoàn tiền (Cancellation Policy)](#49-chính-sách-hủy-phòng--hoàn-tiền-cancellation-policy)
   - [4.10. Hệ thống Đánh giá & Tích lũy Điểm thưởng (Loyalty Program)](#410-hệ-thống-đánh-giá--tích-lũy-điểm-thưởng-loyalty-program)
   - [4.11. Hệ thống Xử lý Khiếu nại & Tranh chấp (Trust & Safety Disputes)](#411-hệ-thống-xử-lý-khiếu-nại--tranh-chấp-trust--safety-disputes)
5. [CÁC THUẬT TOÁN BẮT BUỘC & CƠ CHẾ KỸ THUẬT (NO MACHINE LEARNING)](#5-các-thuật-toán-bắt-buộc--cơ-chế-kỹ-thuật-no-machine-learning)
   - [5.1. Thuật toán Kiểm tra Trùng lịch Phòng (Date Overlap Detection)](#51-thuật-toán-kiểm-tra-trùng-lịch-phòng-date-overlap-detection)
   - [5.2. Chống Tranh chấp Kép bằng Concurrency Lock (Transaction + Row Locking)](#52-chống-tranh-chấp-kép-bằng-concurrency-lock-transaction--row-locking)
   - [5.3. Thuật toán Khoảng cách Địa lý Haversine (Geodesic Distance)](#53-thuật-toán-khoảng-cách-địa-lý-haversine-geodesic-distance)
   - [5.4. Thuật toán Xếp hạng Chỗ nghỉ Tất định (Weighted Property Ranking)](#54-thuật-toán-xếp-hạng-chỗ-nghỉ-tất-định-weighted-property-ranking)
   - [5.5. Đánh giá Điểm Rủi ro theo Luật Nghiệp vụ (Rule-Based Risk Scoring)](#55-đánh-giá-điểm-rủi-ro-theo-luật-nghiệp-vụ-rule-based-risk-scoring)
   - [5.6. Giới hạn Tần suất Truy cập (Rate Limiting)](#56-giới-hạn-tần-suất-truy-cập-rate-limiting)
   - [5.7. Nhật ký Kiểm toán Hoạt động Quan trọng (Audit Trail Logging)](#57-nhật-ký-kiểm-toán-hoạt-động-quan-trọng-audit-trail-logging)
6. [KIẾN TRÚC ĐA NỀN TẢNG (HYBRID ARCHITECTURE)](#6-kiến-trúc-đa-nền-tảng-hybrid-architecture)
7. [MA TRẬN KIỂM THỬ CÁC CA BIÊN (EDGE CASES & TESTING MATRIX)](#7-ma-trận-kiểm-thử-các-ca-biên-edge-cases--testing-matrix)
8. [TỔNG KẾT BÀI TOÁN](#8-tổng-kết-bài-toán)

---

# 1. TỔNG QUAN BÀI TOÁN & BỐI CẢNH NGHIỆP VỤ

### 1.1. Vấn đề thực tế trong ngành lưu trú Homestay
Thị trường Homestay, Villa nghỉ dưỡng tại Việt Nam (Đà Lạt, Sa Pa, Phú Quốc, Hội An, Nha Trang, Ninh Bình...) có những đặc trưng khác biệt so với chuỗi khách sạn truyền thống:
1. **Chủ nhà (Host) phần lớn là cá nhân hoặc hộ gia đình**: Không có hệ thống PMS (Property Management System) đắt tiền, chủ yếu quản lý lịch bằng sổ tay, Zalo, Excel hoặc cuộc gọi hotline.
2. **Nguy cơ Overbooking (Trùng lịch phòng)**: Một homestay vừa đăng bán trên ứng dụng di động cho khách lẻ, vừa tiếp nhận khách vãng lai (walk-in) hoặc khách gọi điện đặt trực tiếp. Nếu không có cơ chế đồng bộ và khóa lịch thời gian thực, việc hai khách cùng nhận một phòng vào một ngày là điều chắc chắn xảy ra.
3. **Mâu thuẫn niềm tin (Trust & Safety)**:
   - Khách lo sợ "homestay ảo", hình ảnh mạng không đúng thực tế, hoặc chuyển khoản cọc nhưng đến nơi chủ nhà từ chối nhận phòng.
   - Sàn lo ngại các chủ nhà không xác thực danh tính (gian lận, lừa cọc, trốn hoa hồng).
   - Chủ nhà lo ngại việc khách đặt "ảo" làm giam phòng trong mùa cao điểm.
4. **Trải nghiệm đa thiết bị**:
   - Khách du lịch cần ứng dụng di động (Mobile App) gọn nhẹ, trực quan, thao tác đặt phòng nhanh dưới 1 phút.
   - Chủ nhà và Nhà điều hành sàn cần giao diện Web màn hình lớn (Desktop-first) để đối soát doanh thu, xuất báo cáo tài chính, xem ảnh biên lai chuyển khoản và thao tác quản lý lịch.
   - Nhân viên lễ tân tại quầy cần màn hình nhanh (Quick Manage) thao tác trên máy tính bảng/điện thoại mà không cần phải đăng nhập tài khoản phức tạp.

### 1.2. Mô hình bài toán tổng thể
Hệ thống giải quyết bài toán trên thông qua mô hình **Hybrid Platform**:
* **Mobile Guest App (React Native Expo)**: Kênh chính cho khách du lịch tìm kiếm, lọc homestay, xem phòng, đặt phòng, áp voucher, chuyển khoản VietQR và nộp minh chứng biên lai.
* **Host Web Portal (Next.js 16)**: Kênh cho chủ nhà đăng tin phòng nghỉ, theo dõi lịch đón khách, kiểm tra doanh thu thực nhận (`host_payout`), và **đặc biệt là tạo đơn đặt phòng trực tiếp tại quầy (Direct Walk-in)** để khóa ngày ngay lập tức.
* **Super Admin Portal (Next.js 16)**: Kênh cho nhà điều hành duyệt homestay, xác minh căn cước chủ nhà, duyệt biên lai chuyển khoản, giải quyết khiếu nại (disputes) và giám sát dòng tiền hoa hồng sàn.
* **REST API & MySQL Database (Node.js/Express)**: "Single Source of Truth" duy nhất thực thi toàn bộ logic nghiệp vụ, tính toán dòng tiền và khóa giao dịch (Transaction Lock).

---

# 2. MÔ HÌNH CHỦ THỂ & MA TRẬN PHÂN QUYỀN (RBAC)

Hệ thống quản lý 4 nhóm vai trò (Roles) trong CSDL:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        HOMESTAY ACTORS MATRIX                          │
├───────────────┬────────────────────────────────────────────────────────┤
│ GUEST         │ Người thuê homestay (Mobile App & Guest Web)           │
│ HOST          │ Chủ cơ sở lưu trú (Host Web Portal)                    │
│ ADMIN         │ Nhà điều hành sàn / Quản trị viên (Super Admin Portal) │
│ STAFF         │ Nhân viên hỗ trợ vận hành sàn                          │
└───────────────┴────────────────────────────────────────────────────────┘
```

### 2.1. Ma trận phân quyền chức năng (Functional Permission Matrix)

| Chức năng / Hành động | Guest | Host | Admin | Lễ tân (Token) | Ghi chú an ninh |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Tìm kiếm & Xem Homestay** | ✅ | ✅ | ✅ | ✅ | Chỉ xem homestay có `status = 'approved'` & `is_active = 1` |
| **Đặt phòng Online (Mobile)** | ✅ | ❌ | ❌ | ❌ | Tạo đơn phòng `source = 'guest_online'` |
| **Upload biên lai thanh toán** | ✅ | ❌ | ❌ | ❌ | Chỉ upload cho đơn của chính mình (`user_id == req.user.id`) |
| **Hủy đơn phòng của mình** | ✅ | ❌ | ❌ | ❌ | Không được hủy đơn đã hoàn thành (`completed`) |
| **Đăng bán Homestay mới** | ❌ | ✅ | ✅ | ❌ | Tạo ở trạng thái `pending` chờ Admin duyệt |
| **Sửa/Xóa Homestay của mình** | ❌ | ✅ | ✅ | ❌ | **Chống IDOR**: Host A không thể sửa homestay của Host B |
| **Đặt phòng tại quầy (Walk-in)** | ❌ | ✅ | ✅ | ✅ | Tạo đơn `source = 'host_direct'`, tự động khóa ngày |
| **Xem doanh thu thực nhận** | ❌ | ✅ | ✅ | ❌ | Chỉ xem doanh thu thuộc homestay do mình sở hữu |
| **Nộp hồ sơ xác minh CCCD/Giấy phép** | ❌ | ✅ | ❌ | ❌ | Host gửi ảnh 2 mặt CCCD, chuyển `status = 'pending'` |
| **Duyệt hồ sơ xác minh Chủ nhà** | ❌ | ❌ | ✅ | ❌ | Phê duyệt hoặc từ chối kèm lý do |
| **Phê duyệt / Từ chối Homestay** | ❌ | ❌ | ✅ | ❌ | Lưu lý do từ chối, gửi thông báo |
| **Xác nhận thanh toán (Duyệt đơn)** | ❌ | ❌ | ✅ | ❌ | Chuyển trạng thái sang `confirmed` (Đặt phòng thành công) |
| **Điều chỉnh tỷ lệ hoa hồng sàn** | ❌ | ❌ | ✅ | ❌ | Cấu hình bảng `app_settings` |
| **Giải quyết Khiếu nại / Tranh chấp** | Gửi | Bị báo cáo | Phân xử | ❌ | Hoàn tiền, cảnh cáo hoặc khóa tài khoản |
| **Xem Nhật ký kiểm toán (Audit Logs)**| ❌ | ❌ | ✅ | ❌ | Lưu vết mọi tác vụ duyệt/hủy/giải quyết tranh chấp |

### 2.2. Kiểm soát Quyền mức Đối tượng (Object-Level Authorization)
Backend nghiêm cấm việc chỉ ẩn nút bấm ở Frontend. Bất kỳ API chỉnh sửa/hủy nào cũng phải kiểm tra quyền sở hữu:
```js
// Kiểm tra Object-level Authorization
const homestay = await HomestayModel.findById(homestayId);
if (req.user.role !== 'admin' && String(homestay.host_id) !== String(req.user.id)) {
  return res.status(403).json({ message: 'Bạn không có quyền can thiệp vào Homestay của chủ nhà khác!' });
}
```

---

# 3. CƠ SỞ DỮ LIỆU & QUAN HỆ THỰC THỂ (DATA ARCHITECTURE)

Hệ thống được thiết kế trên chuẩn cơ sở dữ liệu quan hệ (RDBMS MySQL / MariaDB InnoDB), hỗ trợ khóa giao dịch ACID:

```text
               ┌───────────────┐
               │     USERS     │
               └───────┬───────┘
                       │ 1:N
         ┌─────────────┼─────────────┬──────────────┐
         │ 1:1         │ 1:N         │ 1:N          │ 1:N
         ▼             ▼             ▼              ▼
┌────────────────┐ ┌───────┐ ┌──────────────┐ ┌──────────┐
│HOST_VERIFICAT'N│ │HOMEST.│ │ POINT_TRANS  │ │ DISPUTES │
└────────────────┘ └───┬───┘ └──────────────┘ └──────────┘
                       │ 1:N
         ┌─────────────┼─────────────┐
         │ 1:N         │ N:N         │ 1:N
         ▼             ▼             ▼
┌────────────────┐ ┌───────┐ ┌──────────────┐
│HOMESTAY_IMAGES │ │AMENITY│ │   BOOKINGS   │
└────────────────┘ └───────┘ └───────┬──────┘
                                     │ 1:1
                                     ▼
                             ┌──────────────┐
                             │   PAYMENTS   │
                             └──────────────┘
```

### 3.1. Các thực thể dữ liệu nòng cốt

#### 1. Bảng `users` (Quản lý đa vai trò)
* `id` (BIGINT, PK): Định danh duy nhất.
* `name`, `full_name`, `email` (UNIQUE), `password_hash`, `password`.
* `role`: `ENUM('customer', 'admin', 'staff', 'host', 'guest')`.
* `phone`, `address`, `location`, `avatar_url`, `reward_points` (điểm thưởng tích lũy).
* `is_verified` (TINYINT): Đã xác minh CCCD/giấy phép kinh doanh hay chưa.
* `status`: `ENUM('active', 'blocked')`.

#### 2. Bảng `homestays` / `properties` (Cơ sở lưu trú)
* `id` (BIGINT, PK).
* `host_id` (FK -> `users.id`): Chủ sở hữu homestay.
* `name` / `title`, `description`, `price` (giá/đêm), `old_price`.
* `location_id` (FK -> `locations.id`), `type_id` (FK -> `homestay_types.id`).
* `max_guests`, `bedrooms`, `bathrooms`.
* `latitude`, `longitude`: Tọa độ địa lý dùng cho thuật toán định vị Haversine.
* `approval_status`: `ENUM('pending', 'approved', 'rejected')` (kiểm duyệt của Admin).
* `manage_token` (VARCHAR(80), UNIQUE): Token truy cập nhanh cho lễ tân quầy (`HMTOKEN_0001`).
* `is_active` (TINYINT): Bật/tắt kinh doanh.

#### 3. Bảng `bookings` (Đơn đặt phòng đa nguồn)
* `id` (BIGINT, PK).
* `booking_code` (VARCHAR(30), UNIQUE): Mã đơn hiển thị (`BK20260918001` cho online, `HD20260918001` cho tại quầy).
* `user_id` (BIGINT NULL, FK -> `users.id`): NULL nếu là khách vãng lai đặt tại quầy.
* `guest_name`, `guest_phone`: Lưu thông tin khách vãng lai khi không có tài khoản app.
* `homestay_id` / `property_id` (FK -> `homestays.id`).
* `check_in`, `check_out`: Ngày nhận/trả phòng (DATE).
* `guests`, `nights`, `price_per_night`.
* `discount_amount`, `total_price`: Tổng tiền khách phải thanh toán.
* **Chỉ số tài chính phân bổ**:
  - `commission_rate` (DECIMAL): Tỷ lệ hoa hồng sàn (mặc định 10% online, 5% tại quầy).
  - `commission_amount` (DECIMAL): Tiền hoa hồng nền tảng thực thu.
  - `host_payout_amount` (DECIMAL): Tiền thực nhận của chủ homestay (`total_price - commission_amount`).
* `status`: `ENUM('pending', 'confirmed', 'cancelled', 'completed')`.
* `source`: `ENUM('guest_online', 'host_direct', 'admin_manual')`.
* `notes` (ghi chú của khách), `host_note` (ghi chú riêng của chủ nhà / lễ tân).
* `cancelled_at`, `cancelled_reason`.

#### 4. Bảng `payments` (Lịch sử thanh toán & Minh chứng)
* `id` (BIGINT, PK).
* `booking_id` (FK -> `bookings.id`, ON DELETE CASCADE).
* `payment_method`: `ENUM('cash', 'bank_transfer', 'vnpay', 'momo')`.
* `amount`: Số tiền thanh toán.
* `proof_image_url`: Đường dẫn ảnh chụp biên lai chuyển khoản ngân hàng do khách upload.
* `transaction_code`: Mã tham chiếu ngân hàng (FT...).
* `status`: `ENUM('pending', 'completed', 'failed', 'refunded')`.
* `paid_at`: Thời điểm ghi nhận thanh toán thành công.

#### 5. Bảng `host_verifications` (Hồ sơ xác minh danh tính Chủ nhà)
* `id` (BIGINT, PK).
* `host_id` (BIGINT, UNIQUE, FK -> `users.id`).
* `id_card_number` (CCCD/Hộ chiếu).
* `id_card_front_url`, `id_card_back_url` (Ảnh 2 mặt giấy tờ tùy thân).
* `business_license_url` (Giấy phép kinh doanh lưu trú nếu có).
* `status`: `ENUM('draft', 'pending', 'approved', 'rejected')`.
* `rejection_reason` (Lý do Admin từ chối hồ sơ).
* `reviewed_by` (FK -> `users.id`), `reviewed_at`.

#### 6. Bảng `disputes` (Báo cáo & Khiếu nại Trust & Safety)
* `id` (BIGINT, PK).
* `reporter_id` (FK -> `users.id`), `reporter_role` (`guest` hoặc `host`).
* `target_type`: `ENUM('property', 'host', 'booking')`.
* `target_id`: ID của đối tượng bị báo cáo.
* `booking_id` (FK NULL).
* `reason`: Lý do (Homestay ảo, vắng mặt, sai khác thực tế, lừa cọc...).
* `description`, `evidence_url` (ảnh/video chứng cứ).
* `status`: `ENUM('pending', 'investigating', 'resolved', 'dismissed')`.
* `admin_note`: Ghi chú điều tra của Quản trị viên.
* `resolution_action`: `ENUM('none', 'refund', 'suspend_host', 'suspend_property', 'warning')`.
* `resolved_by` (FK -> `users.id`), `resolved_at`.

#### 7. Bảng `audit_logs` (Nhật ký kiểm toán)
* `id` (BIGINT, PK).
* `actor_id` (Người thực hiện), `actor_role`.
* `action`: Tên hành động (`property_approve`, `booking_cancel`, `dispute_resolve`...).
* `entity_type`, `entity_id`.
* `metadata`: Dữ liệu JSON mô tả chi tiết sự thay đổi.
* `ip_address`, `created_at`.

#### 8. Bảng `app_settings` (Cấu hình nền tảng)
* Lưu trữ cặp key-value: `platform_commission_rate = 10` (%), `direct_commission_rate = 5` (%), `usd_to_vnd_rate = 25000`.

---

# 4. CÁC LUỒNG HOẠT ĐỘNG CHÍNH (BUSINESS WORKFLOWS)

```text
                               LUỒNG HOẠT ĐỘNG TỔNG THỂ
                               
  [ CHỦ HOMESTAY ]                         [ ADMIN SÀN ]                         [ KHÁCH DU LỊCH ]
         │                                       │                                       │
  1. Đăng ký & Nộp CCCD ──────────────────► 2. Duyệt Host                                │
         │                                       │                                       │
  3. Đăng tin Homestay  ──────────────────► 4. Duyệt Homestay                            │
         │                                       │                                       │
         │                                       │◄─── 5. Tìm kiếm & Đặt phòng (Mobile) ─┤
         │                                       │     (Kiểm tra trùng lịch & khóa lock) │
         │                                       │                                       │
         │                                       │◄─── 6. Khách chuyển khoản & Up bill ──┤
         │                                       │                                       │
         │                                  7. Duyệt đơn & Xác nhận                      │
         │                                       │                                       │
  8. Tiếp đón khách tại Homestay ◄───────────────┴───────────────────────────────────────┤
     (Hoặc Lễ tân tạo đơn trực tiếp tại quầy)                                            │
         │                                                                               │
         │                                                                          9. Trả phòng &
         │                                                                             Đánh giá 5★
```

### 4.1. Luồng Xác minh Danh tính Chủ nhà (Host Identity Verification)
1. Host đăng ký tài khoản trên Web với `role = 'host'`.
2. Trạng thái xác minh ban đầu: `draft`. Host chưa được phép mở bán phòng công khai nếu sàn kích hoạt chính sách Verified Only.
3. Host vào mục **Hồ sơ Chủ nhà** $\rightarrow$ Tải ảnh 2 mặt CCCD và giấy phép kinh doanh $\rightarrow$ Trạng thái chuyển thành `pending`.
4. Admin nhận hồ sơ tại mục **Xác minh Chủ Homestay**:
   - Nếu thông tin trùng khớp: Admin ấn **"Phê duyệt"** $\rightarrow$ Trạng thái chuyển `approved`, cờ `users.is_verified = 1`, ghi audit log.
   - Nếu ảnh mờ/giả mạo: Admin ấn **"Từ chối"**, nhập lý do (VD: *"Ảnh mặt sau CCCD bị mờ số"*). Host nhận được thông báo, có quyền chỉnh sửa ảnh và nộp lại (Resubmit).

### 4.2. Luồng Kiểm duyệt Chỗ nghỉ (Property Moderation Lifecycle)
1. Host tạo mới Homestay: Điền tên, loại hình, giá, số khách, tọa độ, tiện nghi và tải lên album ảnh.
2. Homestay được tạo với `approval_status = 'pending'`, `is_active = 1`.
3. Trong trạng thái `pending`: Homestay **hoàn toàn ẩn** đối với khách trên Mobile App và bộ tìm kiếm công khai.
4. Admin vào mục **Duyệt Homestay**:
   - Xem thông tin, kiểm tra chất lượng ảnh, giá cả và vị trí.
   - **Duyệt**: `approval_status = 'approved'`. Homestay xuất hiện tức thì trên App Mobile.
   - **Từ chối**: `approval_status = 'rejected'`, ghi rõ lý do. Host có thể sửa đổi nội dung và gửi lại.
   - **Tạm đình chỉ (Suspend)**: Nếu homestay bị nhiều khách khiếu nại, Admin có thể hạ homestay bất cứ lúc nào (`is_active = 0`).

### 4.3. Luồng Đặt phòng Online từ Mobile App (Guest Online Booking)
1. Khách hàng mở App Mobile, tìm homestay theo Địa điểm, xem Chi tiết và Đánh giá.
2. Khách mở Lịch: Chọn ngày Check-in và Check-out $\rightarrow$ Hệ thống tự động tính số đêm và kiểm tra tính khả dụng.
3. Khách chọn Voucher giảm giá (nếu có trong ví voucher cá nhân).
4. Khách bấm **"Đặt phòng ngay"**:
   - Backend mở Transaction, khóa hàng CSDL, kiểm tra chống trùng lịch 100%.
   - Tạo bản ghi `bookings` với `status = 'pending'`, `source = 'guest_online'`.
   - Tính hoa hồng sàn 10% và tạo bản ghi `payments` với `status = 'pending'`.
   - Cộng +100 điểm thưởng thành viên vào ví cho khách.
5. Màn hình Mobile hiển thị thông báo thành công và chuyển khách sang màn hình Đặt phòng của tôi.

### 4.4. Luồng Đặt phòng Trực tiếp tại Quầy (Host Walk-in Direct Booking)
Nghiệp vụ thực tế: Khách đến tận nơi hoặc gọi điện hotline đặt phòng:
1. Chủ homestay hoặc nhân viên lễ tân mở **Host Web Portal** (hoặc mở đường dẫn nhanh `/quick-manage/[token]`).
2. Bấm nút **"➕ Đặt phòng tại quầy (Khách Walk-in)"**.
3. Điền thông tin nhanh: Tên khách hàng, Số điện thoại, Chọn ngày đến/đi, Số khách, Hình thức tiền mặt/chuyển khoản.
4. **Bảng tính tiền tự động thời gian thực (Live Financial Preview)**:
   - Hiển thị số đêm: `X đêm`.
   - Tổng tiền phòng: `Y ₫`.
   - Hoa hồng nền tảng (5% cho đơn tại quầy): `-Z ₫`.
   - **Chủ nhà thực nhận (95%): `W ₫`**.
5. Bấm **"Tạo đơn & Khóa lịch ngay"**:
   - Hệ thống kiểm tra chống trùng lịch với toàn bộ đơn online và tại quầy khác.
   - Tạo đơn phòng `source = 'host_direct'`, `guest_name`, `guest_phone`, `status = 'confirmed'`.
   - **Khoảng ngày này lập tức bị khóa trên ứng dụng Mobile**; khách online tra cứu ngày này sẽ thấy báo phòng đã kín.

### 4.5. Cơ chế Đồng bộ & Chống Trùng Lịch Hai Chiều (Cross-Platform Sync)
Hệ thống loại bỏ hoàn toàn tình trạng "lệch pha" giữa Mobile và Web:
* **Khách đặt trên Mobile** $\rightarrow$ Xuất hiện ngay trong bảng Đơn phòng của Host trên Web với nhãn `📱 App Mobile`. Lịch trên Web tự động khóa.
* **Host đặt tại quầy trên Web** $\rightarrow$ Lịch trên Mobile App lập tức chuyển sang trạng thái đã kín, không ai có thể đặt trùng.
* **Admin duyệt đơn/hủy đơn trên Web** $\rightarrow$ Trạng thái trên App Mobile của khách đổi tức thì từ `Chờ duyệt` sang `Đặt phòng thành công` hoặc `Đã hủy`.

### 4.6. Luồng Thanh toán, Biên lai Chuyển khoản & Duyệt tài chính
Hệ thống áp dụng quy trình kiểm soát thanh toán an toàn (thay vì cổng thanh toán giả lập):
1. **Khách thanh toán chuyển khoản**:
   - Khách mở chi tiết đơn trên Mobile $\rightarrow$ Nhấn **"Thanh toán"**.
   - Màn hình xuất hiện **Mã VietQR động** (MB Bank, STK, số tiền chính xác từng đồng và nội dung chuyển khoản là mã đơn `BK2026...`).
   - Khách quét mã chuyển khoản qua app ngân hàng của mình.
   - Khách chụp ảnh màn hình giao dịch thành công và tải lên ứng dụng (Upload Payment Proof).
2. **Chuyển đổi trạng thái thanh toán**:
   - Trạng thái thanh toán chuyển thành `Đã thanh toán CK` (`payment_status = 'completed'` / `proof_uploaded`).
   - Trạng thái đặt phòng (`booking.status`) **vẫn giữ nguyên là `pending`** (Chờ Web Admin duyệt).
3. **Quản trị viên kiểm tra & Duyệt đơn**:
   - Admin đăng nhập Web Portal, vào danh sách đơn phòng.
   - Nhìn thấy badge `✓ Đã thanh toán`, bấm nút **"Xem biên lai"** $\rightarrow$ Modal phóng to ảnh chụp màn hình chuyển khoản của khách.
   - Admin kiểm tra số tiền và mã giao dịch. Bấm nút **"Duyệt"**:
     - `booking.status` chuyển thành `confirmed` (Đặt phòng thành công).
     - Khách mở App Mobile sẽ thấy phòng đã được xác nhận chính thức.

### 4.7. Mô hình Phân chia Dòng tiền & Hoa hồng Nền tảng (Revenue Split)
Hệ thống tự động hạch toán tài chính trên từng đơn đặt phòng:

$$\text{Tổng tiền khách trả (Gross)} = \text{Giá mỗi đêm} \times \text{Số đêm} - \text{Chiết khấu Voucher}$$

$$\text{Hoa hồng Nền tảng (Platform Commission)} = \text{Gross} \times \text{Commission Rate}$$

$$\text{Tiền Chủ Homestay thực nhận (Host Payout)} = \text{Gross} - \text{Platform Commission}$$

* **Tỷ lệ hoa hồng**:
  - Đơn khách đặt qua App Mobile (`guest_online`): **10%** (Hoa hồng sàn chuẩn OTA).
  - Đơn chủ nhà tự đặt tại quầy (`host_direct`): **5%** (Phí phần mềm quản lý nhẹ).
* **Báo cáo đối soát**: Cả Admin và Host đều có màn hình thống kê doanh thu phân tách minh bạch: Doanh số gộp, Tiền hoa hồng sàn thu, và Tiền thực chuyển về tài khoản ngân hàng của Host.

### 4.8. Máy trạng thái Đặt phòng (Booking State Machine)

Hệ thống kiểm soát chặt chẽ quy tắc chuyển đổi trạng thái (Transition Invariants), nghiêm cấm việc chuyển trạng thái bất hợp lệ:

```text
               ┌───────────────┐
               │    PENDING    │ (Chờ thanh toán / Chờ duyệt)
               └───────┬───────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│    CONFIRMED    │         │    CANCELLED    │ (Khách hủy hoặc
└────────┬────────┘         └─────────────────┘  Admin từ chối)
         │
         ▼
┌─────────────────┐
│    COMPLETED    │ (Khách đã lưu trú & trả phòng)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    REVIEWED     │ (Khách viết đánh giá 5★ & nhận điểm thưởng)
└─────────────────┘
```

* **Quy tắc bắt buộc**:
  - Đơn đã `completed` hoặc `cancelled` **không bao giờ** được chuyển ngược lại `pending`.
  - Chỉ đơn có `status = 'completed'` mới được phép mở quyền viết đánh giá (Review & Rating).
  - Khách chỉ được hủy khi đơn chưa chuyển sang `completed`.

### 4.9. Chính sách Hủy phòng & Hoàn tiền (Cancellation Policy)
1. Khách hàng bấm biểu tượng thùng rác trên Mobile:
   - Hệ thống hiển thị hộp thoại xác nhận hủy đơn gốc (`Alert.alert`).
   - Khi khách xác nhận: Gọi API `PUT /api/bookings/:id/cancel`.
   - Trạng thái đơn chuyển thành `cancelled`, lưu thời điểm `cancelled_at` và lý do hủy.
   - Nếu đơn trước đó đã thanh toán: Trạng thái thanh toán tự động chuyển sang `refunded` (chờ hoàn tiền theo quy định sàn).
   - Ngay lập tức, khoảng ngày của đơn này được giải phóng, người khác có thể đặt lại.

### 4.10. Hệ thống Đánh giá & Tích lũy Điểm thưởng (Loyalty Program)
* **Tích điểm**:
  - Đặt phòng thành công: Tặng ngay **+100 điểm thưởng** vào ví.
  - Hoàn thành chuyến đi & Đánh giá dịch vụ 5 sao: Tặng thêm **+150 điểm thưởng**.
* **Đổi Voucher**:
  - Khách dùng điểm tích lũy đổi các mã giảm giá giá trị cao (VD: 200 điểm đổi voucher 100.000₫).
  - Điểm bị trừ được ghi nhật ký minh bạch trong bảng `point_transactions`.
* **Chống gian lận đánh giá (Review Fraud Protection)**:
  - Khách không thể đánh giá nếu chưa từng đặt phòng hoặc chưa hoàn tất chuyến đi (`completed`).
  - Mỗi đơn đặt phòng chỉ được gửi đánh giá duy nhất 1 lần.

### 4.11. Hệ thống Xử lý Khiếu nại & Tranh chấp (Trust & Safety Disputes)
1. **Khách hàng hoặc Chủ nhà gửi báo cáo**: Chọn lý do vi phạm (Chỗ nghỉ không có thật, Chủ nhà không ra đón, Chỗ nghỉ bẩn thỉu khác xa ảnh chụp, Khách gây rối...).
2. Đơn khiếu nại được tạo ở trạng thái `pending`.
3. **Quản trị viên (Admin) điều tra**:
   - Xem bằng chứng ảnh/video và thông tin liên hệ của 2 bên.
   - Đưa ra quyết định giải quyết:
     - `refund`: Hoàn trả 100% tiền cọc cho khách.
     - `suspend_property`: Gỡ bỏ homestay vi phạm khỏi sàn.
     - `suspend_host`: Khóa vĩnh viễn tài khoản của chủ nhà gian lận.
     - `warning`: Cảnh cáo vi phạm nhẹ.
4. Mọi quyết định của Admin được lưu vết vào `audit_logs`.

---

# 5. CÁC THUẬT TOÁN BẮT BUỘC & CƠ CHẾ KỸ THUẬT (NO MACHINE LEARNING)

Toàn bộ hệ thống được xây dựng trên nền tảng **thuật toán tất định (Deterministic Algorithms)**, toán học thuần túy và cơ chế khóa CSDL chuẩn mực, tuyệt đối **không sử dụng Machine Learning hay AI black-box**:

### 5.1. Thuật toán Kiểm tra Trùng lịch Phòng (Date Overlap Detection)
* **Vấn đề**: Làm sao biết khoảng ngày khách muốn đặt $[\text{newIn}, \text{newOut}]$ có bị đè lên bất kỳ khoảng ngày đã có người đặt trước $[\text{existIn}, \text{existOut}]$ hay không?
* **Công thức toán học**:
  $$\text{Overlap} \iff (\text{newIn} < \text{existOut}) \land (\text{newOut} > \text{existIn})$$
* **Chứng minh các trường hợp thực tế**:
  - *Trường hợp A (Khách cũ trả phòng 05/10, khách mới nhận phòng đúng ngày 05/10)*:  
    $01/10 < 08/10$ (True) nhưng $05/10 > 05/10$ (**False**) $\implies$ Kết quả: **`False` (Không trùng lịch)**.  
    $\rightarrow$ Đúng chuẩn ngành khách sạn: Khách cũ trả phòng buổi trưa, khách mới nhận phòng buổi chiều cùng ngày!
  - *Trường hợp B (Khách mới đặt từ 03/10 đến 07/10, đè vào giữa kỳ nghỉ cũ 01/10 - 05/10)*:  
    $03/10 < 05/10$ (True) và $07/10 > 01/10$ (True) $\implies$ Kết quả: **`True` (Trùng lịch, lập tức từ chối!)**.
  - *Trường hợp C (Khách mới đặt trọn gói bao trùm hoặc nằm lọt thỏm bên trong)*:  
    Cả 2 điều kiện đều True $\implies$ Báo trùng lịch chính xác 100%.

### 5.2. Chống Tranh chấp Kép bằng Concurrency Lock (Transaction + Row Locking)
* **Nguy cơ Race Condition**: Giả sử phòng chỉ còn trống từ ngày 10/10 - 15/10. Đúng 12:00:00, Khách A bấm Đặt trên App Mobile và cùng lúc Lễ tân B bấm Đặt tại quầy trên Web. Nếu chỉ dùng câu lệnh SELECT thông thường, cả 2 luồng đều thấy phòng trống và cùng tiến hành INSERT $\rightarrow$ **Double Booking thảm họa!**
* **Giải pháp Kỹ thuật**:
  Sử dụng **Giao dịch Cơ sở dữ liệu (Database Transaction)** với cơ chế **Khóa hàng độc quyền (`FOR UPDATE`)**:
  ```javascript
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Khóa dòng Homestay - Mọi luồng khác phải xếp hàng đợi luồng này xong
    const [homestay] = await conn.query(
      'SELECT id, price, is_active FROM homestays WHERE id = ? FOR UPDATE',
      [homestayId]
    );

    // 2. Khóa và đếm số đơn trùng lịch
    const [conflicts] = await conn.query(
      `SELECT COUNT(*) AS conflict_count FROM bookings
       WHERE homestay_id = ? AND status IN ('pending', 'confirmed')
         AND check_in < ? AND check_out > ?
       FOR UPDATE`,
      [homestayId, checkOut, checkIn]
    );

    if (conflicts[0].conflict_count > 0) {
      throw new Error('Homestay đã có khách đặt trong khoảng thời gian này!');
    }

    // 3. Tiến hành ghi nhận đơn phòng và thanh toán
    await conn.query('INSERT INTO bookings ...');
    await conn.query('INSERT INTO payments ...');

    // 4. Xác nhận giao dịch
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  ```
  Nhờ có `FOR UPDATE`, luồng nào đến trước sẽ giữ khóa; luồng thứ hai bắt buộc phải chờ luồng thứ nhất commit xong mới được đọc, lúc này luồng 2 sẽ thấy số lượng conflict = 1 và bị chặn lại ngay lập tức!

### 5.3. Thuật toán Khoảng cách Địa lý Haversine (Geodesic Distance)
* **Vị trí**: `backend/src/services/ranking.service.js`.
* **Mục đích**: Tính chính xác khoảng cách đường chim bay giữa vị trí hiện tại của khách du lịch và tọa độ của từng homestay trên mặt cầu trái đất.
* **Công thức**:
  $$d = 2R \times \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
  Trong đó:
  - $\phi_1, \phi_2$: Vĩ độ của 2 điểm (radian).
  - $\Delta \phi = \phi_2 - \phi_1$, $\Delta \lambda = \lambda_2 - \lambda_1$ (chênh lệch kinh độ).
  - $R = 6371\text{ km}$ (bán kính trung bình của Trái Đất).
* **Ứng dụng**: Cho phép khách chọn tính năng *"Tìm homestay gần tôi nhất"* hoặc lọc *"Trong bán kính 5km, 10km"*.

### 5.4. Thuật toán Xếp hạng Chỗ nghỉ Tất định (Weighted Property Ranking)
* **Vị trí**: `backend/src/services/ranking.service.js`.
* **Nguyên tắc**: Thay vì dùng mô hình AI khó giải thích, sàn sử dụng công thức tính điểm trọng số minh bạch:
  $$\text{Ranking Score} = (\text{Rating} \times 20) + (\min(\text{Reviews}, 50) \times 0.4) + (\text{isFeatured} \times 15) + (\text{isHostVerified} \times 15)$$
* **Ý nghĩa các trọng số**:
  - `Rating * 20`: Điểm đánh giá sao của khách (5 sao $\rightarrow$ 100 điểm tối đa).
  - `ReviewCount * 0.4`: Số lượng đánh giá cộng đồng (tối đa 20 điểm), khuyến khích các homestay có uy tín lâu năm.
  - `+15 điểm`: Ưu tiên cho chỗ nghỉ được ban quản trị gắn cờ đề xuất (`is_featured`).
  - `+15 điểm`: Ưu tiên vượt trội cho các Chủ nhà đã hoàn tất xác minh CCCD chính chủ (`is_host_verified`), loại bỏ nguy cơ homestay lừa đảo.

### 5.5. Đánh giá Điểm Rủi ro theo Luật Nghiệp vụ (Rule-Based Risk Scoring)
* **Vị trí**: `backend/src/services/risk.service.js`.
* **Mục đích**: Tự động phát hiện các tín hiệu bất thường cảnh báo cho Quản trị viên (Admin) lưu ý kiểm tra, không tùy tiện phán xét lừa đảo.
* **Các luật tính điểm rủi ro**:
  1. Chủ nhà chưa xác minh danh tính nhưng đăng bán phòng: **+25 điểm**.
  2. Homestay đang có khiếu nại từ khách chưa giải quyết: **+20 điểm** mỗi khiếu nại.
  3. Chủ nhà có tỷ lệ hủy đơn cao bất thường (> 30% trên tổng số đơn): **+30 điểm**.
  4. Đơn đặt phòng có thời gian lưu trú quá dài (> 14 đêm) nhưng chưa có thanh toán: **+25 điểm**.
  5. Đơn đặt phòng có giá trị tiền mặt quá lớn (> 30.000.000₫): **+20 điểm**.
* **Phân cấp cảnh báo hiển thị trên Admin Dashboard**:
  - `0 - 29 điểm`: **LOW (An toàn)** - Màu xanh.
  - `30 - 59 điểm`: **MEDIUM (Cần lưu ý đối soát)** - Màu vàng cam.
  - `60+ điểm`: **HIGH (Nguy cơ cao, cần Admin can thiệp điều tra)** - Màu đỏ.

### 5.6. Giới hạn Tần suất Truy cập (Rate Limiting)
* **Vị trí**: `backend/src/middlewares/rate-limit.middleware.js`.
* **Triển khai**:
  - Endpoint `/api/auth/login` & `/api/auth/register`: Giới hạn tối đa **30 lần thử / 15 phút** trên 1 địa chỉ IP (chặn hoàn toàn tấn công Brute-force vét cạn mật khẩu).
  - Endpoint `/api/bookings` & `/api/host/direct-booking`: Giới hạn tối đa **25 lần tạo đơn / 10 phút** (chặn click chuột liên thanh tạo đơn spam).
  - Khi vượt ngưỡng: Trả về HTTP 429 Too Many Requests kèm thông báo rõ ràng.

### 5.7. Nhật ký Kiểm toán Hoạt động Quan trọng (Audit Trail Logging)
* **Vị trí**: `backend/src/services/audit.service.js`.
* Bất kỳ hành động can thiệp dữ liệu nhạy cảm nào của Admin hoặc Host đều được ghi lại vĩnh viễn trong bảng `audit_logs`:
  - `property_approved` / `property_rejected`: Ai duyệt phòng nào, lúc mấy giờ, lý do là gì.
  - `host_verification_reviewed`: Ai duyệt xác minh cho chủ nhà nào.
  - `dispute_resolved`: Ai giải quyết khiếu nại, quyết định hoàn tiền hay khóa tài khoản.
  - `booking_cancelled`: Ghi lại IP và người thực hiện hủy đơn.

---

# 6. KIẾN TRÚC ĐA NỀN TẢNG (HYBRID ARCHITECTURE)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        TỔNG THỂ KIẾN TRÚC HỆ THỐNG                     │
├──────────────────────────────────┬─────────────────────────────────────┤
│ 📱 GUEST MOBILE APP              │ 💻 ADMIN & HOST WEB PLATFORM        │
│ - Framework: React Native Expo   │ - Framework: Next.js 16 + React 19  │
│ - Routing: Expo Router (File-based)│ - Styling: Tailwind CSS 4 + Lucide │
│ - Mục tiêu: Khách thuê tìm phòng, │ - Mục tiêu: Dashboard KPI, duyệt    │
│   đặt phòng, quét VietQR, lưu ví │   phòng, đối soát, tạo đơn tại quầy │
├──────────────────────────────────┴─────────────────────────────────────┤
│                     🌐 RESTFUL API BACKEND (EXPRESS.JS)                │
│ - Rate Limiting & Security: CORS, Cookie-parser, Express-session       │
│ - Thuật toán: Haversine, Property Ranking, Date Overlap, Risk Scoring  │
│ - Controllers: Auth, Homestays, Bookings, Host, Admin, Disputes        │
├────────────────────────────────────────────────────────────────────────┤
│                       🗄️ MYSQL DATABASE (INNODB)                       │
│ - ACID Transactions & Row Locking (FOR UPDATE) chống Overbooking       │
│ - Indexes: (check_in, check_out), (status), (host_id), (booking_code)  │
│ - Triggers & Views: Thống kê doanh thu, đồng bộ số lượng homestay      │
└────────────────────────────────────────────────────────────────────────┘
```

---

# 7. MA TRẬN KIỂM THỬ CÁC CA BIÊN (EDGE CASES & TESTING MATRIX)

Toàn bộ hệ sinh thái đã được chạy kiểm thử tự động qua kịch bản `backend/test-system.js`:

| STT | Tình huống kiểm thử (Test Case) | Kỳ vọng hệ thống | Kết quả thực tế |
| :---: | :--- | :--- | :---: |
| **1** | **Checkout = Checkin cùng ngày** (Khách cũ trả 05/10, khách mới nhận 05/10) | Không tính là trùng lịch (`Overlap = false`), cho phép đặt phòng bình thường. | ✅ **PASSED** |
| **2** | **Trùng ngày giao nhau** (Đã có đơn 01/10-05/10, khách mới đặt 03/10-07/10) | Phát hiện trùng lịch (`Overlap = true`), chặn đứng không cho tạo đơn. | ✅ **PASSED** |
| **3** | **Khoảng ngày lọt bên trong** (Đã có đơn 01/10-05/10, khách mới đặt 02/10-04/10) | Phát hiện trùng lịch (`Overlap = true`), từ chối giao dịch. | ✅ **PASSED** |
| **4** | **Tranh chấp kép đồng thời (Concurrency)** (Hai khách cùng đặt 1 phòng ở cùng 1 giây) | Transaction + `FOR UPDATE` khóa dòng; 1 khách thành công, 1 khách nhận thông báo phòng vừa có người đặt. | ✅ **PASSED** |
| **5** | **Tính khoảng cách Haversine** (Đà Nẵng -> Hội An) | Tính chính xác khoảng cách trắc địa mặt cầu ($24.2\text{ km}$). | ✅ **PASSED** |
| **6** | **Xếp hạng Weighted Ranking** | Chỗ nghỉ 5 sao, nhiều review, đã xác minh CCCD đạt điểm tối đa $150/150$. | ✅ **PASSED** |
| **7** | **Đánh giá rủi ro Rule-based** | Đơn bình thường $\rightarrow$ `LOW` (0 điểm); Đơn ở 20 ngày chưa trả tiền $\rightarrow$ `MEDIUM`/`HIGH`. | ✅ **PASSED** |
| **8** | **Kiểm tra biên độ TypeScript Mobile** | Chạy `npx tsc --noEmit` tại thư mục root React Native Expo. | ✅ **0 ERRORS** |
| **9** | **Kiểm tra build Web Admin Next.js** | Chạy `npm run build` trong `admin-web/`. | ✅ **22/22 PAGES OK** |

---

# 8. TỔNG KẾT BÀI TOÁN

Hệ thống **Homestay Booking & Management Platform** hiện tại không phải là một bài tập giao diện đơn thuần, mà là một **sản phẩm phần mềm thực tế hoàn chỉnh** giải quyết trọn vẹn bài toán kinh doanh lưu trú:
1. **Khách hàng (Guest)** có một ứng dụng di động bản địa tinh gọn, nhanh chóng, tìm kiếm thông minh, thanh toán VietQR tiện lợi và được bảo vệ bởi cơ chế khiếu nại (Disputes).
2. **Chủ nhà (Host)** có công cụ đắc lực để vừa bán phòng trên mạng, vừa đón khách vãng lai tại quầy (Walk-in), khóa lịch tự động chống đền phòng cho khách và minh bạch từng đồng doanh thu thực nhận.
3. **Nhà điều hành sàn (Admin)** nắm toàn quyền kiểm soát hệ thống: từ khâu duyệt căn cước chủ nhà, kiểm duyệt chỗ nghỉ, đến theo dõi dòng tiền hoa hồng và bảo đảm an toàn cho toàn bộ sàn lưu trú.
4. **Hạ tầng kỹ thuật (Backend & Database)** được bảo vệ vững chắc bởi các nguyên tắc ACID, cơ chế khóa hàng chống tranh chấp dữ liệu, hệ thống Rate Limiting chống tấn công, và các thuật toán toán học tất định, chuẩn mực.
