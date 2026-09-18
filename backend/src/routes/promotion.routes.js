const express = require('express');
const router = express.Router();
const {
  getPromotions,
  getMyVouchers,
  getRedeemable,
  checkVoucher,
  redeemVoucher,
  getPointHistory,
} = require('../controllers/promotion.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

// Lấy danh sách voucher khả dụng của người dùng (tự động nhận diện Bearer token hoặc ?userId=...)
router.get('/promotions', optionalAuth, getPromotions);
router.get('/vouchers', optionalAuth, getPromotions);

// Lấy ví voucher của người dùng cụ thể (?userId=7 hoặc Bearer token)
router.get('/promotions/my-vouchers', optionalAuth, getMyVouchers);
router.get('/vouchers/my-vouchers', optionalAuth, getMyVouchers);

// Lấy danh sách voucher có thể quy đổi từ điểm thưởng
router.get('/promotions/redeemable', getRedeemable);
router.get('/vouchers/redeemable', getRedeemable);

// Kiểm tra mã voucher và tính chiết khấu
router.post('/promotions/check', optionalAuth, checkVoucher);
router.post('/vouchers/check', optionalAuth, checkVoucher);

// Đổi điểm lấy voucher
router.post('/promotions/redeem', optionalAuth, redeemVoucher);
router.post('/vouchers/redeem', optionalAuth, redeemVoucher);

// Lịch sử điểm thưởng
router.get('/points/history', optionalAuth, getPointHistory);
router.get('/points', optionalAuth, getPointHistory);

module.exports = router;
