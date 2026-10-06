const db = require('../config/database');

class FavoriteModel {
  static async findByUserId(userId) {
    const [rows] = await db.query(
      `SELECT
        p.id,
        COALESCE(p.title, p.name) AS name,
        p.title,
        p.description,
        p.price_per_night AS price,
        p.price_per_night,
        p.old_price,
        p.location_id,
        COALESCE(l.name, p.city) AS location,
        p.type_id,
        COALESCE(t.name, p.property_type) AS type,
        p.rating,
        p.review_count,
        p.max_guests,
        p.bedrooms,
        p.bathrooms,
        f.created_at AS saved_at
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN homestay_types t ON p.type_id = t.id
      WHERE f.user_id = ? AND p.is_active = 1 AND p.is_deleted = 0
      ORDER BY f.created_at DESC`,
      [userId]
    );

    // Fetch images and amenities for each saved property
    const [images] = await db.query(
      'SELECT property_id, image_url FROM property_images ORDER BY is_primary DESC, sort_order ASC'
    );
    const [amenities] = await db.query(
      'SELECT pa.property_id, a.name FROM property_amenities pa JOIN amenities a ON pa.amenity_id = a.id'
    );

    const imageMap = {};
    images.forEach((img) => {
      if (!imageMap[img.property_id]) imageMap[img.property_id] = [];
      imageMap[img.property_id].push(img.image_url);
    });

    const amenityMap = {};
    amenities.forEach((a) => {
      if (!amenityMap[a.property_id]) amenityMap[a.property_id] = [];
      amenityMap[a.property_id].push(a.name);
    });

    return rows.map((row) => ({
      id: String(row.id),
      name: row.name,
      title: row.title,
      description: row.description || '',
      price: parseFloat(row.price),
      pricePerNight: parseFloat(row.price_per_night || row.price),
      oldPrice: row.old_price ? parseFloat(row.old_price) : undefined,
      locationId: String(row.location_id || 1),
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

  static async toggle(userId, propertyId) {
    const [existing] = await db.query(
      'SELECT id FROM favorites WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );

    if (existing.length > 0) {
      await db.query('DELETE FROM favorites WHERE user_id = ? AND property_id = ?', [userId, propertyId]);
      return { isSaved: false, message: 'Đã xóa khỏi danh sách yêu thích' };
    } else {
      await db.query('INSERT INTO favorites (user_id, property_id) VALUES (?, ?)', [userId, propertyId]);
      return { isSaved: true, message: 'Đã lưu vào danh sách yêu thích' };
    }
  }

  static async remove(userId, propertyId) {
    const [result] = await db.query(
      'DELETE FROM favorites WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = FavoriteModel;
