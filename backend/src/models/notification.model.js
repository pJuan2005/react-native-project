const db = require('../config/database');

class NotificationModel {
  static async findByUserId(userId) {
    const [rows] = await db.query(
      `SELECT id, user_id, title, content, type, reference_id, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );
    return rows;
  }

  static async markAsRead(id, userId) {
    const [result] = await db.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  static async markAllAsRead(userId) {
    const [result] = await db.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = NotificationModel;
