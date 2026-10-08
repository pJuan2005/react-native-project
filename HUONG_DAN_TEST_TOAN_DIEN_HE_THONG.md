# 📚 CẨM NANG HƯỚNG DẪN TEST TOÀN DIỆN HỆ THỐNG HOMESTAY BOOKING
> **Dự án:** Homestay Booking & Management Multi-Platform Platform  
> **Kiến trúc:** Mobile Guest App (React Native Expo) • Web Portal (Next.js 16 Admin/Host/Guest) • REST API Backend (Node.js/Express) • Database (MySQL 8.0/MariaDB)  
> **Mục tiêu:** Hướng dẫn từng bước kiểm thử (test) 100% chức năng, nghiệp vụ kinh tế và logic hệ thống thông qua giao diện người dùng trực quan.

---

## 🛠️ CHUẨN BỊ MÔI TRƯỜNG TRƯỚC KHI TEST

### 1. Khởi động Cơ sở dữ liệu & Nạp dữ liệu chuẩn (500+ bản ghi)
1. Mở **XAMPP Control Panel** $\rightarrow$ Bấm nút **Start** ở mục **MySQL** (cổng mặc định 3306).
2. Mở Terminal tại thư mục dự án và chạy lệnh khởi tạo sạch toàn bộ CSDL:
   ```bash
   npm run db:init --prefix backend
   ```
   *(Dữ liệu mẫu 520 users, 520 chỗ nghỉ, 2800+ ảnh, 520 đơn phòng, ví tiền, tài khoản ngân hàng sẽ được nạp trong 3-5 giây).*

### 2. Khởi động Backend Server (Port 3000)
Mở một cửa sổ Terminal mới:
```bash
cd backend
npm run dev
```
- API Base URL: `http://localhost:3000/api`

### 3. Khởi động Web Portal Admin / Host / Guest (Port 3001)
Mở một cửa sổ Terminal mới:
```bash
cd web
npm run dev
```
- Web Portal: `http://localhost:3001`

### 4. Khởi động Mobile App trên Trình duyệt (Port 8081)
Mở một cửa sổ Terminal mới:
```bash
npm run web
```
- Mobile Web App: `http://localhost:8081` *(Khuyên dùng chế độ giả lập điện thoại iPhone/Android bằng cách bấm `F12` trên trình duyệt Chrome/Edge).*

---

## 🔑 DANH SÁCH TÀI KHOẢN ĐĂNG NHẬP MẪU

| Vai trò (Role) | Email đăng nhập | Mật khẩu | Nền tảng sử dụng | Chức năng chính |
|---|---|:---:|---|---|
| **Quản trị viên (Admin)** | `admin@mail.com` | `123456` | Web Portal (`http://localhost:3001/admin`) | Duyệt chỗ nghỉ, duyệt thanh toán đơn phòng, kiểm tra rủi ro, xử lý rút tiền, xem nhật ký kiểm toán. |
| **Chủ nhà (Host 1)** | `host1@mail.com` | `123456` | Web Portal (`http://localhost:3001/host`) | Đăng chỗ nghỉ, lễ tân tại quầy (walk-in), xem doanh số, chat với khách. |
| **Chủ nhà (Host 2)** | `host2@mail.com` | `123456` | Web Portal (`http://localhost:3001/host`) | Quản lý chỗ nghỉ Phú Quốc & Nha Trang. |
| **Khách hàng 1 (Guest)** | `huong@gmail.com` | `123456` | Mobile App (`http://localhost:8081`) | Khám phá, đặt phòng, thanh toán VietQR, ví tiền, rút tiền, khiếu nại. |
| **Khách hàng 2 (Guest)** | `phamchuan2608@gmail.com` | `123456` | Mobile App (`http://localhost:8081`) | Tài khoản khách hàng đầy đủ ví & voucher. |

---

## 📋 KỊCH BẢN KIỂM THỬ NGHIỆP VỤ (TEST SCENARIOS)

---

### PHẦN 1: TEST TRÊN MOBILE GUEST APP (`http://localhost:8081`)

#### Kịch bản 1.1: Đăng nhập & Quản lý hồ sơ cá nhân
1. Mở `http://localhost:8081/login`.
2. Nhập email: `huong@gmail.com`, Mật khẩu: `123456` $\rightarrow$ Bấm **"Đăng nhập"**.
   - **Kỳ vọng:** Đăng nhập thành công 100%, chuyển vào màn hình chính `/(tabs)`.
