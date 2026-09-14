const db = require('../config/database');

class UserModel {
  static async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT id, name, email, password_hash, role, phone, address, birth_date, avatar_url, reward_points, is_active, created_at FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, password_hash, role, phone, address, birth_date, avatar_url, reward_points, is_active, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create({ name, email, passwordHash, phone, address, avatarUrl }) {
    const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash, role, phone, address, avatar_url, reward_points, is_active)
       VALUES (?, ?, ?, 'customer', ?, ?, ?, 150, 1)`,
      [name, email, passwordHash, phone || '', address || '', avatarUrl || '']
    );
    return result.insertId;
  }

  static async update(id, { name, email, phone, address, avatarUrl, birthDate }) {
    await db.query(
      `UPDATE users
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address),
           avatar_url = COALESCE(?, avatar_url),
           birth_date = COALESCE(?, birth_date)
       WHERE id = ?`,
      [name, email, phone, address, avatarUrl, birthDate, id]
    );
    return this.findById(id);
  }

  static async addPoints(id, points, reason, referenceId = null) {
    await db.query('UPDATE users SET reward_points = reward_points + ? WHERE id = ?', [points, id]);
    await db.query(
      'INSERT INTO point_transactions (user_id, title, points, type, reference_id) VALUES (?, ?, ?, ?, ?)',
      [id, reason, points, points >= 0 ? 'earn' : 'redeem', referenceId]
    );
  }

  static async countCustomers() {
    const [[{ count }]] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'customer'");
    return count;
  }
}

module.exports = UserModel;
