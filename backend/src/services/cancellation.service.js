const db = require('../config/database');
const AuditService = require('./audit.service');

const REASON_MAP = {
  CHANGE_OF_PLAN: 'Tôi thay đổi kế hoạch',
  FOUND_ANOTHER_PLACE: 'Tìm được chỗ ở khác',
  PRICE_ISSUE: 'Giá không phù hợp',
  PROPERTY_ISSUE: 'Có vấn đề với chỗ nghỉ',
  SCHEDULE_ISSUE: 'Có vấn đề với lịch trình',
  OTHER: 'Lý do khác',
};

function formatCurrency(val) {
  const num = Number(val || 0);
  return `${num.toLocaleString('vi-VN')} ₫`;
}

class CancellationService {
  /**
   * Tính toán trước chính sách hoàn tiền cho một đơn đặt phòng dựa trên thời gian thực của Server.
   * Mobile gọi API này để hiển thị rõ cho khách trước khi khách xác nhận hủy.
   */
  static async calculateCancellationPreview(bookingId, userId = null) {
    const [rows] = await db.query(
      `SELECT
        b.id,
        b.booking_code,
        b.user_id,
        b.property_id,
        b.check_in,
        b.check_out,
        b.total_price,
        b.status,
        b.payment_status,
        b.created_at,
        p.name AS property_name
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       WHERE b.id = ? OR b.booking_code = ?`,
      [bookingId, bookingId]
    );

    if (rows.length === 0) {
      throw new Error('Không tìm thấy đơn đặt phòng');
    }

    const booking = rows[0];

    if (userId && String(booking.user_id) !== String(userId)) {
      throw new Error('Bạn không có quyền thao tác trên đơn đặt phòng này');
    }

    if (booking.status === 'cancelled') {
      return {
        bookingId: booking.id,
        bookingCode: booking.booking_code,
        canCancel: false,
        message: 'Đơn đặt phòng này đã bị hủy từ trước.',
        policy: 'ALREADY_CANCELLED',
      };
    }

    if (booking.status === 'completed') {
      return {
        bookingId: booking.id,
        bookingCode: booking.booking_code,
        canCancel: false,
        message: 'Chuyến đi đã hoàn tất, không thể hủy phòng.',
        policy: 'STAY_COMPLETED',
      };
    }

    // Thời gian hiện tại từ Server (Source of Truth)
    const now = new Date();

    // Giờ nhận phòng tiêu chuẩn là 14:00 ngày check_in
    const checkInDateOnly = typeof booking.check_in === 'string'
      ? booking.check_in.split('T')[0]
      : new Date(booking.check_in).toISOString().split('T')[0];

    const checkInDateTime = new Date(`${checkInDateOnly}T14:00:00`);
    const diffMs = checkInDateTime.getTime() - now.getTime();
    const hoursUntilCheckIn = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

    // Xác định số tiền thực tế khách đã thanh toán (totalPaid)
    let totalPaid = 0;
    const [payments] = await db.query(
      `SELECT amount, status FROM payments WHERE booking_id = ?`,
      [booking.id]
    );

    const hasCompletedPayment = payments.some(
      (p) => p.status === 'completed' || p.status === 'verified'
    );

    if (hasCompletedPayment || booking.payment_status === 'verified' || booking.payment_status === 'proof_uploaded') {
      totalPaid = parseFloat(booking.total_price || 0);
    }

    let refundPercentage = 0;
    let refundAmount = 0;
    let cancellationFee = 0;
    let policyCode = '';
    let policyDescription = '';

    if (totalPaid <= 0) {
      // Đơn chưa thanh toán tiền: Hủy miễn phí 100%
      refundPercentage = 0;
      refundAmount = 0;
      cancellationFee = 0;
      policyCode = 'CANCEL_UNPAID_FREE';
      policyDescription = 'Đơn phòng chưa thanh toán chuyển khoản: Hủy miễn phí 100%.';
    } else if (hoursUntilCheckIn >= 72) {
      // CASE A: Hủy trước hoặc bằng 72 giờ (>= 72h) -> Hoàn 70%, phí hủy 30%
      refundPercentage = 70;
      refundAmount = Math.round(totalPaid * 0.70);
      cancellationFee = totalPaid - refundAmount;
      policyCode = 'CANCEL_72H_70_PERCENT';
      policyDescription = `Hủy trước giờ nhận phòng ≥ 72 giờ (${hoursUntilCheckIn}h trước nhận phòng): Được hoàn 70% (${formatCurrency(refundAmount)}) vào ví. Phí hủy dịch vụ 30% (${formatCurrency(cancellationFee)}).`;
    } else {
      // CASE B: Hủy dưới 72 giờ (< 72h) -> Không hoàn tiền, phí hủy 100%
      refundPercentage = 0;
      refundAmount = 0;
      cancellationFee = totalPaid;
      policyCode = 'CANCEL_WITHIN_72H_NO_REFUND';
      policyDescription = `Hủy trong vòng 72 giờ trước giờ nhận phòng (${hoursUntilCheckIn}h trước nhận phòng): Không hoàn tiền. Toàn bộ tiền phòng (${formatCurrency(totalPaid)}) được giữ làm phí bồi thường cho chủ nhà.`;
    }

    return {
      bookingId: booking.id,
      bookingCode: booking.booking_code,
      propertyName: booking.property_name,
      checkIn: checkInDateOnly,
      serverTime: now.toISOString(),
      hoursUntilCheckIn,
      totalPaid,
      refundPercentage,
      refundAmount,
      cancellationFee,
      policy: policyCode,
      policyDescription,
      currency: 'VND',
      canCancel: true,
      reasonOptions: Object.entries(REASON_MAP).map(([code, label]) => ({ code, label })),
    };
  }

