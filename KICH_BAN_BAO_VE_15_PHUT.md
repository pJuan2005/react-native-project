# 🎓 KỊCH BẢN BẢO VỆ ĐỒ ÁN 15 - 20 PHÚT: TỰ TIN ĐẠT ĐIỂM TỐI ĐA

> **Học phần:** Lập trình di động đa nền tảng (Cross-Platform Mobile Development)  
> **Sinh viên:** Phạm Xuân Chuẩn  
> **Đề tài:** Nền tảng Đặt phòng & Quản lý Homestay Đa Nền Tảng (Mobile App + Web Portal + Backend REST API + MySQL)

---

## 🛠️ BƯỚC 0: CHUẨN BỊ MÁY TRƯỚC KHI LÊN THUYẾT TRÌNH (RẤT QUAN TRỌNG)

Trước khi tới lượt mình bước lên, bạn hãy bật sẵn 4 cửa sổ sau trên máy tính để không bị lúng túng:

1. **Cửa sổ 1 - Cơ sở dữ liệu MySQL:**
   - Mở **phpMyAdmin** (`http://localhost/phpmyadmin`), chọn database `homestay_db`.
   - Chạy tập lệnh `database/seed_demo_accounts.sql` để tài khoản `phamchuan2608@gmail.com` và `huong@gmail.com` có đầy đủ 50+ bản ghi ở tất cả các màn hình.
2. **Cửa sổ 2 - Backend Server (Port 3000):**
   - Mở terminal `backend`: chạy lệnh `npm run dev` (báo xanh: `Homestay 3-Tier Backend API is running!`).
3. **Cửa sổ 3 - Web Portal (Port 3001):**
   - Mở terminal `web`: chạy lệnh `npm run dev:webpack`.
   - Mở sẵn trình duyệt: đăng nhập tài khoản Admin (`admin@mail.com` / `123456`) tại `http://localhost:3001/admin/dashboard`.
4. **Cửa sổ 4 - Mobile App (Port 8081 / Expo Go):**
   - Chạy lệnh `npx expo start` tại thư mục gốc. Bấm `w` để mở giao diện Web di động (hoặc mở điện thoại thật quét mã QR qua Expo Go).
   - Đăng nhập sẵn tài khoản demo: **`phamchuan2608@gmail.com`** / mật khẩu **`123456`**.

---

## ⏱️ PHÂN BỔ THỜI GIAN THUYẾT TRÌNH (TỔNG: 15 - 20 PHÚT)

| Mốc thời gian | Nội dung chính | Trọng tâm cần thể hiện |
| :---: | :--- | :--- |
| **00:00 - 02:30** | Giới thiệu đề tài & Kiến trúc hệ thống | Tự tin, nêu bật giải pháp đa nền tảng thay thế quản lý thủ công. |
| **02:30 - 11:30** | **DEMO TRỰC TIẾP HỆ THỐNG (Trọng tâm ăn điểm)** | Thao tác mượt mà trên Mobile App kết hợp tương tác thời gian thực với Web Admin. |
| **11:30 - 14:30** | Điểm sáng kỹ thuật & Cơ sở dữ liệu | Trình bày Row-Level Lock chống Overbooking, thuật toán hoàn tiền 70% ví, sổ cái Ledger. |
| **14:30 - 20:00** | Trả lời câu hỏi phản biện của Thầy (Q&A) | Bình tĩnh, rõ ràng, mở đúng file code khi thầy yêu cầu. |

---

## 🎤 LỜI THOẠI CHI TIẾT TỪNG PHÚT

### 🟢 PHẦN 1: MỞ ĐẦU (00:00 - 02:30)

> *"Em xin kính chào quý thầy cô trong Hội đồng chấm đồ án học phần Lập trình di động đa nền tảng! Em tên là Phạm Xuân Chuẩn. Hôm nay, em xin phép được báo cáo và trình diễn sản phẩm đề tài: **'Nền tảng đặt phòng và quản lý Homestay đa nền tảng'**.*
>
> *Thưa thầy cô, xuất phát từ thực tế mô hình homestay hiện nay phát triển rất mạnh nhưng hầu hết các chủ nhà vẫn quản lý thủ công qua sổ sách, tin nhắn Zalo, dẫn đến rủi ro lớn nhất là **đặt trùng phòng (Overbooking)**, thất thoát doanh thu và khó đối soát tài chính. Về phía du khách thế hệ số, họ có nhu cầu tìm kiếm, đặt phòng, thanh toán chuyển khoản và nhận thông báo tức thời ngay trên điện thoại thông minh mọi lúc mọi nơi.*
>
> *Chính vì vậy, em đã xây dựng một hệ sinh thái phân tán hoàn chỉnh gồm 3 phân hệ:*
> 1. *Ứng dụng di động (**Mobile App**) dành cho Du khách được phát triển bằng **React Native và Expo SDK 54**.*
> 2. *Cổng thông tin điều hành (**Web Portal**) dành cho Chủ nhà và Quản trị viên xây dựng trên **Next.js 16 và TypeScript**.*
> 3. *Tầng máy chủ dịch vụ (**Backend REST API**) viết bằng **Node.js/Express** kết nối cơ sở dữ liệu quan hệ **MySQL 26 bảng chuẩn hóa**, áp dụng cơ chế khóa dòng dữ liệu (`FOR UPDATE`) để giải quyết triệt để bài toán tranh chấp phòng.*
>
> *Sau đây, em xin phép được đi trực tiếp vào phần demo các chức năng thực tế của hệ thống ạ."*

