const { error, notFound } = require('../utils/response');

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  return notFound(res, `Đường dẫn API '${req.originalUrl}' không tồn tại trên hệ thống`);
};

/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau';

  return error(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
