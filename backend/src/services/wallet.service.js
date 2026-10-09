const db = require('../config/database');
const AuditService = require('./audit.service');

class WalletService {
  /**
   * Lấy thông tin ví của người dùng. Tự động khởi tạo ví mới với số dư 0 nếu chưa có.
   */
  static async getWallet(userId) {
    if (!userId) {
      throw new Error('Yêu cầu định danh người dùng');
    }

    await db.query(
      `INSERT INTO wallets (user_id, balance, currency, status)
       VALUES (?, 0.00, 'VND', 'active')
       ON DUPLICATE KEY UPDATE updated_at = NOW()`,
      [userId]
    );

    const [rows] = await db.query(
      `SELECT id, user_id, balance, currency, status, created_at, updated_at
       FROM wallets
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    );

    const wallet = rows[0];

    // Lấy thêm tổng số tiền đang chờ rút (pending withdrawals)
    const [wRows] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS pending_amount
       FROM withdrawals
       WHERE user_id = ? AND status IN ('pending', 'processing', 'approved')`,
      [userId]
    );

    const pendingWithdrawal = parseFloat(wRows[0]?.pending_amount || 0);
    const balance = parseFloat(wallet.balance || 0);

    return {
      id: wallet.id,
      userId: wallet.user_id,
      balance,
      pendingWithdrawal,
      availableBalance: Math.max(0, balance),
      currency: wallet.currency || 'VND',
      status: wallet.status || 'active',
      updatedAt: wallet.updated_at,
    };
  }

  /**
   * Lấy danh sách lịch sử biến động số dư ví (Ledger transactions)
   */
  static async getTransactions(userId, { type, limit = 20, offset = 0 } = {}) {
    let sql = `
      SELECT
        id,
        wallet_id,
        user_id,
        type,
        amount,
        balance_before,
        balance_after,
        reference_type,
        reference_id,
        description,
        status,
        created_at
      FROM wallet_transactions
      WHERE user_id = ?
    `;
    const params = [userId];

    if (type && type !== 'all') {
      sql += ' AND type = ?';
      params.push(type.toUpperCase());
    }

    sql += ' ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.query(sql, params);
    return rows.map((r) => ({
      id: r.id,
      walletId: r.wallet_id,
      type: r.type,
      amount: parseFloat(r.amount),
      balanceBefore: parseFloat(r.balance_before),
      balanceAfter: parseFloat(r.balance_after),
      referenceType: r.reference_type,
      referenceId: r.reference_id,
      description: r.description,
      status: r.status,
      createdAt: r.created_at,
    }));
  }

  /**
   * Tạo yêu cầu rút tiền từ ví về tài khoản ngân hàng.
   * Xử lý chặt chẽ trong Transaction với row-locking FOR UPDATE chống double withdrawal.
   */
  static async createWithdrawal({ userId, bankAccountId, amount }) {
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      throw new Error('Số tiền rút phải lớn hơn 0');
    }

    if (!bankAccountId) {
      throw new Error('Vui lòng chọn tài khoản ngân hàng nhận tiền');
    }

    let conn;
    try {
      conn = await db.getConnection();
      await conn.beginTransaction();
    } catch (_) {
      conn = null;
    }
    const runner = conn || db;

