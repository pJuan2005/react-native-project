# BÁO CÁO NGHIỆP VỤ VÀ CHỨC NĂNG HỆ THỐNG
## ĐỀ TÀI: NỀN TẢNG ĐẶT PHÒNG VÀ QUẢN LÝ HOMESTAY ĐA NỀN TẢNG (MOBILE APP & WEB PORTAL)

---

## I. TỔNG QUAN VÀ BẢN CHẤT BÀI TOÁN

### 1. Thực trạng & Vấn đề thực tế
Trong mô hình kinh doanh du lịch lưu trú hiện nay (Homestay, Villa nghỉ dưỡng tại Đà Lạt, Sa Pa, Phú Quốc, Hội An...), phần lớn các chủ homestay là cá nhân hoặc hộ gia đình. Họ đang gặp phải 3 vấn đề lớn:
1. **Khó khăn trong tiếp cận khách hàng:** Khách du lịch ngày nay chủ yếu sử dụng điện thoại thông minh để tìm kiếm và đặt phòng. Nếu không có ứng dụng di động, homestay rất khó tiếp cận lượng khách lẻ này.
2. **Nguy cơ trùng lịch (Overbooking):** Homestay vừa đăng bán online cho khách trên app, vừa nhận khách vãng lai (walk-in) hoặc khách gọi điện đặt trực tiếp. Nếu quản lý thủ công bằng sổ sách hay Zalo thì việc 2 khách cùng đặt trùng 1 phòng vào cùng một khoảng thời gian là điều rất dễ xảy ra.
3. **Minh bạch tài chính và niềm tin:** Sàn cần quản lý danh tính chủ nhà và kiểm duyệt chất lượng phòng để bảo vệ khách; chủ nhà cần theo dõi rõ ràng dòng tiền thực nhận (sau khi trừ phí hoa hồng); khách hàng cần cơ chế thanh toán thuận tiện (VietQR) và quyền khiếu nại nếu dịch vụ không đúng mô tả.

### 2. Giải pháp của hệ thống
Hệ thống giải quyết bài toán trên bằng mô hình **kết nối đa nền tảng đồng bộ thời gian thực**:
* **Ứng dụng di động (Mobile App - React Native):** Dành riêng cho Khách hàng (Guest) trải nghiệm tìm kiếm, chọn ngày, đặt phòng và thanh toán nhanh chóng.
* **Cổng Web Quản trị & Chủ nhà (Web Portal - Next.js):** Dành cho Chủ homestay (Host) đăng tin, theo dõi doanh thu và tạo đơn trực tiếp tại quầy; dành cho Quản trị viên sàn (Admin) duyệt phòng, xác nhận biên lai và đối soát hoa hồng.
* **Hệ thống Máy chủ & CSDL (Node.js/Express + MySQL):** Là trung tâm xử lý dữ liệu duy nhất (Single Source of Truth), đảm bảo việc đặt phòng tại quầy trên Web hay đặt online trên App đều khóa phòng tức thì, không bao giờ bị trùng lịch.

---

## II. CÁC ĐỐI TƯỢNG SỬ DỤNG VÀ VAI TRÒ (ROLES)

Hệ thống phân định rõ ràng 3 đối tượng tham gia:

```
                          HỆ THỐNG HOMESTAY
                                  │
           ┌──────────────────────┼──────────────────────┐
           ▼                      ▼                      ▼
      KHÁCH HÀNG              CHỦ HOMESTAY           QUẢN TRỊ VIÊN
       (Guest)                   (Host)                 (Admin)
           │                      │                      │
   📱 Mobile App          💻 Host Web Portal     💻 Admin Web Portal
   - Tìm kiếm, xem phòng  - Đăng & sửa homestay  - Duyệt homestay
   - Đặt phòng online     - Đặt phòng tại quầy   - Duyệt biên lai tiền
   - Quét mã VietQR       - Xem doanh thu thực   - Quản lý người dùng
   - Đánh giá & đổi điểm  - Lễ tân dùng link quầy - Báo cáo tài chính sàn
```

