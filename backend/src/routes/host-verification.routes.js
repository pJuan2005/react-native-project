const express = require('express');
const router = express.Router();
const {
  submitVerification,
  getMyVerification,
  getAdminHostVerifications,
  reviewHostVerification,
} = require('../controllers/host-verification.controller');
const { optionalAuth, verifyAdmin } = require('../middlewares/auth.middleware');

// Host nộp hồ sơ xác minh danh tính
router.post('/host/verification', optionalAuth, submitVerification);

// Host xem trạng thái xác minh của mình
router.get('/host/verification', optionalAuth, getMyVerification);

// Admin lấy danh sách hồ sơ cần duyệt
router.get('/admin/host-verifications', optionalAuth, getAdminHostVerifications);

// Admin duyệt hoặc từ chối hồ sơ
router.put('/admin/host-verifications/:hostId/review', optionalAuth, reviewHostVerification);

module.exports = router;
