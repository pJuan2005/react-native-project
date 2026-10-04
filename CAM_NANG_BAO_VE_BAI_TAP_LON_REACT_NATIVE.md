# CẨM NANG TOÀN TẬP BẢO VỆ BÀI TẬP LỚN REACT NATIVE
## ĐỀ TÀI: NỀN TẢNG ĐẶT PHÒNG & QUẢN LÝ HOMESTAY (MOBILE APP & WEB ECOSYSTEM)

> **Tài liệu học cấp tốc & luyện thi vấn đáp:** Dành cho sinh viên chuẩn bị bảo vệ bài tập lớn. Giải thích chi tiết từ cú pháp cơ bản (Syntax), kiến trúc React Native, cơ sở dữ liệu MySQL, các thuật toán cốt lõi, quy trình xác thực Host/Homestay, kèm bộ câu hỏi vấn đáp có sẵn câu trả lời.

---

# MỤC LỤC
1. [PHẦN 1: PHỔ CẬP CÚ PHÁP JAVASCRIPT / TYPESCRIPT & REACT NATIVE (TỪ SỐ 0)](#phần-1-phổ-cập-cú-pháp-javascript--typescript--react-native-từ-số-0)
2. [PHẦN 2: TỔNG QUAN KIẾN TRÚC DỰ ÁN & MÔ HÌNH 3 TẦNG (3-TIER)](#phần-2-tổng-quan-kiến-trúc-dự-án--mô-hình-3-tầng-3-tier)
3. [PHẦN 3: ĐỌC & HIỂU CHI TIẾT TỪNG DÒNG CODE REACT NATIVE (APP)](#phần-3-đọc--hiểu-chi-tiết-từng-dòng-code-react-native-app)
4. [PHẦN 4: THIẾT KẾ CƠ SỞ DỮ LIỆU MYSQL (DATABASE SCHEMA & QUAN HỆ)](#phần-4-thiết-kế-cơ-sở-dữ-liệu-mysql-database-schema--quan-hệ)
5. [PHẦN 5: CÁC THUẬT TOÁN ĐẶC BIỆT TRONG DỰ ÁN](#phần-5-các-thuật-toán-đặc-biệt-trong-dự-án)
6. [PHẦN 6: CƠ CHẾ XÁC THỰC HOST & KIỂM DUYỆT HOMESTAY THẬT](#phần-6-cơ-chế-xác-thực-host--kiểm-duyệt-homestay-thật)
7. [PHẦN 7: BỘ CÂU HỎI VẤN ĐÁP THEO TỪNG PHẦN (CÓ SẴN CÂU TRẢ LỜI MẪU)](#phần-7-bộ-câu-hỏi-vấn-đáp-theo-từng-phần-có-sẵn-câu-trả-lời-mẫu)
8. [PHẦN 8: KỊCH BẢN THUYẾT TRÌNH BẢO VỆ 5 PHÚT TỰ TIN](#phần-8-kịch-bản-thuyết-trình-bảo-vệ-5-phút-tự-tin)

---

# PHẦN 1: PHỔ CẬP CÚ PHÁP JAVASCRIPT / TYPESCRIPT & REACT NATIVE (TỪ SỐ 0)

Nếu bạn chưa vững cú pháp, hãy đọc kỹ phần này trước khi đọc code. Đây là những cú pháp xuất hiện liên tục trong dự án:

### 1.1. Khai báo biến: `const`, `let`
- `const`: Biến hằng số, không gán lại giá trị được (`const name = "Đà Lạt";`).
- `let`: Biến có thể thay đổi giá trị (`let nights = 2; nights = 3;`).
- *Lưu ý:* Tuyệt đối không dùng `var` vì dễ gây lỗi phạm vi biến (scope).

### 1.2. Arrow Function (Hàm mũi tên `=>`)
Thay vì viết kiểu cũ:
```javascript
function tinhTong(a, b) {
  return a + b;
}
```
React Native luôn dùng hàm mũi tên:
```javascript
const tinhTong = (a, b) => a + b;
```

### 1.3. Destructuring (Phân rã mảng / object)
Lấy nhanh thuộc tính ra khỏi object hoặc mảng:
```javascript
const homestay = { id: 1, name: "Sunset Villa", price: 1500000 };
// Thay vì viết homestay.id, homestay.name, ta viết:
const { id, name, price } = homestay;
```

### 1.4. Spread Operator (`...` - Toán tử rải)
Dùng để copy hoặc gộp mảng/object mà không làm biến đổi dữ liệu gốc (Immutability):
```javascript
const thongTinCu = { name: "An", role: "Guest" };
// Cập nhật số điện thoại mà vẫn giữ nguyên name, role:
const thongTinMoi = { ...thongTinCu, phone: "0912345678" };
```

### 1.5. Toán tử 3 ngôi (Ternary Operator `condition ? A : B`)
Dùng để viết điều kiện `if ... else` ngay bên trong giao diện JSX:
```javascript
<Text>{isLogin ? "Xin chào bạn!" : "Vui lòng đăng nhập"}</Text>
```

### 1.6. Bất đồng bộ: `async / await` & `Promise`
Khi gửi request lên server (gọi mạng) hoặc đọc dữ liệu từ bộ nhớ điện thoại (AsyncStorage), dữ liệu không trả về ngay lập tức mà mất vài trăm mili-giây.
- `async`: Đánh dấu hàm này chạy bất đồng bộ.
- `await`: Bắt chương trình đợi server trả kết quả về rồi mới chạy dòng lệnh tiếp theo.
```javascript
const layDanhSachPhong = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/homestays");
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error("Lỗi kết nối:", err);
  }
};
```

### 1.7. Các React Hooks bắt buộc phải hiểu:
- **`useState`:** Khai báo biến trạng thái của component. Khi giá trị này thay đổi qua hàm set, component sẽ tự render lại giao diện:
  ```javascript
  const [soKhach, setSoKhach] = useState(2); // Giá trị mặc định là 2
  // Khi người dùng bấm tăng khách:
  setSoKhach(soKhach + 1);
  ```
- **`useEffect`:** Tự động chạy một đoạn mã khi màn hình vừa mở lên (Mount) hoặc khi một biến phụ thuộc thay đổi:
  ```javascript
  useEffect(() => {
    layDanhSachHomestay(); // Gọi API ngay khi mở màn hình
  }, []); // [] nghĩa là chỉ chạy duy nhất 1 lần khi màn hình mở lên
  ```
- **`useContext`:** Lấy dữ liệu từ Context toàn cục (như thông tin người dùng đang đăng nhập, giỏ hàng) mà không cần truyền props qua từng cấp màn hình.
- **`useMemo`:** Ghi nhớ kết quả tính toán phức tạp, chỉ tính lại khi dữ liệu đầu vào thay đổi, giúp app không bị giật lag.

---

# PHẦN 2: TỔNG QUAN KIẾN TRÚC DỰ ÁN & MÔ HÌNH 3 TẦNG (3-TIER)

Dự án gồm 3 phần chính nằm trong cùng một repository:

1. **Mobile App (React Native Expo):** Nằm ở các thư mục `app/`, `components/`, `contexts/`, `config/`, `constants/`.
   - Phục vụ khách du lịch (Guest).
   - Tối ưu giao diện cho màn hình điện thoại (thao tác 1 tay, vuốt chạm mượt mà, hỗ trợ iOS và Android).
2. **Backend REST API (Node.js/Express):** Nằm trong thư mục `backend/`.
   - Chạy trên cổng `3000`.
   - Cung cấp API cho cả Mobile App và Web.
   - Chịu trách nhiệm bảo mật, kiểm tra trùng phòng (Anti-Overbooking), phân quyền đăng nhập, xử lý thanh toán và thông báo.
3. **Web Platform (Next.js 16 + React 19):** Nằm trong thư mục `web/`.
   - Phân chia thành các phân hệ rõ ràng: Khách vãng lai (`web/app/(guest)`), Cổng Chủ nhà (`web/app/host`), Cổng Quản trị viên (`web/app/admin`), Lễ tân quầy Walk-in (`web/app/quick-manage/[token]`).
4. **Cơ sở dữ liệu (MySQL / InnoDB):** Lược đồ định nghĩa trong `database/schema.sql`.

---

# PHẦN 3: ĐỌC & HIỂU CHI TIẾT TỪNG DÒNG CODE REACT NATIVE (APP)

Hãy mở các file sau trên VS Code và đối chiếu phần giải thích:

### 3.1. File `config/api.ts` — Tự động kết nối mạng thông minh
*File đường dẫn:* `config/api.ts`
- **Mục đích:** Khắc phục lỗi kinh điển khi phát triển app React Native: Lỗi điện thoại thật hoặc máy ảo không kết nối được `localhost` của máy tính.
- **Giải thích code:**
  - `Constants.expoConfig?.hostUri`: Expo Metro Server sẽ cung cấp địa chỉ IP LAN của máy tính đang chạy server (Ví dụ: `192.168.0.110:8081`).
  - Hàm `getDevServerIp()`: Tách chuỗi IP này ra để trỏ đúng vào Backend cổng 3000 (`http://192.168.0.110:3000`).
  - Hàm `fetchWithTimeout()`:
    ```typescript
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000);
    ```
    Dùng `AbortController` để ngắt kết nối sau 4 giây. Nếu Backend chưa mở, app sẽ báo lỗi ngay lập tức thay vì đứng hình (treo app 60 giây như fetch mặc định).

### 3.2. File `contexts/AuthContext.tsx` — Quản lý đăng nhập toàn cục
*File đường dẫn:* `contexts/AuthContext.tsx`
- **Mục đích:** Lưu thông tin tài khoản đang đăng nhập và token để sử dụng ở bất kỳ màn hình nào.
- **Giải thích code:**
  - `AsyncStorage.getItem(AUTH_STORAGE_KEY)`: Khi mở app, kiểm tra xem người dùng đã từng đăng nhập trước đó chưa. Nếu có thì tự động đăng nhập luôn (Auto-login).
  - Hàm `login(email, password)`: Gửi thông tin đăng nhập lên `/api/auth/login`. Mật khẩu dưới backend được so khớp bằng mã hóa `bcrypt`.
  - Nếu đăng nhập thành công, lưu thông tin vào `AsyncStorage` bằng chuỗi JSON:
    ```typescript
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
    ```
  - Có cơ chế **Offline Demo Fallback**: Nếu đi thi mạng trường bị chặn hoặc rớt kết nối, app vẫn có thể đăng nhập bằng tài khoản mẫu để biểu diễn cho thầy cô xem mà không bị trừ điểm lỗi mạng.

### 3.3. File `contexts/BookingContext.tsx` — Quản lý đơn phòng & Giỏ hàng
*File đường dẫn:* `contexts/BookingContext.tsx`
- **Mục đích:** Quản lý toàn bộ vòng đời đặt phòng của khách: Đặt phòng mới $\rightarrow$ Quét mã VietQR $\rightarrow$ Gửi ảnh biên lai $\rightarrow$ Hủy phòng $\rightarrow$ Tích điểm thưởng.
- **Giải thích code:**
  - `addToBooking()`: Gửi thông tin homestay, ngày nhận phòng (`checkIn`), ngày trả phòng (`checkOut`), số khách lên Backend `/api/bookings`.
  - `uploadProof(bookingId, proofImageUrl)`: Cập nhật đường dẫn ảnh chụp màn hình chuyển khoản ngân hàng của khách vào bảng `payments` để Admin duyệt.
  - `redeemPointsForVoucher(voucher)`: Trừ điểm tích lũy (`rewardPoints = rewardPoints - voucher.pointsRequired`) và cấp voucher giảm giá vào ví người dùng.

### 3.4. File `app/(tabs)/_layout.tsx` — Thanh điều hướng đáy (Bottom Tabs)
*File đường dẫn:* `app/(tabs)/_layout.tsx`
- **Mục đích:** Tạo thanh điều hướng 5 tab: Trang chủ, Địa điểm, Homestay, Đặt phòng, Cá nhân.
- **Kỹ thuật responsive đáy:**
  ```typescript
  const insets = useSafeAreaInsets();
  const bottomPadding = isIos ? Math.max(insets.bottom, 12) : 8;
  const tabHeight = 52 + bottomPadding;
  ```
  Nhờ `useSafeAreaInsets()`, trên iPhone thanh tab sẽ tự đẩy cao lên để không bị đè vào thanh gạt Home Indicator của iOS, còn trên Android sẽ giữ khoảng đệm chuẩn.
- `HapticTab`: Tích hợp `expo-haptics` tạo cảm giác rung phản hồi xúc giác nhẹ khi người dùng chạm vào tab (chuẩn UX hiện đại).

### 3.5. File `app/homestay/[id].tsx` — Trang chi tiết & Đặt phòng
*File đường dẫn:* `app/homestay/[id].tsx`
- **Mục đích:** Hiển thị chi tiết homestay, tiện nghi, tính số tiền theo số đêm và voucher.
- **Giải thích code:**
  - `const { id } = useLocalSearchParams()`: Lấy mã ID của homestay từ đường dẫn URL.
  - Tính số đêm:
    ```typescript
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    ```
  - Tính giảm giá Voucher:
    - Nếu voucher loại `%`: `discount = (totalPrice * voucher.value) / 100` (có chặn trần giảm tối đa `maxDiscount`).
    - Nếu voucher cố định: Trừ trực tiếp số tiền.

### 3.6. File `app/(tabs)/bookings.tsx` — Màn hình Đặt phòng & Thanh toán VietQR
*File đường dẫn:* `app/(tabs)/bookings.tsx`
- **Mục đích:** Cho phép khách kiểm tra các đơn đã đặt, tạo mã VietQR thanh toán và tải minh chứng.
- **Giải thích code:**
  - Tạo mã VietQR: Dùng link ảnh động VietQR:
    `https://img.vietqr.io/image/TCB-19071766471019-compact2.png?amount=...&addInfo=...`
    Mã QR này chứa đúng số tài khoản Techcombank, tên chủ tài khoản và mã đơn phòng. Khách mở app ngân hàng quét là tự điền đúng số tiền và nội dung!
  - `expo-image-picker`:
    ```typescript
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    ```
    Mở thư viện ảnh điện thoại để khách chọn ảnh chụp biên lai ngân hàng tải lên server.

---

# PHẦN 4: THIẾT KẾ CƠ SỞ DỮ LIỆU MYSQL (DATABASE SCHEMA & QUAN HỆ)

CSDL tên là `homestay_db`, gồm 15 bảng chuẩn hóa quan hệ 3NF:

```
                    ┌──────────────┐
                    │  locations   │ (Vùng du lịch: Sa Pa, Đà Lạt, Phú Quốc...)
                    └──────┬───────┘
                           │ 1
                           │ n
┌───────────┐ 1    n ┌─────┴──────┐ 1    n ┌──────────────┐
│   users   ├────────┤ homestays  ├────────┤   bookings   │
│  (Guests, │ (Host) └─────┬──────┘        └──────┬───────┘
│   Hosts,  │              │ 1                    │ 1
│   Admins) │              │ n                    │ 1
└─────┬─────┘        ┌─────┴──────────────┐┌──────┴───────┐
      │              │  homestay_images   ││   payments   │ (VietQR, Minh chứng)
      │              └────────────────────┘└──────────────┘
      │
      ├──────────────── n ── [ favorites ] (Homestay yêu thích)
      ├──────────────── n ── [ reviews ] (Đánh giá & số sao)
      ├──────────────── n ── [ point_transactions ] (Lịch sử tích/đổi điểm)
      └──────────────── n ── [ notifications ] (Thông báo đẩy trong app)
```

### Chi tiết các bảng quan trọng nhất:
1. **`users`:** Lưu tài khoản người dùng với phân quyền (`role`: `customer`, `host`, `admin`), mật khẩu băm `password_hash`, điểm thưởng `reward_points`.
2. **`locations`:** Danh mục điểm đến (Đà Lạt, Sa Pa, Nha Trang, Phú Quốc...) kèm tọa độ và ảnh bìa.
3. **`homestay_types`:** Phân loại hình lưu trú (Villa, Homestay, Resort, Cabin, Eco Homestay).
4. **`homestays`:** Bảng phòng nghỉ. Khóa ngoại `host_id` liên kết tới `users.id`, `location_id` liên kết tới `locations.id`. Có trường `approval_status` (`pending`, `approved`, `rejected`) và `manage_token` phục vụ lễ tân quầy.
5. **`bookings`:** Bảng đơn phòng. Lưu ngày `check_in`, `check_out`, số khách `guests`, số đêm `nights`, đơn giá `price_per_night`, tổng tiền `total_price`, tỷ lệ hoa hồng `commission_rate`, nguồn đơn `source` (`guest_online` hoặc `host_direct`), trạng thái `status` (`pending`, `confirmed`, `cancelled`, `completed`).
6. **`payments`:** Lưu thanh toán của đơn đặt phòng. Cột `proof_image_url` lưu đường dẫn ảnh biên lai chuyển khoản, `transaction_code` lưu mã giao dịch ngân hàng, `status` (`pending`, `completed`).
7. **`promotions`:** Bảng Voucher giảm giá với điều kiện đơn hàng tối thiểu `min_booking_amount` và mức giảm tối đa `max_discount_amount`.
8. **`reviews`:** Bảng đánh giá của khách sau khi hoàn thành kỳ nghỉ. Điểm số từ 1 đến 5 sao.

---

# PHẦN 5: CÁC THUẬT TOÁN ĐẶC BIỆT TRONG DỰ ÁN

Đây là phần **ăn điểm tuyệt đối** khi bảo vệ vì thể hiện tư duy thuật toán chặt chẽ thay vì chỉ làm CRUD thông thường:

### 5.1. Thuật toán kiểm tra xung đột ngày đặt phòng (Anti-Overbooking Algorithm)
- **Vấn đề thực tế:** Làm sao biết một khoảng ngày khách mới muốn đặt `[newCheckIn, newCheckOut]` có bị trùng với bất kỳ đơn đặt phòng nào đã có trước đó `[existingCheckIn, existingCheckOut]` không?
- **Nguyên lý toán học khoảng giao nhau:** Hai khoảng thời gian giao nhau khi và chỉ khi:
  $$\text{newCheckIn} < \text{existingCheckOut} \quad \text{VÀ} \quad \text{newCheckOut} > \text{existingCheckIn}$$
- **Mã nguồn thực thi trong SQL ([backend/src/models/booking.model.js:225](backend/src/models/booking.model.js#L225)):**
  ```sql
  SELECT COUNT(*) AS conflict_count
  FROM bookings
  WHERE homestay_id = ?
    AND status IN ('pending', 'confirmed')
    AND check_in < ?   -- existingCheckIn < newCheckOut
    AND check_out > ?  -- existingCheckOut > newCheckIn
  ```
- **Điểm xuất sắc:** Thuật toán này **cho phép khách A trả phòng ngày 05/10 và khách B nhận phòng đúng ngày 05/10 mà KHÔNG bị báo lỗi trùng phòng!**

### 5.2. Thuật toán kiểm soát tương tranh với Khóa dòng (Concurrency Lock: `SELECT ... FOR UPDATE`)
- **Vấn đề:** Điều gì xảy ra nếu tại cùng 1 giây, khách A trên Mobile và khách B trên Web cùng bấm "Đặt phòng" cho cùng 1 căn homestay vào cùng ngày?
- **Giải pháp:** Sử dụng **MySQL InnoDB Transaction** kết hợp khóa dòng `FOR UPDATE`:
  ```javascript
  const conn = await db.getConnection();
  await conn.beginTransaction(); // Bắt đầu giao dịch

  // Khóa dòng dữ liệu của Homestay lại:
  const [hRows] = await conn.query(
    'SELECT id, name, price FROM homestays WHERE id = ? FOR UPDATE',
    [homestayId]
  );

  // Kiểm tra trùng ngày trong trạng thái khóa:
  const [conflicts] = await conn.query('... FOR UPDATE', ...);

  if (conflicts[0].conflict_count > 0) {
    await conn.rollback(); // Hủy bỏ
    throw new Error('Homestay đã có khách đặt');
  }

  // Chèn đơn phòng và commit giao dịch
  await conn.commit();
  ```
- **Kết quả:** Request nào tới trước sẽ khóa phòng và đặt thành công; request tới sau bị chặn lại xếp hàng và sẽ nhận thông báo phòng đã kín lịch. Không bao giờ xảy ra tình trạng "bán 1 phòng cho 2 người".

### 5.3. Thuật toán tính khoảng cách trắc địa Haversine (Không dùng ML)
*File đường dẫn:* `backend/src/services/ranking.service.js`
- **Mục đích:** Tính khoảng cách chính xác theo đường cong bề mặt Trái Đất (đơn vị km) giữa tọa độ GPS của người dùng $(\text{lat}_1, \text{lon}_1)$ và tọa độ homestay $(\text{lat}_2, \text{lon}_2)$ mà không cần gọi API Google Maps tốn phí.
- **Công thức toán học:**
  $$d = 2R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
  *(Với $R = 6371\text{ km}$ là bán kính Trái Đất).*
- **Ứng dụng:** Xếp hạng các homestay gần người dùng nhất và hiển thị bán kính khám phá.

### 5.4. Thuật toán xếp hạng Chỗ nghỉ có trọng số (Deterministic Weighted Ranking)
*File đường dẫn:* `backend/src/services/ranking.service.js`
- **Mục đích:** Xếp hạng hiển thị homestay trên Trang chủ công bằng, minh bạch, có trọng số rõ ràng:
  $$\text{Score} = (\text{Rating} \times 20) + (\text{ReviewCount} \times 0.4) + (\text{isFeatured} \times 15) + (\text{isHostVerified} \times 15)$$
- **Giải thích:**
  - Điểm sao tối đa 5.0 $\times$ 20 = 100 điểm.
  - Số lượng đánh giá cộng tối đa 20 điểm (khuyến khích chỗ nghỉ có nhiều tương tác thật).
  - Phòng có huy hiệu nổi bật cộng 15 điểm.
  - Chủ nhà đã xác minh CCCD/Giấy phép kinh doanh cộng 15 điểm (bảo vệ quyền lợi khách).

### 5.5. Thuật toán đánh giá rủi ro đơn phòng theo luật quy tắc (Rule-based Risk Scoring)
*File đường dẫn:* `backend/src/services/risk.service.js`
- **Mục đích:** Cảnh báo sớm các đơn đặt phòng bất thường cho Admin đối soát mà không cần mô hình Machine Learning nặng nề:
  - Thời gian lưu trú $> 14$ đêm nhưng chưa thanh toán: $+25$ điểm rủi ro.
  - Tổng giá trị đơn $> 30.000.000$ VNĐ: $+20$ điểm rủi ro.
  - Đặt phòng sát giờ nhận phòng (dưới 2 giờ): $+15$ điểm rủi ro.
  - Phân loại: $\text{Score} < 30 \rightarrow \text{LOW}$, $30 - 49 \rightarrow \text{MEDIUM}$, $\ge 50 \rightarrow \text{HIGH}$ (Cảnh báo đỏ trên Dashboard quản trị).

### 5.6. Thuật toán Kinh tế Tích lũy Điểm thưởng & Đổi Voucher Bền vững (Sustainable Loyalty Economy)
*File đường dẫn:* `backend/src/models/booking.model.js` và `constants/mockData.ts`
- **Vấn đề thực tế (Kinh tế nền tảng):** Nếu đặt phòng nào cũng cộng cố định 100-150 điểm, khách chỉ cần đặt 1-2 đơn phòng rẻ tiền là đủ điểm đổi ngay voucher 100k-500k. Điều này làm sàn bị **lỗ nặng**, chủ nhà bị ép giá và cơ chế điểm thưởng trở nên phi thực tế.
- **Giải pháp thiết kế kinh tế thực tế:**
  1. **Quy tắc tích điểm theo giá trị đơn hàng (Tỷ lệ hoàn ~1%):**
     $$\text{EarnedPoints} = \max\left(10, \left\lfloor \frac{\text{Tổng tiền thanh toán}}{10.000} \right\rfloor\right)$$
     - Đơn 1.500.000₫ tích lũy: $1.500.000 / 10.000 = 150$ điểm.
     - Đơn 4.500.000₫ tích lũy: $4.500.000 / 10.000 = 450$ điểm.
     - Đặt ít tiền tích ít điểm, đặt nhiều tiền tích nhiều điểm.
  2. **Quy tắc đổi Voucher lũy tiến kết hợp Điều kiện Đơn tối thiểu (Min Order):**
     - Voucher 50.000₫: Cần **100 điểm** (đơn tối thiểu 1.000.000₫). Tỷ lệ giảm tối đa 5%.
     - Voucher 100.000₫: Cần **200 điểm** (đơn tối thiểu 1.800.000₫). Tỷ lệ giảm tối đa 5.5%.
     - Voucher 250.000₫: Cần **450 điểm** (đơn tối thiểu 3.500.000₫). Tỷ lệ giảm tối đa 7.1%.
     - Voucher VIP 500.000₫: Cần **900 điểm** (đơn tối thiểu 6.000.000₫). Tỷ lệ giảm tối đa 8.3%.
  3. **Hiệu quả kinh tế & Kích cầu:**
     - Sàn thu hoa hồng 10% giá trị đơn hàng. Mức giảm voucher cao nhất chỉ 8.3% trên đơn tối thiểu $\rightarrow$ Sàn **luôn luôn có lãi** (tối thiểu 1.7% - 5%), không bao giờ bị âm tiền.
     - Khách hàng có động lực quay lại đặt phòng lần 2, lần 3 để gom đủ điểm đổi voucher lớn và tiếp tục chi tiêu đơn hàng giá trị cao.

---

# PHẦN 6: CƠ CHẾ XÁC THỰC HOST & KIỂM DUYỆT HOMESTAY THẬT

Giảng viên thường rất quan tâm: *"Làm sao hệ thống biết chủ nhà là người thật và homestay không phải là tin ảo, lừa đảo?"*. Hệ thống giải quyết bằng quy trình **Tách biệt 2 tầng kiểm soát (Two-Tier Trust & Safety Boundary)**:

```
┌────────────────────────────────────────────────────────┐
│ TẦNG 1: XÁC MINH DANH TÍNH CHỦ NHÀ (HOST VERIFICATION) │
│  • Bảng CSDL: host_verifications                       │
│  • Hồ sơ: Ảnh CCCD 2 mặt + Giấy phép kinh doanh        │
│  • Admin đối soát mã định danh công dân                │
│  • Kết quả: Cấp quyền Host hợp lệ                      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ TẦNG 2: KIỂM DUYỆT CƠ SỞ LƯU TRÚ (PROPERTY MODERATION) │
│  • Bảng CSDL: homestays.approval_status                │
│  • Hồ sơ: Ảnh thực tế phòng, địa chỉ cụ thể, tiện nghi │
│  • Trạng thái ban đầu: "pending" (Chưa được mở bán)    │
│  • Admin duyệt đạt chuẩn -> chuyển sang "approved"     │
│  • Lúc này homestay mới xuất hiện trên Mobile & Web!   │
└────────────────────────────────────────────────────────┘
```

### 6.1. Tầng 1 — Xác thực danh tính chủ nhà (Host Identity Verification)
- Chủ nhà muốn kinh doanh phải gửi hồ sơ pháp lý gồm:
  1. Họ và tên, số CCCD / Hộ chiếu.
  2. Ảnh chụp mặt trước và mặt sau của CCCD.
  3. Giấy phép đăng ký kinh doanh lưu trú hoặc giấy ủy quyền quản lý tài sản.
- Dữ liệu lưu trong bảng `host_verifications`.
- Admin kiểm tra tính chính xác của hồ sơ trước khi kích hoạt cờ `is_host_verified = 1`.

### 6.2. Tầng 2 — Kiểm duyệt chỗ nghỉ (Property Moderation)
- Dù Host đã được xác minh danh tính, **mỗi căn homestay đăng lên đều không được hiển thị ngay lập tức**.
- Trường `approval_status` trong bảng `homestays` mặc định là `'pending'`.
- Chỗ nghỉ bị ẩn khỏi màn hình tìm kiếm của Mobile App và Web Guest.
- Ban quản trị (Admin) vào trang `Admin > Phê duyệt chỗ nghỉ` kiểm tra:
  - Chất lượng hình ảnh có rõ nét không (chống ảnh copy từ Internet).
  - Địa chỉ có thực sự tồn tại ở địa phương không.
  - Giá thuê có nằm trong khung thị trường không.
- Nếu đạt chuẩn $\rightarrow$ Admin bấm **"Phê duyệt"** (`approval_status = 'approved'`).
- Nếu vi phạm $\rightarrow$ Admin nhập lý do và bấm **"Từ chối"** (`approval_status = 'rejected'`), chủ nhà sẽ nhận được thông báo để chỉnh sửa lại.

### 6.3. Cơ chế Mã quản lý nhanh tại quầy (`manage_token`)
- Mỗi homestay sau khi được duyệt sẽ được cấp một mã bảo mật duy nhất: `manage_token` (Ví dụ: `HMTOKEN_DA_LAT_01`).
- Chủ nhà hoặc nhân viên lễ tân mở đường dẫn: `/quick-manage/[token]` để đặt phòng trực tiếp cho khách vãng lai (khách không cài app, đến quầy thuê trực tiếp).
- Đơn đặt tại quầy được tự động đồng bộ vào Database, khóa lịch phòng trên Mobile App ngay lập tức để người khác không đặt đè lên.

---

# PHẦN 7: BỘ CÂU HỎI VẤN ĐÁP THEO TỪNG PHẦN (CÓ SẴN CÂU TRẢ LỜI MẪU)

Dưới đây là các câu hỏi trọng tâm thường được hội đồng giám khảo đặt ra:

### Nhóm 1: Câu hỏi về React Native & Mobile App
**Q1: Ứng dụng quản lý State bằng gì? Tại sao không dùng Redux?**
> **Trả lời:** Em sử dụng **React Context API** kết hợp **Custom Hooks** và **AsyncStorage**. Dự án có 3 Context rõ ràng: `AuthContext` (phiên đăng nhập), `BookingContext` (đơn phòng, voucher, điểm thưởng) và `ThemeContext` (giao diện sáng/tối). Sử dụng Context API giúp code tinh gọn, dễ bảo trì, không bị cồng kềnh như Redux và hoàn toàn đáp ứng hiệu năng mượt mà cho ứng dụng.

**Q2: Tại sao ứng dụng kết nối được Backend khi chạy trên điện thoại thật qua Expo Go?**
> **Trả lời:** Trong file `config/api.ts`, em viết hàm `getDevServerIp()` tự động đọc địa chỉ IP của máy chủ Metro thông qua `Constants.expoConfig?.hostUri`. Khi điện thoại và máy tính cùng kết nối chung mạng Wi-Fi, app sẽ tự động trỏ đúng vào địa chỉ IPv4 LAN của máy tính cổng 3000, không bị lỗi `Network request failed` do hardcode `localhost`.

**Q3: Trong React Native, em làm thế nào để giao diện hiển thị chuẩn trên cả iPhone có tai thỏ và Android?**
> **Trả lời:** Em dùng thư viện `react-native-safe-area-context` lấy khoảng đệm `insets` an toàn (`useSafeAreaInsets()`), kết hợp bố cục Flexbox co giãn (`flex: 1`, `justifyContent`, `alignItems`) và hàm `Platform.OS` để tính toán padding tối ưu cho từng nền tảng.

**Q4: Mục đích của `expo-image` trong dự án là gì?**
> **Trả lời:** `expo-image` là thư viện hình ảnh hiệu năng cao, hỗ trợ tự động cache ảnh vào bộ nhớ đệm RAM và ổ đĩa, giúp danh sách homestay cuộn mượt mà, không bị chớp giật hay tải lại ảnh khi người dùng lướt màn hình.

---

### Nhóm 2: Câu hỏi về Cơ sở dữ liệu & Backend
**Q5: Làm sao giải quyết bài toán chống đặt trùng phòng (Overbooking)?**
> **Trả lời:** Hệ thống giải quyết ở 2 tầng:
> 1. Tầng logic toán học: Áp dụng công thức `(newCheckIn < existingCheckOut) AND (newCheckOut > existingCheckIn)` để chặn các khoảng ngày đè lên nhau, nhưng vẫn cho phép ngày trả phòng của khách A trùng ngày nhận phòng của khách B.
> 2. Tầng Transaction CSDL: Sử dụng MySQL `BEGIN TRANSACTION` với lệnh `SELECT ... FOR UPDATE` trên bảng `homestays` và `bookings`. Khi có 2 người cùng bấm đặt 1 phòng trong cùng mili-giây, giao dịch sẽ khóa dòng và xử lý tuần tự, loại bỏ hoàn toàn nguy cơ trùng phòng.

**Q6: Quy trình thanh toán chuyển khoản trên App hoạt động như thế nào?**
> **Trả lời:** Khi khách tạo đơn, trạng thái đơn là `pending` và thanh toán là `unpaid`. Hệ thống sinh mã VietQR chứa đúng số tài khoản, tên người thụ hưởng và mã đơn đặt phòng. Khách thanh toán xong sẽ dùng `expo-image-picker` tải ảnh chụp màn hình biên lai lên server. Trạng thái thanh toán chuyển sang `proof_uploaded`. Chủ nhà hoặc Admin sẽ vào Web kiểm tra tài khoản và bấm "Duyệt", đơn phòng chuyển sang `confirmed` và phòng chính thức được khóa.

**Q7: Sự khác nhau giữa việc đặt phòng trên App Mobile và đặt phòng tại quầy lễ tân là gì?**
> **Trả lời:** 
> - Khách đặt trên App Mobile: Đơn có nguồn `guest_online`, hoa hồng sàn thu 10%, chủ nhà thực nhận 90%.
> - Khách đặt tại quầy (Walk-in qua `manage_token`): Đơn có nguồn `host_direct`, hoa hồng sàn chỉ thu 5%, chủ nhà thực nhận 95%. Cả hai hình thức đều đồng bộ vào cùng một database và tự động khóa phòng trên toàn hệ thống.

---

### Nhóm 3: Câu hỏi về Thuật toán & Kiểm duyệt
**Q8: Thuật toán Haversine trong dự án dùng để làm gì?**
> **Trả lời:** Dùng để tính toán khoảng cách đường chim bay chính xác giữa tọa độ GPS của khách hàng và tọa độ của homestay theo công thức trắc địa mặt cầu Trái Đất bán kính $6371\text{ km}$, giúp gợi ý homestay gần nhất mà không phụ thuộc vào Google Maps API tính phí.

**Q9: Làm sao hệ thống đảm bảo homestay đăng bán là có thật?**
> **Trả lời:** Hệ thống tách biệt 2 lớp kiểm duyệt: Lớp 1 xác minh danh tính chủ nhà bằng CCCD và Giấy phép kinh doanh (`host_verifications`). Lớp 2 kiểm duyệt cơ sở lưu trú (`homestays.approval_status`). Mọi homestay đăng mới đều ở trạng thái `pending` và bị ẩn, chỉ khi Admin kiểm tra hình ảnh thực tế, tiện nghi và vị trí đạt chuẩn thì mới bấm duyệt mở bán công khai.

**Q10: Cơ chế tích lũy điểm thưởng và đổi Voucher trong dự án được thiết kế như thế nào để đảm bảo tính thực tế và lợi nhuận cho sàn?**
> **Trả lời:** Em không áp dụng mức cộng điểm cố định vì sẽ gây lạm phát điểm và làm sàn thua lỗ. Thay vào đó, em thiết kế **mô hình kinh tế bền vững (Sustainable Loyalty Economy)**:
> 1. Tỷ lệ tích điểm tỷ lệ thuận với giá trị đơn hàng: Cứ 10.000₫ thanh toán sẽ tích lũy được 1 điểm (tương đương hoàn ~1% vào điểm thưởng).
> 2. Quy tắc đổi voucher lũy tiến kèm điều kiện đơn hàng tối thiểu (Min Order): Khách cần chi tiêu khoảng 1.000.000₫ để tích 100 điểm đổi voucher 50k (đơn tối thiểu 1 triệu); chi tiêu khoảng 6.000.000₫ tích 600-900 điểm đổi voucher 500k (đơn tối thiểu 6 triệu).
> 3. Bảo toàn lợi nhuận: Vì sàn thu phí hoa hồng 10% trên mỗi đơn đặt phòng online, trong khi mức giảm voucher cao nhất chỉ chiếm tối đa 5% - 8.3% trên giá trị đơn tối thiểu. Nhờ đó, sàn luôn giữ được biên lợi nhuận dương (1.7% - 5%), vừa kích thích khách quay lại đặt phòng lần tiếp theo, vừa đảm bảo doanh thu bền vững.

---

# PHẦN 8: KỊCH BẢN THUYẾT TRÌNH BẢO VỆ 5 PHÚT TỰ TIN

Hãy học thuộc hoặc ghi chú lại kịch bản 5 bước này để mở đầu buổi bảo vệ thật ấn tượng:

- **Phút 1 — Giới thiệu đề tài & Bài toán:**
  *"Kính thưa quý thầy cô trong hội đồng, em xin đại diện nhóm trình bày đề tài: 'Xây dựng Ứng dụng Đặt phòng và Quản lý Homestay trên nền tảng React Native kết hợp Hệ sinh thái Web'. Bài toán thực tế nhóm giải quyết là kết nối trực tiếp du khách với các homestay độc đáo, giải quyết triệt để vấn đề đặt trùng phòng (Overbooking) và hỗ trợ chủ homestay quản lý khách tại quầy linh hoạt."*
- **Phút 2 — Demo Ứng dụng Di động (Mobile App):**
  *"Ứng dụng di động được xây dựng bằng React Native Expo. Em xin trình diễn các tính năng chính: Khám phá homestay theo địa điểm du lịch, bộ lọc tìm kiếm theo giá và số khách, tính toán số đêm và áp dụng Voucher khuyến mãi tự động, quét mã VietQR và chụp ảnh biên lai chuyển khoản ngân hàng, hệ thống tích điểm thưởng đổi voucher và chuyển đổi giao diện Dark/Light mode."*
- **Phút 3 — Trình diễn Đồng bộ Thời gian thực với Web:**
  *"Dữ liệu từ Mobile App được đồng bộ tức thì với Backend Node.js và Database MySQL. Khi khách vừa bấm đặt phòng trên điện thoại, trên Cổng Chủ nhà và Cổng Admin lập tức xuất hiện đơn phòng ở trạng thái chờ duyệt. Chủ nhà kiểm tra biên lai và bấm 'Xác nhận', ngay lập tức trên app điện thoại trạng thái đơn chuyển sang 'Đã xác nhận' và phòng được khóa trên toàn hệ thống."*
- **Phút 4 — Nêu bật Điểm sáng Kỹ thuật & Thuật toán:**
  *"Điểm đặc biệt về mặt kỹ thuật của dự án là:
  1. Kiểm soát tương tranh Concurrency Control bằng MySQL Transaction với khóa dòng `FOR UPDATE`.
  2. Thuật toán chống Overbooking chặn trùng lịch linh hoạt nhưng vẫn cho phép khách trước checkout cùng ngày với khách sau checkin.
  3. Thuật toán trắc địa Haversine tính km địa lý và thuật toán tính điểm xếp hạng chỗ nghỉ có trọng số.
  4. Cơ chế kiểm duyệt tin cậy 2 tầng tách biệt giữa xác minh danh tính chủ nhà và kiểm duyệt phòng."*
- **Phút 5 — Kết luận & Lời cảm ơn:**
  *"Toàn bộ hệ thống đã được kiểm thử toàn diện với 11/11 bài test nghiệp vụ tự động đạt kết quả 100%. Em xin chân thành cảm ơn quý thầy cô đã lắng nghe và em rất mong nhận được những câu hỏi đóng góp quý báu từ hội đồng!"*
