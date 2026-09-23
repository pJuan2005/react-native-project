const db = require('../config/database');

/**
 * Rule-based Risk Scoring Service
 * Cung cấp tín hiệu cảnh báo rủi ro nội bộ cho Quản trị viên (Admin).
 * KHÔNG sử dụng Machine Learning, chỉ dùng luật nghiệp vụ (Business Rules).
 */
class RiskScoringService {
  /**
   * Tính toán điểm rủi ro cho một Chủ Homestay (Host Risk Assessment)
   *
   * @param {number|string} hostId ID của host
   * @returns {Object} { riskScore, riskLevel, riskFactors }
   */
  static async evaluateHostRisk(hostId) {
    const riskFactors = [];
    let riskScore = 0;

    try {
      // 1. Kiểm tra xác minh danh tính
      const [hostRows] = await db.query(
        'SELECT id, name, is_active FROM users WHERE id = ?',
        [hostId]
      );
      if (hostRows.length === 0) {
        return { riskScore: 100, riskLevel: 'HIGH', riskFactors: ['Tài khoản không tồn tại'] };
      }

      const [verifRows] = await db.query(
        "SELECT status FROM host_verifications WHERE host_id = ?",
        [hostId]
      );
      const isVerified = verifRows[0]?.status === 'approved';
      if (!isVerified) {
        riskScore += 25;
        riskFactors.push('Chủ nhà chưa hoàn thành xác minh danh tính (CCCD/Giấy phép)');
      }

      // 2. Kiểm tra số lượng khiếu nại (Disputes) đang bị tố cáo
      const [disputeRows] = await db.query(
        "SELECT COUNT(*) AS count FROM disputes WHERE target_type = 'host' AND target_id = ? AND status IN ('pending', 'investigating')",
        [hostId]
      );
      const activeDisputes = disputeRows[0]?.count || 0;
      if (activeDisputes > 0) {
        riskScore += activeDisputes * 20;
        riskFactors.push(`Có ${activeDisputes} khiếu nại từ khách hàng chưa được giải quyết`);
      }

      // 3. Kiểm tra tỷ lệ hủy đơn phòng của Host
      const [bookingRows] = await db.query(
        `SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
         FROM bookings b
         JOIN homestays h ON b.homestay_id = h.id
         WHERE h.host_id = ?`,
        [hostId]
      );
      const totalBookings = bookingRows[0]?.total || 0;
      const cancelledBookings = bookingRows[0]?.cancelled || 0;
      if (totalBookings >= 5) {
        const cancelRate = cancelledBookings / totalBookings;
        if (cancelRate > 0.3) {
          riskScore += 30;
          riskFactors.push(`Tỷ lệ hủy đơn phòng cao bất thường (${Math.round(cancelRate * 100)}%)`);
        }
      }
    } catch (err) {
      console.warn('RiskScoringService notice:', err.message);
    }

    riskScore = Math.min(100, riskScore);
    const riskLevel = riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'MEDIUM' : 'LOW';

    return {
      hostId,
      riskScore,
      riskLevel,
      riskFactors,
    };
  }

  /**
   * Tính toán điểm rủi ro cho đơn đặt phòng (Booking Risk Assessment)
   */
  static evaluateBookingRisk(booking) {
    const riskFactors = [];
    let riskScore = 0;

    const nights = parseInt(booking.nights || 1, 10);
    const totalPrice = parseFloat(booking.total_price || 0);

    // Lưu trú quá dài ngày nhưng chưa thanh toán
    if (nights > 14 && booking.payment_status === 'unpaid') {
      riskScore += 25;
      riskFactors.push('Thời gian lưu trú dài ngày (> 14 đêm) nhưng chưa có thanh toán');
    }

    // Giá trị đơn rất lớn (> 30 triệu đồng)
    if (totalPrice > 30000000 && booking.payment_status !== 'verified') {
      riskScore += 20;
      riskFactors.push('Giá trị đơn đặt phòng lớn (> 30.000.000₫), cần lưu ý đối soát');
    }

    riskScore = Math.min(100, riskScore);
    const riskLevel = riskScore >= 50 ? 'HIGH' : riskScore >= 25 ? 'MEDIUM' : 'LOW';

    return {
      riskScore,
      riskLevel,
      riskFactors,
    };
  }
}

module.exports = RiskScoringService;
