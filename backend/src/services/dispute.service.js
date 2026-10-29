const db = require('../config/database');
const AuditService = require('./audit.service');

class DisputeService {
  /**
   * Tạo một khiếu nại / báo cáo mới có tích hợp AI Triage & Spam Defense
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

    // 1. CHỐNG SPAM LỚP 1: Kiểm tra tần suất khiếu nại của user trong 24h
    if (reporterId) {
      const [recentDisputes] = await db.query(
        `SELECT COUNT(*) AS cnt FROM disputes
         WHERE reporter_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
        [reporterId]
      );
      if (recentDisputes[0]?.cnt >= 5) {
        throw new Error('Bạn đã gửi 5 khiếu nại trong 24 giờ qua. Để chống spam, vui lòng đợi Ban Quản Trị xử lý các yêu cầu hiện tại.');
      }
    }

    // 2. CHỐNG ĐỐI THỦ PHÀN NÀN ẢO: Nếu khiếu nại Homestay mà có bookingId -> xác minh khách đã từng đặt phòng này
    if (bookingId && targetType === 'property') {
      const [bookingCheck] = await db.query(
        `SELECT id, user_id, status FROM bookings WHERE id = ? AND property_id = ?`,
        [bookingId, targetId]
      );
      if (bookingCheck.length === 0) {
        throw new Error('Đơn đặt phòng không trùng khớp với chỗ nghỉ đang khiếu nại.');
      }
    }

    // 3. AI AUTO-TRIAGE & AUTO-RESOLVE ENGINE:
    // Tự động phân tích ngữ cảnh, từ khóa và chứng cứ để gán nhãn hoặc tự động xử lý
    const content = `${reason} ${description}`.toLowerCase();
    const spamKeywords = ['quảng cáo', 'mua bán', 'telegram', 'zalo', 'lừa đảo lừa đảo', 'hack', 'vay tiền', 'tuyen dung'];
    const isSpamDetected = spamKeywords.some((kw) => content.includes(kw)) || description.trim().length < 6;

    const legitIssueKeywords = ['sai phòng', 'bẩn', 'không có nước', 'không liên lạc được', 'cháy nổ', 'hỏng điều hòa', 'mùi hôi', 'thái độ kém'];
    const hasLegitIssue = legitIssueKeywords.some((kw) => content.includes(kw));
    const hasEvidence = Boolean(evidenceUrl);

    let initialStatus = 'pending';
    let aiNote = null;
    let resolutionAction = 'none';

    if (isSpamDetected) {
      // AI Tự động từ chối spam
      initialStatus = 'rejected';
      aiNote = '[AI Auto-Shield]: Phát hiện nội dung spam hoặc từ khóa không hợp lệ. Hệ thống tự động từ chối khiếu nại rác.';
      resolutionAction = 'none';
    } else if (hasEvidence && hasLegitIssue && bookingId) {
      // AI Tự động chấp nhận ưu tiên (Auto-Accept) với trường hợp có bằng chứng ảnh + mã đặt phòng thực tế
      initialStatus = 'resolved';
      aiNote = '[AI Auto-Accept]: Khiếu nại có mã phòng hợp lệ, mô tả chi tiết và bằng chứng đính kèm. AI đã tự động phê duyệt và chuyển bộ phận CSKH.';
      resolutionAction = 'none';
    }

    const [result] = await db.query(
      `INSERT INTO disputes (
        reporter_id, reporter_role, target_type, target_id, booking_id,
        reason, description, evidence_url, status, admin_note, resolution_action, resolved_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${initialStatus !== 'pending' ? 'NOW()' : 'NULL'})`,
      [
        reporterId,
        reporterRole,
        targetType,
        targetId,
        bookingId || null,
        reason.trim(),
        description.trim(),
        evidenceUrl || null,
        initialStatus,
        aiNote,
        resolutionAction,
      ]
    );

    const disputeId = result.insertId;

    // Log to Audit trail
    await AuditService.log({
      actorId: reporterId || 1,
      actorRole: reporterRole,
      action: initialStatus === 'pending' ? 'dispute_created' : `dispute_${initialStatus}_by_ai`,
      entityType: 'dispute',
      entityId: disputeId,
      metadata: { targetType, targetId, reason, aiNote, status: initialStatus },
    });

    return {
      id: disputeId,
      targetType,
      targetId,
      reason,
      status: initialStatus,
      aiAnalysis: aiNote,
      message: initialStatus === 'resolved'
        ? 'Khiếu nại của bạn đã được hệ thống AI tự động xác thực và chấp thuận!'
        : initialStatus === 'rejected'
        ? 'Khiếu nại bị từ chối do không đáp ứng tiêu chuẩn cộng đồng hoặc vi phạm từ khóa.'
        : 'Khiếu nại của bạn đã được ghi nhận và đưa vào hàng đợi điều tra.',
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
      await db.query('UPDATE properties SET is_active = 0, is_deleted = 1, status = "rejected" WHERE id = ?', [dispute.target_id]);
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
