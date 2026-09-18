const express = require('express');
const router = express.Router();
const {
  createDirectBooking,
  getHostHomestays,
  getHostBookings,
  getHostDashboard,
  getQuickManageByToken,
} = require('../controllers/host.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

// 1. Tạo đơn đặt phòng trực tiếp tại quầy homestay (Khách Walk-in)
router.post('/direct-booking', optionalAuth, createDirectBooking);
router.post('/direct-bookings', optionalAuth, createDirectBooking);

// 2. Danh sách homestay của Host
router.get('/homestays', optionalAuth, getHostHomestays);

// 3. Danh sách đơn phòng của Host
router.get('/bookings', optionalAuth, getHostBookings);

// 4. Dashboard & Doanh thu Host
router.get('/dashboard', optionalAuth, getHostDashboard);

// 5. Quản lý nhanh bằng Token bí mật (Quick Manage)
router.get('/quick-manage/:token', getQuickManageByToken);
router.post('/quick-manage/:token/direct-bookings', createDirectBooking);

module.exports = router;
