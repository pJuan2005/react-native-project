const rateLimit = require('express-rate-limit');

// Limiter cho các API nhạy cảm (Đăng nhập / Đăng ký)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 30, // Tối đa 30 requests / 15 phút trên mỗi IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu đăng nhập/đăng ký. Vui lòng thử lại sau 15 phút.',
  },
});

// Limiter cho hành động Đặt phòng & Nộp biên lai chuyển khoản (Chống double click / spam)
const bookingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 25, // Tối đa 25 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu đặt phòng. Vui lòng thử lại sau ít phút.',
  },
});

// Limiter chung cho API toàn hệ thống
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Hệ thống đang tiếp nhận quá nhiều yêu cầu. Vui lòng thử lại sau.',
  },
});

module.exports = {
  authLimiter,
  bookingLimiter,
  generalApiLimiter,
};
