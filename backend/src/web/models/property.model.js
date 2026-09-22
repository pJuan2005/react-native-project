const db = require("../common/db");
const crypto = require("crypto");
const { buildVariantUrl } = require("../common/propertyUpload");

const Property = {};

function normalizePublicPropertyFilters(filters = {}) {
  return {
    location: String(filters.location || "").trim(),
    type: String(filters.type || "").trim(),
    checkIn: String(filters.checkIn || "").trim(),
    checkOut: String(filters.checkOut || "").trim(),
    guests: Number.isFinite(Number(filters.guests))
      ? Math.trunc(Number(filters.guests))
      : 0,
  };
}

function buildPublicPropertyWhereClause(filters = {}) {
  const normalizedFilters = normalizePublicPropertyFilters(filters);
  const clauses = ["p.status = 'approved'", "p.is_deleted = 0"];
  const params = [];

  if (normalizedFilters.location) {
    const likeValue = `%${normalizedFilters.location}%`;
    clauses.push(`(
      p.title LIKE ?
      OR p.street_address LIKE ?
      OR p.city LIKE ?
      OR p.country LIKE ?
      OR p.property_type LIKE ?
    )`);
    params.push(likeValue, likeValue, likeValue, likeValue, likeValue);
  }

  if (normalizedFilters.type) {
    clauses.push("p.property_type = ?");
    params.push(normalizedFilters.type);
  }

  if (normalizedFilters.guests > 0) {
    clauses.push("p.max_guests >= ?");
    params.push(normalizedFilters.guests);
  }

  if (normalizedFilters.checkIn && normalizedFilters.checkOut) {
    clauses.push(`NOT EXISTS (
      SELECT 1
      FROM bookings b
      WHERE b.property_id = p.id
        AND b.status IN ('pending', 'confirmed')
        AND ? < b.check_out
        AND ? > b.check_in
    )`);
    params.push(normalizedFilters.checkIn, normalizedFilters.checkOut);
  }

  return {
    whereClause: clauses.join(" AND "),
    params,
  };
}

function createManageToken() {
  return crypto.randomBytes(24).toString("hex");
}

function mapPropertySummaryRow(row, options = {}) {
  const summary = {
    id: Number(row.id),
    hostId: Number(row.hostId),
    title: row.title,
    description: row.description,
    type: row.type,
    price: Number(row.price),
    location: row.location,
    city: row.city,
    country: row.country,
    maxGuests: Number(row.maxGuests || 0),
    bedrooms: Number(row.bedrooms || 0),
    bathrooms: Number(row.bathrooms || 0),
    status: row.status,
    image: buildVariantUrl(row.image, "thumb"),
    featured: Boolean(row.featured),
    hostName: row.hostName,
    reviews: Number(row.reviews || 0),
    rating: Number(row.rating || 0),
  };

  if (options.includeManageAccess) {
    summary.manageToken = row.manageToken || "";
    summary.manageTokenActive = Boolean(row.manageTokenActive);
    summary.manageTokenExpiresAt = row.manageTokenExpiresAt || null;
  }

  return summary;
}

async function getAmenities(propertyId) {
  const [rows] = await db.promise().query(
    `SELECT a.name
     FROM amenities a
     JOIN property_amenities pa ON a.id = pa.amenity_id
     WHERE pa.property_id = ?
     ORDER BY a.name ASC`,
    [propertyId],
  );

  return rows.map((row) => row.name);
}

async function getImageList(propertyId) {
  const [rows] = await db.promise().query(
    `SELECT id, image_url
     FROM property_images
     WHERE property_id = ?
     ORDER BY id ASC`,
    [propertyId],
  );

  return rows.map((row) => ({
    id: Number(row.id),
    url: row.image_url,
  }));
}

async function getReviewList(propertyId) {
  const [rows] = await db.promise().query(
    `SELECT
      r.id,
      r.rating,
      r.comment,
      r.created_at AS date,
      u.full_name AS authorName
     FROM reviews r
     JOIN users u ON r.guest_id = u.id
     WHERE r.property_id = ?
     ORDER BY r.created_at DESC`,
    [propertyId],
  );

  return rows.map((row) => ({
    id: Number(row.id),
    rating: Number(row.rating),
    comment: row.comment,
    authorName: row.authorName,
    date: row.date,
  }));
}

