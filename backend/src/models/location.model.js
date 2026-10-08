const db = require('../config/database');

const MOCK_LOCATIONS = [
  { id: 1, name: 'Đà Lạt', description: 'Thành phố ngàn hoa và sương mây lãng mạn', icon: 'leaf-outline', image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 2, name: 'Sa Pa', description: 'Ruộng bậc thang & núi non Tây Bắc hùng vĩ', icon: 'compass-outline', image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 3, name: 'Phú Quốc', description: 'Đảo ngọc biển xanh cát trắng nắng vàng', icon: 'water-outline', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 4, name: 'Hội An', description: 'Phố cổ đèn lồng lung linh ven sông Hoài', icon: 'home-outline', image_url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 5, name: 'Nha Trang', description: 'Vịnh biển quyến rũ và bãi tắm tuyệt đẹp', icon: 'water-outline', image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 6, name: 'Ninh Bình', description: 'Non nước hữu tình danh thắng Tràng An', icon: 'compass-outline', image_url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 7, name: 'Hà Nội', description: 'Thủ đô nghìn năm văn hiến cổ kính', icon: 'compass-outline', image_url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 8, name: 'TP. Hồ Chí Minh', description: 'Đô thị sôi động hiện đại bậc nhất', icon: 'business-outline', image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 9, name: 'Đà Nẵng', description: 'Thành phố đáng sống biển Mỹ Khê', icon: 'water-outline', image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 10, name: 'Vũng Tàu', description: 'Bãi Sau lộng gió nghỉ dưỡng cuối tuần', icon: 'sunny-outline', image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 11, name: 'Quy Nhơn', description: 'Eo Gió Kỳ Co biển xanh hoang sơ', icon: 'water-outline', image_url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4b13?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 12, name: 'Huế', description: 'Cố đô mộng mơ sông Hương núi Ngự', icon: 'home-outline', image_url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 13, name: 'Hạ Long', description: 'Kỳ quan thiên nhiên vịnh đá vôi', icon: 'boat-outline', image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 14, name: 'Côn Đảo', description: 'Thiên đường biển đảo thanh bình', icon: 'leaf-outline', image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 15, name: 'Mộc Châu', description: 'Đồi chè xanh mướt cao nguyên mộng mơ', icon: 'leaf-outline', image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 16, name: 'Phan Thiết', description: 'Đồi cát bay và vịnh Mũi Né', icon: 'sunny-outline', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 17, name: 'Buôn Ma Thuột', description: 'Thủ phủ cà phê đại ngàn Tây Nguyên', icon: 'cafe-outline', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 18, name: 'Mũi Né', description: 'Làng chài thơ mộng và sóng biển', icon: 'water-outline', image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 19, name: 'Hà Giang', description: 'Cao nguyên đá Đồng Văn hùng vĩ', icon: 'compass-outline', image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
  { id: 20, name: 'Mai Châu', description: 'Thung lũng bản Lác yên bình', icon: 'home-outline', image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80', homestay_count: 26 },
];

class LocationModel {
  static async findAll() {
    try {
      const [rows] = await db.query(
        `SELECT
          l.id,
          l.name,
          l.description,
          l.icon,
          l.image_url,
          COALESCE(COUNT(p.id), l.homestay_count) AS homestay_count,
          COALESCE(COUNT(p.id), l.homestay_count) AS property_count
        FROM locations l
        LEFT JOIN properties p ON p.location_id = l.id AND p.is_active = 1 AND p.is_deleted = 0
        WHERE l.is_active = 1
        GROUP BY l.id
        ORDER BY l.sort_order ASC, l.id ASC`
      );
      if (rows.length > 0) {
        return rows.map((r) => ({
          ...r,
          homestay_count: parseInt(r.homestay_count, 10) || 0,
          property_count: parseInt(r.property_count, 10) || 0,
        }));
      }
      return MOCK_LOCATIONS;
    } catch (_) {
      return MOCK_LOCATIONS;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query(
        `SELECT
          l.id,
          l.name,
          l.description,
          l.icon,
          l.image_url,
          COALESCE(COUNT(p.id), l.homestay_count) AS homestay_count,
          COALESCE(COUNT(p.id), l.homestay_count) AS property_count
        FROM locations l
        LEFT JOIN properties p ON p.location_id = l.id AND p.is_active = 1 AND p.is_deleted = 0
        WHERE l.id = ? AND l.is_active = 1
        GROUP BY l.id`,
        [id]
      );
      if (rows[0]) {
        return {
          ...rows[0],
          homestay_count: parseInt(rows[0].homestay_count, 10) || 0,
          property_count: parseInt(rows[0].property_count, 10) || 0,
        };
      }
    } catch (_) {}
    return MOCK_LOCATIONS.find((l) => String(l.id) === String(id)) || null;
  }
}

module.exports = LocationModel;