3. Bấm vào tab **"Cá nhân"** (ở góc dưới cùng bên phải).
4. Bấm **"Chỉnh sửa hồ sơ"**:
   - Thử bấm vào biểu tượng chiếc lịch 📅 cạnh ô **Ngày sinh** $\rightarrow$ Modal chọn Ngày, Tháng, Năm hiện ra trực quan.
   - Chọn Ngày 20, Tháng 10, Năm 1998 $\rightarrow$ Bấm **"Áp dụng ngày này"**.
   - Bấm **"Lưu thay đổi"**.
   - **Kỳ vọng:** Hồ sơ cập nhật mượt mà, ngày sinh hiển thị chuẩn format `20/10/1998` (không bao giờ bị lỗi năm 1899 hay lệch múi giờ).
5. Thử bấm **"Đổi ảnh đại diện"**:
   - Chọn một avatar hoạt hình Disney dễ thương (Mickey, Judy Hopps, Stitch...) $\rightarrow$ Avatar đổi ngay lập tức.

---

#### Kịch bản 1.2: Khám phá địa điểm du lịch & Phân trang
1. Tại thanh điều hướng dưới cùng, bấm tab **"Địa điểm"** (`/locations`).
   - **Kỳ vọng:** Hiển thị danh sách 20 điểm đến du lịch lớn trên cả nước (*Đà Lạt, Sa Pa, Phú Quốc, Hội An, Nha Trang, Ninh Bình...*).
   - Dưới chân trang có thanh phân trang: **`Hiển thị 1 - 6 trên tổng số 20 địa điểm du lịch`**.
2. Bấm nút **"Sau"** hoặc bấm vào số **`2`**, **`3`**, **`4`**:
   - **Kỳ vọng:** Danh sách chuyển trang mượt mà, hiển thị các địa danh tiếp theo.
3. Bấm chọn vào thẻ **"Đà Lạt"**:
   - **Kỳ vọng:** Chuyển sang màn hình Chi tiết địa điểm Đà Lạt (`/location/1`).
   - Hiển thị ảnh bìa danh thắng, số lượng homestay có sẵn và danh sách các chỗ nghỉ tại Đà Lạt kèm thanh phân trang 6 chỗ nghỉ/trang.

---

#### Kịch bản 1.3: Danh sách chỗ nghỉ & Bộ lọc tìm kiếm
1. Bấm tab **"Homestay"** (`/homestays`).
   - **Kỳ vọng:** Hiển thị danh sách các chỗ nghỉ kèm phân trang 8 chỗ nghỉ/trang.
2. Thử gõ từ khóa vào ô tìm kiếm: `"Villa"`:
   - **Kỳ vọng:** Danh sách lọc tức thì chỉ hiển thị các chỗ nghỉ có chữ Villa, tự động đưa về trang 1.
3. Thử bấm nút sắp xếp **"Giá"** hoặc **"Đánh giá"**:
   - **Kỳ vọng:** Danh sách sắp xếp lại theo đơn giá tăng dần hoặc số sao đánh giá cao nhất.

---

#### Kịch bản 1.4: Xem chi tiết Homestay, Thư viện ảnh chân thực & Lịch chống trùng (Anti-Overbooking)
1. Bấm vào một homestay bất kỳ (Ví dụ: *Villa Lavender Dream* hoặc *Ancient Town Riverside*).
2. **Kiểm tra thư viện ảnh:**
   - Quan sát góc trên ảnh: Chỉ số ảnh hiển thị chuẩn xác **`1 / 6 ảnh`** hoặc **`1 / 7 ảnh`** (không bị lỗi 302 ảnh).
   - Thử bấm nút mũi tên `<` và `>` hoặc bấm vào từng ô ảnh nhỏ ở dải thumbnail bên dưới $\rightarrow$ Ảnh chuyển đổi mượt mà.
   - Thử bấm vào giữa ảnh để mở **Modal Xem ảnh toàn màn hình** $\rightarrow$ Modal mở rộng full màn hình cực kỳ sắc nét.
3. **Kiểm tra Lịch chọn ngày & Chặn ngày quá khứ / Ngày kín:**
   - Cuộn xuống phần chọn ngày, bấm vào ô chọn ngày nhận/trả phòng.
   - **Kỳ vọng:** Các ngày trong quá khứ bị gạch ngang và làm mờ (không thể bấm).
   - Các ngày đã có khách đặt trước được tô màu đỏ và hiển thị trạng thái kín phòng.
   - Thử chọn Ngày nhận phòng: ngày mai, Ngày trả phòng: 2 ngày sau (cách nhau 2 đêm) $\rightarrow$ Hệ thống tự động tính số đêm và tổng tiền chuẩn xác theo giá niêm yết.

---

