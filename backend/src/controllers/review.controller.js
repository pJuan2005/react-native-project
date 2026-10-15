const ReviewService = require('../services/review.service');
const { success, created, badRequest, error } = require('../utils/response');

const getReviews = async (req, res) => {
  try {
    const propertyId = req.params.propertyId || req.params.homestayId;
    const data = await ReviewService.getReviewsByProperty(propertyId);
    return success(res, data, 'Lấy danh sách đánh giá thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy danh sách đánh giá');
  }
};

const createReview = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || '1';
    const { propertyId, homestayId, bookingId, rating, comment, points } = req.body;

    const reviewId = await ReviewService.createReview({
      userId,
      propertyId: propertyId || homestayId,
      bookingId,
      rating: parseInt(rating, 10),
      comment,
      points: points ? parseInt(points, 10) : undefined,
    });

    return created(res, { id: reviewId }, 'Gửi đánh giá thành công! Cảm ơn bạn đã đóng góp đánh giá.');
  } catch (err) {
    console.error('Lỗi tạo/cập nhật đánh giá:', err);
    return badRequest(res, err.message || 'Lỗi khi gửi đánh giá');
  }
};

module.exports = {
  getReviews,
  getHomestayReviews: getReviews,
  createReview,
};
