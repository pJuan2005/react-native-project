# 🚀 HƯỚNG DẪN CẤP TỐC: HIỂU CODE & EDIT CODE KHI THẦY VẤN ĐÁP

> **Dành riêng cho:** Phạm Xuân Chuẩn  
> **Mục tiêu:** Nắm chắc kiến trúc dự án, hiểu nhanh cú pháp, tự tin sửa code tại chỗ khi thầy yêu cầu và vượt qua buổi bảo vệ đồ án 15 - 20 phút.

---

## 🗺️ PHẦN 1: BẢN ĐỒ DỰ ÁN (THẦY BẢO MỞ GÌ, MỞ ĐƯỢC NGAY ĐÓ)

Dự án của bạn gồm 3 phần chính. Thầy chấm môn **Lập trình di động đa nền tảng** sẽ **90% soi vào thư mục `app/`** (Mobile) và một phần nhỏ vào `backend/`.

```text
appw3/
├── app/                        <=== 📱 ĐÂY LÀ PHẦN THẦY CHẤM CHÍNH (REACT NATIVE / EXPO)
│   ├── (tabs)/                 <--- 5 Tab chính dưới đáy màn hình
│   │   ├── index.tsx           <--- [1] Trang chủ: Tìm kiếm, banner, homestay nổi bật
│   │   ├── locations.tsx       <--- [2] Tab Địa điểm: Đà Lạt, Sa Pa, Phú Quốc...
│   │   ├── homestays.tsx       <--- [3] Tab Danh sách homestay & Lọc loại hình/giá
│   │   ├── bookings.tsx        <--- [4] Tab Đặt phòng của tôi (Trỏ về app/bookings.tsx)
│   │   └── users.tsx           <--- [5] Tab Hồ sơ cá nhân (Tài khoản, cài đặt)
│   ├── homestay/[id].tsx       <--- [QUAN TRỌNG] Chi tiết phòng, lịch ngày & đặt phòng
│   ├── bookings.tsx            <--- [QUAN TRỌNG] Danh sách đặt phòng, lọc Đang ở/Sắp tới, thanh toán VietQR, hủy hoàn 70% ví
│   ├── wallet.tsx              <--- [QUAN TRỌNG] Ví điện tử, lịch sử sổ cái, lệnh rút tiền
│   ├── bank-accounts.tsx       <--- Quản lý tài khoản ngân hàng liên kết
│   ├── chat/[id].tsx           <--- Nhắn tin chat 1-1 với chủ nhà
│   ├── disputes.tsx            <--- Danh sách khiếu nại của khách
│   ├── dispute/[id].tsx        <--- Form gửi khiếu nại sự cố kèm ảnh
│   ├── login.tsx               <--- Màn hình Đăng nhập
│   └── register.tsx            <--- Màn hình Đăng ký
│
├── backend/src/                <=== ⚙️ TẦNG MÁY CHỦ REST API (NODE.JS / EXPRESS)
│   ├── models/booking.model.js <--- [CỰC QUAN TRỌNG] Xử lý chống Overbooking (FOR UPDATE)
│   ├── services/
│   │   ├── cancellation.service.js <--- [CỰC QUAN TRỌNG] Tính tiền hoàn 70% ví (mốc 72h)
│   │   ├── wallet.service.js       <--- Quản lý số dư ví & sổ cái
│   │   └── host-verification.service.js <--- Lưu ảnh CCCD 2 mặt
│   └── routes/                 <--- Định tuyến API: /api/bookings, /api/homestays...
│
└── web/                        <=== 💻 WEB PORTAL DÀNH CHO HOST & ADMIN (NEXT.JS 16)
    └── app/
        ├── host/               <--- Cổng chủ nhà (đăng phòng, nộp CCCD KYC)
        └── admin/              <--- Cổng admin (duyệt phòng, duyệt tiền rút, duyệt CCCD)
```

---

