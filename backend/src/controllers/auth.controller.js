const AuthService = require('../services/auth.service');
const { success, created, badRequest, unauthorized, error } = require('../utils/response');

const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return badRequest(res, 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest(res, 'Email không đúng định dạng');
    }
    if (password.length < 6) {
      return badRequest(res, 'Mật khẩu phải có ít nhất 6 ký tự');
    }

    const data = await AuthService.register({ name, email, password, phone, address });
    return created(res, data, 'Đăng ký tài khoản thành công! Tặng bạn 150 điểm thưởng.');
  } catch (err) {
    if (err.message.includes('đã được đăng ký')) {
      return badRequest(res, err.message);
    }
    return error(res, err.message || 'Lỗi máy chủ khi đăng ký tài khoản');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return badRequest(res, 'Vui lòng nhập email và mật khẩu');
    }

    const data = await AuthService.login({ email, password });
    return success(res, data, `Đăng nhập thành công! Xin chào ${data.user.name}`);
  } catch (err) {
    return unauthorized(res, err.message || 'Email hoặc mật khẩu không chính xác');
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user?.id || '1';
    const data = await AuthService.getMe(userId);
    return success(res, data, 'Lấy thông tin tài khoản thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy thông tin người dùng');
  }
};

module.exports = {
  register,
  login,
  getMe,
};