1. **Khách hàng (Guest):** Sử dụng App Mobile để tìm homestay, chọn ngày đến/đi, áp mã giảm giá, đặt phòng, chuyển khoản ngân hàng và đánh giá sau chuyến đi.
2. **Chủ Homestay (Host / Lễ tân):** Sử dụng Web Portal để quản lý phòng nghỉ của mình, xem lịch đón khách, tạo đơn trực tiếp cho khách đến tại quầy (Walk-in), và theo dõi doanh thu thực nhận.
3. **Quản trị viên (Super Admin):** Sử dụng Web Admin để kiểm duyệt chất lượng phòng mới, xác minh căn cước chủ nhà, kiểm tra ảnh chụp biên lai chuyển khoản để duyệt đơn, theo dõi tổng doanh thu và tiền hoa hồng sàn thu được.

---

## III. CÁCH THỨC HOẠT ĐỘNG VÀ CÁC LUỒNG NGHIỆP VỤ CHÍNH

### 1. Luồng Khách đặt phòng Online trên Mobile App
```
Khách chọn Homestay ➔ Chọn ngày Check-in/Check-out ➔ Chọn Voucher ➔ Bấm "Đặt phòng"
                                                                         │
                                                                         ▼
                                                     Hệ thống kiểm tra & Khóa lịch (Transaction)
                                                                         │
                                                                         ▼
                                                     Tạo đơn phòng (Trạng thái: Chờ duyệt)
                                                                         │
                                                                         ▼
                                                     Khách quét VietQR & Tải ảnh biên lai CK
                                                                         │
                                                                         ▼
                                                     Admin xem biên lai & Bấm "Duyệt đơn"
                                                                         │
                                                                         ▼
                                                     Đơn chuyển thành "Đặt phòng thành công"
```
* **Bước 1:** Khách mở Mobile App, xem thông tin homestay, tiện nghi, hình ảnh và vị trí.
* **Bước 2:** Chọn ngày nhận phòng (Check-in) và trả phòng (Check-out) $\rightarrow$ App tự tính số đêm và tổng tiền.
* **Bước 3:** Khách bấm **"Đặt phòng ngay"** $\rightarrow$ Backend kiểm tra tính khả dụng, tạo đơn phòng với trạng thái `pending` (Chờ duyệt). Khách được tặng ngay +100 điểm thưởng thành viên.
* **Bước 4:** Khách mở chi tiết đơn, bấm **"Thanh toán"** $\rightarrow$ App hiển thị mã VietQR động với đúng số tiền và nội dung chuyển khoản. Khách chuyển khoản xong chụp màn hình tải lên ứng dụng (Upload minh chứng chuyển khoản).
* **Bước 5:** Trạng thái thanh toán chuyển sang `Đã thanh toán CK`, đơn phòng được gửi đến Web Admin.
* **Bước 6:** Admin kiểm tra ảnh chụp biên lai hợp lệ $\rightarrow$ bấm **"Duyệt"** $\rightarrow$ Đơn phòng chính thức chuyển sang trạng thái `Đặt phòng thành công` (`confirmed`).

---

### 2. Luồng Chủ Homestay tạo đơn Đặt phòng trực tiếp tại quầy (Walk-in Direct Booking)
Đây là nghiệp vụ thực tế khi khách đến trực tiếp homestay hoặc gọi hotline đặt chỗ:
```
Khách đến tại quầy ➔ Chủ nhà mở Web Host ➔ Bấm "Đặt phòng tại quầy"
                                                      │
                                                      ▼
                      Nhập: Tên khách + SĐT + Ngày nhận/trả phòng + Số khách
                                                      │
                                                      ▼
                      Web tự tính tiền: Tiền phòng, Hoa hồng sàn (5%), Thực nhận (95%)
                                                      │
                                                      ▼
                      Bấm "Tạo đơn & Khóa lịch" ➔ Tự động KHÓA LỊCH trên Mobile App
```
* **Ý nghĩa:** Khách vãng lai không cần tải app hay đăng ký tài khoản, chủ nhà vẫn tạo được đơn trên web. Ngay khi bấm tạo đơn, **khoảng ngày đó lập tức bị khóa trên App Mobile**, khách online tra cứu ngày đó sẽ thấy báo phòng đã kín, loại bỏ 100% rủi ro đền phòng do trùng lịch.

---

