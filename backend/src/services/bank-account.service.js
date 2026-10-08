const db = require('../config/database');
const { comparePassword } = require('../utils/hash');
const AuditService = require('./audit.service');

class BankAccountService {
  /**
   * Lấy danh sách tài khoản ngân hàng của người dùng (Mask số tài khoản để bảo mật)
   */
  static async getBankAccounts(userId) {
    const [rows] = await db.query(
      `SELECT
        id,
        user_id,
        bank_name,
        bank_code,
        account_number,
        account_holder_name,
        is_default,
        status,
        created_at
       FROM bank_accounts
       WHERE user_id = ? AND status = 'active'
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    return rows.map((r) => {
      const acc = String(r.account_number || '');
      const masked = acc.length > 4 ? `****${acc.slice(-4)}` : acc;
      return {
        id: r.id,
        bankName: r.bank_name,
        bankCode: r.bank_code,
        bank_name: r.bank_name,
        bank_code: r.bank_code,
        accountNumberMasked: masked,
        account_number_masked: masked,
        accountNumber: masked,
        account_number: masked,
        accountHolderName: r.account_holder_name,
        account_holder_name: r.account_holder_name,
        isDefault: Boolean(r.is_default),
        is_default: r.is_default,
        status: r.status,
        createdAt: r.created_at,
      };
    });
  }

  /**
   * Xem chi tiết số tài khoản ngân hàng không che - BẮT BUỘC NHẬP MẬT KHẨU TÀI KHOẢN ĐỂ XÁC THỰC
   */
  static async revealBankAccountDetail({ userId, accountId, password }) {
    if (!password) {
      throw new Error('Vui lòng nhập mật khẩu tài khoản để xác thực bảo mật.');
    }

    // 1. Kiểm tra tài khoản người dùng và đối chiếu mật khẩu
    const [userRows] = await db.query(
      `SELECT id, password_hash, password FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );
    if (userRows.length === 0) {
      throw new Error('Không tìm thấy tài khoản người dùng.');
    }

    const user = userRows[0];
    const storedHash = user.password_hash || user.password;
    const isValid = comparePassword(password, storedHash);
    if (!isValid) {
      throw new Error('Mật khẩu tài khoản không chính xác. Không thể xem thông tin bảo mật.');
    }

    // 2. Lấy thông tin tài khoản ngân hàng đầy đủ
    const [rows] = await db.query(
      `SELECT
        id,
        user_id,
        bank_name,
        bank_code,
        account_number,
        account_holder_name,
        is_default,
        status,
        created_at
       FROM bank_accounts
       WHERE id = ? AND user_id = ? AND status = 'active'
       LIMIT 1`,
      [accountId, userId]
    );

    if (rows.length === 0) {
      throw new Error('Tài khoản ngân hàng không tồn tại hoặc đã bị xóa.');
    }

    const r = rows[0];

    // 3. Ghi vết kiểm toán (Audit Trail)
    AuditService.log({
      actorId: userId,
      actorRole: 'guest',
      action: 'bank_account_reveal',
      entityType: 'bank_account',
      entityId: accountId,
      metadata: `Người dùng xác thực mật khẩu thành công để xem số tài khoản ${r.bank_name}`,
    }).catch(() => {});

    return {
      id: r.id,
      bankName: r.bank_name,
      bankCode: r.bank_code,
      bank_name: r.bank_name,
      bank_code: r.bank_code,
      accountNumber: r.account_number,
      account_number: r.account_number,
      accountHolderName: r.account_holder_name,
      account_holder_name: r.account_holder_name,
      isDefault: Boolean(r.is_default),
      is_default: r.is_default,
      status: r.status,
      createdAt: r.created_at,
    };
  }

