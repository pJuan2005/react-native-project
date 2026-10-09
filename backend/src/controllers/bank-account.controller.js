const BankAccountService = require('../services/bank-account.service');
const { success, created, badRequest, error } = require('../utils/response');

function resolveUserId(req, fallback = 4) {
  const candidates = [req.user?.id, req.body?.userId, req.query?.userId];
  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== 'offline' && !isNaN(Number(c))) {
      return Number(c);
    }
  }
  return fallback;
}

const getBankAccounts = async (req, res) => {
  try {
    const userId = resolveUserId(req, 4);
    const data = await BankAccountService.getBankAccounts(userId);
    return success(res, data, 'Lấy danh sách tài khoản ngân hàng thành công');
  } catch (err) {
    return error(res, err.message || 'Lỗi khi tải danh sách tài khoản ngân hàng');
  }
};

const addBankAccount = async (req, res) => {
  try {
    const userId = resolveUserId(req, 4);
    const { bankName, bankCode, accountNumber, accountHolderName, isDefault } = req.body;

    const data = await BankAccountService.addBankAccount({
      userId,
      bankName,
      bankCode,
      accountNumber,
      accountHolderName,
      isDefault: Boolean(isDefault),
    });

    return created(res, data, data.message);
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi thêm tài khoản ngân hàng');
  }
};

const setDefault = async (req, res) => {
  try {
    const userId = resolveUserId(req, 4);
    const { id } = req.params;

    const data = await BankAccountService.setDefault(userId, id);
    return success(res, data, data.message);
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi đổi tài khoản mặc định');
  }
};

const deleteBankAccount = async (req, res) => {
  try {
    const userId = resolveUserId(req, 4);
    const { id } = req.params;

    const data = await BankAccountService.deleteBankAccount(userId, id);
    return success(res, data, data.message);
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi xóa tài khoản ngân hàng');
  }
};

const revealBankAccount = async (req, res) => {
  try {
    const userId = resolveUserId(req, 4);
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return badRequest(res, 'Vui lòng nhập mật khẩu tài khoản để xác thực');
    }

    const data = await BankAccountService.revealBankAccountDetail({
      userId,
      accountId: id,
      password,
    });
    return success(res, data, 'Xác thực mật khẩu thành công!');
  } catch (err) {
    return badRequest(res, err.message || 'Mật khẩu không chính xác');
  }
};

module.exports = {
  getBankAccounts,
  addBankAccount,
  setDefault,
  deleteBankAccount,
  revealBankAccount,
};
