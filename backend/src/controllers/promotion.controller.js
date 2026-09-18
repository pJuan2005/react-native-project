const PromotionService = require('../services/promotion.service');
const { success, badRequest, error } = require('../utils/response');

const getPromotions = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    const data = await PromotionService.getActivePromotions(userId);
    return success(res, data, 'Lấy danh sách voucher khuyến mãi thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy danh sách khuyến mãi');
  }
};

const getMyVouchers = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    const data = await PromotionService.getMyVouchers(userId);
    return success(res, data, 'Lấy ví voucher của tôi thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy ví voucher');
  }
};

const getRedeemable = async (req, res) => {
  try {
    const data = await PromotionService.getRedeemablePromotions();
    return success(res, data, 'Lấy danh sách voucher có thể đổi điểm thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy danh sách đổi điểm');
  }
};

const checkVoucher = async (req, res) => {
  try {
    const { code, rawTotal } = req.body;
    const data = await PromotionService.checkVoucherCode(code, parseFloat(rawTotal || 0));
    return success(res, data, `Áp dụng voucher ${data.voucher.code} thành công!`);
  } catch (err) {
    return badRequest(res, err.message || 'Mã voucher không hợp lệ');
  }
};

const redeemVoucher = async (req, res) => {
  try {
    const userId = req.body.userId || req.query.userId || req.user?.id || '1';
    const { promotionId } = req.body;
    const data = await PromotionService.redeemVoucher(userId, promotionId);
    return success(res, data, 'Đổi voucher bằng điểm thưởng thành công!');
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi đổi voucher');
  }
};

const getPointHistory = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id || '1';
    const data = await PromotionService.getPointHistory(userId);
    return success(res, data, 'Lấy lịch sử điểm thưởng thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy lịch sử điểm');
  }
};

module.exports = {
  getPromotions,
  getMyVouchers,
  getRedeemable,
  checkVoucher,
  redeemVoucher,
  getPointHistory,
};