  /**
   * Thêm mới một tài khoản ngân hàng
   */
  static async addBankAccount({
    userId,
    bankName,
    bankCode,
    accountNumber,
    accountHolderName,
    isDefault = false,
  }) {
    if (!bankName || !bankName.trim()) {
      throw new Error('Vui lòng chọn tên ngân hàng');
    }
    if (!accountNumber || !accountNumber.trim()) {
      throw new Error('Vui lòng nhập số tài khoản ngân hàng');
    }
    if (!accountHolderName || !accountHolderName.trim()) {
      throw new Error('Vui lòng nhập tên chủ tài khoản');
    }

    const cleanAccNum = String(accountNumber).trim().replace(/\s+/g, '');
    const cleanHolder = String(accountHolderName).trim().toUpperCase();
    const cleanBankName = String(bankName).trim();
    const cleanCode = String(bankCode || 'BANK').trim().toUpperCase();

    // Kiểm tra xem đã có tài khoản nào chưa; nếu là tài khoản đầu tiên thì tự động đặt làm mặc định
    const [existing] = await db.query(
      `SELECT id FROM bank_accounts WHERE user_id = ? AND status = 'active'`,
      [userId]
    );

    const shouldBeDefault = isDefault || existing.length === 0;

    if (shouldBeDefault) {
      await db.query(
        `UPDATE bank_accounts SET is_default = 0 WHERE user_id = ?`,
        [userId]
      );
    }

    const [result] = await db.query(
      `INSERT INTO bank_accounts (
        user_id, bank_name, bank_code, account_number, account_holder_name, is_default, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [
        userId,
        cleanBankName,
        cleanCode,
        cleanAccNum,
        cleanHolder,
        shouldBeDefault ? 1 : 0,
      ]
    );

    const masked = cleanAccNum.length > 4 ? `****${cleanAccNum.slice(-4)}` : cleanAccNum;

    return {
      id: result.insertId,
      bankName: cleanBankName,
      bankCode: cleanCode,
      accountNumberMasked: masked,
      accountHolderName: cleanHolder,
      isDefault: shouldBeDefault,
      message: 'Thêm tài khoản ngân hàng thành công!',
    };
  }

  /**
   * Đặt một tài khoản làm mặc định
   */
  static async setDefault(userId, accountId) {
    const [rows] = await db.query(
      `SELECT id FROM bank_accounts WHERE id = ? AND user_id = ? AND status = 'active'`,
      [accountId, userId]
    );
    if (rows.length === 0) {
      throw new Error('Tài khoản ngân hàng không tồn tại');
    }

    await db.query(
      `UPDATE bank_accounts SET is_default = 0 WHERE user_id = ?`,
      [userId]
    );
    await db.query(
      `UPDATE bank_accounts SET is_default = 1 WHERE id = ? AND user_id = ?`,
      [accountId, userId]
    );

    return { success: true, message: 'Đã đặt làm tài khoản ngân hàng mặc định' };
  }

  /**
   * Xóa tài khoản ngân hàng (soft delete status='inactive')
   */
  static async deleteBankAccount(userId, accountId) {
    const [rows] = await db.query(
      `SELECT id, is_default FROM bank_accounts WHERE id = ? AND user_id = ?`,
      [accountId, userId]
    );
    if (rows.length === 0) {
      throw new Error('Tài khoản ngân hàng không tồn tại');
    }

    await db.query(
      `UPDATE bank_accounts SET status = 'inactive', is_default = 0 WHERE id = ? AND user_id = ?`,
      [accountId, userId]
    );

    // Nếu vừa xóa tài khoản mặc định, đặt tài khoản còn lại đầu tiên làm mặc định
    if (rows[0].is_default) {
      const [remaining] = await db.query(
        `SELECT id FROM bank_accounts WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      if (remaining.length > 0) {
        await db.query(
          `UPDATE bank_accounts SET is_default = 1 WHERE id = ?`,
          [remaining[0].id]
        );
      }
    }

    return { success: true, message: 'Đã xóa tài khoản ngân hàng thành công' };
  }
}

module.exports = BankAccountService;
