const db = require('../config/database');

class HomestayModel {
  static async findAll({ locationId, typeId, search, isFeatured, isNew } = {}) {
    let sql = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price_per_night,
        p.old_price,
        p.location_id,
        COALESCE(l.name, p.city) AS location,
        p.type_id,
        COALESCE(t.name, 'Homestay') AS type,
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
      sql += ' AND p.is_featured = 1';
    }
    if (isNew) {
      sql += ' AND p.is_new = 1';
    }
    if (search) {
      sql += ' AND (p.name LIKE ? OR l.name LIKE ? OR p.city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY p.created_at DESC';

    const [rows] = await db.query(sql, params);

    // Fetch images and amenities from property child tables (deduplicated)
    const [images] = await db.query(
      'SELECT DISTINCT property_id, image_url FROM property_images ORDER BY is_primary DESC, sort_order ASC, id ASC'
    );
    const [amenities] = await db.query(
      'SELECT DISTINCT pa.property_id, a.name FROM property_amenities pa JOIN amenities a ON pa.amenity_id = a.id'
    );

    const imageMap = {};
    images.forEach((img) => {
      if (!imageMap[img.property_id]) imageMap[img.property_id] = [];
      if (!imageMap[img.property_id].includes(img.image_url) && imageMap[img.property_id].length < 10) {
        imageMap[img.property_id].push(img.image_url);
      }
    });

    const amenityMap = {};
    amenities.forEach((a) => {
      if (!amenityMap[a.property_id]) amenityMap[a.property_id] = [];
      if (!amenityMap[a.property_id].includes(a.name)) {
        amenityMap[a.property_id].push(a.name);
      }
    });

    return rows.map((row) => ({
      id: String(row.id),
      name: row.name,
      title: row.name, // DTO compatibility for Web
      price: parseFloat(row.price_per_night), // DTO compatibility for Mobile
      pricePerNight: parseFloat(row.price_per_night),
      oldPrice: row.old_price ? parseFloat(row.old_price) : undefined,
      locationId: String(row.location_id || 1),
      location: row.location,
      type: row.type,
      propertyType: row.type, // DTO compatibility
      typeId: String(row.type_id || 1),
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
      featured: Boolean(row.is_featured), // DTO compatibility
    }));
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT
        p.id,
        p.name,
        p.description,
        p.price_per_night,
        p.old_price,
        p.location_id,
        COALESCE(l.name, p.city) AS location,
        p.type_id,
        COALESCE(t.name, 'Homestay') AS type,
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
      'SELECT DISTINCT image_url FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 10',
      [id]
    );
    const [amenities] = await db.query(
      'SELECT DISTINCT a.name FROM property_amenities pa JOIN amenities a ON pa.amenity_id = a.id WHERE pa.property_id = ?',
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
           AND status IN ('pending', 'confirmed', 'completed')
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
      title: row.name, // DTO compatibility
      description: row.description || '',
      price: parseFloat(row.price_per_night), // DTO compatibility
      pricePerNight: parseFloat(row.price_per_night),
      oldPrice: row.old_price ? parseFloat(row.old_price) : undefined,
      locationId: String(row.location_id || 1),
      location: row.location,
      type: row.type,
      propertyType: row.type, // DTO compatibility
      typeId: String(row.type_id || 1),
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
      featured: Boolean(row.is_featured), // DTO compatibility
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
    const canonicalName = name || title;
    const canonicalPrice = pricePerNight || price || 0;

    const [result] = await db.query(
      `INSERT INTO properties (
        host_id, name, description, type_id, price_per_night, old_price,
        location_id, max_guests, bedrooms, bathrooms,
        is_featured, is_new, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
      [
        hostId,
        canonicalName,
        description || '',
        typeId || 1,
        canonicalPrice,
        oldPrice || null,
        locationId || 1,
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
        p.name,
        p.description,
        p.price_per_night,
        p.old_price,
        p.location_id,
        COALESCE(l.name, p.city) AS location,
        p.type_id,
        COALESCE(t.name, 'Homestay') AS type,
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
      'SELECT DISTINCT property_id, image_url FROM property_images ORDER BY is_primary DESC, sort_order ASC, id ASC'
    );
    const imageMap = {};
    images.forEach((img) => {
      if (!imageMap[img.property_id]) imageMap[img.property_id] = [];
      if (!imageMap[img.property_id].includes(img.image_url) && imageMap[img.property_id].length < 10) {
        imageMap[img.property_id].push(img.image_url);
      }
    });

    return rows.map((row) => ({
      ...row,
      title: row.name, // DTO compatibility
      price: parseFloat(row.price_per_night), // DTO compatibility
      pricePerNight: parseFloat(row.price_per_night),
      oldPrice: row.old_price ? parseFloat(row.old_price) : undefined,
      propertyType: row.type, // DTO compatibility
      featured: Boolean(row.is_featured), // DTO compatibility
      approval_status: row.status, // DTO compatibility
      images: imageMap[row.id] && imageMap[row.id].length > 0
        ? imageMap[row.id]
        : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'],
    }));
  }

  static async findByToken(token) {
    const [rows] = await db.query(
      `SELECT
        p.id,
        p.name,
        p.description,
        p.price_per_night,
        p.old_price,
        p.location_id,
        COALESCE(l.name, p.city) AS location,
        p.type_id,
        COALESCE(t.name, 'Homestay') AS type,
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
      'SELECT DISTINCT image_url FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 10',
      [row.id]
    );

    return {
      ...row,
      title: row.name, // DTO compatibility
      price: parseFloat(row.price_per_night), // DTO compatibility
      pricePerNight: parseFloat(row.price_per_night),
      oldPrice: row.old_price ? parseFloat(row.old_price) : undefined,
      propertyType: row.type, // DTO compatibility
      featured: Boolean(row.is_featured), // DTO compatibility
      approval_status: row.status, // DTO compatibility
      images: images.length > 0 ? images.map((i) => i.image_url) : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'],
    };
  }

  static async updateApprovalStatus(id, status) {
    const [result] = await db.query(
      'UPDATE properties SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async countActive() {
    const [[{ count }]] = await db.query('SELECT COUNT(*) AS count FROM properties WHERE is_active = 1 AND is_deleted = 0');
    return count;
  }
}

module.exports = HomestayModel;