---

### 🟢 PHẦN 2: KỊCH BẢN DEMO SỐNG ĐỘNG (02:30 - 11:30)

*(Bạn chuyển sang màn hình Mobile App đang đăng nhập tài khoản `phamchuan2608@gmail.com`)*

#### 1. Màn hình Khám phá & Chọn ngày thông minh (Phút 02:30 - 04:30):
* **Hành động:**
  - Ở Trang chủ: Lướt nhanh qua các địa danh nổi tiếng (Đà Lạt, Phú Quốc, Sa Pa...) và danh mục hơn 500 homestay được nạp từ MySQL.
  - Chọn một Homestay bất kỳ (ví dụ: Homestay tại Đà Lạt).
  - Bấm vào mục **"Chọn ngày nhận & trả phòng"**:
    + Bấm nút chọn nhanh **"Cuối tuần này (2 đêm)"** $\to$ Chỉ cho thầy thấy: *"Thưa thầy, hệ thống tự động tính toán chính xác ngày Thứ Sáu đến Chủ Nhật của tuần này mà không bị lỗi lệch ngày hay nhảy tuần."*
    + Bấm thử nút **"Cuối tuần sau (2 đêm)"** $\to$ Hệ thống tự động chuyển đúng sang Thứ Sáu tuần sau.
    + Chỉ vào các ngày đã có khách đặt trước trên lịch: *"Các ngày đã kín phòng sẽ bị khóa mờ tự động theo thời gian thực, ngăn chặn khách bấm chọn đè ngày ạ."*

#### 2. Đặt phòng & Thanh toán chuyển khoản VietQR (Phút 04:30 - 06:30):
* **Hành động:**
  - Chọn ngày hợp lệ $\to$ Chọn mã giảm giá **`WELCOME10`** (giảm 10%) $\to$ Bấm **"Đặt phòng ngay"**.
  - Màn hình thanh toán hiện ra:
    + Chỉ vào mã **VietQR động**: *"Hệ thống tự động sinh mã VietQR chứa đúng số tiền sau giảm giá và nội dung chuyển khoản là mã đơn phòng `BK-xxxxx`."*
    + Chỉ vào đồng hồ đếm ngược: *"Hệ thống có cơ chế giữ chỗ 15 phút. Nếu sau 15 phút khách không thanh toán, máy chủ sẽ tự động giải phóng phòng để tránh tình trạng găm phòng ảo ạ."*
    + Bấm **"Tải ảnh biên lai lên"** (hoặc nút dùng ảnh mẫu) $\to$ Bấm **"Xác nhận đã thanh toán"**. Đơn chuyển sang trạng thái *"Đã gửi biên lai"*.

#### 3. Bộ lọc "Đang ở", "Sắp tới" & Hủy phòng hoàn 70% Ví (Phút 06:30 - 08:30):
* **Hành động:**
  - Vào tab **"Đặt phòng"** dưới đáy màn hình:
    + Bấm vào chip **`Đang ở (2)`**: *"Thưa thầy, đây là tính năng phân loại thời gian thực em vừa nâng cấp. Những đơn phòng đã được Admin duyệt và ngày hôm nay đang nằm trong khoảng lưu trú sẽ có badge xanh lá cây `🟢 Đang lưu trú`, tách biệt hoàn toàn với các đơn chưa đến ngày đi."*
    + Bấm vào chip **`Sắp tới`**: Thấy đơn phòng vừa đặt ở trên.
    + Bấm vào chip **`Đã ở qua`** $\to$ Cuộn cho thầy xem hơn 25 chuyến đi đã hoàn thành và có thể bấm đánh giá 5★.
  - **Trình diễn kịch bản hủy phòng:**
    + Chọn một đơn sắp tới (có ngày check-in cách thời điểm hiện tại trên 72 giờ).
    + Bấm biểu tượng thùng rác/Hủy phòng $\to$ Modal xem trước hoàn tiền hiện ra: *"Thưa thầy, hệ thống tính toán thời gian thực: Hủy trước $\ge 72$ giờ sẽ được hoàn tự động 70% giá trị phòng vào Ví điện tử, 30% phí phạt sẽ chia Sàn 10% và Chủ nhà 20% bồi thường."*
    + Tích chọn đồng ý $\to$ Bấm **"Xác nhận hủy phòng"** $\to$ Hệ thống báo: *"Hủy thành công, số tiền +1.400.000đ (70%) đã được hoàn ngay vào Ví điện tử!"*

