const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const homestayRoutes = require('./homestay.routes');
const userRoutes = require('./user.routes');
const adminRoutes = require('./admin.routes');

// Health Check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Homestay Layered REST API is running normally',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
router.use('/auth', authRoutes);
router.use('/', homestayRoutes);
router.use('/', userRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
