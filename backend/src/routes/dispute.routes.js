const express = require('express');
const router = express.Router();
const {
  createDispute,
  getDisputes,
  resolveDispute,
} = require('../controllers/dispute.controller');
const { optionalAuth, verifyAdmin } = require('../middlewares/auth.middleware');

// Khách hoặc Host tạo khiếu nại
router.post('/disputes', optionalAuth, createDispute);

// Xem danh sách khiếu nại (Admin xem hết, User xem của mình)
router.get('/disputes', optionalAuth, getDisputes);

// Admin điều tra và giải quyết khiếu nại
router.put('/disputes/:id/resolve', optionalAuth, resolveDispute);

module.exports = router;