### 3. Cơ chế Đồng bộ Hai chiều giữa Mobile và Web (Cross-Platform Sync)
Hệ thống sử dụng chung một CSDL MySQL duy nhất:
* **Khách đặt trên Mobile App** $\rightarrow$ Lịch trên Web Host tự động khóa, danh sách đơn của Host tự động hiện đơn mới với nhãn `📱 App Mobile`.
* **Host đặt tại quầy trên Web** $\rightarrow$ Lịch trên Mobile App lập tức đóng lại, không ai đặt trùng được.
* **Admin bấm Duyệt đơn trên Web** $\rightarrow$ Màn hình Mobile của khách chuyển ngay từ `Chờ duyệt` sang `Đặt phòng thành công`.

---

### 4. Luồng Phân chia Tài chính & Hoa hồng Nền tảng (Revenue Split)
Hệ thống tự động hạch toán dòng tiền minh bạch trên từng đơn đặt phòng:
* **Đơn khách đặt qua App Mobile (`guest_online`):**
  - Khách trả: 100% giá trị phòng.
  - Sàn thu hoa hồng: **10%** (Phí dịch vụ OTA).
  - Chủ homestay thực nhận: **90%** tiền phòng.
* **Đơn chủ nhà tự tạo tại quầy (`host_direct`):**
  - Khách trả: 100% giá trị phòng.
  - Sàn thu phí quản lý phần mềm: **5%**.
  - Chủ homestay thực nhận: **95%** tiền phòng.
* **Báo cáo đối soát:** Cả Admin và Host đều có biểu đồ và bảng số liệu riêng biệt để theo dõi doanh thu tổng, tiền nộp sàn và tiền chuyển về tài khoản ngân hàng.

---

### 5. Luồng Đánh giá & Tích lũy Điểm thưởng (Loyalty Program)
* Sau khi khách hoàn thành kỳ nghỉ (trả phòng xong): Mở tính năng Đánh giá 5 sao kèm nhận xét.
* Gửi đánh giá thành công $\rightarrow$ Khách được cộng thêm **+150 điểm thưởng**.
* Khách dùng điểm tích lũy trong ví để đổi các voucher giảm giá (Ví dụ: 200 điểm đổi voucher giảm 100.000₫) cho những lần đặt phòng tiếp theo.

---

## IV. DANH SÁCH CHỨC NĂNG CHI TIẾT THEO TỪNG PHÂN HỆ

### 1. Phân hệ Ứng dụng Di động (Mobile App - React Native Expo)
Dành cho Khách hàng (Guest) với giao diện tối ưu, hiện đại và chuẩn responsive trên mọi kích cỡ điện thoại:
1. **Trang chủ (Home):**
   - Hero banner chào đón người dùng theo tên tài khoản.
   - Thanh tìm kiếm homestay nhanh theo tên hoặc địa điểm du lịch.
   - Dải chữ chạy xu hướng (Trending Marquee) hiển thị các từ khóa hot (Villa hồ bơi, Đà Lạt view đồi, Sa Pa săn mây...).
   - Danh sách "Dành cho bạn" và lưới 2 cột "Homestay nổi bật" hiển thị hình ảnh, giá tiền, địa điểm, nút lưu yêu thích.
2. **Khám phá Địa điểm (Locations):**
   - Danh sách các vùng miền du lịch nổi tiếng (Đà Lạt, Sa Pa, Phú Quốc, Hội An, Nha Trang, Ninh Bình...).
   - Bấm vào từng địa điểm để lọc ra danh sách homestay tại khu vực đó.
3. **Danh sách Homestay (Homestays Listing):**
   - Bộ lọc phân loại chỗ nghỉ (Tất cả, Villa, Homestay, Resort, Cabin, Eco Homestay...).
   - Sắp xếp linh hoạt theo Giá tăng dần hoặc Điểm đánh giá cao nhất.
   - Tìm kiếm theo từ khóa thời gian thực.
4. **Chi tiết Homestay & Đặt phòng (Homestay Detail):**
   - Bộ sưu tập đa ảnh (Carousel Viewer) có chế độ xem toàn màn hình (Fullscreen Gallery).
   - Thông tin chi tiết: Sức chứa tối đa, số phòng ngủ, số phòng tắm, danh sách tiện nghi (WiFi, Bếp, BBQ, Hồ bơi...).
   - Bộ chọn ngày lịch (Calendar Date Picker) hỗ trợ chọn nhanh (Hôm nay, Cuối tuần, Tuần tới).
   - Tự động kiểm tra tính hợp lệ của ngày đặt và sức chứa khách.
   - Chọn áp dụng mã giảm giá / Voucher từ ví cá nhân.
   - Thanh cố định ở đáy màn hình (Sticky Bottom Bar) giúp đặt phòng thuận tiện không bị che khuất bởi phím Home.
