const fs = require('fs');
const path = require('path');
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
    const { name, fullName, email, phone, address, location, avatar, avatarUrl, avatar_url, birthDate } = req.body;

    const data = await UserService.updateUserProfile(id, {
      name: name || fullName,
      fullName: fullName || name,
      email,
      phone,
      address: address || location,
      location: location || address,
      avatar: avatar || avatarUrl || avatar_url,
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

const uploadAvatar = async (req, res) => {
  try {
    const { id } = req.params;
    let avatarUrl = '';

    const avatarsDir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
    }

    // 1. Tải lên tệp ảnh qua multipart (req.file)
    if (req.file) {
      const ext = path.extname(req.file.originalname) || '.jpg';
      const fileName = `avatar-${id}-${Date.now()}${ext}`;
      const filePath = path.join(avatarsDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      avatarUrl = `/uploads/avatars/${fileName}`;
    }
    // 2. Tải lên chuỗi base64 qua body ({ avatarBase64: '...' })
    else if (req.body?.avatarBase64) {
      const isPng = req.body.avatarBase64.includes('image/png');
      const isWebp = req.body.avatarBase64.includes('image/webp');
      const ext = isPng ? '.png' : isWebp ? '.webp' : '.jpg';
      const base64Data = req.body.avatarBase64.replace(/^data:image\/[^;]+;base64,/, '');
      const fileName = `avatar-${id}-${Date.now()}${ext}`;
      const filePath = path.join(avatarsDir, fileName);
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      avatarUrl = `/uploads/avatars/${fileName}`;
    }
    // 3. Nếu là link URL có sẵn ({ avatarUrl: '...' })
    else if (req.body?.avatarUrl) {
      avatarUrl = req.body.avatarUrl;
    } else {
      return badRequest(res, 'Vui lòng cung cấp tệp ảnh hoặc chuỗi base64 hợp lệ');
    }

    // Cập nhật đường link vào CSDL
    await UserService.updateUserProfile(id, { avatar: avatarUrl });

    return success(res, { avatarUrl }, 'Tải lên ảnh đại diện thành công');
  } catch (err) {
    return error(res, err.message || 'Lỗi khi tải lên ảnh đại diện');
  }
};

module.exports = {
  getUser,
  updateUser,
  uploadAvatar,
};

