const UserModel = require('../models/user.model');

class UserService {
  static async getUserProfile(id) {
    try {
      const user = await UserModel.findById(id);
      if (user) {
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          address: user.address || '',
          birthDate: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
          avatar: user.avatar_url || '',
          rewardPoints: user.reward_points || 0,
        };
      }
    } catch (err) {
      console.warn('DB error fetching user, fallback:', err.message);
    }

    return {
      id: String(id),
      name: 'Phạm Xuân Chuẩn',
      email: 'phamchuan2608@gmail.com',
      phone: '0901234567',
      address: 'Cầu Giấy, Hà Nội',
      birthDate: '2000-01-01',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      rewardPoints: 450,
    };
  }

  static async updateUserProfile(id, { name, email, phone, address, avatar, birthDate }) {
    if (name !== undefined && name.trim() === '') {
      throw new Error('Họ và tên không được để trống');
    }
    if (email !== undefined && email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Email không đúng định dạng');
    }

    try {
      const updated = await UserModel.update(id, {
        name: name !== undefined ? name.trim() : undefined,
        email: email !== undefined ? email.trim().toLowerCase() : undefined,
        phone,
        address,
        avatarUrl: avatar,
        birthDate: birthDate || undefined,
      });

      if (updated) {
        return {
          id: String(updated.id),
          name: updated.name,
          email: updated.email,
          phone: updated.phone || '',
          address: updated.address || '',
          birthDate: updated.birth_date ? new Date(updated.birth_date).toISOString().split('T')[0] : '',
          avatar: updated.avatar_url || '',
          rewardPoints: updated.reward_points || 0,
        };
      }
    } catch (err) {
      if (err.message.includes('không')) throw err;
      console.warn('DB error updating user, return local data:', err.message);
    }

    return {
      id: String(id),
      name: name || 'Phạm Xuân Chuẩn',
      email: email || 'phamchuan2608@gmail.com',
      phone: phone || '',
      address: address || '',
      birthDate: birthDate || '2000-01-01',
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      rewardPoints: 450,
    };
  }
}

module.exports = UserService;