5. **Quản lý Đặt phòng & Thanh toán (Bookings & Payment):**
   - Tab "Phòng đã đặt": Hiển thị danh sách các đơn phòng kèm 2 huy hiệu trạng thái rõ ràng (*Trạng thái thanh toán: Đã thanh toán CK / Chưa thanh toán* và *Trạng thái đơn: Đặt phòng thành công / Chờ duyệt*).
   - Xem chi tiết hóa đơn đặt phòng: Mã đơn, ngày nhận/trả phòng, số đêm, số khách, giá gốc, tiền voucher giảm, tổng tiền.
   - **Thanh toán VietQR:** Mở modal quét mã QR chuyển khoản tự động kèm thông tin số tài khoản và nội dung chuyển khoản theo mã đơn.
   - **Tải lên biên lai chuyển khoản:** Chọn ảnh biên lai từ thư viện máy hoặc dùng ảnh mẫu demo để gửi xác nhận thanh toán.
   - **Hủy đặt phòng an toàn:** Nút thùng rác độc lập có hộp thoại cảnh báo xác nhận, hủy đơn và đồng bộ trả lại ngày trống trên CSDL mà không làm đơ ứng dụng.
   - Tab "Yêu thích" (Wishlist): Lưu lại các homestay ưng ý để xem lại và đặt sau.
6. **Tài khoản Cá nhân & Cài đặt (Profile & Settings):**
   - Quản lý thông tin cá nhân: Họ tên, Email, Số điện thoại, Địa chỉ, Ngày sinh.
   - Đổi ảnh đại diện (chọn từ thư viện máy hoặc chọn bộ avatar hoạt hình có sẵn).
   - Thẻ điểm thưởng thành viên: Xem số điểm tích lũy, mở bảng lịch sử cộng/trừ điểm và chức năng "Đổi Voucher".
   - Ví Voucher của tôi: Quản lý danh sách các mã giảm giá được quyền sử dụng.
   - Cài đặt giao diện: Chuyển đổi linh hoạt chế độ Sáng (Light Mode) / Tối (Dark Mode) có lưu trạng thái vĩnh viễn trên thiết bị.
7. **Xác thực Người dùng (Auth):**
   - Đăng nhập, Đăng ký tài khoản mới có validate định dạng email, độ dài mật khẩu và khớp mật khẩu xác nhận.

---

### 2. Phân hệ Web Quản trị Sàn (Super Admin Portal - Next.js)
Dành cho Nhà điều hành toàn bộ nền tảng:
1. **Admin Dashboard:**
   - Thống kê toàn sàn: Tổng doanh thu gộp, Tiền hoa hồng thực thu của sàn (10%), Tổng số đơn đặt phòng, Số lượng Homestay, Số lượng Khách & Chủ nhà.
   - Biểu đồ tài chính 12 tháng phân tích song song: Doanh thu tổng & Tiền hoa hồng sàn thu về.
2. **Quản lý Đặt phòng Toàn hệ thống (Manage Bookings):**
   - Bảng danh sách đơn phòng toàn sàn, lọc theo trạng thái (*Chờ duyệt, Đã xác nhận, Hoàn thành, Đã hủy*) và lọc theo nguồn (*App Mobile, Tại quầy Host*).
   - Xem ảnh chụp biên lai chuyển khoản ngân hàng của khách (ảnh phóng to trong modal).
   - Nút thao tác nhanh: Duyệt đơn (chấp nhận đơn phòng), Hoàn thành đơn hoặc Hủy đơn.
3. **Quản lý & Duyệt Homestay (Properties & Approvals):**
   - Quản lý danh sách homestay của tất cả các chủ nhà trên toàn hệ thống.
   - Phê duyệt homestay mới đăng ký hoặc từ chối kèm lý do phản hồi cho chủ nhà.
   - Bật / tắt trạng thái hoạt động kinh doanh của homestay.
4. **Quản lý Đối tác & Chủ nhà (Manage Hosts):**
   - Danh sách các chủ homestay, số lượng cơ sở quản lý, khu vực hoạt động và tỷ lệ hoa hồng áp dụng.
