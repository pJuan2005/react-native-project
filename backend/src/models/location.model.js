const db = require('../config/database');

const MOCK_LOCATIONS = [
  { id: 1, name: 'Đà Lạt', description: 'Thành phố ngàn hoa và sương mây', icon: 'leaf-outline', image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80', homestay_count: 25 },
  { id: 2, name: 'Sa Pa', description: 'Nơi gặp gỡ đất trời Tây Bắc', icon: 'compass-outline', image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80', homestay_count: 18 },
  { id: 3, name: 'Phú Quốc', description: 'Thiên đường đảo ngọc biển xanh', icon: 'water-outline', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80', homestay_count: 32 },
  { id: 4, name: 'Hội An', description: 'Phố cổ trầm mặc ven sông Hoài', icon: 'home-outline', image_url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80', homestay_count: 21 },
  { id: 5, name: 'Nha Trang', description: 'Vịnh biển quyến rũ và nắng vàng', icon: 'water-outline', image_url: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=900&q=80', homestay_count: 28 },
  { id: 6, name: 'Ninh Bình', description: 'Non nước hữu tình Tràng An', icon: 'compass-outline', image_url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80', homestay_count: 15 },
];

class LocationModel {
  static async findAll() {
    try {
      const [rows] = await db.query(
        'SELECT id, name, description, icon, image_url, homestay_count FROM locations WHERE is_active = 1 ORDER BY sort_order ASC'
      );
      return rows.length > 0 ? rows : MOCK_LOCATIONS;
    } catch (_) {
      return MOCK_LOCATIONS;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query(
        'SELECT id, name, description, icon, image_url, homestay_count FROM locations WHERE id = ? AND is_active = 1',
        [id]
      );
      if (rows[0]) return rows[0];
    } catch (_) {}
    return MOCK_LOCATIONS.find((l) => String(l.id) === String(id)) || null;
  }
}

module.exports = LocationModel;
