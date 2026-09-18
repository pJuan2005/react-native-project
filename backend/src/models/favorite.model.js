const db = require('../config/database');

class FavoriteModel {
  static async findByUserId(userId) {
    const [rows] = await db.query(
      `SELECT
        h.id,
        h.name,
        h.description,
        h.price,
        h.old_price,
        h.location_id,
        l.name AS location,
        h.type_id,
        t.name AS type,
        h.rating,
        h.review_count,
        h.max_guests,
        h.bedrooms,
        h.bathrooms,
        f.created_at AS saved_at
      FROM favorites f
      JOIN homestays h ON f.homestay_id = h.id
      JOIN locations l ON h.location_id = l.id
      JOIN homestay_types t ON h.type_id = t.id
      WHERE f.user_id = ? AND h.is_active = 1
      ORDER BY f.created_at DESC`,
      [userId]
    );

    // Fetch images for each saved homestay
    const [images] = await db.query(
      'SELECT homestay_id, image_url FROM homestay_images ORDER BY is_primary DESC, sort_order ASC'
    );
    const [amenities] = await db.query(
      'SELECT ha.homestay_id, a.name FROM homestay_amenities ha JOIN amenities a ON ha.amenity_id = a.id'
    );

    const imageMap = {};
    images.forEach((img) => {
      if (!imageMap[img.homestay_id]) imageMap[img.homestay_id] = [];
      imageMap[img.homestay_id].push(img.image_url);
    });

    const amenityMap = {};
    amenities.forEach((a) => {
      if (!amenityMap[a.homestay_id]) amenityMap[a.homestay_id] = [];
      amenityMap[a.homestay_id].push(a.name);
    });

    return rows.map((row) => ({
      id: String(row.id),
      name: row.name,
      description: row.description || '',
      price: parseFloat(row.price),
      oldPrice: row.old_price ? parseFloat(row.old_price) : undefined,
      locationId: String(row.location_id),
      location: row.location,
      type: row.type,
      rating: parseFloat(row.rating),
      reviewCount: row.review_count,
      maxGuests: row.max_guests,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      amenities: amenityMap[row.id] || [],
      images: imageMap[row.id] || ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'],
      savedAt: row.saved_at,
    }));
  }

  static async toggle(userId, homestayId) {
    const [existing] = await db.query(
      'SELECT id FROM favorites WHERE user_id = ? AND homestay_id = ?',
      [userId, homestayId]
    );

    if (existing.length > 0) {
      await db.query('DELETE FROM favorites WHERE user_id = ? AND homestay_id = ?', [userId, homestayId]);
      return { isSaved: false, message: 'Đã xóa khỏi danh sách yêu thích' };
    } else {
      await db.query('INSERT INTO favorites (user_id, homestay_id) VALUES (?, ?)', [userId, homestayId]);
      return { isSaved: true, message: 'Đã lưu vào danh sách yêu thích' };
    }
  }

  static async remove(userId, homestayId) {
    const [result] = await db.query(
      'DELETE FROM favorites WHERE user_id = ? AND homestay_id = ?',
      [userId, homestayId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = FavoriteModel;