5. **Xác minh Danh tính Chủ nhà (Host Verifications):**
   - Kiểm tra ảnh chụp 2 mặt Căn cước công dân (CCCD) và giấy phép kinh doanh của chủ nhà để cấp tích xanh "Đã xác minh".
6. **Xử lý Khiếu nại & Tranh chấp (Disputes Management):**
   - Tiếp nhận báo cáo từ khách hàng (chỗ nghỉ ảo, không đúng mô tả, chủ nhà vắng mặt...).
   - Điều tra và thực thi quyết định: Hoàn tiền cho khách, cảnh cáo, tạm dừng homestay hoặc khóa tài khoản chủ nhà vi phạm.
7. **Cấu hình Nền tảng (Platform Settings):**
   - Tùy chỉnh tỷ lệ % hoa hồng đơn online (mặc định 10%) và đơn tại quầy (mặc định 5%).
   - Cấu hình thông tin tài khoản ngân hàng nhận tiền của sàn.
8. **Nhật ký Kiểm toán (Audit Logs):**
   - Lưu vết lịch sử toàn bộ các thao tác nhạy cảm (ai duyệt phòng nào, lúc mấy giờ, lý do từ chối là gì...).

---

### 3. Phân hệ Web Dành cho Chủ Homestay (Host Portal - Next.js)
Dành riêng cho Chủ cơ sở lưu trú và nhân viên quản lý:
1. **Host Dashboard:**
   - Thống kê doanh thu thực nhận của chủ nhà (sau khi trừ phí sàn), số lượng đơn phòng, phân tích tỷ lệ khách từ App Mobile vs khách đặt tại quầy.
2. **Quản lý Homestay của tôi (My Properties):**
   - Đăng homestay mới: Tên, địa chỉ, loại hình, giá tiền/đêm, sức chứa, số phòng, tải lên album ảnh bìa và ảnh chi tiết, gắn danh mục tiện nghi.
   - Chỉnh sửa thông tin phòng nghỉ.
3. **Đặt phòng Trực tiếp tại quầy (Walk-in Direct Booking):**
   - Chức năng tạo đơn cho khách đến trực tiếp hoặc gọi điện thoại.
   - Nhập tên khách, số điện thoại, ngày nhận/trả phòng, số khách, hình thức thanh toán.
   - Bảng tính tiền tự động thời gian thực hiển thị rõ: Tiền phòng, Hoa hồng nộp sàn (5%) và Tiền chủ nhà thực nhận (95%).
   - Tự động kiểm tra chống trùng lịch và khóa ngày ngay trên App Mobile.
4. **Quản lý Đơn phòng Homestay:**
   - Xem toàn bộ lịch đón khách, phân biệt khách đặt từ App Mobile và khách đặt tại quầy.
5. **Báo cáo Tài chính & Số dư (Host Revenue & Payout):**
   - Bảng đối soát thu nhập minh bạch từng đơn phòng và thông tin số tài khoản ngân hàng nhận tiền định kỳ.

---

### 4. Phân hệ Quầy Lễ Tân Truy cập Nhanh (Quick Manage)
* Mở bằng đường dẫn chứa mã token bí mật riêng của từng homestay (Ví dụ: `/quick-manage/HMTOKEN_0001`).
* Dành cho thiết bị iPad / máy tính bảng đặt tại quầy lễ tân: Nhân viên lễ tân có thể tra cứu lịch trống và tạo đơn đặt phòng trực tiếp cho khách walk-in ngay lập tức mà không cần đăng nhập tài khoản.

---

## V. CÁC THUẬT TOÁN VÀ CƠ CHẾ KỸ THUẬT NỔI BẬT

Hệ thống được xây dựng hoàn toàn bằng **thuật toán tất định (Deterministic Logic)** và cơ chế CSDL chuẩn mực, tuyệt đối không dùng Machine Learning:

### 1. Thuật toán Kiểm tra Trùng lịch Phòng (Date Overlap Algorithm)
* **Công thức toán học:**
  $$\text{Overlap} \iff (\text{Ngày nhận mới} < \text{Ngày trả cũ}) \land (\text{Ngày trả mới} > \text{Ngày nhận cũ})$$
