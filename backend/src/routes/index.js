const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const homestayRoutes = require('./homestay.routes');
const userRoutes = require('./user.routes');
const locationRoutes = require('./location.routes');
const bookingRoutes = require('./booking.routes');
const favoriteRoutes = require('./favorite.routes');
const promotionRoutes = require('./promotion.routes');
const reviewRoutes = require('./review.routes');
const notificationRoutes = require('./notification.routes');
const adminRoutes = require('./admin.routes');
const hostRoutes = require('./host.routes');

// Health Check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Homestay Layered REST API is running normally',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Client Mobile Routes
router.use('/auth', authRoutes);
router.use('/', homestayRoutes);
router.use('/', userRoutes);
router.use('/', locationRoutes);
router.use('/', bookingRoutes);
router.use('/', favoriteRoutes);
router.use('/', promotionRoutes);
router.use('/', reviewRoutes);
router.use('/', notificationRoutes);

// Mount Admin & Host Routes
router.use('/admin', adminRoutes);
router.use('/host', hostRoutes);
router.use('/', hostRoutes); // for /quick-manage/:token direct alias

module.exports = router;