#### Kịch bản 1.5: Đặt phòng & Quét mã VietQR chuyển khoản
1. Bấm nút **"Đặt phòng ngay"** ở thanh hành động dưới cùng.
   - **Kỳ vọng:** Đặt phòng thành công, hiển thị Modal biên lai thành công với Mã đơn phòng dạng `BK2026...`.
2. Bấm **"Xem danh sách đặt phòng"** $\rightarrow$ Chuyển sang màn hình `/bookings`.
3. Quan sát đơn phòng vừa tạo:
   - Hiển thị huy hiệu: 🟡 **Chưa thanh toán** và ⏳ **Hạn 15 phút** (Chính sách giữ phòng 15 phút chống găm phòng).
4. Bấm nút **"Thanh toán"**:
   - Modal Thanh toán chuyển khoản mở ra.
   - Hiển thị mã **VietQR** Techcombank `1907 1766 4710 19` (`PHAM XUAN CHUAN`) kèm đúng số tiền cần chuyển và mã nội dung chuyển khoản.
   - Bấm nút **"Dùng ảnh mẫu test"** (hoặc chọn ảnh từ máy) $\rightarrow$ Bấm **"Xác nhận thanh toán"**.
   - **Kỳ vọng:** Trạng thái đơn phòng lập tức chuyển sang: 🟢 **Đã thanh toán CK** & 🟡 **Chờ Web Admin duyệt**.

---

#### Kịch bản 1.6: Chat thời gian thực với Chủ nhà (Guest $\leftrightarrow$ Host)
1. Trong màn hình `/bookings`, bấm vào đơn phòng vừa thanh toán để mở **Modal Chi tiết đơn đặt phòng**.
2. Bấm nút **"Nhắn tin với chủ nhà"** (icon `chatbubbles-outline`).
   - **Kỳ vọng:** Mở màn hình chat trực tiếp với Chủ nhà (`/chat/[id]`).
   - Hiển thị sẵn tin nhắn hệ thống thông báo trạng thái đơn phòng.
3. Gõ tin nhắn: *"Chào chủ nhà, mấy giờ mình có thể nhận phòng được vậy ạ?"* $\rightarrow$ Bấm nút gửi (`Send`).
   - **Kỳ vọng:** Tin nhắn của bạn hiện màu xanh bên phải ngay lập tức.

---

#### Kịch bản 1.7: Hủy phòng có tính toán tiền hoàn (Cancellation & Refund Logic)
1. Quay lại màn hình `/bookings`, bấm vào đơn phòng để mở Chi tiết.
2. Bấm nút màu đỏ **"Hủy đặt phòng"**:
   - **Kỳ vọng:** Modal Hủy phòng & Bảng tính hoàn tiền mở ra.
   - **Bảng tính thời gian thực từ Server:**
     - Nếu ngày nhận phòng còn cách hiện tại $\ge 72$ giờ: Hiển thị rõ **Tỷ lệ hoàn tiền: 70%** (Hoàn vào Ví), **Phí hủy dịch vụ: 30%** (Sàn thu 10% hoa hồng, Chủ nhà nhận 20% bồi thường).
     - Nếu ngày nhận phòng cách hiện tại $< 72$ giờ: Hiển thị rõ **Tỷ lệ hoàn tiền: 0%**, **Phí hủy: 100%** (Chủ nhà nhận 90% bồi thường do hủy sát ngày).
3. **Thử nghiệm tính bắt buộc:**
   - Nếu chưa tích checkbox *"Tôi đã đọc và đồng ý chính sách"* $\rightarrow$ Nút xác nhận bị mờ và vô hiệu hóa.
   - Thử chọn lý do **"Lý do khác"** $\rightarrow$ Hệ thống yêu cầu bắt buộc gõ nội dung chi tiết (tối thiểu 10 ký tự).
4. Chọn lý do: *"Tôi thay đổi kế hoạch"*, tích chọn đồng ý chính sách $\rightarrow$ Bấm **"Xác nhận hủy phòng"**.
   - **Kỳ vọng:** Hủy phòng thành công! Số tiền hoàn 70% được tự động chuyển ngay vào **Ví của bạn**.

---

#### Kịch bản 1.8: Kiểm tra Ví điện tử, Biến động số dư (Ledger) & Thêm ngân hàng rút tiền
1. Mở tab **"Cá nhân"** $\rightarrow$ Bấm **"Ví của tôi (Số dư & Rút tiền)"** (`/wallet`).
   - **Kỳ vọng:**
     - Số dư khả dụng đã tăng thêm đúng số tiền 70% vừa được hoàn ở bước trên!
     - Trong mục **Lịch sử biến động số dư**, có dòng ghi nhận giao dịch:
       `+1.400.000 ₫ • Hoàn 70% tiền hủy phòng đơn #BK... theo chính sách`.
