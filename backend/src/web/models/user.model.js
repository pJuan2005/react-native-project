const db = require("../common/db");

const User = {};

function mapAdminUserRow(row) {
  return {
    id: Number(row.id),
    fullName: row.fullName,
    email: row.email,
    role: row.role,
    status: row.status,
    phone: row.phone,
    location: row.location || "",
    website: row.website || "",
    languages: row.languages || "",
    bio: row.bio || "",
    createdAt: row.createdAt,
    bookingCount: Number(row.bookingCount || 0),
    propertyCount: Number(row.propertyCount || 0),
  };
}

User.findByEmail = async (email) => {
  const [rows] = await db.promise().query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email],
  );

  return rows[0] || null;
};

User.findById = async (id) => {
  const [rows] = await db.promise().query(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [id],
  );

  return rows[0] || null;
};

User.getAllForAdmin = async () => {
  const [rows] = await db.promise().query(
    `SELECT
      u.id,
      u.full_name AS fullName,
      u.email,
      u.role,
      u.status,
      u.phone,
      u.location,
      u.website,
      u.languages,
      u.bio,
      u.created_at AS createdAt,
      (
        SELECT COUNT(*)
        FROM properties p
        WHERE p.host_id = u.id
          AND p.is_deleted = 0
      ) AS propertyCount,
      (
        CASE
          WHEN u.role = 'host' THEN (
            SELECT COUNT(*)
            FROM bookings hb
            JOIN properties hp ON hp.id = hb.property_id
            WHERE hp.host_id = u.id
              AND hp.is_deleted = 0
          )
          ELSE (
            SELECT COUNT(*)
            FROM bookings gb
            WHERE gb.guest_id = u.id
          )
        END
      ) AS bookingCount
     FROM users u
     ORDER BY u.created_at DESC, u.id DESC`,
  );

  return rows.map(mapAdminUserRow);
};

User.getByIdForAdmin = async (id) => {
  const [rows] = await db.promise().query(
    `SELECT
      u.id,
      u.full_name AS fullName,
      u.email,
      u.role,
      u.status,
      u.phone,
      u.location,
      u.website,
      u.languages,
      u.bio,
      u.created_at AS createdAt,
      (
        SELECT COUNT(*)
        FROM properties p
        WHERE p.host_id = u.id
          AND p.is_deleted = 0
      ) AS propertyCount,
      (
        CASE
          WHEN u.role = 'host' THEN (
            SELECT COUNT(*)
            FROM bookings hb
            JOIN properties hp ON hp.id = hb.property_id
            WHERE hp.host_id = u.id
              AND hp.is_deleted = 0
          )
          ELSE (
            SELECT COUNT(*)
            FROM bookings gb
            WHERE gb.guest_id = u.id
          )
        END
      ) AS bookingCount
     FROM users u
     WHERE u.id = ?
     LIMIT 1`,
    [id],
  );

  return rows[0] ? mapAdminUserRow(rows[0]) : null;
};

User.updateProfile = async (id, payload) => {
  const [result] = await db.promise().query(
    `UPDATE users
     SET
       full_name = ?,
       email = ?,
       phone = ?,
       location = ?,
       website = ?,
       languages = ?,
       bio = ?
     WHERE id = ?`,
    [
      payload.fullName,
      payload.email,
      payload.phone,
      payload.location || null,
      payload.website || null,
      payload.languages || null,
      payload.bio || null,
      id,
    ],
  );

  return result.affectedRows > 0;
};

User.updateByAdmin = async (id, payload) => {
  const [result] = await db.promise().query(
    `UPDATE users
     SET
       full_name = ?,
       email = ?,
       role = ?,
       phone = ?,
       location = ?,
       website = ?,
       languages = ?,
       bio = ?,
       status = ?
     WHERE id = ?`,
    [
      payload.fullName,
      payload.email,
      payload.role,
      payload.phone,
      payload.location || null,
      payload.website || null,
      payload.languages || null,
      payload.bio || null,
      payload.status,
      id,
    ],
  );

  return result.affectedRows > 0;
};

User.create = async (payload) => {
  const [result] = await db.promise().query(
    `INSERT INTO users (
      full_name,
      email,
      password,
      role,
      phone,
      location,
      website,
      languages,
      bio,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.fullName,
      payload.email,
      payload.password,
      payload.role,
      payload.phone,
      payload.location || null,
      payload.website || null,
      payload.languages || null,
      payload.bio || null,
      payload.status || "active",
    ],
  );

  return Number(result.insertId);
};

User.updatePassword = async (id, password) => {
  const [result] = await db.promise().query(
    "UPDATE users SET password = ? WHERE id = ?",
    [password, id],
  );

  return result.affectedRows > 0;
};

module.exports = User;