  /**
   * Thực hiện hủy đặt phòng chính thức trong DB Transaction.
   * Tự động cộng tiền hoàn vào Ví (Wallet) và ghi sổ Ledger (wallet_transactions), tạo system chat message.
   */
  static async executeCancellation({ bookingId, userId, reasonCode, reasonText = '' }) {
    if (!reasonCode) {
      throw new Error('Vui lòng chọn lý do hủy đặt phòng');
    }

    const normalizedReasonCode = String(reasonCode).trim().toUpperCase();
    if (!REASON_MAP[normalizedReasonCode]) {
      throw new Error('Lý do hủy phòng không hợp lệ');
    }

    if (normalizedReasonCode === 'OTHER' && (!reasonText || reasonText.trim().length < 10)) {
      throw new Error('Vui lòng nhập chi tiết lý do hủy phòng (tối thiểu 10 ký tự)');
    }

    const finalReasonDesc = normalizedReasonCode === 'OTHER'
      ? `Lý do khác: ${reasonText.trim()}`
      : REASON_MAP[normalizedReasonCode];

    let conn;
    try {
      conn = await db.getConnection();
      await conn.beginTransaction();
    } catch (_) {
      conn = null;
    }
    const runner = conn || db;

    try {
      // 1. Khóa bản ghi booking bằng FOR UPDATE để chống race condition
      const [bRows] = await runner.query(
        `SELECT
          b.id,
          b.booking_code,
          b.user_id,
          b.property_id,
          b.check_in,
          b.total_price,
          b.status,
          b.payment_status,
          p.name AS property_name,
          p.host_id
         FROM bookings b
         JOIN properties p ON b.property_id = p.id
         WHERE b.id = ? OR b.booking_code = ?
         FOR UPDATE`,
        [bookingId, bookingId]
      );

      if (bRows.length === 0) {
        throw new Error('Không tìm thấy đơn đặt phòng');
      }

      const booking = bRows[0];

      if (userId && String(booking.user_id) !== String(userId)) {
        throw new Error('Bạn không có quyền hủy đơn đặt phòng này');
      }

      if (booking.status === 'cancelled') {
        throw new Error('Đơn đặt phòng này đã được hủy trước đó');
      }

      if (booking.status === 'completed') {
        throw new Error('Chuyến đi đã hoàn thành, không thể hủy phòng');
      }

      // 2. Tính toán chính sách hoàn tiền theo server time
      const now = new Date();
      const checkInDateOnly = typeof booking.check_in === 'string'
        ? booking.check_in.split('T')[0]
        : new Date(booking.check_in).toISOString().split('T')[0];
      const checkInDateTime = new Date(`${checkInDateOnly}T14:00:00`);
      const diffMs = checkInDateTime.getTime() - now.getTime();
      const hoursUntilCheckIn = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

      // Tính tổng tiền đã thanh toán thực tế
      const [pRows] = await runner.query(
        `SELECT amount, status FROM payments WHERE booking_id = ?`,
        [booking.id]
      );
      const isPaid = pRows.some((p) => p.status === 'completed' || p.status === 'verified') ||
                     booking.payment_status === 'verified' ||
                     booking.payment_status === 'proof_uploaded';

      const totalPaid = isPaid ? parseFloat(booking.total_price || 0) : 0;

      let refundPercentage = 0;
      let refundAmount = 0;
      let cancellationFee = 0;
      let policyCode = '';

      if (totalPaid <= 0) {
        refundPercentage = 0;
        refundAmount = 0;
        cancellationFee = 0;
        policyCode = 'CANCEL_UNPAID_FREE';
      } else if (hoursUntilCheckIn >= 72) {
        refundPercentage = 70;
        refundAmount = Math.round(totalPaid * 0.70);
        cancellationFee = totalPaid - refundAmount;
        policyCode = 'CANCEL_72H_70_PERCENT';
      } else {
        refundPercentage = 0;
        refundAmount = 0;
        cancellationFee = totalPaid;
        policyCode = 'CANCEL_WITHIN_72H_NO_REFUND';
      }

      // Xác định trạng thái thanh toán mới
      let newPaymentStatus = 'unpaid';
      if (totalPaid > 0) {
        if (refundAmount >= totalPaid) {
          newPaymentStatus = 'refunded';
        } else if (refundAmount > 0) {
          newPaymentStatus = 'partially_refunded';
        } else {
          newPaymentStatus = 'verified'; // Tiền được giữ làm cancellation fee
        }
      }

      // 3. Cập nhật booking
      await runner.query(
        `UPDATE bookings SET
          status = 'cancelled',
          payment_status = ?,
          cancellation_reason_code = ?,
          cancellation_reason_text = ?,
          refund_amount = ?,
          cancellation_fee = ?,
          refund_percentage = ?,
          cancellation_policy_applied = ?,
          cancelled_by = ?,
          cancelled_at = NOW(),
          cancelled_reason = ?
         WHERE id = ?`,
        [
          newPaymentStatus,
          normalizedReasonCode,
          reasonText ? reasonText.trim() : null,
          refundAmount,
          cancellationFee,
          refundPercentage,
          policyCode,
          userId || booking.user_id,
          finalReasonDesc,
          booking.id,
        ]
      );

      // Cập nhật bảng payments
      if (totalPaid > 0) {
        const paymentState = refundAmount >= totalPaid ? 'refunded' : refundAmount > 0 ? 'partially_refunded' : 'completed';
        await runner.query(
          `UPDATE payments SET status = ?, updated_at = NOW() WHERE booking_id = ?`,
          [paymentState, booking.id]
        );
      }

      let walletTxId = null;

      // 4. Nếu có tiền hoàn (refundAmount > 0) -> Hoàn vào Ví (Wallet) của Khách qua Ledger
      if (refundAmount > 0 && booking.user_id) {
        // Đảm bảo ví tồn tại
        await runner.query(
          `INSERT INTO wallets (user_id, balance, currency, status)
           VALUES (?, 0.00, 'VND', 'active')
           ON DUPLICATE KEY UPDATE updated_at = NOW()`,
          [booking.user_id]
        );

        // Khóa hàng ví bằng FOR UPDATE
        const [wRows] = await runner.query(
          `SELECT id, balance FROM wallets WHERE user_id = ? FOR UPDATE`,
          [booking.user_id]
        );

        const wallet = wRows[0];
        const balanceBefore = parseFloat(wallet.balance || 0);
        const balanceAfter = balanceBefore + refundAmount;

        // Cập nhật số dư ví
        await runner.query(
          `UPDATE wallets SET balance = ?, updated_at = NOW() WHERE id = ?`,
          [balanceAfter, wallet.id]
        );

        // Ghi lịch sử biến động số dư (Ledger transaction)
        const [txResult] = await runner.query(
          `INSERT INTO wallet_transactions (
            wallet_id, user_id, type, amount, balance_before, balance_after,
            reference_type, reference_id, description, status, created_at
          ) VALUES (?, ?, 'REFUND', ?, ?, ?, 'booking_refund', ?, ?, 'completed', NOW())`,
          [
            wallet.id,
            booking.user_id,
            refundAmount,
            balanceBefore,
            balanceAfter,
            booking.id,
            `Hoàn 70% tiền hủy phòng đơn ${booking.booking_code} (${booking.property_name})`,
          ]
        );
        walletTxId = txResult.insertId;
      }

      // 5. Ghi nhận vào bảng refunds
      await runner.query(
        `INSERT INTO refunds (
          booking_id, user_id, total_paid, refund_amount, cancellation_fee,
          refund_percentage, policy_code, reason_code, reason_text, status,
          wallet_transaction_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, NOW())
        ON DUPLICATE KEY UPDATE
          refund_amount = VALUES(refund_amount),
          cancellation_fee = VALUES(cancellation_fee),
          wallet_transaction_id = VALUES(wallet_transaction_id)`,
        [
          booking.id,
          booking.user_id,
          totalPaid,
          refundAmount,
          cancellationFee,
          refundPercentage,
          policyCode,
          normalizedReasonCode,
          reasonText ? reasonText.trim() : null,
          walletTxId,
        ]
      );

      // 6. Tạo cuộc hội thoại Chat và tin nhắn hệ thống (System Messages)
      try {
        await runner.query(
          `INSERT IGNORE INTO booking_conversations (booking_id) VALUES (?)`,
          [booking.id]
        );

        const [cRows] = await runner.query(
          `SELECT id FROM booking_conversations WHERE booking_id = ? LIMIT 1`,
          [booking.id]
        );

        if (cRows.length > 0) {
          const convId = cRows[0].id;
          const senderId = userId || booking.user_id || 1;

          await runner.query(
            `INSERT INTO booking_messages (conversation_id, sender_id, message, message_type)
             VALUES (?, ?, ?, 'system')`,
            [
              convId,
              senderId,
              `Hệ thống đã ghi nhận yêu cầu hủy đặt phòng đơn #${booking.booking_code}. Lý do: ${finalReasonDesc}.`,
            ]
          );

          if (refundAmount > 0) {
            await runner.query(
              `INSERT INTO booking_messages (conversation_id, sender_id, message, message_type)
               VALUES (?, ?, ?, 'system')`,
              [
                convId,
                senderId,
                `Khoản hoàn tiền ${formatCurrency(refundAmount)} đã được cộng vào Ví của bạn thành công.`,
              ]
            );
          }
        }
      } catch (chatErr) {
        console.warn('Chat system message notice:', chatErr.message);
      }

      // 7. Ghi Audit Log
      await AuditService.log({
        actorId: userId || booking.user_id,
        actorRole: 'guest',
        action: 'booking_cancelled',
        entityType: 'booking',
        entityId: booking.id,
        metadata: {
          bookingCode: booking.booking_code,
          totalPaid,
          refundAmount,
          cancellationFee,
          policyCode,
          reason: finalReasonDesc,
        },
      }).catch(() => {});

      // 8. Tạo thông báo In-app cho người dùng
      if (booking.user_id) {
        const notifContent = refundAmount > 0
          ? `Đơn đặt phòng ${booking.booking_code} đã được hủy. ${formatCurrency(refundAmount)} (70%) đã được hoàn về Ví của bạn.`
          : `Đơn đặt phòng ${booking.booking_code} đã được hủy theo yêu cầu.`;

        await runner.query(
          `INSERT INTO notifications (user_id, title, content, type, reference_id)
           VALUES (?, 'Hủy phòng thành công', ?, 'booking_status', ?)`,
          [booking.user_id, notifContent, booking.id]
        ).catch(() => {});
      }

      if (conn) {
        await conn.commit();
      }

      return {
        bookingId: booking.id,
        bookingCode: booking.booking_code,
        status: 'cancelled',
        paymentStatus: newPaymentStatus,
        totalPaid,
        refundAmount,
        cancellationFee,
        refundPercentage,
        policyCode,
        refundToWallet: refundAmount > 0,
        message: refundAmount > 0
          ? `Hủy phòng thành công! Số tiền ${formatCurrency(refundAmount)} (70%) đã được hoàn vào Ví của bạn.`
          : 'Hủy phòng thành công.',
      };
    } catch (err) {
      if (conn) {
        await conn.rollback();
      }
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }
}

module.exports = CancellationService;
