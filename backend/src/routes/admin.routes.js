const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  createHomestay,
  deleteHomestay,
} = require('../controllers/admin.controller');

// Dashboard & Analytics
router.get('/dashboard', getDashboardStats);

// Booking Management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// Homestay Management
router.post('/homestays', createHomestay);
router.delete('/homestays/:id', deleteHomestay);

module.exports = router;