#### 4. Ví điện tử & Rút tiền ngân hàng (Phút 08:30 - 10:00):
* **Hành động:**
  - Mở tab **Hồ sơ** $\to$ Bấm vào **"Ví điện tử"**:
    + Chỉ vào số dư ví: *"Số tiền 70% vừa hủy ở trên đã được cộng ngay lập tức vào số dư khả dụng của ví."*
    + Cuộn danh sách lịch sử: *"Dưới đây là sổ cái tài chính (Ledger) với hơn 50 giao dịch minh bạch, lưu vết rõ số dư trước (`balance_before`) và số dư sau (`balance_after`)."*
    + Bấm nút **"Rút tiền"** $\to$ Nhập 500.000đ $\to$ Chọn ngân hàng Techcombank $\to$ Bấm gửi lệnh rút. Hệ thống báo lệnh rút đang chờ Quản trị viên duyệt.

#### 5. Kết nối thời gian thực sang Web Admin (Phút 10:00 - 11:30):
* **Hành động (Chuyển sang trình duyệt Web Admin `localhost:3001`):**
  - Mở trang **Quản lý đặt phòng (`/admin/manage-booking`)**: Thấy ngay đơn phòng vừa tải biên lai VietQR trên Mobile $\to$ Bấm **"Duyệt phòng"** $\to$ Đơn chuyển sang trạng thái thành công!
  - Mở trang **Quản lý rút tiền (`/admin/withdrawals`)**: Thấy lệnh rút 500.000đ của tài khoản Phạm Xuân Chuẩn vừa tạo $\to$ Bấm **"Xác nhận đã chuyển"**!
  - Mở trang **Xác minh chủ nhà (`/admin/host-verifications`)**: Cho thầy xem ảnh 2 mặt CCCD của Host $\to$ Bấm **"Duyệt cấp tích xanh"**!
  - Mở trang **Nhật ký kiểm toán (`/admin/audit-logs`)**: *"Thưa thầy, toàn bộ các thao tác duyệt phòng, duyệt rút tiền em vừa làm trên Web đều được tự động ghi vết bất biến vào bảng audit logs kèm địa chỉ IP và mốc thời gian thực ạ."*

---

### 🟢 PHẦN 3: GIẢI TRÌNH ĐIỂM SÁNG KỸ THUẬT (11:30 - 14:30)

> *"Thưa thầy, để hệ thống vận hành trơn tru như vậy, em đã tập trung giải quyết 3 bài toán kỹ thuật cốt lõi ở tầng kiến trúc:*
>
> 1. ***Giải quyết triệt để bài toán Đặt trùng phòng (Anti-Overbooking):**  
>    Nếu 2 khách hàng cùng bấm đặt 1 phòng trong cùng 1 mili-giây, em sử dụng kỹ thuật **Database Transaction kết hợp Row-Level Locking (`SELECT ... FOR UPDATE`)** trong file `booking.model.js`. Dòng dữ liệu của homestay sẽ bị khóa độc quyền cho đến khi giao dịch đầu tiên hoàn tất, ngăn chặn 100% tình trạng Race Condition.
> 2. ***Kiểm soát rủi ro găm phòng ảo (Anti-Spam):**  
>    Máy chủ có tiến trình tự động dọn dẹp các đơn giữ phòng quá hạn 15 phút mà không chuyển khoản, đồng thời tạm khóa tính năng nếu 1 tài khoản tạo đơn ảo quá 10 lần/24h.
> 3. ***Tự động hóa tài chính và Quản lý sổ cái (Wallet Ledger):**  
>    Mọi biến động cộng trừ tiền đều tuân thủ nguyên lý sổ cái kép (double-entry ledger), lưu đủ số dư trước và sau giao dịch, đảm bảo tính toàn vẹn tuyệt đối về mặt kế toán tài chính."*

---

