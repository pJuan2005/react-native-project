const NotificationModel = require('../models/notification.model');

class NotificationService {
  static async getNotifications(userId) {
    return NotificationModel.findByUserId(userId);
  }

  static async markAsRead(id, userId) {
    return NotificationModel.markAsRead(id, userId);
  }

  static async markAllAsRead(userId) {
    return NotificationModel.markAllAsRead(userId);
  }
}

module.exports = NotificationService;
