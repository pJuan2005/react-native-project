const WalletService = require('../services/wallet.service');
const { success, created, badRequest, error } = require('../utils/response');

const getWallet = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || 4;
    const data = await WalletService.getWallet(userId);
    return success(res, data, 'Lấy thông tin ví thành công');
  } catch (err) {
    return error(res, err.message || 'Lỗi khi tải thông tin ví');
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || 4;
    const { type, limit, offset } = req.query;
    const data = await WalletService.getTransactions(userId, { type, limit, offset });
    return success(res, data, 'Lấy lịch sử giao dịch ví thành công');
  } catch (err) {
    return error(res, err.message || 'Lỗi khi tải lịch sử giao dịch ví');
  }
};

const createWithdrawal = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || 4;
    const { bankAccountId, amount } = req.body;

    const data = await WalletService.createWithdrawal({
      userId,
      bankAccountId,
      amount,
    });
    return created(res, data, data.message);
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi tạo yêu cầu rút tiền');
  }
};

const getWithdrawals = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || 4;
    const data = await WalletService.getWithdrawals(userId);
    return success(res, data, 'Lấy lịch sử rút tiền thành công');
  } catch (err) {
    return error(res, err.message || 'Lỗi khi tải lịch sử rút tiền');
  }
};

const getAllWithdrawalsAdmin = async (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    const data = await WalletService.getAllWithdrawalsAdmin({ status, limit, offset });
    return success(res, data, 'Lấy danh sách yêu cầu rút tiền thành công');
  } catch (err) {
    return error(res, err.message || 'Lỗi khi tải danh sách rút tiền');
  }
};

const processWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id || 1;
    const { status, adminNote } = req.body;

    const data = await WalletService.processWithdrawal(id, {
      adminId,
      status,
      adminNote,
    });
    return success(res, data, data.message);
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi xử lý yêu cầu rút tiền');
  }
};

module.exports = {
  getWallet,
  getTransactions,
  createWithdrawal,
  getWithdrawals,
  getAllWithdrawalsAdmin,
  processWithdrawal,
};
