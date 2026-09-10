const pool = require('../config/db');

// GET /api/homestays
const getHomestays = async (req, res) => {
  try {
    const [rows] = await pool.query(`
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
      ORDER BY h.created_at DESC
    `);

    // Get images for each homestay
    const [images] = await pool.query(`
      SELECT homestay_id, image_url
      FROM homestay_images
      WHERE is_primary = 1
    `);

    // Get amenities for each homestay
    const [amenities] = await pool.query(`
      SELECT ha.homestay_id, a.name
      FROM homestay_amenities ha
      JOIN amenities a ON ha.amenity_id = a.id
    `);

    // Group images and amenities by homestay_id
    const imageMap = {};
    images.forEach(img => {
      if (!imageMap[img.homestay_id]) imageMap[img.homestay_id] = [];
      imageMap[img.homestay_id].push(img.image_url);
    });

    const amenityMap = {};
    amenities.forEach(a => {
      if (!amenityMap[a.homestay_id]) amenityMap[a.homestay_id] = [];
      amenityMap[a.homestay_id].push(a.name);
    });

    // Format response to match frontend Homestay type
    const data = rows.map(row => ({
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
      images: imageMap[row.id] || [],
      description: row.description || '',
      isNew: !!row.is_new,
      isFeatured: !!row.is_featured,
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching homestays:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy dữ liệu homestay' });
  }
};

// GET /api/homestays/:id
const getHomestayById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
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
      WHERE h.id = ? AND h.is_active = 1
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Homestay not found' });
    }

    const row = rows[0];

    // Get ALL images for this homestay
    const [images] = await pool.query(`
      SELECT image_url
      FROM homestay_images
      WHERE homestay_id = ?
      ORDER BY is_primary DESC, sort_order ASC
    `, [id]);

    // Get amenities for this homestay
    const [amenities] = await pool.query(`
      SELECT a.name
      FROM homestay_amenities ha
      JOIN amenities a ON ha.amenity_id = a.id
      WHERE ha.homestay_id = ?
    `, [id]);

    const data = {
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
      amenities: amenities.map(a => a.name),
      images: images.map(i => i.image_url),
      isNew: !!row.is_new,
      isFeatured: !!row.is_featured,
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching homestay:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin homestay' });
  }
};

module.exports = { getHomestays, getHomestayById };