### 🟢 PHẦN 4: TRẢ LỜI CÂU HỎI PHẢN BIỆN CỦA HỘI ĐỒNG (14:30 - 20:00)

Dưới đây là 10 câu hỏi "kinh điển" thầy cô hay hỏi và câu trả lời ăn điểm tuyệt đối:

#### ❓ Câu 1: Tại sao em lại làm cả Web và Mobile mà không làm mỗi Web hoặc mỗi Mobile?
* **Trả lời:** *"Dạ thưa thầy, em thiết kế hệ thống theo định hướng trải nghiệm người dùng thực tế: Du khách cần sự cơ động, đặt phòng và quét mã QR ngay trên điện thoại di động (Mobile-First); trong khi Chủ nhà và Quản trị viên cần màn hình máy tính lớn (Web Portal) để theo dõi biểu đồ doanh thu phức tạp, kiểm duyệt hồ sơ CCCD và quản lý bảng biểu thuận tiện. Cả hai nền tảng cùng chia sẻ chung một tầng máy chủ Backend REST API và cơ sở dữ liệu MySQL tập trung ạ."*

#### ❓ Câu 2: Em dùng State Management nào trong React Native?
* **Trả lời:** *"Dạ, em sử dụng **React Context API** kết hợp với các Custom Hooks: `AuthContext` quản lý phiên đăng nhập và token; `BookingContext` quản lý dữ liệu đặt phòng, giỏ phòng và danh sách yêu thích; `ThemeContext` quản lý chế độ sáng/tối (Dark/Light mode) ạ."*

#### ❓ Câu 3: Dữ liệu trên điện thoại được lưu ngoại tuyến bằng cái gì?
* **Trả lời:** *"Dạ em sử dụng thư viện `@react-native-async-storage/async-storage` để lưu trữ token JWT và thông tin người dùng cục bộ, giúp ứng dụng tự động duy trì đăng nhập mà không cần bắt người dùng nhập lại mật khẩu mỗi lần mở app ạ."*

#### ❓ Câu 4: Thầy bảo: "Mở code chỗ xử lý chống đặt trùng phòng cho tôi xem!"
* **Hành động & Trả lời:**
  - Mở ngay file `backend/src/models/booking.model.js`, kéo đến dòng 286.
  - Chỉ vào dòng code: `SELECT id, name, price_per_night... FROM properties WHERE id = ? FOR UPDATE`.
  - Giải thích: *"Dạ đây ạ, từ khóa `FOR UPDATE` trong MySQL Transaction sẽ khóa dòng dữ liệu của phòng này lại, khiến luồng thứ hai gửi đến phải chờ luồng thứ nhất commit xong mới được đọc, nhờ vậy loại bỏ hoàn toàn việc 2 người đặt trùng cùng 1 phòng ạ."*

#### ❓ Câu 5: Nếu mạng chập chờn khi đang thanh toán VietQR thì xử lý thế nào?
* **Trả lời:** *"Dạ, hệ thống có hàm `fetchWithTimeout` với thời gian chờ giới hạn (Timeout). Nếu mất mạng, ứng dụng sẽ bắt lỗi `catch` và hiển thị thông báo thân thiện cho người dùng thử lại. Đồng thời, đơn phòng vẫn được giữ ở trạng thái `pending` trong 15 phút, khách hàng có thể vào lại mục Đặt phòng để tiếp tục tải ảnh biên lai khi mạng ổn định ạ."*

---

## 🏆 BÍ QUYẾT TÂM LÝ DÀNH CHO BẠN CHUẨN:
1. **Trang phục gọn gàng, tự tin:** Mặc áo sơ mi có cổ, nói to, dõng dạc, mắt nhìn thẳng vào thầy cô.
2. **Nắm thế chủ động khi Demo:** Hãy chủ động dẫn dắt thầy cô đi qua kịch bản demo: *"Sau đây em xin phép được demo 3 điểm kỹ thuật tâm đắc nhất của em..."* $\to$ Khi bạn làm chủ được màn hình demo, thầy cô sẽ bị cuốn theo và ít khi hỏi các câu lý thuyết hóc búa.
3. **Thành thật và cầu thị:** Nếu gặp câu hỏi mở về tương lai, hãy trả lời: *"Dạ đây là một hướng phát triển rất hay, trong phạm vi đồ án môn học em chưa kịp triển khai, em xin phép tiếp thu ý kiến của thầy để phát triển hoàn thiện hơn trong đồ án tốt nghiệp sắp tới ạ!"*

Chúc bạn Chuẩn có một buổi bảo vệ thật thành công rực rỡ và đạt điểm số cao nhất! 🚀
