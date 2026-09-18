const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notification.controller');

// Lấy danh sách thông báo
router.get('/notifications', getNotifications);

// Đánh dấu đọc tất cả
router.put('/notifications/read-all', markAllAsRead);

// Đánh dấu đã đọc 1 thông báo
router.put('/notifications/:id/read', markAsRead);

module.exports = router;
