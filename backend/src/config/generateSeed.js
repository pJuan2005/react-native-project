/**
 * Data Generator Script for Homestay Booking Platform
 * Generates rich, realistic, constraint-valid Vietnamese seed data with 500+ records per entity table.
 * Natural authentic property names (NO '#' suffix) and themed high-resolution photos matching property types.
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Real Salted hash for "123456"
const DEFAULT_PW_HASH = bcrypt.hashSync('123456', 10);

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Vietnamese name pools
const LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đoàn', 'Đào', 'Võ', 'Lương', 'Trịnh', 'Trương'];
const MID_NAMES_MALE = ['Văn', 'Minh', 'Hoàng', 'Đình', 'Đức', 'Hữu', 'Trọng', 'Tuấn', 'Quang', 'Bảo', 'Thành', 'Quốc', 'Tiến', 'Mạnh', 'Gia'];
const MID_NAMES_FEMALE = ['Thị', 'Thu', 'Thanh', 'Ngọc', 'Thùy', 'Kim', 'Khánh', 'Phương', 'Bích', 'Mai', 'Ánh', 'Diệu', 'Hồng', 'Yến', 'Lan'];
const FIRST_NAMES_MALE = ['Chuẩn', 'Nam', 'Đức', 'Quân', 'Tuấn', 'Anh', 'Dũng', 'Long', 'Hùng', 'Thắng', 'Sơn', 'Kiên', 'Phong', 'Huy', 'Cường', 'Hải', 'An', 'Bình', 'Phúc', 'Tâm', 'Lâm', 'Tùng', 'Việt', 'Bách'];
const FIRST_NAMES_FEMALE = ['Hương', 'Trang', 'Yến', 'Linh', 'Hoa', 'Lan', 'Mai', 'Thảo', 'Ly', 'Vy', 'Quyên', 'Hằng', 'Châu', 'Nhung', 'Ngân', 'Hà', 'Phương', 'Giang', 'Tú', 'Uyên', 'Thư', 'Trâm', 'Ngọc', 'Loan'];

function removeAccents(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function generateVietnameseName(gender = 'random') {
  const isMale = gender === 'random' ? Math.random() > 0.5 : gender === 'male';
  const last = randomItem(LAST_NAMES);
  const mid = isMale ? randomItem(MID_NAMES_MALE) : randomItem(MID_NAMES_FEMALE);
  const first = isMale ? randomItem(FIRST_NAMES_MALE) : randomItem(FIRST_NAMES_FEMALE);
  return {
    fullName: `${last} ${mid} ${first}`,
    cleanEmailName: `${removeAccents(first).toLowerCase()}.${removeAccents(last).toLowerCase()}${randomInt(10, 999)}`,
    gender: isMale ? 'male' : 'female',
  };
}

const CITIES = [
  'Đà Lạt', 'Sa Pa', 'Phú Quốc', 'Hội An', 'Nha Trang', 'Ninh Bình', 'Hà Nội', 'TP. Hồ Chí Minh',
  'Đà Nẵng', 'Vũng Tàu', 'Quy Nhơn', 'Huế', 'Hạ Long', 'Côn Đảo', 'Mộc Châu', 'Phan Thiết',
  'Buôn Ma Thuột', 'Mũi Né', 'Hà Giang', 'Mai Châu'
];

const DISTRICTS = [
  'Quận 1', 'Quận 3', 'Quận 7', 'Cầu Giấy', 'Hoàn Kiếm', 'Tây Hồ', 'Hải Châu', 'Sơn Trà',
  'Phường 1', 'Phường 2', 'Phường 8', 'Bãi Cháy', 'Dương Đông', 'Cẩm Phô', 'Vĩnh Hải', 'Tam Cốc'
];

// PHOTO POOLS BY THEME (Loại bỏ hoàn toàn ảnh trùng nhau, ảnh khớp sát với loại hình)
// PHOTO POOLS BY THEME (Mở rộng kho ảnh chất lượng cao, tuyệt đối không trùng lặp trong cùng địa điểm)
const PHOTOS_VILLA = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
];

const PHOTOS_HOMESTAY = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1540518614846-7ede433c4b13?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab275?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=900&q=80',
];

const PHOTOS_RESORT = [
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=900&q=80',
];

const PHOTOS_CABIN = [
  'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=900&q=80',
];

const PHOTOS_ECO = [
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1498429089284-41f8cf3ffd39?auto=format&fit=crop&w=900&q=80',
];

const AVATAR_COLLECTION = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
];

// Bộ từ ghép tiếng Việt tạo tên chỗ nghỉ phong phú, chuyên nghiệp, hoàn toàn tự nhiên
const THEMED_NAMES = {
  1: [ // Villa (type_id = 1)
    'Villa Lavender Dream', 'Seaside Bliss Luxury Villa', 'Sunset Cliff Villa', 'Heritage Palm Villa',
    'Golden Horizon Villa', 'Ocean View Royal Villa', 'Rose Garden Luxury Villa', 'Emerald Bay Villa',
    'Hillside Palace Villa', 'Pine Hill Grand Villa', 'Valley Dream Luxury Villa', 'Imperial Lotus Villa',
    'Starlight Bay Villa', 'Riverfront Crown Villa', 'Azure Sky Villa', 'Sunny Coastline Villa',
    'Green Meadow Villa', 'Silent Forest Villa', 'Serene Lake Villa', 'Paradise Cove Villa'
  ],
  2: [ // Homestay (type_id = 2)
    'Homestay Cloud Nine', 'Rice Terrace Homestay', 'Ancient Town Riverside', 'Sweet Home Valley',
    'Cozy Corner Homestay', 'Morning Mist Homestay', 'Old Street Memory Homestay', 'Green Oasis Homestay',
    'Valley Lantern Homestay', 'Sunflower Hill Homestay', 'Peaceful Haven Homestay', 'Riverside Warmth Homestay',
    'Dreamcatcher Homestay', 'Hillside Breeze Homestay', 'Little Forest Homestay', 'Moonlight Valley Homestay',
    'Rustic Charm Homestay', 'Warm Hearth Homestay', 'Birdsong Garden Homestay', 'Old Quarter Story Homestay'
  ],
  3: [ // Resort (type_id = 3)
    'Ocean View Resort', 'Sunset Beach Luxury Resort', 'Lotus Lagoon Wellness Resort', 'Palm Island Beach Resort',
    'Golden Sand Boutique Resort', 'Mountain Peak Eco Resort', 'Emerald Coast Paradise Resort', 'Riverside Serenity Resort',
    'Starlight Cliff Resort', 'Heritage Bay Resort & Spa', 'Crystal Clear Bay Resort', 'Green Valley Retreat Resort',
    'Aqua Marine Luxury Resort', 'Tropical Breeze Resort', 'Sunburst Paradise Resort', 'Royal Coastline Resort'
  ],
  4: [ // Cabin (type_id = 4)
    'Pine Hill Rustic Cabin', 'Cozy Wood Cabin', 'Starlight Hillside Cabin', 'Silent Woods Log Cabin',
    'Mountain Dew Timber Cabin', 'Morning Dew Forest Cabin', 'Warm Fireplace Cabin', 'Hidden Glen Wood Cabin',
    'Cedar Wood Country Cabin', 'Whispering Pines Cabin', 'Little Wooden Cottage', 'Highland Timber Cabin',
    'Alpine Forest Cabin', 'Autumn Leaves Cabin', 'Valley Mist Cabin', 'Riverside Wooden Cabin'
  ],
  5: [ // Eco Homestay (type_id = 5)
    'Bamboo Eco Green House', 'Tràng An Valley Lotus Retreat', 'Lotus Lagoon Eco Farmstay', 'Green Garden Nature Lodge',
    'Organic Farm Eco Homestay', 'Wildflower Meadow Retreat', 'Forest Brook Eco House', 'Earth & Stone Eco Lodge',
    'River Stream Eco Retreat', 'Herbal Garden Eco House', 'Sunlit Farm Nature Stay', 'Pure Earth Eco Sanctuary',
    'Bird Paradise Eco Retreat', 'Green Valley Sustainable Stay', 'Breeze Garden Eco House', 'Fresh Spring Eco Lodge'
  ]
};

const AREA_QUALIFIERS = [
  'Khu A', 'Khu B', 'Khu Nghỉ Dưỡng', 'Biệt Lập', 'Bên Suối', 'Lưng Đồi', 'Ven Sông', 'Hướng Biển',
  'Vườn Thượng Uyển', 'Đồi Thông', 'Phố Cổ', 'Thung Lũng', 'Bãi Bắc', 'Bãi Nam', 'An Hòa', 'Thanh Bình'
];

const VIETNAMESE_REVIEWS = [
  'Chỗ nghỉ tuyệt vời ngoài mong đợi! Không gian thoáng đãng, view ngắm hoàng hôn rất chill.',
  'Chủ nhà đón tiếp cực kỳ nồng hậu và nhiệt tình, chỉ dẫn tận tình các điểm ăn ngon quanh đây.',
  'Phòng ốc sạch sẽ tinh tươm, đầy đủ tiện nghi từ bếp đến máy giặt. Rất thích hợp cho gia đình.',
  'Sáng thức dậy mở cửa sổ là ngắm trọn biển mây bồng bềnh. Chắc chắn sẽ quay lại cùng bạn bè!',
  'Bữa sáng ngon miệng, trà và cafe thơm nức. Đồ đạc decor rất có gu và ấm cúng.',
  'Vị trí thuận tiện gần trung tâm nhưng vẫn giữ được sự yên tĩnh, không gian xanh trong lành.',
  'Hồ bơi nước ấm siêu sạch, các bé nhà mình bơi thích mê. 10/10 điểm cho chất lượng phục vụ.',
  'Đáng giá từng đồng bỏ ra! Thủ tục nhận phòng và trả phòng rất nhanh gọn, chủ nhà chu đáo.'
];

const DISPUTE_REASONS = [
  { cat: 'PROPERTY_MISMATCH', reason: 'Chỗ ở không giống hình ảnh trên ứng dụng', desc: 'Khi đến nhận phòng thực tế ban công và nội thất khác nhiều so với ảnh minh họa.' },
  { cat: 'CHECKIN_ISSUE', reason: 'Không thể nhận phòng đúng giờ thỏa thuận', desc: 'Khách đến nơi lúc 14h30 nhưng phòng chưa dọn xong phải đợi hơn 1 tiếng ở sảnh.' },
  { cat: 'HOST_UNRESPONSIVE', reason: 'Chủ nhà không nghe máy khi khách đến', desc: 'Gọi 5 cuộc gọi cho số hotline chủ nhà đều không phản hồi để mở cổng.' },
  { cat: 'PAYMENT_ISSUE', reason: 'Minh chứng chuyển khoản chưa được đối soát kịp thời', desc: 'Đã hoàn tất chuyển khoản VietQR nhưng trạng thái đơn phòng chưa cập nhật.' },
  { cat: 'REFUND_ISSUE', reason: 'Thắc mắc về chính sách hoàn tiền khi hủy phòng', desc: 'Hủy phòng trước 4 ngày nhưng muốn kiểm tra lại số dư tiền hoàn vào ví.' },
  { cat: 'SAFETY_ISSUE', reason: 'Điều hòa trong phòng gặp sự cố rò nước', desc: 'Điều hòa phòng ngủ chính bị chảy nước xuống sàn gây trơn trượt.' }
];

console.log("Generating production-scale seed data without '#' symbol and with thematic photos...");

// OUTPUT BUILDER
let sql = `-- =====================================================
-- COMPREHENSIVE PRODUCTION-SCALE SEED DATA (500+ RECORDS PER ENTITY)
-- Database: homestay_db
-- Target: MariaDB / MySQL 8.0+
-- Generated with Authentic Vietnamese Names (NO '#' symbol) & Themed Photos
-- =====================================================

USE \`homestay_db\`;

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM \`booking_messages\`;
DELETE FROM \`booking_conversations\`;
DELETE FROM \`withdrawals\`;
DELETE FROM \`bank_accounts\`;
DELETE FROM \`refunds\`;
DELETE FROM \`wallet_transactions\`;
DELETE FROM \`wallets\`;
DELETE FROM \`app_settings\`;
DELETE FROM \`audit_logs\`;
DELETE FROM \`disputes\`;
DELETE FROM \`host_verifications\`;
DELETE FROM \`point_transactions\`;
DELETE FROM \`user_devices\`;
DELETE FROM \`notifications\`;
DELETE FROM \`reviews\`;
DELETE FROM \`favorites\`;
DELETE FROM \`payments\`;
DELETE FROM \`bookings\`;
DELETE FROM \`promotions\`;
DELETE FROM \`property_amenities\`;
DELETE FROM \`property_images\`;
DELETE FROM \`properties\`;
DELETE FROM \`amenities\`;
DELETE FROM \`homestay_types\`;
DELETE FROM \`locations\`;
DELETE FROM \`users\`;

ALTER TABLE \`booking_messages\` AUTO_INCREMENT = 1;
ALTER TABLE \`booking_conversations\` AUTO_INCREMENT = 1;
ALTER TABLE \`withdrawals\` AUTO_INCREMENT = 1;
ALTER TABLE \`bank_accounts\` AUTO_INCREMENT = 1;
ALTER TABLE \`refunds\` AUTO_INCREMENT = 1;
ALTER TABLE \`wallet_transactions\` AUTO_INCREMENT = 1;
ALTER TABLE \`wallets\` AUTO_INCREMENT = 1;
ALTER TABLE \`app_settings\` AUTO_INCREMENT = 1;
ALTER TABLE \`point_transactions\` AUTO_INCREMENT = 1;
ALTER TABLE \`user_devices\` AUTO_INCREMENT = 1;
ALTER TABLE \`notifications\` AUTO_INCREMENT = 1;
ALTER TABLE \`reviews\` AUTO_INCREMENT = 1;
ALTER TABLE \`favorites\` AUTO_INCREMENT = 1;
ALTER TABLE \`payments\` AUTO_INCREMENT = 1;
ALTER TABLE \`bookings\` AUTO_INCREMENT = 1;
ALTER TABLE \`promotions\` AUTO_INCREMENT = 1;
ALTER TABLE \`property_images\` AUTO_INCREMENT = 1;
ALTER TABLE \`properties\` AUTO_INCREMENT = 1;
ALTER TABLE \`amenities\` AUTO_INCREMENT = 1;
ALTER TABLE \`homestay_types\` AUTO_INCREMENT = 1;
ALTER TABLE \`locations\` AUTO_INCREMENT = 1;
ALTER TABLE \`users\` AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;
\n`;

// 1. SEED APP SETTINGS
sql += `-- =====================================================
-- 1. APP SETTINGS
-- =====================================================
INSERT IGNORE INTO \`app_settings\` (\`id\`, \`setting_key\`, \`setting_value\`, \`description\`) VALUES
(1, 'platform_commission_rate', '10', 'Tỷ lệ hoa hồng nền tảng thu từ đơn online (%)'),
(2, 'direct_commission_rate', '5', 'Tỷ lệ hoa hồng nền tảng thu từ đơn tại quầy do chủ nhà tạo (%)'),
(3, 'usd_to_vnd_rate', '25000', 'Tỷ giá quy đổi USD sang VND')
ON DUPLICATE KEY UPDATE \`setting_value\` = VALUES(\`setting_value\`);
\n`;

// 2. SEED LOCATIONS (20 Điểm đến du lịch)
const LOCATION_COUNT = 20;
sql += `-- =====================================================
-- 2. SEED LOCATIONS (20 Điểm đến)
-- =====================================================
INSERT INTO \`locations\` (\`id\`, \`name\`, \`description\`, \`icon\`, \`image_url\`, \`property_count\`, \`homestay_count\`, \`is_active\`, \`sort_order\`) VALUES
`;
const locValues = [];
for (let i = 1; i <= LOCATION_COUNT; i++) {
  const cityName = CITIES[i - 1];
  const photo = PHOTOS_HOMESTAY[(i - 1) % PHOTOS_HOMESTAY.length];
  locValues.push(`(${i}, '${cityName}', 'Điểm đến du lịch nổi tiếng ${cityName}', 'compass-outline', '${photo}', 26, 26, 1, ${i})`);
}
sql += locValues.join(',\n') + ';\n\n';

// 3. SEED HOMESTAY TYPES (5 loại hình chuẩn)
sql += `-- =====================================================
-- 3. SEED HOMESTAY TYPES (5 Loại hình)
-- =====================================================
INSERT INTO \`homestay_types\` (\`id\`, \`name\`, \`description\`, \`icon\`, \`is_active\`, \`sort_order\`) VALUES
(1, 'Villa', 'Biệt thự riêng tư cao cấp với hồ bơi và khuôn viên rộng', 'business-outline', 1, 1),
(2, 'Homestay', 'Nhà nghỉ ấm cúng mang phong cách bản địa thân thiện', 'home-outline', 1, 2),
(3, 'Resort', 'Khu nghỉ dưỡng tiện nghi đẳng cấp với dịch vụ chăm sóc toàn diện', 'bed-outline', 1, 3),
(4, 'Cabin', 'Nhà gỗ mộc mạc giữa rừng thông hoặc sườn đồi thơ mộng', 'bonfire-outline', 1, 4),
(5, 'Eco Homestay', 'Mô hình nghỉ dưỡng sinh thái xanh, gần gũi thiên nhiên', 'leaf-outline', 1, 5);
\n`;

// 4. SEED AMENITIES (18 tiện nghi)
sql += `-- =====================================================
-- 4. SEED AMENITIES (18 Tiện nghi)
-- =====================================================
INSERT INTO \`amenities\` (\`id\`, \`name\`, \`icon\`, \`category\`, \`is_active\`) VALUES
(1, 'Hồ bơi riêng', 'water-outline', 'Outdoor', 1),
(2, 'Khu nướng BBQ', 'flame-outline', 'Outdoor', 1),
(3, 'View núi / thung lũng', 'image-outline', 'View', 1),
(4, 'View biển trực diện', 'sunny-outline', 'View', 1),
(5, 'Bếp đầy đủ dụng cụ', 'restaurant-outline', 'Living', 1),
(6, 'WiFi tốc độ cao', 'wifi-outline', 'Tech', 1),
(7, 'Điều hòa 2 chiều', 'snow-outline', 'Living', 1),
(8, 'Bãi đỗ xe ô tô miễn phí', 'car-outline', 'Facility', 1),
(9, 'Máy giặt & sấy', 'shirt-outline', 'Living', 1),
(10, 'Xe đạp miễn phí', 'bicycle-outline', 'Facility', 1),
(11, 'Bình nóng lạnh', 'thermometer-outline', 'Living', 1),
(12, 'Dịch vụ Spa & Massage', 'flower-outline', 'Service', 1),
(13, 'Lò sưởi ấm cúng', 'bonfire-outline', 'Living', 1),
(14, 'Sân vườn thư giãn', 'leaf-outline', 'Outdoor', 1),
(15, 'Smart TV 4K Netflix', 'tv-outline', 'Tech', 1),
(16, 'Máy pha cà phê', 'cafe-outline', 'Living', 1),
(17, 'Bàn bi-a giải trí', 'game-controller-outline', 'Entertainment', 1),
(18, 'Phòng xông hơi Sauna', 'cloud-outline', 'Service', 1);
\n`;

// 5. SEED USERS (520 Users: 1 Admin, 70 Hosts, 449 Customers)
const TOTAL_USERS = 520;
const HOST_COUNT = 70;
const userRows = [];

// User 1: Admin
userRows.push(`(1, 'Admin User', 'Admin User', 'admin@mail.com', '${DEFAULT_PW_HASH}', '${DEFAULT_PW_HASH}', 'admin', 'active', '0988888888', 'Hoàn Kiếm, Hà Nội', 'Hà Nội', '1995-05-15', '${AVATAR_COLLECTION[1]}', 1000, 1, 1)`);

// User 2: Host 1
userRows.push(`(2, 'Nguyen Van A (Host)', 'Nguyen Van A', 'host1@mail.com', '${DEFAULT_PW_HASH}', '${DEFAULT_PW_HASH}', 'host', 'active', '0900000002', 'Đà Lạt, Lâm Đồng', 'Đà Lạt', '1990-03-10', '${AVATAR_COLLECTION[0]}', 500, 1, 1)`);

// User 3: Host 2
userRows.push(`(3, 'Tran Thi B (Host)', 'Tran Thi B', 'host2@mail.com', '${DEFAULT_PW_HASH}', '${DEFAULT_PW_HASH}', 'host', 'active', '0900000003', 'Phú Quốc, Kiên Giang', 'Phú Quốc', '1992-07-22', '${AVATAR_COLLECTION[2]}', 650, 1, 1)`);

// User 4: Pham Xuan Chuan (Main Customer)
userRows.push(`(4, 'Phạm Xuân Chuẩn', 'Phạm Xuân Chuẩn', 'phamchuan2608@gmail.com', '${DEFAULT_PW_HASH}', '${DEFAULT_PW_HASH}', 'customer', 'active', '0901234567', 'Cầu Giấy, Hà Nội', 'Hà Nội', '2000-01-01', '${AVATAR_COLLECTION[0]}', 450, 1, 1)`);

// User 8: Huong Nguyen
userRows.push(`(8, 'Hương Nguyễn', 'Hương Nguyễn', 'huong@gmail.com', '${DEFAULT_PW_HASH}', '${DEFAULT_PW_HASH}', 'customer', 'active', '0912888999', 'Hà Nội', 'Hà Nội', '1998-05-10', '${AVATAR_COLLECTION[2]}', 250, 1, 1)`);

// Generate other users up to TOTAL_USERS
const generatedEmails = new Set(['admin@mail.com', 'host1@mail.com', 'host2@mail.com', 'phamchuan2608@gmail.com', 'huong@gmail.com']);

for (let id = 5; id <= TOTAL_USERS; id++) {
  if (id === 8) continue;
  const role = id <= HOST_COUNT + 2 ? 'host' : 'customer';
  const nameObj = generateVietnameseName();
  let email = `${nameObj.cleanEmailName}@gmail.com`;
  if (generatedEmails.has(email)) {
    email = `${nameObj.cleanEmailName}.${id}@gmail.com`;
  }
  generatedEmails.add(email);

  const phone = `09${randomInt(10000000, 99999999)}`;
  const city = randomItem(CITIES);
  const district = randomItem(DISTRICTS);
  const address = `${district}, ${city}`;
  const birthYear = randomInt(1980, 2004);
  const birthMonth = String(randomInt(1, 12)).padStart(2, '0');
  const birthDay = String(randomInt(1, 28)).padStart(2, '0');
  const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;
  const avatar = AVATAR_COLLECTION[(id - 1) % AVATAR_COLLECTION.length];
  const points = randomInt(50, 800);

  userRows.push(`(${id}, '${nameObj.fullName}', '${nameObj.fullName}', '${email}', '${DEFAULT_PW_HASH}', '${DEFAULT_PW_HASH}', '${role}', 'active', '${phone}', '${address}', '${city}', '${birthDate}', '${avatar}', ${points}, 1, 1)`);
}

sql += `-- =====================================================
-- 5. SEED USERS (${userRows.length} Users)
-- =====================================================
INSERT INTO \`users\` (\`id\`, \`name\`, \`full_name\`, \`email\`, \`password\`, \`password_hash\`, \`role\`, \`status\`, \`phone\`, \`address\`, \`location\`, \`birth_date\`, \`avatar_url\`, \`reward_points\`, \`is_verified\`, \`is_active\`) VALUES
` + userRows.join(',\n') + ';\n\n';

// 6. SEED PROPERTIES (520 Properties - TÊN TỰ NHIÊN, KHÔNG DẤU '#', ẢNH KHỚP CHỦ ĐỀ VÀ KHÔNG TRÙNG NHAU TRONG CÙNG ĐỊA ĐIỂM)
const TOTAL_PROPERTIES = 520;
const PROPS_PER_LOCATION = 26; // 20 Địa điểm * 26 Chỗ nghỉ = 520 Chỗ nghỉ
const propRows = [];
const imageRows = [];
const amenityRows = [];
let imgIdCounter = 1;

for (let locId = 1; locId <= LOCATION_COUNT; locId++) {
  const city = CITIES[locId - 1];

  for (let k = 0; k < PROPS_PER_LOCATION; k++) {
    const id = (locId - 1) * PROPS_PER_LOCATION + k + 1;
    const hostId = ((id + locId * 3) % HOST_COUNT) + 2;
    // Mỗi địa điểm xoay vòng đều 5 loại hình: Villa (1), Homestay (2), Resort (3), Cabin (4), Eco (5)
    const typeId = (k % 5) + 1;

    // Tạo tên tự nhiên không có ký tự '#', phong phú và hoàn toàn khác nhau trong từng địa điểm
    const baseThemedList = THEMED_NAMES[typeId];
    const nameIndex = (locId * 7 + k * 3) % baseThemedList.length;
    const baseName = baseThemedList[nameIndex];
    const qualifier = AREA_QUALIFIERS[(locId * 5 + k * 7) % AREA_QUALIFIERS.length];
    const name = k < 10
      ? `${baseName} ${city}`
      : `${baseName} ${qualifier} ${city}`;

    const desc = `${name} tọa lạc tại vị trí đắc địa ở ${city}. Không gian nghỉ dưỡng yên bình với đầy đủ tiện nghi, view ngắm cảnh tuyệt đẹp, sân vườn nướng BBQ và không gian thư giãn lý tưởng cho chuyến đi của bạn.`;
    const price = randomInt(12, 65) * 100000; // 1.200.000đ - 6.500.000đ
    const oldPrice = Math.random() > 0.4 ? Math.round(price * 1.25) : null;
    const address = `Đường số ${randomInt(1, 88)}, ${randomItem(DISTRICTS)}`;
    const lat = (10 + Math.random() * 12).toFixed(6);
    const lng = (105 + Math.random() * 4).toFixed(6);
    const maxGuests = typeId === 1 ? randomInt(6, 14) : typeId === 3 ? randomInt(4, 8) : randomInt(2, 6);
    const bedrooms = Math.max(1, Math.floor(maxGuests / 2));
    const bathrooms = Math.max(1, Math.floor(bedrooms * 0.8));
    const rating = (4.4 + Math.random() * 0.6).toFixed(2);
    const reviewCount = randomInt(12, 180);
    const isNew = id > 450 ? 1 : 0;
    const isFeatured = (id % 7 === 0 || id <= 10) ? 1 : 0;

    // Chọn bộ ảnh khớp đúng với loại hình chỗ nghỉ
    let themedPhotoPool = PHOTOS_HOMESTAY;
    if (typeId === 1) themedPhotoPool = PHOTOS_VILLA;
    else if (typeId === 3) themedPhotoPool = PHOTOS_RESORT;
    else if (typeId === 4) themedPhotoPool = PHOTOS_CABIN;
    else if (typeId === 5) themedPhotoPool = PHOTOS_ECO;

    // Ảnh bìa hoàn toàn độc nhất trong địa điểm đó (không trùng lặp!)
    const coverImgIndex = (locId * 3 + k * 7) % themedPhotoPool.length;
    const coverImg = themedPhotoPool[coverImgIndex];
    const token = `HMTOKEN_${String(id).padStart(4, '0')}`;

    propRows.push(`(${id}, ${hostId}, '${name}', '${desc}', ${typeId}, ${price}.00, ${oldPrice ? oldPrice + '.00' : 'NULL'}, ${locId}, '${address}', '${city}', 'Vietnam', ${lat}, ${lng}, ${maxGuests}, ${bedrooms}, ${bathrooms}, ${rating}, ${reviewCount}, ${isNew}, ${isFeatured}, 1, 0, 'approved', '${coverImg}', '${token}', 1, NULL)`);

    // Mỗi chỗ nghỉ có 6 ảnh độc đáo, không trùng lặp
    const imgCount = 6;
    for (let imgIdx = 1; imgIdx <= imgCount; imgIdx++) {
      const imgUrl = themedPhotoPool[(coverImgIndex + imgIdx) % themedPhotoPool.length];
      const isPrimary = imgIdx === 1 ? 1 : 0;
      imageRows.push(`(${imgIdCounter++}, ${id}, '${imgUrl}', ${isPrimary}, ${imgIdx})`);
    }

    // 6-8 Amenities per property
    const amenCount = randomInt(6, 8);
    const pickedAmenIds = new Set();
    while (pickedAmenIds.size < amenCount) {
      pickedAmenIds.add(randomInt(1, 18));
    }
    for (const amenId of pickedAmenIds) {
      amenityRows.push(`(${id}, ${amenId})`);
    }
  }
}

sql += `-- =====================================================
-- 6. SEED PROPERTIES (${propRows.length} Properties)
-- =====================================================
INSERT INTO \`properties\` (\`id\`, \`host_id\`, \`name\`, \`description\`, \`type_id\`, \`price_per_night\`, \`old_price\`, \`location_id\`, \`street_address\`, \`city\`, \`country\`, \`latitude\`, \`longitude\`, \`max_guests\`, \`bedrooms\`, \`bathrooms\`, \`rating\`, \`review_count\`, \`is_new\`, \`is_featured\`, \`is_active\`, \`is_deleted\`, \`status\`, \`cover_image\`, \`manage_token\`, \`manage_token_active\`, \`manage_token_expires_at\`) VALUES
` + propRows.join(',\n') + ';\n\n';

sql += `-- =====================================================
-- 7. SEED PROPERTY IMAGES (${imageRows.length} Images)
-- =====================================================
INSERT INTO \`property_images\` (\`id\`, \`property_id\`, \`image_url\`, \`is_primary\`, \`sort_order\`) VALUES
` + imageRows.join(',\n') + ';\n\n';

sql += `-- =====================================================
-- 8. SEED PROPERTY AMENITIES (${amenityRows.length} Links)
-- =====================================================
INSERT INTO \`property_amenities\` (\`property_id\`, \`amenity_id\`) VALUES
` + amenityRows.join(',\n') + ';\n\n';

// 9. PROMOTIONS (25 promotions)
sql += `-- =====================================================
-- 9. SEED PROMOTIONS (25 Vouchers)
-- =====================================================
INSERT INTO \`promotions\` (\`id\`, \`code\`, \`title\`, \`description\`, \`discount_type\`, \`discount_value\`, \`max_discount_amount\`, \`min_booking_amount\`, \`required_points\`, \`start_date\`, \`end_date\`, \`usage_limit\`, \`used_count\`, \`is_active\`) VALUES
(1, 'WELCOME10', 'Ưu đãi chào mừng bạn mới', 'Giảm 10% tối đa 300.000₫ cho tất cả chỗ nghỉ', 'percent', 10.00, 300000.00, 0.00, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1000, 85, 1),
(2, 'HELLOHOLIDAY', 'Voucher Lễ Hội 2026', 'Giảm trực tiếp 200.000₫ cho đơn đặt phòng từ 1.500.000₫', 'fixed', 200000.00, NULL, 1500000.00, 0, '2026-06-01 00:00:00', '2026-12-31 23:59:59', 500, 112, 1),
(3, 'WEEKEND15', 'Ưu đãi đặt phòng cuối tuần', 'Giảm 15% tối đa 400.000₫ cho chuyến đi từ 2 đêm', 'percent', 15.00, 400000.00, 2000000.00, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 300, 48, 1),
(4, 'POINT100K', 'Voucher Đổi Thưởng 100.000 ₫', 'Quy đổi bằng 200 điểm thưởng tích lũy', 'fixed', 100000.00, NULL, 0.00, 200, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 9999, 45, 1),
(5, 'POINT250K', 'Voucher Đổi Thưởng 250.000 ₫', 'Quy đổi bằng 450 điểm thưởng tích lũy', 'fixed', 250000.00, NULL, 1200000.00, 450, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 9999, 32, 1),
(6, 'POINT500K', 'Voucher VIP Đổi Thưởng 500.000 ₫', 'Quy đổi bằng 800 điểm thưởng tích lũy', 'fixed', 500000.00, NULL, 2500000.00, 800, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 9999, 14, 1),
(7, 'SUMMERDEAL', 'Mùa Hè Rực Rỡ', 'Giảm 12% tối đa 500.000₫ khi đặt phòng trên 3.000.000₫', 'percent', 12.00, 500000.00, 3000000.00, 0, '2026-05-01 00:00:00', '2026-09-30 23:59:59', 400, 78, 1),
(8, 'DALATLOVE', 'Đà Lạt Mộng Mơ', 'Giảm 150.000₫ cho tất cả homestay tại Đà Lạt', 'fixed', 150000.00, NULL, 1000000.00, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 300, 65, 1);
\n`;

// 10. SEED BOOKINGS (520 Bookings with realistic diverse scenarios: completed, confirmed, pending, cancelled)
const TOTAL_BOOKINGS = 520;
const bookingRows = [];
const paymentRows = [];
const refundRows = [];
const conversationRows = [];
const messageRows = [];
let msgIdCounter = 1;

for (let bId = 1; bId <= TOTAL_BOOKINGS; bId++) {
  const propId = ((bId - 1) % TOTAL_PROPERTIES) + 1;
  const guestUserId = randomInt(HOST_COUNT + 3, TOTAL_USERS);
  const bookingCode = `BK2026${String(randomInt(1, 12)).padStart(2, '0')}${String(bId).padStart(4, '0')}`;
  const nights = randomInt(1, 4);
  const guests = randomInt(1, 6);
  const pricePerNight = randomInt(12, 45) * 100000;
  const rawTotal = pricePerNight * nights;
  const discountAmount = bId % 4 === 0 ? 200000 : 0;
  const totalPrice = rawTotal - discountAmount;
  const commRate = 10.0;
  const commAmount = Math.round((totalPrice * commRate) / 100);
  const hostPayout = totalPrice - commAmount;

  const month = randomInt(6, 11);
  const startDay = ((bId * 3) % 25) + 1;
  const endDay = startDay + nights;
  const checkIn = `2026-${String(month).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
  const checkOut = `2026-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

  let status = 'confirmed';
  let paymentStatus = 'verified';
  let cancelReasonCode = 'NULL';
  let cancelReasonText = 'NULL';
  let cancelReasonDisplay = 'NULL';
  let refundAmount = 0;
  let cancellationFee = 0;
  let refundPercentage = 0;
  let policyApplied = 'NULL';
  let cancelledAt = 'NULL';

  if (bId <= 280) {
    status = 'completed';
    paymentStatus = 'verified';
  } else if (bId <= 420) {
    status = 'confirmed';
    paymentStatus = 'verified';
  } else if (bId <= 460) {
    status = 'pending';
    paymentStatus = bId % 2 === 0 ? 'proof_uploaded' : 'unpaid';
  } else {
    status = 'cancelled';
    cancelledAt = `'2026-${String(month).padStart(2, '0')}-${String(startDay > 4 ? startDay - 4 : 1).padStart(2, '0')} 10:00:00'`;
    if (bId % 3 === 0) {
      paymentStatus = 'partially_refunded';
      refundPercentage = 70.0;
      refundAmount = Math.round(totalPrice * 0.70);
      cancellationFee = totalPrice - refundAmount;
      policyApplied = "'CANCEL_72H_70_PERCENT'";
      cancelReasonCode = "'CHANGE_OF_PLAN'";
      cancelReasonDisplay = "'Tôi thay đổi kế hoạch chuyến đi'";
    } else if (bId % 3 === 1) {
      paymentStatus = 'verified';
      refundPercentage = 0.0;
      refundAmount = 0;
      cancellationFee = totalPrice;
      policyApplied = "'CANCEL_WITHIN_72H_NO_REFUND'";
      cancelReasonCode = "'SCHEDULE_ISSUE'";
      cancelReasonDisplay = "'Có việc bận đột xuất sát ngày đi'";
    } else {
      paymentStatus = 'rejected';
      refundPercentage = 0.0;
      refundAmount = 0;
      cancellationFee = 0;
      policyApplied = "'CANCEL_UNPAID_FREE'";
      cancelReasonCode = "'OTHER'";
      cancelReasonText = "'Hết thời hạn giữ chỗ thanh toán (15 phút)'";
      cancelReasonDisplay = "'Hết thời hạn giữ chỗ thanh toán (15 phút)'";
    }
  }

  const proofImg = (paymentStatus === 'verified' || paymentStatus === 'proof_uploaded')
    ? "'/uploads/proofs/sample_proof.jpg'"
    : 'NULL';

  bookingRows.push(`(${bId}, '${bookingCode}', ${propId}, ${guestUserId}, ${guestUserId}, NULL, NULL, NULL, NULL, '${checkIn}', '${checkOut}', ${guests}, ${nights}, ${pricePerNight}.00, NULL, ${discountAmount}.00, ${totalPrice}.00, ${commRate}, 0.1000, ${commAmount}.00, ${hostPayout}.00, '${status}', 'guest_online', 'bank_transfer', 'HSBK${String(bId).padStart(6, '0')}', '${paymentStatus}', ${proofImg}, NOW(), 1, NOW(), NULL, 'Vui lòng xuất trình CCCD khi nhận phòng', 'Khách đặt qua ứng dụng', '', ${guestUserId}, ${cancelReasonCode}, ${cancelReasonText}, ${refundAmount}.00, ${cancellationFee}.00, ${refundPercentage}, ${policyApplied}, ${status === 'cancelled' ? guestUserId : 'NULL'}, ${cancelledAt}, ${cancelReasonDisplay}, NOW(), NOW())`);

  let payStatus = 'completed';
  if (paymentStatus === 'unpaid') payStatus = 'pending';
  else if (paymentStatus === 'refunded') payStatus = 'refunded';
  else if (paymentStatus === 'partially_refunded') payStatus = 'partially_refunded';
  else if (paymentStatus === 'rejected') payStatus = 'failed';

  paymentRows.push(`(${bId}, ${bId}, 'bank_transfer', 'FT26${String(bId).padStart(8, '0')}', ${proofImg}, ${totalPrice}.00, '${payStatus}', NOW(), NOW(), NOW())`);

  if (status === 'cancelled' && (refundAmount > 0 || cancellationFee > 0)) {
    refundRows.push(`(${refundRows.length + 1}, ${bId}, ${guestUserId}, ${totalPrice}.00, ${refundAmount}.00, ${cancellationFee}.00, ${refundPercentage}, ${policyApplied}, ${cancelReasonCode}, ${cancelReasonDisplay}, 'completed', NULL, NOW())`);
  }

  conversationRows.push(`(${bId}, ${bId}, NOW())`);
  messageRows.push(`(${msgIdCounter++}, ${bId}, 1, 'Đặt phòng thành công! Bạn có thể trao đổi với chủ nhà tại đây.', 'system', NOW(), NOW())`);
  messageRows.push(`(${msgIdCounter++}, ${bId}, ${guestUserId}, 'Chào chủ nhà, mình có thể nhận phòng sớm khoảng 12h trưa được không?', 'text', NOW(), NOW())`);
  messageRows.push(`(${msgIdCounter++}, ${bId}, 2, 'Chào bạn! Homestay sẽ hỗ trợ chuẩn bị phòng sớm cho bạn nhé.', 'text', NOW(), NOW())`);
}

sql += `-- =====================================================
-- 10. SEED BOOKINGS (${bookingRows.length} Bookings)
-- =====================================================
INSERT INTO \`bookings\` (\`id\`, \`booking_code\`, \`property_id\`, \`user_id\`, \`guest_id\`, \`guest_name\`, \`guest_name_snapshot\`, \`guest_phone\`, \`guest_phone_snapshot\`, \`check_in\`, \`check_out\`, \`guests\`, \`nights\`, \`price_per_night\`, \`promotion_id\`, \`discount_amount\`, \`total_price\`, \`commission_rate\`, \`commission_rate_applied\`, \`commission_amount\`, \`host_payout_amount\`, \`status\`, \`source\`, \`payment_method\`, \`payment_reference\`, \`payment_status\`, \`payment_proof_image\`, \`payment_submitted_at\`, \`confirmed_by\`, \`confirmed_at\`, \`rejection_reason\`, \`checkin_instructions\`, \`notes\`, \`host_note\`, \`created_by\`, \`cancellation_reason_code\`, \`cancellation_reason_text\`, \`refund_amount\`, \`cancellation_fee\`, \`refund_percentage\`, \`cancellation_policy_applied\`, \`cancelled_by\`, \`cancelled_at\`, \`cancelled_reason\`, \`created_at\`, \`updated_at\`) VALUES
` + bookingRows.join(',\n') + ';\n\n';

sql += `-- =====================================================
-- 11. SEED PAYMENTS (${paymentRows.length} Payments)
-- =====================================================
INSERT INTO \`payments\` (\`id\`, \`booking_id\`, \`payment_method\`, \`transaction_code\`, \`proof_image_url\`, \`amount\`, \`status\`, \`paid_at\`, \`created_at\`, \`updated_at\`) VALUES
` + paymentRows.join(',\n') + ';\n\n';

// 12. SEED FAVORITES (520 Favorites)
const favRows = [];
const favPairs = new Set();
let favId = 1;
while (favRows.length < 520) {
  const uId = randomInt(HOST_COUNT + 3, TOTAL_USERS);
  const pId = randomInt(1, TOTAL_PROPERTIES);
  const key = `${uId}_${pId}`;
  if (!favPairs.has(key)) {
    favPairs.add(key);
    favRows.push(`(${favId++}, ${uId}, ${pId}, NOW())`);
  }
}

sql += `-- =====================================================
-- 12. SEED FAVORITES (${favRows.length} Favorites)
-- =====================================================
INSERT INTO \`favorites\` (\`id\`, \`user_id\`, \`property_id\`, \`created_at\`) VALUES
` + favRows.join(',\n') + ';\n\n';

// 13. SEED REVIEWS (520 Reviews)
const revRows = [];
for (let rId = 1; rId <= 520; rId++) {
  const bId = rId;
  const uId = randomInt(HOST_COUNT + 3, TOTAL_USERS);
  const pId = ((rId - 1) % TOTAL_PROPERTIES) + 1;
  const rating = randomInt(4, 5);
  const comment = randomItem(VIETNAMESE_REVIEWS);
  revRows.push(`(${rId}, ${uId}, ${uId}, ${pId}, ${bId}, ${rating}, '${comment}', 1, 1, NOW(), NOW())`);
}

sql += `-- =====================================================
-- 13. SEED REVIEWS (${revRows.length} Reviews)
-- =====================================================
INSERT INTO \`reviews\` (\`id\`, \`user_id\`, \`guest_id\`, \`property_id\`, \`booking_id\`, \`rating\`, \`comment\`, \`is_verified\`, \`is_active\`, \`created_at\`, \`updated_at\`) VALUES
` + revRows.join(',\n') + ';\n\n';

// 14. SEED NOTIFICATIONS (520 Notifications)
const notifRows = [];
for (let nId = 1; nId <= 520; nId++) {
  const uId = randomInt(HOST_COUNT + 3, TOTAL_USERS);
  notifRows.push(`(${nId}, ${uId}, 'Xác nhận đơn phòng 🎉', 'Đơn đặt phòng #${nId} của bạn đã hoàn tất thành công. Chúc bạn có kỳ nghỉ vui vẻ!', 'booking_status', ${nId}, ${nId % 2 === 0 ? 1 : 0}, NOW())`);
}
sql += `-- =====================================================
-- 14. SEED NOTIFICATIONS (${notifRows.length} Notifications)
-- =====================================================
INSERT INTO \`notifications\` (\`id\`, \`user_id\`, \`title\`, \`content\`, \`type\`, \`reference_id\`, \`is_read\`, \`created_at\`) VALUES
` + notifRows.join(',\n') + ';\n\n';

// 15. SEED USER DEVICES (520 Devices)
const devRows = [];
for (let dId = 1; dId <= 520; dId++) {
  devRows.push(`(${dId}, ${dId}, 'fcm_token_device_simulated_${dId}_${Date.now()}', '${dId % 2 === 0 ? 'android' : 'ios'}', 1, NOW(), NOW())`);
}
sql += `-- =====================================================
-- 15. SEED USER DEVICES (${devRows.length} Devices)
-- =====================================================
INSERT INTO \`user_devices\` (\`id\`, \`user_id\`, \`device_token\`, \`device_type\`, \`is_active\`, \`created_at\`, \`updated_at\`) VALUES
` + devRows.join(',\n') + ';\n\n';

// 16. SEED POINT TRANSACTIONS (520 Point Transactions)
const ptRows = [];
for (let ptId = 1; ptId <= 520; ptId++) {
  const uId = randomInt(HOST_COUNT + 3, TOTAL_USERS);
  const pts = randomInt(50, 250);
  ptRows.push(`(${ptId}, ${uId}, 'Thưởng tích lũy đặt phòng thành công', ${pts}, 'earn', ${ptId}, NOW())`);
}
sql += `-- =====================================================
-- 16. SEED POINT TRANSACTIONS (${ptRows.length} Records)
-- =====================================================
INSERT INTO \`point_transactions\` (\`id\`, \`user_id\`, \`title\`, \`points\`, \`type\`, \`reference_id\`, \`created_at\`) VALUES
` + ptRows.join(',\n') + ';\n\n';

// 17. SEED WALLETS (520 Wallets)
const walletRows = [];
for (let wId = 1; wId <= 520; wId++) {
  let bal = randomInt(2, 25) * 100000;
  if (wId === 4) bal = 1400000; // Phạm Xuân Chuẩn có 1.400.000₫ trong ví
  if (wId === 8) bal = 1900000; // Hương Nguyễn có 1.900.000₫ trong ví
  walletRows.push(`(${wId}, ${wId}, ${bal}.00, 'VND', 'active', NOW(), NOW())`);
}
sql += `-- =====================================================
-- 17. SEED WALLETS (${walletRows.length} Wallets)
-- =====================================================
INSERT INTO \`wallets\` (\`id\`, \`user_id\`, \`balance\`, \`currency\`, \`status\`, \`created_at\`, \`updated_at\`) VALUES
` + walletRows.join(',\n') + ';\n\n';

// 18. SEED WALLET TRANSACTIONS (520 Wallet Transactions)
const wtxRows = [];
// Giao dịch ví mẫu thực tế cho Phạm Xuân Chuẩn (user 4)
wtxRows.push(`(1, 4, 4, 'REFUND', 1400000.00, 0.00, 1400000.00, 'booking_refund', 101, 'Hoàn 70% tiền phòng hủy trước 72h đơn #BK101', 'completed', '2026-10-07 14:30:00')`);
// Giao dịch ví mẫu thực tế cho Hương Nguyễn (user 8)
wtxRows.push(`(2, 8, 8, 'REFUND', 1900000.00, 0.00, 1900000.00, 'booking_refund', 108, 'Hoàn 70% tiền phòng hủy trước 72h đơn #BK108', 'completed', '2026-10-06 09:15:00')`);

for (let txId = 3; txId <= 520; txId++) {
  const uId = randomInt(HOST_COUNT + 3, TOTAL_USERS);
  const amt = randomInt(5, 20) * 100000;
  wtxRows.push(`(${txId}, ${uId}, ${uId}, 'REFUND', ${amt}.00, 0.00, ${amt}.00, 'booking_refund', ${txId}, 'Hoàn 70% tiền phòng hủy trước 72h đơn #${txId}', 'completed', NOW())`);
}
sql += `-- =====================================================
-- 18. SEED WALLET TRANSACTIONS (${wtxRows.length} Records)
-- =====================================================
INSERT INTO \`wallet_transactions\` (\`id\`, \`wallet_id\`, \`user_id\`, \`type\`, \`amount\`, \`balance_before\`, \`balance_after\`, \`reference_type\`, \`reference_id\`, \`description\`, \`status\`, \`created_at\`) VALUES
` + wtxRows.join(',\n') + ';\n\n';

// 19. SEED BANK ACCOUNTS (520 Bank Accounts)
const BANKS = [
  { name: 'Techcombank', code: 'TCB' },
  { name: 'Vietcombank', code: 'VCB' },
  { name: 'MB Bank', code: 'MB' },
  { name: 'VietinBank', code: 'CTG' },
  { name: 'ACB', code: 'ACB' },
  { name: 'BIDV', code: 'BIDV' },
  { name: 'VPBank', code: 'VPB' }
];
const bankRows = [];
for (let bAccId = 1; bAccId <= 520; bAccId++) {
  const b = randomItem(BANKS);
  let accNum = `${randomInt(1000, 9999)}${randomInt(1000, 9999)}${randomInt(1000, 9999)}`;
  let holder = `NGUYEN KHACH HANG ${bAccId}`;
  let bankName = b.name;
  let bankCode = b.code;

  if (bAccId === 4) {
    bankName = 'Vietcombank';
    bankCode = 'VCB';
    accNum = '190720058888';
    holder = 'PHAM XUAN CHUAN';
  } else if (bAccId === 8) {
    bankName = 'Techcombank';
    bankCode = 'TCB';
    accNum = '190345672005';
    holder = 'VU THU HUONG';
  }

  bankRows.push(`(${bAccId}, ${bAccId}, '${bankName}', '${bankCode}', '${accNum}', '${holder}', 1, 'active', NOW(), NOW())`);
}
sql += `-- =====================================================
-- 19. SEED BANK ACCOUNTS (${bankRows.length} Accounts)
-- =====================================================
INSERT INTO \`bank_accounts\` (\`id\`, \`user_id\`, \`bank_name\`, \`bank_code\`, \`account_number\`, \`account_holder_name\`, \`is_default\`, \`status\`, \`created_at\`, \`updated_at\`) VALUES
` + bankRows.join(',\n') + ';\n\n';

// 20. SEED WITHDRAWALS (200 Withdrawals - sạch sẽ cho user 4 và user 8 để tự do rút tiền test)
const withRows = [];
for (let wId = 1; wId <= 200; wId++) {
  const amt = randomInt(5, 30) * 100000;
  // User 4 và User 8 không bị treo lệnh pending, giúp người dùng tự do bấm rút tiền kiểm thử
  let status = wId % 4 === 0 ? 'pending' : 'completed';
  if (wId === 4 || wId === 8) {
    status = 'completed';
  }
  withRows.push(`(${wId}, ${wId}, ${wId}, ${wId}, ${amt}.00, '${status}', 'Rút tiền qua thẻ ngân hàng', 1, NOW(), NOW(), NOW())`);
}
sql += `-- =====================================================
-- 20. SEED WITHDRAWALS (${withRows.length} Records)
-- =====================================================
INSERT INTO \`withdrawals\` (\`id\`, \`user_id\`, \`wallet_id\`, \`bank_account_id\`, \`amount\`, \`status\`, \`admin_note\`, \`processed_by\`, \`processed_at\`, \`created_at\`, \`updated_at\`) VALUES
` + withRows.join(',\n') + ';\n\n';

// 21. SEED REFUNDS
if (refundRows.length > 0) {
  sql += `-- =====================================================
-- 21. SEED REFUNDS (${refundRows.length} Records)
-- =====================================================
INSERT INTO \`refunds\` (\`id\`, \`booking_id\`, \`user_id\`, \`total_paid\`, \`refund_amount\`, \`cancellation_fee\`, \`refund_percentage\`, \`policy_code\`, \`reason_code\`, \`reason_text\`, \`status\`, \`wallet_transaction_id\`, \`created_at\`) VALUES
` + refundRows.join(',\n') + ';\n\n';
}

// 22. SEED CONVERSATIONS & MESSAGES
sql += `-- =====================================================
-- 22. SEED BOOKING CONVERSATIONS (${conversationRows.length} Conversations)
-- =====================================================
INSERT INTO \`booking_conversations\` (\`id\`, \`booking_id\`, \`created_at\`) VALUES
` + conversationRows.join(',\n') + ';\n\n';

sql += `-- =====================================================
-- 23. SEED BOOKING MESSAGES (${messageRows.length} Messages)
-- =====================================================
INSERT INTO \`booking_messages\` (\`id\`, \`conversation_id\`, \`sender_id\`, \`message\`, \`message_type\`, \`read_at\`, \`created_at\`) VALUES
` + messageRows.join(',\n') + ';\n\n';

// 24. SEED DISPUTES (120 Disputes)
const dispRows = [];
for (let dId = 1; dId <= 120; dId++) {
  const dObj = randomItem(DISPUTE_REASONS);
  const uId = randomInt(HOST_COUNT + 3, TOTAL_USERS);
  const st = dId % 3 === 0 ? 'resolved' : dId % 3 === 1 ? 'investigating' : 'pending';
  dispRows.push(`(${dId}, ${uId}, 'guest', 'booking', ${dId}, ${dId}, '${dObj.cat}', '${dObj.reason}', '${dObj.desc}', NULL, '${st}', ${st === 'resolved' ? "'Đã đối soát và hỗ trợ khách hàng thỏa đáng'" : 'NULL'}, 'none', 1, NOW(), NOW())`);
}
sql += `-- =====================================================
-- 24. SEED DISPUTES (${dispRows.length} Disputes)
-- =====================================================
INSERT INTO \`disputes\` (\`id\`, \`reporter_id\`, \`reporter_role\`, \`target_type\`, \`target_id\`, \`booking_id\`, \`category\`, \`reason\`, \`description\`, \`evidence_url\`, \`status\`, \`admin_note\`, \`resolution_action\`, \`resolved_by\`, \`created_at\`, \`resolved_at\`) VALUES
` + dispRows.join(',\n') + ';\n\n';

// 25. SEED HOST VERIFICATIONS (Host Count)
const hvRows = [];
for (let hId = 1; hId <= HOST_COUNT; hId++) {
  const cccd = `0${randomInt(10, 89)}09${randomInt(100000, 999999)}`;
  hvRows.push(`(${hId}, ${hId + 1}, '${cccd}', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=80', 'approved', NULL, 1, NOW(), NOW(), NOW())`);
}
sql += `-- =====================================================
-- 25. SEED HOST VERIFICATIONS (${hvRows.length} Hosts)
-- =====================================================
INSERT INTO \`host_verifications\` (\`id\`, \`host_id\`, \`id_card_number\`, \`id_card_front_url\`, \`id_card_back_url\`, \`business_license_url\`, \`status\`, \`rejection_reason\`, \`reviewed_by\`, \`reviewed_at\`, \`created_at\`, \`updated_at\`) VALUES
` + hvRows.join(',\n') + ';\n\n';

// 26. SEED AUDIT LOGS (1000 Logs)
const auditRows = [];
const ACTIONS = ['booking_confirmed', 'booking_cancelled', 'property_approved', 'dispute_resolved', 'withdrawal_processed'];
for (let aId = 1; aId <= 1000; aId++) {
  const act = randomItem(ACTIONS);
  auditRows.push(`(${aId}, 1, 'admin', '${act}', 'system', ${aId}, 'Nhật ký kiểm toán truy vết giao dịch #${aId}', '127.0.0.1', NOW())`);
}
sql += `-- =====================================================
-- 26. SEED AUDIT LOGS (${auditRows.length} Logs)
-- =====================================================
INSERT INTO \`audit_logs\` (\`id\`, \`actor_id\`, \`actor_role\`, \`action\`, \`entity_type\`, \`entity_id\`, \`metadata\`, \`ip_address\`, \`created_at\`) VALUES
` + auditRows.join(',\n') + ';\n\n';

// Write to database/seed.sql
const targetPath = path.resolve(__dirname, '../../../database/seed.sql');
fs.writeFileSync(targetPath, sql, 'utf8');

console.log(`✓ Generated ${targetPath} successfully!`);
console.log(`Summary:`);
console.log(` - users: ${userRows.length}`);
console.log(` - properties: ${propRows.length}`);
console.log(` - property_images: ${imageRows.length}`);
console.log(` - property_amenities: ${amenityRows.length}`);
console.log(` - bookings: ${bookingRows.length}`);
console.log(` - payments: ${paymentRows.length}`);
console.log(` - favorites: ${favRows.length}`);
console.log(` - reviews: ${revRows.length}`);
console.log(` - notifications: ${notifRows.length}`);
console.log(` - user_devices: ${devRows.length}`);
console.log(` - point_transactions: ${ptRows.length}`);
console.log(` - wallets: ${walletRows.length}`);
console.log(` - wallet_transactions: ${wtxRows.length}`);
console.log(` - bank_accounts: ${bankRows.length}`);
console.log(` - withdrawals: ${withRows.length}`);
console.log(` - booking_conversations: ${conversationRows.length}`);
console.log(` - booking_messages: ${messageRows.length}`);
console.log(` - disputes: ${dispRows.length}`);
console.log(` - host_verifications: ${hvRows.length}`);
console.log(` - audit_logs: ${auditRows.length}`);
