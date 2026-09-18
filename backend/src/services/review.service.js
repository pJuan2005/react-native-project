const ReviewModel = require('../models/review.model');

class ReviewService {
  static async getReviewsByHomestay(homestayId) {
    return ReviewModel.findByHomestayId(homestayId);
  }

  static async createReview({ userId, homestayId, bookingId, rating, comment }) {
    if (!homestayId || !rating) {
      throw new Error('Vui lòng chọn số sao và chỗ nghỉ muốn đánh giá');
    }
    return ReviewModel.create({ userId, homestayId, bookingId, rating, comment });
  }
}

module.exports = ReviewService;
