const UserModel = require('../models/user.model');

function normalizeDateForDb(val) {
  if (!val) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(val).trim();
  if (!str) return null;

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
}

function formatDateForClient(val) {
  if (!val) return '';
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${d}/${m}/${y}`;
  }
  const str = String(val).trim();
  const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
  return str;
}

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
      birthDate: formatDateForClient(user.birth_date),
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

    const dbBirthDate = birthDate !== undefined ? normalizeDateForDb(birthDate) : undefined;

    const updated = await UserModel.update(id, {
      name: name !== undefined ? name.trim() : undefined,
      email: email !== undefined ? email.trim().toLowerCase() : undefined,
      phone,
      address,
      avatarUrl: avatar,
      birthDate: dbBirthDate,
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
      birthDate: formatDateForClient(updated.birth_date),
      avatar: updated.avatar_url || '',
      rewardPoints: updated.reward_points || 0,
    };
  }
}

module.exports = UserService;