## 💡 PHẦN 2: "BÍ KÍP" ĐỌC CÚ PHÁP REACT NATIVE CHO NGƯỜI MỚI

Khi thầy bắt nhìn vào code, bạn chỉ cần nhớ các thẻ cơ bản này:
1. `<View>`: Giống như thẻ `<div>` trong web, dùng làm cái khung chứa các phần tử.
2. `<Text>`: Dùng để hiển thị chữ. Muốn viết chữ trong React Native **bắt buộc phải bọc trong `<Text>`**.
3. `<Pressable>` hoặc `<TouchableOpacity>`: Nút bấm có thể nhấn được (bắt sự kiện `onPress`).
4. `<TextInput>`: Ô cho người dùng gõ chữ vào.
5. `<Image>` hoặc `<ProductImage>`: Hiển thị hình ảnh.
6. `style={[s.tenStyle, { color: 'red' }]}`: Định dạng CSS cho phần tử. Các style được viết ở cuối file trong `const s = StyleSheet.create({ ... })`.
7. `router.push('/duong-dan')`: Dùng để chuyển màn hình.
8. **React Hooks cơ bản (Thầy hay hỏi lý thuyết):**
   - `useState(giá_trị_ban_đầu)`: Dùng để lưu trữ dữ liệu có thể thay đổi trên màn hình (khi state thay đổi, giao diện tự động vẽ lại).
   - `useEffect(() => { ... }, [])`: Chạy một hàm khi màn hình vừa mở lên (thường dùng để gọi API lấy dữ liệu từ Backend).
   - `useMemo(() => { ... }, [dependencies])`: Tối ưu hóa tính toán, chỉ tính lại khi dữ liệu phụ thuộc thay đổi (ví dụ: lọc danh sách, tính tổng tiền).

---

## 🎯 PHẦN 3: 10 BÀI TẬP "THẦY HAY BẮT SỬA CODE TẠI CHỖ" & CÁCH LÀM TRONG 30 GIÂY

### 📌 Bài 1: "Thầy bảo: Sửa màu hoặc sửa chữ của một nút bấm"
* **Ví dụ:** Sửa nút "Đặt phòng ngay" hoặc nút "Thanh toán" sang màu xanh lá (`#16A34A`) hoặc màu đỏ (`#EF4444`).
* **Cách làm:**
  1. Mở file màn hình đó (ví dụ: `app/homestay/[id].tsx` hoặc `app/bookings.tsx`).
  2. Bấm `Ctrl + F` tìm chữ của nút đó (ví dụ tìm: `Đặt phòng ngay` hoặc `Thanh toán`).
  3. Thấy thuộc tính `style={[s.payNowBtn, { backgroundColor: colors.primary }]}`.
  4. Bạn chỉ cần sửa `{ backgroundColor: '#16A34A' }` (màu xanh lá) hoặc `{ backgroundColor: '#EF4444' }` (màu đỏ).
  5. Sửa chữ: Đổi nội dung nằm giữa thẻ `<Text>Nội dung mới</Text>`.
  6. Bấm `Ctrl + S` lưu lại $\to$ Màn hình điện thoại/web tự động đổi màu ngay lập tức!

---

### 📌 Bài 2: "Thầy bảo: Thêm 1 dòng chữ / 1 thông tin mới vào thẻ Homestay hoặc Booking"
* **Ví dụ:** Thêm dòng chữ *"Ưu đãi miễn phí bữa sáng"* vào thẻ phòng trong `app/bookings.tsx`.
* **Cách làm:**
  1. Mở `app/bookings.tsx`, tìm dòng hiển thị ngày tháng: `formatDate(booking.checkIn)`.
  2. Ngay bên dưới dòng đó, gõ thêm:
     ```tsx
     <Text style={{ fontSize: 11, color: '#16A34A', fontWeight: 'bold', marginTop: 2 }}>
       🎁 Ưu đãi: Miễn phí bữa sáng buffet
     </Text>
     ```
  3. Lưu lại $\to$ Trên ứng dụng xuất hiện ngay dòng chữ xanh lá đậm!

