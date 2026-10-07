const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  uploadPaymentProof,
} = require('../controllers/booking.controller');
const {
  getCancellationPreview,
  cancelBooking,
} = require('../controllers/cancellation.controller');
const chat = require('../web/controllers/chat.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

// Đặt phòng mới
router.post('/bookings', optionalAuth, createBooking);

// Lấy danh sách đặt phòng của tôi (?status=pending|confirmed|completed|cancelled)
router.get('/bookings/my-bookings', optionalAuth, getMyBookings);
router.get('/my-bookings', optionalAuth, getMyBookings); // Alias

// Xem trước chính sách hủy phòng và tính toán hoàn tiền từ Server
router.get('/bookings/:id/cancellation-preview', optionalAuth, getCancellationPreview);

// Hủy đặt phòng chính thức với lý do bắt buộc và chính sách hoàn tiền
router.post('/bookings/:id/cancel', optionalAuth, cancelBooking);
router.put('/bookings/:id/cancel', optionalAuth, cancelBooking);

// Khách upload minh chứng thanh toán chuyển khoản
router.post('/bookings/:id/payment-proof', optionalAuth, uploadPaymentProof);
router.post('/bookings/payment-proof', optionalAuth, uploadPaymentProof);

// Chat giữa Guest và Host gắn với booking
router.get('/bookings/:id/chat', optionalAuth, chat.getGuestBookingConversation);
router.post('/bookings/:id/chat/messages', optionalAuth, chat.createGuestBookingMessage);

// Danh sách các cuộc trò chuyện của user
router.get('/chat/conversations', optionalAuth, chat.getUserConversations);

// Lấy chi tiết 1 đơn đặt phòng (phải đặt sau các route con cụ thể)
router.get('/bookings/:id', optionalAuth, getBookingById);

module.exports = router;
