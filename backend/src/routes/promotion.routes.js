const express = require('express');
const router = express.Router();
const {
  getPromotions,
  checkVoucher,
  redeemVoucher,
  getPointHistory,
} = require('../controllers/promotion.controller');

// Lấy danh sách voucher
router.get('/promotions', getPromotions);
router.get('/vouchers', getPromotions);

// Kiểm tra mã voucher và tính chiết khấu
router.post('/promotions/check', checkVoucher);
router.post('/vouchers/check', checkVoucher);

// Đổi điểm lấy voucher
router.post('/promotions/redeem', redeemVoucher);
router.post('/vouchers/redeem', redeemVoucher);

// Lịch sử điểm thưởng
router.get('/points/history', getPointHistory);
router.get('/points', getPointHistory);

module.exports = router;
