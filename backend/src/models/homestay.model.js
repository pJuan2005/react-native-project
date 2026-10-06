const db = require('../config/database');

class HomestayModel {
  static async findAll({ locationId, typeId, search, isFeatured, isNew } = {}) {
    let sql = `
      SELECT
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
        p.is_new,
        p.is_featured
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN homestay_types t ON p.type_id = t.id
      WHERE p.is_active = 1 AND p.is_deleted = 0
    `;
    const params = [];

    if (locationId) {
      sql += ' AND p.location_id = ?';
      params.push(locationId);
    }
    if (typeId) {
      sql += ' AND p.type_id = ?';
      params.push(typeId);
    }
    if (isFeatured) {
      sql += ' AND (p.is_featured = 1 OR p.featured = 1)';
    }
    if (isNew) {
      sql += ' AND p.is_new = 1';
    }
    if (search) {
      sql += ' AND (p.title LIKE ? OR p.name LIKE ? OR l.name LIKE ? OR p.city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY p.created_at DESC';

    const [rows] = await db.query(sql, params);

    // Fetch images and amenities from property child tables
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
      images: imageMap[row.id] && imageMap[row.id].length > 0
        ? imageMap[row.id]
        : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'],
      description: row.description || '',
      isNew: Boolean(row.is_new),
      isFeatured: Boolean(row.is_featured),
    }));
  }

  static async findById(id) {
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
        p.is_new,
        p.is_featured
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN homestay_types t ON p.type_id = t.id
      WHERE p.id = ? AND p.is_active = 1 AND p.is_deleted = 0`,
      [id]
    );

    if (rows.length === 0) return null;
    const row = rows[0];

    const [images] = await db.query(
      'SELECT image_url FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, sort_order ASC',
      [id]
    );
    const [amenities] = await db.query(
      'SELECT a.name FROM property_amenities pa JOIN amenities a ON pa.amenity_id = a.id WHERE pa.property_id = ?',
      [id]
    );

    let bookedRanges = [];
    try {
      const [bookedRows] = await db.query(
        `SELECT
          DATE_FORMAT(check_in, '%Y-%m-%d') AS check_in,
          DATE_FORMAT(check_out, '%Y-%m-%d') AS check_out
         FROM bookings
         WHERE property_id = ?
           AND status IN ('pending', 'confirmed')
           AND check_out >= CURDATE()
         ORDER BY check_in ASC`,
        [id]
      );
      bookedRanges = bookedRows.map((b) => ({
        checkIn: b.check_in,
        checkOut: b.check_out,
      }));
    } catch (_) {}

    return {
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
      amenities: amenities.map((a) => a.name),
      images: images.length > 0
        ? images.map((i) => i.image_url)
        : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'],
      bookedRanges,
      isNew: Boolean(row.is_new),
      isFeatured: Boolean(row.is_featured),
    };
  }

  static async create({
    name,
    title,
    description,
    price,
    pricePerNight,
    oldPrice,
    locationId,
    typeId,
    maxGuests,
    bedrooms,
    bathrooms,
    imageUrl,
    isFeatured,
    isNew,
    hostId = 2,
  }) {
    const finalTitle = title || name;
    const finalPrice = pricePerNight || price;

    const [result] = await db.query(
      `INSERT INTO properties (
        title, name, description, price_per_night, price, old_price,
        location_id, type_id, host_id, max_guests, bedrooms, bathrooms,
        is_featured, is_new, status, approval_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 'approved')`,
      [
        finalTitle,
        finalTitle,
        description || '',
        finalPrice,
        finalPrice,
        oldPrice || null,
        locationId || 1,
        typeId || 1,
        hostId,
        maxGuests || 2,
        bedrooms || 1,
        bathrooms || 1,
        isFeatured ? 1 : 0,
        isNew ? 1 : 0,
      ]
    );
    const propertyId = result.insertId;

    if (imageUrl) {
      await db.query(
        'INSERT INTO property_images (property_id, image_url, is_primary, sort_order) VALUES (?, ?, 1, 1)',
        [propertyId, imageUrl]
      );
    }
    return propertyId;
  }

  static async softDelete(id) {
    const [result] = await db.query('UPDATE properties SET is_active = 0, is_deleted = 1 WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async findByHostId(hostId) {
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
        p.is_new,
        p.is_featured,
        p.is_active,
        p.host_id,
        p.status,
        p.approval_status,
        p.manage_token,
        p.created_at
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN homestay_types t ON p.type_id = t.id
      WHERE p.host_id = ? AND p.is_deleted = 0
      ORDER BY p.created_at DESC`,
      [hostId]
    );

    const [images] = await db.query(
      'SELECT property_id, image_url FROM property_images ORDER BY is_primary DESC, sort_order ASC'
    );
    const imageMap = {};
    images.forEach((img) => {
      if (!imageMap[img.property_id]) imageMap[img.property_id] = [];
      imageMap[img.property_id].push(img.image_url);
    });

    return rows.map((row) => ({
      ...row,
      price: parseFloat(row.price),
      pricePerNight: parseFloat(row.price_per_night || row.price),
      oldPrice: row.old_price ? parseFloat(row.old_price) : undefined,
      images: imageMap[row.id] && imageMap[row.id].length > 0
        ? imageMap[row.id]
        : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'],
    }));
  }

  static async findByToken(token) {
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
        p.is_new,
        p.is_featured,
        p.is_active,
        p.host_id,
        p.status,
        p.approval_status,
        p.manage_token
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN homestay_types t ON p.type_id = t.id
      WHERE p.manage_token = ? AND p.is_active = 1 AND p.is_deleted = 0`,
      [token]
    );

    if (rows.length === 0) return null;
    const row = rows[0];

    const [images] = await db.query(
      'SELECT image_url FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, sort_order ASC',
      [row.id]
    );

    return {
      ...row,
      price: parseFloat(row.price),
      pricePerNight: parseFloat(row.price_per_night || row.price),
      oldPrice: row.old_price ? parseFloat(row.old_price) : undefined,
      images: images.length > 0 ? images.map((i) => i.image_url) : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'],
    };
  }

  static async updateApprovalStatus(id, status) {
    const [result] = await db.query(
      'UPDATE properties SET status = ?, approval_status = ? WHERE id = ?',
      [status, status, id]
    );
    return result.affectedRows > 0;
  }

  static async countActive() {
    const [[{ count }]] = await db.query('SELECT COUNT(*) AS count FROM properties WHERE is_active = 1 AND is_deleted = 0');
    return count;
  }
}

module.exports = HomestayModel;
