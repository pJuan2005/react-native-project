const express = require('express');
const router = express.Router();
const {
  getReviews,
  createReview,
} = require('../controllers/review.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

// Lấy danh sách đánh giá của 1 property / homestay
router.get('/reviews/property/:propertyId', getReviews);
router.get('/properties/:propertyId/reviews', getReviews);
router.get('/reviews/homestay/:homestayId', getReviews);
router.get('/homestays/:homestayId/reviews', getReviews);

// Gửi đánh giá mới (+50 điểm thưởng)
router.post('/reviews', optionalAuth, createReview);

module.exports = router;