---

### 📌 Bài 3: "Thầy bảo: Thêm một icon mới vào giao diện"
* **Ví dụ:** Thêm icon trái tim hoặc icon ngôi sao cạnh tiêu đề.
* **Cách làm:**
  1. Trong React Native Expo, icon lấy từ thư viện `@expo/vector-icons`:
     ```tsx
     <Ionicons name="heart" size={18} color="#EF4444" />
     ```
  2. Nếu thầy bảo đổi icon khác:
     - Icon ngôi sao: `name="star"`
     - Icon chìa khóa: `name="key-outline"`
     - Icon xe hơi: `name="car-outline"`
     - Icon check thành công: `name="checkmark-circle"`

---

### 📌 Bài 4: "Thầy bảo: Sửa tỷ lệ hoàn tiền hủy phòng từ 70% thành 80% hoặc 50%"
* **Vị trí sửa:** `backend/src/services/cancellation.service.js` (dòng 42 - 58).
* **Cách làm:**
  1. Mở file `backend/src/services/cancellation.service.js`.
  2. Tìm hàm `calculateSplitBreakdown`:
     ```js
     // Sửa từ 70 thành 80:
     const refundPercentage = 80; // Sửa số 70 thành 80
     const refundAmount = Math.round(totalPaid * 0.80); // Sửa 0.70 thành 0.80
     const cancellationFee = totalPaid - refundAmount; // 20% phí hủy
     const platformFee = Math.round(totalPaid * 0.10); // Sàn 10%
     const hostPayout = cancellationFee - platformFee; // Host nhận 10%
     ```
  3. Lưu lại $\to$ Backend tự động tính toán hoàn 80% vào ví khi khách hủy trước 72 giờ!

---

### 📌 Bài 5: "Thầy bảo: Sửa mốc thời gian hoàn tiền từ 72 giờ thành 48 giờ hoặc 24 giờ"
* **Vị trí sửa:** `backend/src/services/cancellation.service.js` (dòng 39).
* **Cách làm:**
  1. Tìm dòng `if (hoursUntilCheckIn >= 72) {`.
  2. Sửa số `72` thành `48`: `if (hoursUntilCheckIn >= 48) {`.
  3. Sửa câu thông báo mô tả bên dưới từ `72 giờ` thành `48 giờ`.
  4. Lưu lại.

---

### 📌 Bài 6: "Thầy bảo: Thay đổi số tiền rút tối thiểu từ Ví điện tử"
* **Ví dụ:** Đang cho rút tối thiểu 50.000đ, thầy bảo sửa thành tối thiểu 100.000đ.
* **Cách làm:**
  1. Mở `app/wallet.tsx`, tìm dòng kiểm tra số tiền rút (khoảng dòng 100):
     ```ts
     if (numAmount < 100000) { // Sửa 50000 thành 100000
       Alert.alert('Số tiền không hợp lệ', 'Số tiền rút tối thiểu là 100.000 ₫');
       return;
     }
     ```
  2. Lưu lại.

---

### 📌 Bài 7: "Thầy hỏi: Bài toán chống đặt trùng phòng (Overbooking) em giải quyết ở đâu trong code?"
* **Vị trí chỉ điểm:** `backend/src/models/booking.model.js` (dòng 286 - 290).
* **Cách mở code và trả lời:**
  1. Mở file `backend/src/models/booking.model.js`, kéo đến dòng 286, chỉ vào dòng:
     ```js
     const [pRows] = await runner.query(
       'SELECT id, name, price_per_night, max_guests, is_active, host_id FROM properties WHERE id = ? AND is_deleted = 0 FOR UPDATE',
       [targetPropertyId]
     );
     ```
  2. **Dõng dạc trả lời:**  
     *"Thưa thầy, em sử dụng Database Transaction của MySQL kết hợp với từ khóa `FOR UPDATE` (Row-Level Locking). Khi khách hàng A ấn đặt phòng, dòng dữ liệu của chỗ nghỉ đó trong cơ sở dữ liệu sẽ bị khóa độc quyền trong phạm vi transaction. Nếu khách hàng B gửi yêu cầu đặt cùng lúc, hệ thống sẽ bắt khách B phải đợi hoặc kiểm tra hàm xung đột ngày, nếu trùng thì hệ thống Rollback và báo phòng đã có người đặt, loại bỏ 100% tình trạng đặt trùng phòng (Race Condition) ạ."*

