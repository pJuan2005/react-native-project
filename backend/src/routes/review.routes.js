const express = require('express');
const router = express.Router();
const {
  getHomestayReviews,
  createReview,
} = require('../controllers/review.controller');

// Lấy danh sách đánh giá của 1 homestay
router.get('/reviews/homestay/:homestayId', getHomestayReviews);
router.get('/homestays/:homestayId/reviews', getHomestayReviews);

// Gửi đánh giá mới (+50 điểm thưởng)
router.post('/reviews', createReview);

module.exports = router;
