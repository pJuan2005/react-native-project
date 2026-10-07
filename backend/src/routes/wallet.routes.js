const express = require('express');
const router = express.Router();
const {
  getWallet,
  getTransactions,
  createWithdrawal,
  getWithdrawals,
  getAllWithdrawalsAdmin,
  processWithdrawal,
} = require('../controllers/wallet.controller');
const { optionalAuth, verifyAdmin } = require('../middlewares/auth.middleware');

// User Wallet endpoints
router.get('/wallet', optionalAuth, getWallet);
router.get('/wallet/transactions', optionalAuth, getTransactions);
router.post('/wallet/withdraw', optionalAuth, createWithdrawal);
router.get('/wallet/withdrawals', optionalAuth, getWithdrawals);

// Admin Withdrawal Management endpoints
router.get('/admin/withdrawals', optionalAuth, getAllWithdrawalsAdmin);
router.put('/admin/withdrawals/:id/process', optionalAuth, processWithdrawal);

module.exports = router;
