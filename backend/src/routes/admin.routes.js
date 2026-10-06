const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  createProperty,
  deleteProperty,
} = require('../controllers/admin.controller');

// Dashboard & Analytics
router.get('/dashboard', getDashboardStats);

// Booking Management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// Property Management
router.post('/properties', createProperty);
router.delete('/properties/:id', deleteProperty);
router.post('/homestays', createProperty);
router.delete('/homestays/:id', deleteProperty);

module.exports = router;
