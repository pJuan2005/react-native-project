const db = require('../config/database');

class AuditService {
  /**
   * Log critical system actions for compliance, trust & safety.
   *
   * @param {Object} entry
   * @param {number|string|null} entry.actorId - ID của người thực hiện hành động
   * @param {string|null} entry.actorRole - Role: admin, host, guest, staff
   * @param {string} entry.action - Tên hành động: property_approve, property_reject, booking_review, dispute_resolve, etc.
   * @param {string} entry.entityType - property, booking, user, dispute, host_verification
   * @param {number|string} entry.entityId - ID của thực thể bị tác động
   * @param {Object|string|null} entry.metadata - Thông tin bổ sung (lý do từ chối, ghi chú, trạng thái cũ/mới)
   * @param {string|null} entry.ipAddress - Địa chỉ IP gọi API
   */
  static async log({
    actorId = null,
    actorRole = null,
    action,
    entityType,
    entityId,
    metadata = null,
    ipAddress = null,
  }) {
    if (!action || !entityType || !entityId) {
      return false;
    }

    try {
      const metaString =
        typeof metadata === 'object' && metadata !== null
          ? JSON.stringify(metadata)
          : String(metadata || '');

      await db.query(
        `INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [actorId, actorRole, action, entityType, entityId, metaString, ipAddress]
      );
      return true;
    } catch (err) {
      console.warn('AuditService.log warning (non-fatal):', err.message);
      return false;
    }
  }

  static async getRecentLogs(limit = 50, offset = 0) {
    try {
      const [rows] = await db.query(
        `SELECT a.*, u.name AS actor_name, u.email AS actor_email
         FROM audit_logs a
         LEFT JOIN users u ON a.actor_id = u.id
         ORDER BY a.created_at DESC
         LIMIT ? OFFSET ?`,
        [parseInt(limit, 10), parseInt(offset, 10)]
      );
      return rows;
    } catch (_) {
      return [];
    }
  }
}

module.exports = AuditService;