async function buildPropertyDetail(row, options = {}) {
  const [amenities, imageRows, reviews] = await Promise.all([
    getAmenities(row.id),
    getImageList(row.id),
    getReviewList(row.id),
  ]);

  const images = imageRows.map((imageRow) => imageRow.url);

  const detail = {
    id: Number(row.id),
    hostId: Number(row.host_id),
    title: row.title,
    description: row.description,
    type: row.property_type,
    price: Number(row.price_per_night),
    address: row.street_address,
    location: `${row.street_address}, ${row.city}, ${row.country}`,
    city: row.city,
    country: row.country,
    maxGuests: Number(row.max_guests || 0),
    bedrooms: Number(row.bedrooms || 0),
    bathrooms: Number(row.bathrooms || 0),
    status: row.status,
    image: buildVariantUrl(row.cover_image, "medium"),
    coverImageOriginal: row.cover_image,
    images: images.map((image) => buildVariantUrl(image, "medium")),
    originalImages: images,
    amenities,
    reviews,
    reviewCount: Number(row.reviewCount || 0),
    rating: Number(row.rating || 0),
    featured: Boolean(row.featured),
    hostName: row.hostName,
  };

  if (options.includeManageAccess) {
    detail.manageToken = row.manage_token || "";
    detail.manageTokenActive = Boolean(row.manage_token_active);
    detail.manageTokenExpiresAt = row.manage_token_expires_at || null;
  }

  return detail;
}

async function getPropertyDetail(whereClause, params, options = {}) {
  const [rows] = await db.promise().query(
    `SELECT
      p.*,
      u.full_name AS hostName,
      COUNT(r.id) AS reviewCount,
      COALESCE(AVG(r.rating), 0) AS rating
     FROM properties p
     JOIN users u ON p.host_id = u.id
     LEFT JOIN reviews r ON r.property_id = p.id
     WHERE ${whereClause}
     GROUP BY p.id`,
    params,
  );

  if (rows.length === 0) {
    return null;
  }

  return buildPropertyDetail(rows[0], options);
}

async function getPropertyList(whereClause, params = [], options = {}) {
  const manageFields = options.includeManageAccess
    ? `,
      p.manage_token AS manageToken,
      p.manage_token_active AS manageTokenActive,
      p.manage_token_expires_at AS manageTokenExpiresAt`
    : "";

  const [rows] = await db.promise().query(
    `SELECT
      p.id,
      p.host_id AS hostId,
      p.title,
      p.description,
      p.property_type AS type,
      p.price_per_night AS price,
      CONCAT(p.street_address, ', ', p.city, ', ', p.country) AS location,
      p.city,
      p.country,
      p.max_guests AS maxGuests,
      p.bedrooms,
      p.bathrooms,
      p.status,
      p.cover_image AS image,
      p.featured,
      ${options.includeManageAccess ? "p.manage_token AS manageToken," : ""}
      ${options.includeManageAccess ? "p.manage_token_active AS manageTokenActive," : ""}
      ${options.includeManageAccess ? "p.manage_token_expires_at AS manageTokenExpiresAt," : ""}
      u.full_name AS hostName,
      COUNT(r.id) AS reviews,
      COALESCE(AVG(r.rating), 0) AS rating
     FROM properties p
     JOIN users u ON p.host_id = u.id
     LEFT JOIN reviews r ON r.property_id = p.id
     WHERE ${whereClause}
     GROUP BY p.id
     ORDER BY p.created_at DESC`,
    params,
  );

  return rows.map((row) => mapPropertySummaryRow(row, options));
}

Property.getAll = async (filters = {}) => {
  const { whereClause, params } = buildPublicPropertyWhereClause(filters);
  return getPropertyList(whereClause, params);
};

Property.getById = async (id) =>
  getPropertyDetail("p.id = ? AND p.status = 'approved' AND p.is_deleted = 0", [id]);

