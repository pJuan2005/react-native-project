const UserModel = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/hash');

class AuthService {
  static async register({ name, email, password, phone, address }) {
    const cleanEmail = email.trim().toLowerCase();

    // Check email exists
    const existing = await UserModel.findByEmail(cleanEmail);
    if (existing) {
      throw new Error('Email này đã được đăng ký trên hệ thống');
    }

    const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';
    const insertId = await UserModel.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash: hashPassword(password),
      phone: phone || '',
      address: address || '',
      avatarUrl: defaultAvatar,
    });

    const userId = String(insertId);
    const user = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      role: 'customer',
      phone: phone || '',
      address: address || '',
      avatar: defaultAvatar,
      rewardPoints: 150,
    };

    return {
      user,
      token: `token_${userId}_${Date.now()}`,
    };
  }

  static async login({ email, password }) {
    const cleanEmail = email.trim().toLowerCase();
    const userRow = await UserModel.findByEmail(cleanEmail);

    if (!userRow) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    if (!userRow.is_active) {
      throw new Error('Tài khoản này đã bị khóa. Vui lòng liên hệ quản trị viên');
    }

    const isValid = comparePassword(password, userRow.password_hash);
    if (!isValid) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const user = {
      id: String(userRow.id),
      name: userRow.name,
      email: userRow.email,
      role: userRow.role,
      phone: userRow.phone || '',
      address: userRow.address || '',
      birthDate: userRow.birth_date ? new Date(userRow.birth_date).toISOString().split('T')[0] : '',
      avatar: userRow.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      rewardPoints: userRow.reward_points || 0,
    };

    return {
      user,
      token: `token_${user.id}_${Date.now()}`,
    };
  }

  static async getMe(userId) {
    const userRow = await UserModel.findById(userId);
    if (!userRow) {
      throw new Error('Không tìm thấy thông tin tài khoản');
    }

    return {
      id: String(userRow.id),
      name: userRow.name,
      email: userRow.email,
      role: userRow.role,
      phone: userRow.phone || '',
      address: userRow.address || '',
      birthDate: userRow.birth_date ? new Date(userRow.birth_date).toISOString().split('T')[0] : '',
      avatar: userRow.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      rewardPoints: userRow.reward_points || 0,
    };
  }
}

module.exports = AuthService;