* **Điểm ưu việt:** Xử lý chính xác trường hợp chuẩn khách sạn: Khách cũ trả phòng ngày 05/10 và khách mới nhận phòng đúng ngày 05/10 $\rightarrow$ Kết quả là `False` (Không trùng lịch, cho phép đặt phòng bình thường). Bất kỳ khoảng ngày nào chèn vào giữa đều bị chặn đứng (`True`).

### 2. Chống Tranh chấp Kép bằng Concurrency Lock (Transaction + Row Locking)
* **Vấn đề:** Nếu 2 người cùng bấm đặt 1 phòng ở cùng 1 giây, cả 2 đều thấy phòng trống và cùng ghi dữ liệu $\rightarrow$ Bị bán trùng phòng (Double Booking).
* **Giải pháp:** Sử dụng **MySQL Transaction** kết hợp khóa dòng **`FOR UPDATE`**:
  - Khi luồng 1 bắt đầu kiểm tra phòng, dòng homestay bị khóa độc quyền trong CSDL.
  - Luồng 2 bắt buộc phải xếp hàng chờ luồng 1 hoàn tất. Khi luồng 1 tạo đơn xong, luồng 2 đọc lại sẽ thấy phòng đã có người đặt và bị từ chối ngay lập tức.

### 3. Thuật toán Khoảng cách Địa lý Haversine
* Tính khoảng cách đường chim bay chính xác giữa tọa độ GPS của khách hàng và tọa độ của homestay trên mặt cầu Trái Đất (bán kính $R = 6371\text{ km}$) để phục vụ tính năng tìm homestay gần nhất trong bán kính 5km, 10km.

### 4. Thuật toán Xếp hạng Chỗ nghỉ Trọng số (Weighted Property Ranking)
* Công thức tính điểm minh bạch:
  $$\text{Điểm xếp hạng} = (\text{Số sao} \times 20) + (\min(\text{Số đánh giá}, 50) \times 0.4) + (\text{Phòng nổi bật} \times 15) + (\text{Chủ nhà đã duyệt CCCD} \times 15)$$
* Giúp tự động đẩy các homestay chất lượng cao và chủ nhà uy tín lên đầu danh sách tìm kiếm.

### 5. Đánh giá Điểm Rủi ro theo Luật Nghiệp vụ (Rule-Based Risk Scoring)
* Tự động cảnh báo cho Admin các dấu hiệu bất thường: Chủ nhà chưa xác minh danh tính (+25đ), có khiếu nại chưa xử lý (+20đ/vụ), tỷ lệ hủy đơn cao > 30% (+30đ), đơn ở trên 14 ngày chưa thanh toán (+25đ). Chia mức độ `LOW`, `MEDIUM`, `HIGH` để Admin ưu tiên kiểm tra.

### 6. Giới hạn Tần suất (Rate Limiting)
* Chống tấn công dò quét mật khẩu (tối đa 30 lần / 15 phút) và chống click đúp liên tục tạo đơn rác (tối đa 25 lần / 10 phút) bằng middleware an ninh `express-rate-limit`.

---

## VI. KẾT LUẬN VÀ GIÁ TRỊ THỰC TIỄN CỦA ĐỀ TÀI

1. **Hiểu đúng và trọn vẹn bản chất bài toán:** Đề tài không đơn thuần là làm một giao diện đặt phòng xem ảnh, mà đã giải quyết triệt để bài toán kinh doanh lưu trú thực tế: kết nối khách du lịch (Mobile App), chủ nhà & lễ tân (Host Portal) và đơn vị điều hành sàn (Admin Portal).
2. **Tính toàn vẹn và đồng bộ dữ liệu cao:** Giải quyết triệt để nguy cơ Overbooking bằng thuật toán kiểm tra trùng lịch và khóa giao dịch CSDL Concurrency Lock hai chiều giữa Mobile và Web.
3. **Mô hình tài chính và an toàn dịch vụ minh bạch:** Hạch toán tự động tỷ lệ hoa hồng sàn, dòng tiền thực nhận của chủ nhà, quy trình thanh toán VietQR đối soát biên lai và hệ thống giải quyết khiếu nại (Disputes) bảo vệ người tiêu dùng.
4. **Kiến trúc công nghệ hiện đại, phân tách rõ ràng:** Frontend Mobile React Native Expo mượt mà, Web Next.js 16 chuẩn Server-Side Rendering & Tailwind CSS, Backend REST API Express.js và CSDL MySQL InnoDB vững chắc.
