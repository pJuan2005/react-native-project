const ReviewService = require('../services/review.service');
const { success, created, badRequest, error } = require('../utils/response');

const getHomestayReviews = async (req, res) => {
  try {
    const { homestayId } = req.params;
    const data = await ReviewService.getReviewsByHomestay(homestayId);
    return success(res, data, 'Lấy danh sách đánh giá thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy danh sách đánh giá');
  }
};

const createReview = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || '1';
    const { homestayId, bookingId, rating, comment } = req.body;

    const reviewId = await ReviewService.createReview({
      userId,
      homestayId,
      bookingId,
      rating: parseInt(rating, 10),
      comment,
    });

    return created(res, { id: reviewId }, 'Gửi đánh giá thành công! Tặng bạn +50 điểm thưởng.');
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi gửi đánh giá');
  }
};

module.exports = {
  getHomestayReviews,
  createReview,
};
