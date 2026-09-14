const UserService = require('../services/user.service');
const { success, notFound, badRequest, error } = require('../utils/response');

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await UserService.getUserProfile(id);
    if (!data) {
      return notFound(res, 'Không tìm thấy người dùng');
    }
    return success(res, data, 'Lấy thông tin người dùng thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy thông tin người dùng');
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, avatar, birthDate } = req.body;

    const data = await UserService.updateUserProfile(id, {
      name,
      email,
      phone,
      address,
      avatar,
      birthDate,
    });
    return success(res, data, 'Cập nhật thông tin hồ sơ thành công');
  } catch (err) {
    if (err.message.includes('không') || err.message.includes('trống')) {
      return badRequest(res, err.message);
    }
    return error(res, 'Lỗi khi cập nhật thông tin người dùng');
  }
};

module.exports = {
  getUser,
  updateUser,
};
