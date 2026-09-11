const pool = require('../config/db');

// GET /api/users/:id
const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT id, name, email, phone, address, birth_date, avatar_url FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = rows[0];
    res.json({
      success: true,
      data: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        birthDate: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
        avatar: user.avatar_url || '',
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin user' });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, avatar, birthDate } = req.body;

    // Validation
    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Tên không được để trống' });
    }

    if (email !== undefined && email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Email không hợp lệ' });
    }

    // Check user exists
    const [existing] = await pool.query(
      'SELECT id, name, email, phone, address, birth_date, avatar_url FROM users WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const current = existing[0];

    // Only update fields that are provided
    const newName = name !== undefined ? name.trim() : current.name;
    const newEmail = email !== undefined ? email : current.email;
    const newPhone = phone !== undefined ? phone : current.phone;
    const newAddress = address !== undefined ? address : current.address;
    const newAvatar = avatar !== undefined ? avatar : current.avatar_url;
    const newBirthDate = birthDate !== undefined && birthDate !== '' ? birthDate : current.birth_date;

    await pool.query(
      'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, avatar_url = ?, birth_date = ? WHERE id = ?',
      [newName, newEmail, newPhone, newAddress, newAvatar, newBirthDate, id]
    );

    // Return updated user
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, address, birth_date, avatar_url FROM users WHERE id = ?',
      [id]
    );

    const user = rows[0];
    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        birthDate: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
        avatar: user.avatar_url || '',
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật thông tin' });
  }
};

module.exports = { getUser, updateUser };
