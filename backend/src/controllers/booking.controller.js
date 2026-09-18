const BookingService = require('../services/booking.service');
const { success, created, badRequest, notFound, error } = require('../utils/response');

const createBooking = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id || '1';
    const {
      homestayId,
      checkIn,
      checkOut,
      guests,
      promotionId,
      paymentMethod,
      notes,
    } = req.body;

    const data = await BookingService.createBooking({
      userId,
      homestayId,
      checkIn,
      checkOut,
      guests,
      promotionId,
      paymentMethod,
      notes,
    });

    return created(res, data, 'Đặt phòng thành công! Đã cộng +100 điểm thưởng thành viên.');
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi đặt phòng');
  }
};

const getMyBookings = async (req, res) => {
  try {
    // Ưu tiên query param userId để thuận tiện test trên Postman / Mobile
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
    const userId = req.body.userId || req.query.userId || req.user?.id || '1';
    const { reason } = req.body;

    await BookingService.cancelBooking(id, userId, reason);
    return success(res, null, 'Hủy đơn đặt phòng thành công');
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi hủy đơn đặt phòng');
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