Property.checkAvailability = async (id, filters = {}) => {
  const normalizedFilters = normalizePublicPropertyFilters(filters);
  const [propertyRows] = await db.promise().query(
    `SELECT id, status, is_deleted, max_guests
     FROM properties
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  if (!propertyRows.length) {
    return {
      exists: false,
      available: false,
      reason: "Property not found.",
    };
  }

  const property = propertyRows[0];

  if (property.is_deleted || property.status !== "approved") {
    return {
      exists: true,
      available: false,
      reason: "This property is not available for public booking.",
    };
  }

  if (!normalizedFilters.checkIn || !normalizedFilters.checkOut) {
    return {
      exists: true,
      available: true,
      reason: "",
    };
  }

  const [conflictRows] = await db.promise().query(
    `SELECT COUNT(*) AS total
     FROM bookings
     WHERE property_id = ?
       AND status IN ('pending', 'confirmed')
       AND ? < check_out
       AND ? > check_in`,
    [id, normalizedFilters.checkIn, normalizedFilters.checkOut],
  );

  const conflictCount = Number(conflictRows[0]?.total || 0);

  return {
    exists: true,
    available: conflictCount === 0,
    reason:
      conflictCount === 0
        ? ""
        : "The selected dates are no longer available. Please choose another stay period.",
  };
};

Property.getUnavailableDateRanges = async (id) => {
  const [propertyRows] = await db.promise().query(
    `SELECT id, status, is_deleted
     FROM properties
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  if (!propertyRows.length) {
    return {
      exists: false,
      ranges: [],
    };
  }

  const property = propertyRows[0];

  if (property.is_deleted || property.status !== "approved") {
    return {
      exists: true,
      ranges: [],
    };
  }

  const [rows] = await db.promise().query(
    `SELECT
      DATE_FORMAT(check_in, '%Y-%m-%d') AS checkIn,
      DATE_FORMAT(check_out, '%Y-%m-%d') AS checkOut,
      status
     FROM bookings
     WHERE property_id = ?
       AND status IN ('pending', 'confirmed')
       AND check_out > CURDATE()
     ORDER BY check_in ASC`,
    [id],
  );

  return {
    exists: true,
    ranges: rows.map((row) => ({
      checkIn: row.checkIn,
      checkOut: row.checkOut,
      status: row.status,
    })),
  };
};

Property.getAllAdmin = async () =>
  getPropertyList("p.is_deleted = 0", [], {
    includeManageAccess: true,
  });

Property.getAdminById = async (id) =>
  getPropertyDetail("p.id = ? AND p.is_deleted = 0", [id], {
    includeManageAccess: true,
  });

Property.getByHost = async (hostId) =>
  getPropertyList("p.host_id = ? AND p.is_deleted = 0", [hostId], {
    includeManageAccess: true,
  });

Property.getHostById = async (id, hostId) =>
  getPropertyDetail("p.id = ? AND p.host_id = ? AND p.is_deleted = 0", [id, hostId], {
    includeManageAccess: true,
  });

Property.create = async (payload) => {
  const manageToken = createManageToken();
  const [result] = await db.promise().query(
    `INSERT INTO properties (
      host_id,
      title,
      description,
      property_type,
      price_per_night,
      street_address,
      city,
      country,
      max_guests,
      bedrooms,
      bathrooms,
      status,
      cover_image,
      featured,
      manage_token,
      manage_token_active,
      manage_token_expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NULL)`,
    [
      payload.hostId,
      payload.title,
      payload.description,
      payload.type,
      payload.price,
      payload.address,
      payload.city,
      payload.country,
      payload.maxGuests,
      payload.bedrooms,
      payload.bathrooms,
      payload.status || "pending",
      payload.coverImage || null,
      payload.featured ? 1 : 0,
      manageToken,
    ],
  );

  return Number(result.insertId);
};

Property.regenerateManageToken = async (id, hostId = null) => {
  const manageToken = createManageToken();
  let sql = `UPDATE properties
             SET manage_token = ?, manage_token_active = 1, manage_token_expires_at = NULL
             WHERE id = ? AND is_deleted = 0`;
  const params = [manageToken, id];

  if (hostId !== null) {
    sql += " AND host_id = ?";
    params.push(hostId);
  }

  const [result] = await db.promise().query(sql, params);
  if (!result.affectedRows) {
    return null;
  }

  return manageToken;
};

Property.setManageTokenActive = async (id, isActive, hostId = null) => {
  let sql = `UPDATE properties
             SET manage_token_active = ?
             WHERE id = ? AND is_deleted = 0`;
  const params = [isActive ? 1 : 0, id];

  if (hostId !== null) {
    sql += " AND host_id = ?";
    params.push(hostId);
  }

  const [result] = await db.promise().query(sql, params);
  return result.affectedRows > 0;
};

Property.getQuickManageByToken = async (token) =>
  getPropertyDetail(
    `p.manage_token = ?
     AND p.manage_token_active = 1
     AND p.status = 'approved'
     AND p.is_deleted = 0
     AND (p.manage_token_expires_at IS NULL OR p.manage_token_expires_at > NOW())`,
    [token],
    { includeManageAccess: true },
  );

Property.getManagedUnavailableDateRanges = async (propertyId) => {
  const [rows] = await db.promise().query(
    `SELECT
      DATE_FORMAT(check_in, '%Y-%m-%d') AS checkIn,
      DATE_FORMAT(check_out, '%Y-%m-%d') AS checkOut,
      status
     FROM bookings
     WHERE property_id = ?
       AND status IN ('pending', 'confirmed')
       AND check_out >= CURDATE()
     ORDER BY check_in ASC`,
    [propertyId],
  );

  return rows.map((row) => ({
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    status: row.status,
  }));
};

Property.update = async (id, payload, hostId = null) => {
  const params = [
    payload.title,
    payload.description,
    payload.type,
    payload.price,
    payload.address,
    payload.city,
    payload.country,
    payload.maxGuests,
    payload.bedrooms,
    payload.bathrooms,
    payload.featured ? 1 : 0,
    id,
  ];

  let sql = `UPDATE properties
             SET
               title = ?,
               description = ?,
               property_type = ?,
               price_per_night = ?,
               street_address = ?,
               city = ?,
               country = ?,
               max_guests = ?,
               bedrooms = ?,
               bathrooms = ?,
               featured = ?
             WHERE id = ? AND is_deleted = 0`;

  if (hostId !== null) {
    sql += " AND host_id = ?";
    params.push(hostId);
  }

  const [result] = await db.promise().query(sql, params);
  return result.affectedRows > 0;
};

Property.updateCoverImage = async (id, imageUrl) => {
  const [result] = await db.promise().query(
    "UPDATE properties SET cover_image = ? WHERE id = ?",
    [imageUrl, id],
  );

  return result.affectedRows > 0;
};

Property.replaceAmenities = async (propertyId, amenityNames) => {
  await db.promise().query(
    "DELETE FROM property_amenities WHERE property_id = ?",
    [propertyId],
  );

  if (!Array.isArray(amenityNames) || amenityNames.length === 0) {
    return;
  }

  const [amenityRows] = await db.promise().query(
    "SELECT id FROM amenities WHERE name IN (?)",
    [amenityNames],
  );

  if (amenityRows.length === 0) {
    return;
  }

  const values = amenityRows.map((row) => [propertyId, row.id]);
  await db.promise().query(
    "INSERT INTO property_amenities (property_id, amenity_id) VALUES ?",
    [values],
  );
};

Property.addImages = async (propertyId, imageUrls) => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return;
  }

  const values = imageUrls.map((imageUrl) => [propertyId, imageUrl]);
  await db.promise().query(
    "INSERT INTO property_images (property_id, image_url) VALUES ?",
    [values],
  );
};

Property.deleteImagesByUrls = async (propertyId, imageUrls) => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return;
  }

  await db.promise().query(
    "DELETE FROM property_images WHERE property_id = ? AND image_url IN (?)",
    [propertyId, imageUrls],
  );
};

Property.getImageUrls = async (propertyId) => {
  const images = await getImageList(propertyId);
  return images.map((image) => image.url);
};

Property.softDelete = async (id, hostId = null) => {
  let sql = "UPDATE properties SET is_deleted = 1 WHERE id = ? AND is_deleted = 0";
  const params = [id];

  if (hostId !== null) {
    sql += " AND host_id = ?";
    params.push(hostId);
  }

  const [result] = await db.promise().query(sql, params);
  return result.affectedRows > 0;
};

Property.updateStatus = async (id, status) => {
  const [result] = await db.promise().query(
    "UPDATE properties SET status = ? WHERE id = ? AND is_deleted = 0",
    [status, id],
  );

  return result.affectedRows > 0;
};

module.exports = Property;
