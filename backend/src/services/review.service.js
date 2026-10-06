const ReviewModel = require('../models/review.model');

class ReviewService {
  static async getReviewsByProperty(propertyId) {
    return ReviewModel.findByPropertyId(propertyId);
  }

  static async getReviewsByHomestay(homestayId) {
    return ReviewModel.findByPropertyId(homestayId);
  }

  static async createReview({ userId, propertyId, homestayId, bookingId, rating, comment }) {
    const targetPropertyId = propertyId || homestayId;
    if (!targetPropertyId || !rating) {
      throw new Error('Vui lòng chọn số sao và chỗ nghỉ muốn đánh giá');
    }
    return ReviewModel.create({ userId, propertyId: targetPropertyId, bookingId, rating, comment });
  }
}

module.exports = ReviewService;
