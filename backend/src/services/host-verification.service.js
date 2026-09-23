const db = require('../config/database');
const AuditService = require('./audit.service');

class HostVerificationService {
  /**
   * Host nộp hồ sơ xác minh danh tính
   */
  static async submitVerification(hostId, {
    idCardNumber,
    idCardFrontUrl,
    idCardBackUrl,
    businessLicenseUrl = null,
  }) {
    if (!idCardNumber || !idCardFrontUrl || !idCardBackUrl) {
      throw new Error('Vui lòng cung cấp số CCCD/Hộ chiếu và ảnh chụp 2 mặt giấy tờ tùy thân.');
    }

    await db.query(
      `INSERT INTO host_verifications (
        host_id, id_card_number, id_card_front_url, id_card_back_url,
        business_license_url, status, rejection_reason
      ) VALUES (?, ?, ?, ?, ?, 'pending', NULL)
      ON DUPLICATE KEY UPDATE
        id_card_number = VALUES(id_card_number),
        id_card_front_url = VALUES(id_card_front_url),
        id_card_back_url = VALUES(id_card_back_url),
        business_license_url = VALUES(business_license_url),
        status = 'pending',
        rejection_reason = NULL,
        reviewed_by = NULL,
        reviewed_at = NULL,
        updated_at = NOW()`,
      [
        hostId,
        idCardNumber.trim(),
        idCardFrontUrl,
        idCardBackUrl,
        businessLicenseUrl || null,
      ]
    );

    // Ghi audit
    await AuditService.log({
      actorId: hostId,
      actorRole: 'host',
      action: 'host_verification_submitted',
      entityType: 'host_verification',
      entityId: hostId,
      metadata: { idCardNumber },
    });

    return {
      hostId,
      status: 'pending',
      message: 'Hồ sơ xác minh danh tính của bạn đã được gửi. Quản trị viên sẽ kiểm duyệt trong vòng 24 giờ.',
    };
  }

  /**
   * Lấy trạng thái xác minh của 1 Host
   */
  static async getVerificationStatus(hostId) {
    try {
      const [rows] = await db.query(
        `SELECT hv.*, u.name AS host_name, u.email AS host_email, u.phone AS host_phone
         FROM host_verifications hv
         JOIN users u ON hv.host_id = u.id
         WHERE hv.host_id = ?`,
        [hostId]
      );
      return rows[0] || { status: 'draft', message: 'Chưa nộp hồ sơ xác minh' };
    } catch (_) {
      return { status: 'draft', message: 'Chưa nộp hồ sơ xác minh' };
    }
  }

  /**
   * Admin lấy danh sách hồ sơ xác minh cần duyệt
   */
  static async getAllVerifications(status = 'pending') {
    let sql = `
      SELECT
        hv.*,
        u.name AS host_name,
        u.email AS host_email,
        u.phone AS host_phone,
        u.location AS host_location,
        admin.name AS reviewer_name
      FROM host_verifications hv
      JOIN users u ON hv.host_id = u.id
      LEFT JOIN users admin ON hv.reviewed_by = admin.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND hv.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY hv.created_at DESC';

    try {
      const [rows] = await db.query(sql, params);
      return rows;
    } catch (_) {
      return [];
    }
  }

  /**
   * Admin duyệt hoặc từ chối hồ sơ Host
   */
  static async reviewVerification(hostId, adminId, { decision, rejectionReason = '' }) {
    if (!['approved', 'rejected'].includes(decision)) {
      throw new Error('Quyết định không hợp lệ (chỉ chấp nhận approved hoặc rejected)');
    }

    await db.query(
      `UPDATE host_verifications
       SET status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE host_id = ?`,
      [decision, decision === 'rejected' ? rejectionReason.trim() : null, adminId, hostId]
    );

    // Cập nhật cờ is_verified trên users
    const isVerifiedVal = decision === 'approved' ? 1 : 0;
    await db.query('UPDATE users SET is_verified = ? WHERE id = ?', [isVerifiedVal, hostId]);

    // Ghi audit
    await AuditService.log({
      actorId: adminId,
      actorRole: 'admin',
      action: decision === 'approved' ? 'host_verification_approved' : 'host_verification_rejected',
      entityType: 'host_verification',
      entityId: hostId,
      metadata: { decision, rejectionReason },
    });

    return {
      hostId,
      status: decision,
      rejectionReason: decision === 'rejected' ? rejectionReason : null,
      message: decision === 'approved'
        ? 'Đã duyệt xác minh danh tính Chủ Homestay thành công!'
        : 'Đã từ chối hồ sơ xác minh với lý do: ' + rejectionReason,
    };
  }
}

module.exports = HostVerificationService;
