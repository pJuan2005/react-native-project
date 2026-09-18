const NotificationService = require('../services/notification.service');
const { success, error } = require('../utils/response');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || '1';
    const data = await NotificationService.getNotifications(userId);
    return success(res, data, 'Lấy danh sách thông báo thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy danh sách thông báo');
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.body.userId || '1';
    await NotificationService.markAsRead(id, userId);
    return success(res, null, 'Đã đánh dấu đọc thông báo');
  } catch (err) {
    return error(res, 'Lỗi khi cập nhật trạng thái thông báo');
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || '1';
    await NotificationService.markAllAsRead(userId);
    return success(res, null, 'Đã đánh dấu đọc tất cả thông báo');
  } catch (err) {
    return error(res, 'Lỗi khi cập nhật trạng thái thông báo');
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