---

### 📌 Bài 8: "Thầy hỏi: Luồng dữ liệu chạy từ Mobile App về Server như thế nào?"
* **Cách trả lời tự tin:**
  *"Thưa thầy, kiến trúc hệ thống của em tuân theo mô hình Client-Server chuẩn:*
  1. *Trên Mobile App (React Native), khi người dùng tương tác (ví dụ bấm Đặt phòng), app sẽ gọi hàm `fetchWithTimeout` gửi yêu cầu HTTP (POST/GET) kèm mã xác thực Bearer JWT Token về máy chủ Express qua địa chỉ `http://localhost:3000/api/...`.*
  2. *Ở Backend, yêu cầu đi qua `routes/booking.routes.js` để định tuyến $\to$ chuyển tiếp sang `controllers/booking.controller.js` để kiểm tra dữ liệu đầu vào $\to$ gọi sang `services/booking.service.js` để xử lý nghiệp vụ $\to$ gọi `models/booking.model.js` thực thi câu lệnh SQL với MySQL.*
  3. *Cơ sở dữ liệu trả về kết quả $\to$ Controller đóng gói JSON trả về cho Mobile $\to$ Mobile cập nhật vào React State (`useState`) và hiển thị lên giao diện tức thời mà không cần reload trang ạ."*

---

### 📌 Bài 9: "Thầy hỏi: State và Props khác nhau như thế nào trong React Native?"
* **Cách trả lời ngắn gọn, chuẩn 10/10:**
  - **Props (Properties):** Là dữ liệu truyền từ component cha xuống component con, chỉ đọc (Read-only), component con không được tự ý sửa props.
  - **State:** Là trạng thái dữ liệu nội bộ bên trong một component (quản lý qua `useState`), có thể thay đổi được. Mỗi khi `setState` được gọi, component sẽ tự động render (vẽ lại) giao diện với dữ liệu mới.

---

### 📌 Bài 10: "Thầy hỏi: File-based Routing trong Expo Router hoạt động thế nào?"
* **Cách trả lời:**
  - Expo Router sử dụng cấu trúc thư mục để tự động tạo đường dẫn (giống Next.js).
  - Thư mục có dấu ngoặc tròn `(tabs)`: Là nhóm các màn hình nằm chung trong thanh điều hướng Tab Bar dưới đáy màn hình (Trang chủ, Đặt phòng, Hồ sơ...).
  - Tệp tin có dấu ngoặc vuông `[id].tsx`: Là tuyến đường động (Dynamic Route). Ví dụ khi chuyển đến `/homestay/10`, Expo Router sẽ tự động nạp file `app/homestay/[id].tsx` và lấy được tham số `id = 10` thông qua hook `useLocalSearchParams()`.

---

## 💡 LỜI KHUYÊN TÂM LÝ KHI BẢO VỆ:
1. **Bình tĩnh, nói to, rõ ràng:** Giảng viên rất thích sinh viên trả lời dứt khoát.
2. **Nếu thầy bắt sửa code mà run quá:** Đừng sợ! Hãy bảo: *"Dạ vâng, để em mở file component tương ứng ra ạ"*, sau đó dùng `Ctrl + F` tìm từ khóa trên giao diện là ra ngay vị trí cần sửa.
3. **Mọi thao tác sửa xong nhớ bấm `Ctrl + S`** để ứng dụng Expo tự động cập nhật ngay trên màn hình.
