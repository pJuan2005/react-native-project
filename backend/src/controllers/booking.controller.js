const BookingService = require('../services/booking.service');
const { success, created, badRequest, notFound, error } = require('../utils/response');

const createBooking = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id || '1';
    const {
      propertyId,
      homestayId,
      checkIn,
      checkOut,
      guests,
      promotionId,
      voucherCode,
      paymentMethod,
      notes,
    } = req.body;

    const data = await BookingService.createBooking({
      userId,
      propertyId: propertyId || homestayId,
      homestayId: propertyId || homestayId,
      checkIn,
      checkOut,
      guests,
      promotionId: promotionId || voucherCode,
      voucherCode: voucherCode || (isNaN(Number(promotionId)) ? promotionId : null),
      paymentMethod,
      notes,
    });

    return created(res, data, 'Đặt phòng thành công! Đã tích lũy điểm thưởng thành viên.');
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi đặt phòng');
  }
};

const getMyBookings = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id || '1';
    const { status } = req.query;
    const data = await BookingService.getMyBookings(userId, status);
    return success(res, data, 'Lấy danh sách đặt phòng của tôi thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy danh sách đặt phòng');
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await BookingService.getBookingById(id);
    return success(res, data, 'Lấy chi tiết đơn đặt phòng thành công');
  } catch (err) {
    return notFound(res, err.message || 'Không tìm thấy đơn đặt phòng');
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.body.userId || null;
    const reason = req.body.reason || 'Khách yêu cầu hủy';

    await BookingService.cancelBooking(id, userId, reason);
    return success(res, null, 'Hủy đơn đặt phòng thành công');
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi hủy đơn đặt phòng');
  }
};

const uploadPaymentProof = async (req, res) => {
  try {
    const bookingId = req.params.id || req.body.bookingId;
    const userId = req.user?.id || req.body.userId || null;
    const { proofImageUrl, transactionCode } = req.body;

    const result = await BookingService.uploadPaymentProof({
      bookingId,
      userId,
      proofImageUrl,
      transactionCode,
    });

    return success(res, result, result.message);
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi cập nhật minh chứng thanh toán');
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  uploadPaymentProof,
};
