const db = require('../config/database');

class PointModel {
  static async findHistoryByUserId(userId) {
    const [rows] = await db.query(
      `SELECT id, user_id, title, points, type, reference_id, created_at
       FROM point_transactions
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = PointModel;