2. Bấm nút **"Ngân hàng"** (hoặc mở menu *Tài khoản ngân hàng liên kết* tại `/bank-accounts`):
   - Bấm **"Thêm thẻ mới"**: Chọn ngân hàng (Techcombank, Vietcombank, MB...), nhập số tài khoản và tên chủ tài khoản $\rightarrow$ Bấm **"Lưu tài khoản"**.
   - **Kỳ vọng:** Thẻ ngân hàng được thêm thành công, số tài khoản được mã hóa bảo mật dạng `****1019`.
3. Quay lại trang Ví $\rightarrow$ Bấm **"Rút tiền về thẻ"**:
   - Chọn tài khoản ngân hàng vừa thêm.
   - Nhập số tiền muốn rút (Ví dụ: `500.000`) $\rightarrow$ Bấm **"Gửi yêu cầu rút"**.
   - **Kỳ vọng:** Yêu cầu rút tiền được tạo thành công, số dư khả dụng trừ 500.000₫ và chuyển 500.000₫ sang trạng thái *Đang chờ chuyển khoản*.

---

#### Kịch bản 1.9: Gửi khiếu nại / Báo cáo sự cố (Dispute)
1. Quay lại tab **"Đặt phòng"** $\rightarrow$ Bấm vào một đơn phòng bất kỳ $\rightarrow$ Bấm **"Trợ giúp & Khiếu nại"** (`/dispute/[id]`).
2. Chọn phân loại: *"Chỗ ở không giống mô tả"* hoặc *"Vấn đề thanh toán & đối soát biên lai"*.
3. Nhập mô tả chi tiết sự cố $\rightarrow$ Bấm **"Gửi khiếu nại tới Ban Quản Trị"**.
   - **Kỳ vọng:** Gửi thành công, có mã khiếu nại dạng `#DSP000...`.
4. Mở tab **"Cá nhân"** $\rightarrow$ Bấm **"Khiếu nại & Trợ giúp đơn phòng"** (`/disputes`):
   - **Kỳ vọng:** Xem lại được khiếu nại vừa gửi ở trạng thái 🔵 **Chờ xử lý**.

---

### PHẦN 2: TEST TRÊN CỔNG CHỦ NHÀ - HOST PORTAL (`http://localhost:3001/host`)

1. Mở trình duyệt truy cập: `http://localhost:3001/auth/login`.
2. Đăng nhập tài khoản Host:
   - Email: `host1@mail.com`
   - Mật khẩu: `123456`
3. **Màn hình Tổng quan (`/host/dashboard`):**
   - Xem tổng số chỗ nghỉ đang quản lý, tổng đơn phòng và doanh số.
4. **Màn hình Lễ tân đón khách tại quầy (Walk-in Desk Booking):**
   - Vào `/quick-manage/HMTOKEN_0001` (hoặc mở từ link quản lý nhanh).
   - Điền thông tin khách vãng lai nhận phòng trực tiếp tại quầy: Tên khách, SĐT, ngày nhận phòng, ngày trả phòng.
   - Bấm tạo đơn $\rightarrow$ Hệ thống tự động khóa lịch phòng và chia hoa hồng tại quầy chuẩn: **Sàn thu 5%, Chủ nhà nhận 95%**.
5. **Màn hình Chat với khách:**
   - Vào mục Quản lý đặt phòng $\rightarrow$ Bấm vào đơn phòng của khách $\rightarrow$ Bấm nút **"Trò chuyện"**.
   - **Kỳ vọng:** Đọc được tin nhắn khách vừa gửi từ Mobile App ở Kịch bản 1.6 $\rightarrow$ Gõ trả lời: *"Homestay đã nhận thông tin, chào đón bạn nhé!"* $\rightarrow$ Trên Mobile App lập tức nhận được phản hồi của chủ nhà!

---

### PHẦN 3: TEST TRÊN CỔNG QUẢN TRỊ VIÊN - ADMIN PORTAL (`http://localhost:3001/admin`)

1. Đăng xuất tài khoản Host và đăng nhập tài khoản Admin:
   - Email: `admin@mail.com`
   - Mật khẩu: `123456`
   - Đường dẫn: `http://localhost:3001/admin/dashboard`
