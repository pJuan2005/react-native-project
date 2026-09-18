const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  uploadPaymentProof,
} = require('../controllers/booking.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

// Đặt phòng mới
router.post('/bookings', optionalAuth, createBooking);

// Lấy danh sách đặt phòng của tôi (?status=pending|confirmed|completed|cancelled)
router.get('/bookings/my-bookings', optionalAuth, getMyBookings);
router.get('/my-bookings', optionalAuth, getMyBookings); // Alias

// Lấy chi tiết 1 đơn đặt phòng
router.get('/bookings/:id', optionalAuth, getBookingById);

// Khách hủy đơn đặt phòng
router.put('/bookings/:id/cancel', optionalAuth, cancelBooking);
router.post('/bookings/:id/cancel', optionalAuth, cancelBooking);

// Khách upload minh chứng thanh toán chuyển khoản
router.post('/bookings/:id/payment-proof', optionalAuth, uploadPaymentProof);
router.post('/bookings/payment-proof', optionalAuth, uploadPaymentProof);

module.exports = router;
