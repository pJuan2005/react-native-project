const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/booking.controller');

// Đặt phòng mới
router.post('/bookings', createBooking);

// Lấy danh sách đặt phòng của tôi (?status=pending|confirmed|completed|cancelled)
router.get('/bookings/my-bookings', getMyBookings);
router.get('/my-bookings', getMyBookings); // Alias

// Lấy chi tiết 1 đơn đặt phòng
router.get('/bookings/:id', getBookingById);

// Khách hủy đơn đặt phòng
router.put('/bookings/:id/cancel', cancelBooking);

module.exports = router;