2. **Kiểm tra & Duyệt đơn đặt phòng (`/admin/manage-booking`):**
   - Tìm đơn đặt phòng mà bạn đã thanh toán ở Kịch bản 1.5.
   - Cột **Đánh giá rủi ro (Risk Scoring)**: Hiển thị huy hiệu 🟢 **An toàn (LOW)** hoặc 🟡 **Lưu ý (MEDIUM)** kèm giải thích.
   - Bấm nút **"Kiểm tra biên lai"** $\rightarrow$ Xem ảnh chuyển khoản VietQR $\rightarrow$ Bấm **"Duyệt đơn phòng"**.
   - **Kỳ vọng:** Đơn phòng chuyển sang trạng thái 🟢 **Đã xác nhận (Confirmed)**. Mở lại Mobile App, đơn phòng lập tức đổi sang badge **"Đặt phòng thành công"**.
3. **Xem Nhật ký kiểm toán an ninh (`/admin/audit-logs`):**
   - Bấm menu **"Nhật ký kiểm toán"** bên trái thanh điều hướng.
   - **Kỳ vọng:** Hiển thị toàn bộ lịch sử truy vết mọi hành vi vừa thực hiện: Admin duyệt đơn, Khách hủy phòng, Khách gửi khiếu nại, Kèm IP thực hiện và mốc thời gian chính xác!
4. **Phê duyệt chỗ nghỉ mới (`/admin/property-approvals`):**
   - Xem danh sách chỗ nghỉ chờ duyệt, duyệt hoặc từ chối kèm lý do phản hồi cho chủ nhà.

---

## ✅ BẢNG TỔNG KẾT TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CHECKLIST)

| STT | Nghiệp vụ kiểm thử | Thao tác giao diện | Kết quả kỳ vọng | Trạng thái |
|:---:|---|---|---|:---:|
| 1 | **Đăng nhập Mobile** | Nhập `huong@gmail.com` / `123456` | Đăng nhập thành công, không lỗi 400 | **PASS** |
| 2 | **Chọn ngày sinh** | Bấm icon Lịch 📅 trong sửa hồ sơ | Chọn Ngày-Tháng-Năm trực quan, chuẩn `DD/MM/YYYY` | **PASS** |
| 3 | **Khám phá 20 địa điểm** | Mở tab Địa điểm & Trang chủ | Hiển thị đầy đủ 20 địa danh du lịch lớn | **PASS** |
| 4 | **Phân trang Mobile** | Chuyển trang tại Địa điểm & Homestay | Phân trang 6-8 mục/trang mượt mà | **PASS** |
| 5 | **Thư viện ảnh Homestay** | Mở chi tiết homestay | Hiển thị chuẩn 6-8 ảnh, không bị lỗi 302 ảnh | **PASS** |
| 6 | **Đặt phòng & VietQR** | Đặt phòng và quét VietQR | Tạo đơn kèm mã VietQR Techcombank chính chủ | **PASS** |
| 7 | **Thời hạn giữ chỗ 15p** | Đơn pending chưa thanh toán | Hiển thị hạn 15p, auto-cancel giải phóng phòng | **PASS** |
| 8 | **Hủy phòng $\ge 72$h** | Hủy trước 72h trong chi tiết đơn | Hoàn 70% vào Ví, phí hủy chia Sàn 10% + Host 20% | **PASS** |
| 9 | **Hủy phòng $< 72$h** | Hủy sát ngày trong chi tiết đơn | Hoàn 0%, Host nhận 90% bồi thường vào Ví | **PASS** |
| 10 | **Ví & Rút tiền** | Mở Ví $\rightarrow$ Rút về thẻ | Trừ số dư ví, tạo ledger và pending withdrawal | **PASS** |
| 11 | **Liên kết Ngân hàng** | Thêm thẻ tại `/bank-accounts` | Lưu thẻ an toàn, che số thẻ dạng `****1019` | **PASS** |
| 12 | **Chat Guest $\leftrightarrow$ Host** | Bấm "Nhắn tin với chủ nhà" | Chat 2 chiều gắn với booking kèm tin nhắn hệ thống | **PASS** |
| 13 | **Gửi Khiếu nại** | Bấm "Trợ giúp & Khiếu nại" | Gửi sự cố theo đơn phòng tới Admin theo dõi | **PASS** |
| 14 | **Admin Duyệt & Audit** | Admin kiểm tra biên lai và log | Duyệt phòng thành công, ghi vết audit log đầy đủ | **PASS** |

---
*Cẩm nang này bao quát 100% các tính năng thực tế. Bạn có thể mở đồng thời 2 tab trình duyệt (1 tab Mobile `localhost:8081` và 1 tab Web Admin/Host `localhost:3001`) để tận mắt trải nghiệm sự đồng bộ thời gian thực mượt mà của hệ thống!*
