const CancellationService = require('../services/cancellation.service');
const { success, badRequest, error } = require('../utils/response');

/**
 * GET /api/bookings/:id/cancellation-preview
 * Lấy bảng tính số tiền được hoàn và phí hủy theo chính sách trước khi khách xác nhận
 */
const getCancellationPreview = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.id || req.query.userId || null;
    const data = await CancellationService.calculateCancellationPreview(bookingId, userId);
    return success(res, data, 'Lấy chính sách hủy và hoàn tiền thành công');
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi kiểm tra chính sách hủy phòng');
  }
};

/**
 * POST /api/bookings/:id/cancel
 * Xác nhận hủy phòng chính thức với lý do bắt buộc và chính sách hoàn tiền
 */
const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.id || req.body.userId || null;
    const { reasonCode, reasonText } = req.body;

    const data = await CancellationService.executeCancellation({
      bookingId,
      userId,
      reasonCode,
      reasonText,
    });

    return success(res, data, data.message);
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi thực hiện hủy đặt phòng');
  }
};

module.exports = {
  getCancellationPreview,
  cancelBooking,
};
