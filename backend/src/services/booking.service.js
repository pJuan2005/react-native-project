const BookingModel = require('../models/booking.model');

class BookingService {
  static async createBooking({
    userId,
    homestayId,
    checkIn,
    checkOut,
    guests,
    promotionId,
    paymentMethod,
    notes,
  }) {
    if (!homestayId || !checkIn || !checkOut) {
      throw new Error('Vui lòng chọn chỗ nghỉ và ngày nhận/trả phòng');
    }
    return BookingModel.createBooking({
      userId,
      homestayId,
      checkIn,
      checkOut,
      guests,
      promotionId,
      paymentMethod,
      notes,
    });
  }

  static async getMyBookings(userId, status) {
    return BookingModel.findByUserId(userId, status);
  }

  static async getBookingById(id) {
    const booking = await BookingModel.findById(id);
    if (!booking) {
      throw new Error('Không tìm thấy đơn đặt phòng');
    }
    return booking;
  }

  static async cancelBooking(bookingId, userId, reason) {
    return BookingModel.cancelBookingByUser(bookingId, userId, reason);
  }
}

module.exports = BookingService;
