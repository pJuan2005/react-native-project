const db = require('../config/database');
const AuditService = require('./audit.service');

class DisputeService {
  /**
   * Tạo một khiếu nại / báo cáo mới
   */
  static async createDispute({
    reporterId,
    reporterRole = 'guest',
    targetType,
    targetId,
    bookingId = null,
    reason,
    description,
    evidenceUrl = null,
  }) {
    if (!targetType || !targetId || !reason || !description) {
      throw new Error('Vui lòng cung cấp đầy đủ thông tin mục khiếu nại, lý do và mô tả chi tiết.');
    }

    const [result] = await db.query(
      `INSERT INTO disputes (
        reporter_id, reporter_role, target_type, target_id, booking_id,
        reason, description, evidence_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        reporterId,
        reporterRole,
        targetType,
        targetId,
        bookingId || null,
        reason.trim(),
        description.trim(),
        evidenceUrl || null,
      ]
    );

    const disputeId = result.insertId;

    // Log to Audit trail
    await AuditService.log({
      actorId: reporterId,
      actorRole: reporterRole,
      action: 'dispute_created',
      entityType: 'dispute',
      entityId: disputeId,
      metadata: { targetType, targetId, reason },
    });

    return {
      id: disputeId,
      targetType,
      targetId,
      reason,
      status: 'pending',
      message: 'Khiếu nại của bạn đã được gửi tới Ban Quản Trị. Chúng tôi sẽ điều tra và phản hồi sớm nhất.',
    };
  }

  /**
   * Lấy danh sách khiếu nại (dành cho Admin hoặc cá nhân người khiếu nại)
   */
  static async getDisputes({ status, targetType, reporterId, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT
        d.*,
        u.name AS reporter_name,
        u.email AS reporter_email,
        u.phone AS reporter_phone,
        admin.name AS resolved_by_name
      FROM disputes d
      JOIN users u ON d.reporter_id = u.id
      LEFT JOIN users admin ON d.resolved_by = admin.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND d.status = ?';
      params.push(status);
    }
    if (targetType && targetType !== 'all') {
      sql += ' AND d.target_type = ?';
      params.push(targetType);
    }
    if (reporterId) {
      sql += ' AND d.reporter_id = ?';
      params.push(reporterId);
    }

    sql += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    try {
      const [rows] = await db.query(sql, params);
      return rows;
    } catch (_) {
      return [];
    }
  }

  /**
   * Quản trị viên (Admin) giải quyết khiếu nại
   */
  static async resolveDispute(disputeId, {
    adminId,
    status = 'resolved',
    adminNote = '',
    resolutionAction = 'none',
  }) {
    const [dRows] = await db.query('SELECT * FROM disputes WHERE id = ?', [disputeId]);
    if (dRows.length === 0) {
      throw new Error('Không tìm thấy bản ghi khiếu nại.');
    }
    const dispute = dRows[0];

    // Cập nhật trạng thái khiếu nại
    await db.query(
      `UPDATE disputes
       SET status = ?, admin_note = ?, resolution_action = ?, resolved_by = ?, resolved_at = NOW()
       WHERE id = ?`,
      [status, adminNote.trim(), resolutionAction, adminId, disputeId]
    );

    // Thực thi hành động khắc phục nếu có
    if (resolutionAction === 'suspend_property' && dispute.target_type === 'property') {
      await db.query('UPDATE homestays SET is_active = 0, approval_status = "rejected" WHERE id = ?', [dispute.target_id]);
      await db.query('UPDATE properties SET is_deleted = 1, status = "rejected" WHERE id = ?', [dispute.target_id]);
    } else if (resolutionAction === 'suspend_host' && dispute.target_type === 'host') {
      await db.query("UPDATE users SET is_active = 0, status = 'blocked' WHERE id = ?", [dispute.target_id]);
    }

    // Ghi nhận Audit log
    await AuditService.log({
      actorId: adminId,
      actorRole: 'admin',
      action: 'dispute_resolved',
      entityType: 'dispute',
      entityId: disputeId,
      metadata: { status, resolutionAction, adminNote },
    });

    return {
      disputeId,
      status,
      resolutionAction,
      adminNote,
    };
  }
}

module.exports = DisputeService;