    try {
      // 1. Kiểm tra tài khoản ngân hàng thuộc về user và đang hoạt động
      const [bankRows] = await runner.query(
        `SELECT id, bank_name, bank_code, account_number, account_holder_name, status
         FROM bank_accounts
         WHERE id = ? AND user_id = ? AND status = 'active'
         LIMIT 1`,
        [bankAccountId, userId]
      );

      if (bankRows.length === 0) {
        throw new Error('Tài khoản ngân hàng không hợp lệ hoặc đã bị vô hiệu hóa');
      }
      const bank = bankRows[0];

      // 2. Kiểm tra giới hạn số yêu cầu rút tiền đang chờ xử lý (tối đa 5 yêu cầu cùng lúc để chống spam)
      const [pendingRows] = await runner.query(
        `SELECT COUNT(*) AS pending_count FROM withdrawals WHERE user_id = ? AND status = 'pending'`,
        [userId]
      );
      if (pendingRows[0]?.pending_count >= 5) {
        throw new Error('Bạn đang có 5 yêu cầu rút tiền đang chờ xét duyệt. Vui lòng đợi quản trị viên xử lý trước khi tạo thêm.');
      }

      // 3. Khóa hàng ví bằng FOR UPDATE
      await runner.query(
        `INSERT INTO wallets (user_id, balance, currency, status)
         VALUES (?, 0.00, 'VND', 'active')
         ON DUPLICATE KEY UPDATE updated_at = NOW()`,
        [userId]
      );

      const [wRows] = await runner.query(
        `SELECT id, balance, status FROM wallets WHERE user_id = ? FOR UPDATE`,
        [userId]
      );

      const wallet = wRows[0];
      if (wallet.status !== 'active') {
        throw new Error('Ví của bạn đang bị tạm khóa. Vui lòng liên hệ ban quản trị.');
      }

      const balanceBefore = parseFloat(wallet.balance || 0);
      if (balanceBefore < withdrawAmount) {
        throw new Error(`Số dư khả dụng (${balanceBefore.toLocaleString('vi-VN')}₫) không đủ để rút ${withdrawAmount.toLocaleString('vi-VN')}₫`);
      }

      const balanceAfter = balanceBefore - withdrawAmount;

      // 4. Trừ số dư khả dụng
      await runner.query(
        `UPDATE wallets SET balance = ?, updated_at = NOW() WHERE id = ?`,
        [balanceAfter, wallet.id]
      );

      // 5. Ghi sổ giao dịch Ledger (Loại: WITHDRAWAL, số âm)
      const maskedAcc = bank.account_number.length > 4
        ? `****${bank.account_number.slice(-4)}`
        : bank.account_number;

      const [txResult] = await runner.query(
        `INSERT INTO wallet_transactions (
          wallet_id, user_id, type, amount, balance_before, balance_after,
          reference_type, reference_id, description, status, created_at
        ) VALUES (?, ?, 'WITHDRAWAL', ?, ?, ?, 'withdrawal_request', NULL, ?, 'pending', NOW())`,
        [
          wallet.id,
          userId,
          -withdrawAmount,
          balanceBefore,
          balanceAfter,
          `Yêu cầu rút tiền về ${bank.bank_name} (${maskedAcc})`,
        ]
      );

      const txId = txResult.insertId;

      // 6. Tạo bản ghi rút tiền
      const [wResult] = await runner.query(
        `INSERT INTO withdrawals (
          user_id, wallet_id, bank_account_id, amount, status, created_at
        ) VALUES (?, ?, ?, ?, 'pending', NOW())`,
        [userId, wallet.id, bank.id, withdrawAmount]
      );
      const withdrawalId = wResult.insertId;

      // Cập nhật reference_id cho transaction
      await runner.query(
        `UPDATE wallet_transactions SET reference_id = ? WHERE id = ?`,
        [withdrawalId, txId]
      );

      // 7. Ghi Audit Log
      await AuditService.log({
        actorId: userId,
        actorRole: 'guest',
        action: 'withdrawal_requested',
        entityType: 'withdrawal',
        entityId: withdrawalId,
        metadata: {
          amount: withdrawAmount,
          bankName: bank.bank_name,
          accountHolder: bank.account_holder_name,
        },
      }).catch(() => {});

      if (conn) {
        await conn.commit();
      }

      return {
        id: withdrawalId,
        amount: withdrawAmount,
        bankName: bank.bank_name,
        bankAccountMasked: maskedAcc,
        accountHolderName: bank.account_holder_name,
        status: 'pending',
        remainingBalance: balanceAfter,
        message: 'Yêu cầu rút tiền đã được tạo thành công và đang chờ Quản trị viên xử lý chuyển khoản.',
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

  /**
   * Lấy lịch sử các yêu cầu rút tiền của user
   */
  static async getWithdrawals(userId) {
    const [rows] = await db.query(
      `SELECT
        w.id,
        w.amount,
        w.status,
        w.admin_note,
        w.created_at,
        w.processed_at,
        b.bank_name,
        b.bank_code,
        b.account_number,
        b.account_holder_name
       FROM withdrawals w
       JOIN bank_accounts b ON w.bank_account_id = b.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );

    return rows.map((r) => {
      const acc = String(r.account_number || '');
      const masked = acc.length > 4 ? `****${acc.slice(-4)}` : acc;
      return {
        id: r.id,
        amount: parseFloat(r.amount),
        status: r.status,
        adminNote: r.admin_note,
        createdAt: r.created_at,
        processedAt: r.processed_at,
        bankName: r.bank_name,
        bankCode: r.bank_code,
        accountNumberMasked: masked,
        accountHolderName: r.account_holder_name,
      };
    });
  }

  /**
   * Admin xem tất cả các yêu cầu rút tiền
   */
  static async getAllWithdrawalsAdmin({ status, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT
        w.id,
        w.user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        w.amount,
        w.status,
        w.admin_note,
        w.created_at,
        w.processed_at,
        b.bank_name,
        b.bank_code,
        b.account_number,
        b.account_holder_name
       FROM withdrawals w
       JOIN users u ON w.user_id = u.id
       JOIN bank_accounts b ON w.bank_account_id = b.id
       WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND w.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY w.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.query(sql, params);
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userEmail: r.user_email,
      userPhone: r.user_phone,
      amount: parseFloat(r.amount),
      status: r.status,
      adminNote: r.admin_note,
      createdAt: r.created_at,
      processedAt: r.processed_at,
      bankName: r.bank_name,
      bankCode: r.bank_code,
      accountNumber: r.account_number,
      accountHolderName: r.account_holder_name,
    }));
  }

  /**
   * Admin duyệt hoặc từ chối yêu cầu rút tiền
   */
  static async processWithdrawal(withdrawalId, { adminId, status, adminNote = '' }) {
    if (!['completed', 'rejected', 'processing'].includes(status)) {
      throw new Error('Trạng thái xử lý không hợp lệ');
    }

    let conn;
    try {
      conn = await db.getConnection();
      await conn.beginTransaction();
    } catch (_) {
      conn = null;
    }
    const runner = conn || db;

    try {
      const [wRows] = await runner.query(
        `SELECT id, user_id, wallet_id, amount, status FROM withdrawals WHERE id = ? FOR UPDATE`,
        [withdrawalId]
      );
      if (wRows.length === 0) {
        throw new Error('Không tìm thấy yêu cầu rút tiền');
      }
      const withdrawal = wRows[0];

      if (withdrawal.status === 'completed' || withdrawal.status === 'rejected') {
        throw new Error('Yêu cầu rút tiền này đã được giải quyết từ trước');
      }

      // Cập nhật trạng thái withdrawal
      await runner.query(
        `UPDATE withdrawals
         SET status = ?, admin_note = ?, processed_by = ?, processed_at = NOW(), updated_at = NOW()
         WHERE id = ?`,
        [status, adminNote.trim(), adminId, withdrawalId]
      );

      // Cập nhật trạng thái transaction tương ứng
      await runner.query(
        `UPDATE wallet_transactions
         SET status = ?
         WHERE reference_type = 'withdrawal_request' AND reference_id = ?`,
        [status === 'completed' ? 'completed' : status === 'rejected' ? 'failed' : 'pending', withdrawalId]
      );

      // NẾU TỪ CHỐI (REJECTED): Phải hoàn trả lại số tiền đã trừ vào ví của khách!
      if (status === 'rejected') {
        const [walletRows] = await runner.query(
          `SELECT id, balance FROM wallets WHERE id = ? FOR UPDATE`,
          [withdrawal.wallet_id]
        );
        const wallet = walletRows[0];
        const refundAmount = parseFloat(withdrawal.amount);
        const balanceBefore = parseFloat(wallet.balance || 0);
        const balanceAfter = balanceBefore + refundAmount;

        await runner.query(
          `UPDATE wallets SET balance = ?, updated_at = NOW() WHERE id = ?`,
          [balanceAfter, wallet.id]
        );

        await runner.query(
          `INSERT INTO wallet_transactions (
            wallet_id, user_id, type, amount, balance_before, balance_after,
            reference_type, reference_id, description, status, created_at
          ) VALUES (?, ?, 'ADJUSTMENT', ?, ?, ?, 'withdrawal_rejected_refund', ?, ?, 'completed', NOW())`,
          [
            wallet.id,
            withdrawal.user_id,
            refundAmount,
            balanceBefore,
            balanceAfter,
            withdrawalId,
            `Hoàn tiền lại vào ví do yêu cầu rút tiền bị từ chối (${adminNote || 'Không hợp lệ'})`,
          ]
        );
      }

      // Ghi Audit Log
      await AuditService.log({
        actorId: adminId,
        actorRole: 'admin',
        action: `withdrawal_${status}`,
        entityType: 'withdrawal',
        entityId: withdrawalId,
        metadata: { status, adminNote, amount: withdrawal.amount },
      }).catch(() => {});

      if (conn) {
        await conn.commit();
      }

      return {
        id: withdrawalId,
        status,
        adminNote,
        message: status === 'completed' ? 'Đã xác nhận chuyển tiền thành công!' : 'Đã từ chối và hoàn lại tiền vào ví người dùng.',
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

module.exports = WalletService;
