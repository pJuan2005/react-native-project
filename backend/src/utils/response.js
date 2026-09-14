/**
 * Standard API Response Utilities
 */

const success = (res, data = null, message = 'Thành công', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const error = (res, message = 'Đã có lỗi xảy ra', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

const created = (res, data = null, message = 'Tạo mới thành công') => {
  return success(res, data, message, 201);
};

const badRequest = (res, message = 'Dữ liệu không hợp lệ', errors = null) => {
  return error(res, message, 400, errors);
};

const unauthorized = (res, message = 'Chưa xác thực hoặc token không hợp lệ') => {
  return error(res, message, 401);
};

const forbidden = (res, message = 'Bạn không có quyền truy cập tài nguyên này') => {
  return error(res, message, 403);
};

const notFound = (res, message = 'Không tìm thấy tài nguyên yêu cầu') => {
  return error(res, message, 404);
};

module.exports = {
  success,
  error,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
};
