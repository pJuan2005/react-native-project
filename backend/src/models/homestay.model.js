const db = require('../config/database');

class HomestayModel {
  static async findAll({ locationId, typeId, search, isFeatured, isNew } = {}) {
    let sql = `
      SELECT
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
        h.is_new,
        h.is_featured
      FROM homestays h
      JOIN locations l ON h.location_id = l.id
      JOIN homestay_types t ON h.type_id = t.id
      WHERE h.is_active = 1
    `;
    const params = [];

    if (locationId) {
      sql += ' AND h.location_id = ?';
      params.push(locationId);
    }
    if (typeId) {
      sql += ' AND h.type_id = ?';
      params.push(typeId);
    }
    if (isFeatured) {
      sql += ' AND h.is_featured = 1';
    }
    if (isNew) {
      sql += ' AND h.is_new = 1';
    }
    if (search) {
      sql += ' AND (h.name LIKE ? OR l.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY h.created_at DESC';

    const [rows] = await db.query(sql, params);

    // Fetch images and amenities in parallel
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
        h.is_new,
        h.is_featured
      FROM homestays h
      JOIN locations l ON h.location_id = l.id
      JOIN homestay_types t ON h.type_id = t.id
      WHERE h.id = ? AND h.is_active = 1`,
      [id]
    );

    if (rows.length === 0) return null;
    const row = rows[0];

    const [images] = await db.query(
      'SELECT image_url FROM homestay_images WHERE homestay_id = ? ORDER BY is_primary DESC, sort_order ASC',
      [id]
    );
    const [amenities] = await db.query(
      'SELECT a.name FROM homestay_amenities ha JOIN amenities a ON ha.amenity_id = a.id WHERE ha.homestay_id = ?',
      [id]
    );

    return {
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
      amenities: amenities.map((a) => a.name),
      images: images.length > 0
        ? images.map((i) => i.image_url)
        : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'],
      isNew: Boolean(row.is_new),
      isFeatured: Boolean(row.is_featured),
    };
  }

  static async create({
    name,
    description,
    price,
    oldPrice,
    locationId,
    typeId,
    maxGuests,
    bedrooms,
    bathrooms,
    imageUrl,
    isFeatured,
    isNew,
  }) {
    const [result] = await db.query(
      `INSERT INTO homestays (name, description, price, old_price, location_id, type_id, max_guests, bedrooms, bathrooms, is_featured, is_new)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || '',
        price,
        oldPrice || null,
        locationId,
        typeId,
        maxGuests || 2,
        bedrooms || 1,
        bathrooms || 1,
        isFeatured ? 1 : 0,
        isNew ? 1 : 0,
      ]
    );
    const homestayId = result.insertId;

    if (imageUrl) {
      await db.query(
        'INSERT INTO homestay_images (homestay_id, image_url, is_primary, sort_order) VALUES (?, ?, 1, 1)',
        [homestayId, imageUrl]
      );
    }
    return homestayId;
  }

  static async softDelete(id) {
    const [result] = await db.query('UPDATE homestays SET is_active = 0 WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async findByHostId(hostId) {
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
        h.is_new,
        h.is_featured,
        h.is_active,
        h.host_id,
        h.approval_status,
        h.manage_token,
        h.created_at
      FROM homestays h
      JOIN locations l ON h.location_id = l.id
      JOIN homestay_types t ON h.type_id = t.id
      WHERE h.host_id = ?
      ORDER BY h.created_at DESC`,
      [hostId]
    );

    const [images] = await db.query(
      'SELECT homestay_id, image_url FROM homestay_images ORDER BY is_primary DESC, sort_order ASC'
    );
    const imageMap = {};
    images.forEach((img) => {
      if (!imageMap[img.homestay_id]) imageMap[img.homestay_id] = [];
      imageMap[img.homestay_id].push(img.image_url);
    });

    return rows.map((row) => ({
      ...row,
      price: parseFloat(row.price),
      oldPrice: row.old_price ? parseFloat(row.old_price) : undefined,
      images: imageMap[row.id] && imageMap[row.id].length > 0
        ? imageMap[row.id]
        : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'],
    }));
  }

  static async findByToken(token) {
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
        h.is_new,
        h.is_featured,
        h.is_active,
        h.host_id,
        h.approval_status,
        h.manage_token
      FROM homestays h
      JOIN locations l ON h.location_id = l.id
      JOIN homestay_types t ON h.type_id = t.id
      WHERE h.manage_token = ? AND h.is_active = 1`,
      [token]
    );

    if (rows.length === 0) return null;
    const row = rows[0];

    const [images] = await db.query(
      'SELECT image_url FROM homestay_images WHERE homestay_id = ? ORDER BY is_primary DESC, sort_order ASC',
      [row.id]
    );

    return {
      ...row,
      price: parseFloat(row.price),
      oldPrice: row.old_price ? parseFloat(row.old_price) : undefined,
      images: images.length > 0 ? images.map((i) => i.image_url) : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'],
    };
  }

  static async updateApprovalStatus(id, status) {
    const [result] = await db.query(
      'UPDATE homestays SET approval_status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async countActive() {
    const [[{ count }]] = await db.query('SELECT COUNT(*) AS count FROM homestays WHERE is_active = 1');
    return count;
  }
}

module.exports = HomestayModel;
