const UserModel = require('../models/user.model');

class UserService {
  static async getUserProfile(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    return {
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      birthDate: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
      avatar: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      rewardPoints: user.reward_points || 0,
    };
  }

  static async updateUserProfile(id, { name, email, phone, address, avatar, birthDate }) {
    if (name !== undefined && name.trim() === '') {
      throw new Error('Họ và tên không được để trống');
    }
    if (email !== undefined && email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Email không đúng định dạng');
    }

    const updated = await UserModel.update(id, {
      name: name !== undefined ? name.trim() : undefined,
      email: email !== undefined ? email.trim().toLowerCase() : undefined,
      phone,
      address,
      avatarUrl: avatar,
      birthDate: birthDate || undefined,
    });

    if (!updated) {
      throw new Error('Không tìm thấy người dùng để cập nhật');
    }

    return {
      id: String(updated.id),
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone || '',
      address: updated.address || '',
      birthDate: updated.birth_date ? new Date(updated.birth_date).toISOString().split('T')[0] : '',
      avatar: updated.avatar_url || '',
      rewardPoints: updated.reward_points || 0,
    };
  }
}

module.exports = UserService;
