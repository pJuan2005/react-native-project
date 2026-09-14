const db = require('../config/database');

class LocationModel {
  static async findAll() {
    const [rows] = await db.query(
      'SELECT id, name, description, icon, image_url, homestay_count FROM locations WHERE is_active = 1 ORDER BY sort_order ASC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, description, icon, image_url, homestay_count FROM locations WHERE id = ? AND is_active = 1',
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = LocationModel;
