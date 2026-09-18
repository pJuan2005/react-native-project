const BookingModel = require('../models/booking.model');
const HomestayModel = require('../models/homestay.model');
const { success, created, badRequest, notFound, error } = require('../utils/response');

// 1. Tạo đơn đặt phòng trực tiếp tại quầy homestay (Khách Walk-in)
const createDirectBooking = async (req, res) => {
  try {
    const {
      homestayId,
      guestName,
      guestPhone,
      checkIn,
      checkOut,
      guests,
      paymentMethod,
      status,
      hostNote,
    } = req.body;

    const createdBy = req.user?.id || req.body.hostId || null;

    const data = await BookingModel.createDirectBooking({
      homestayId,
      guestName,
      guestPhone,
      checkIn,
      checkOut,
      guests: parseInt(guests, 10) || 1,
      paymentMethod: paymentMethod || 'cash',
      status: status || 'confirmed',
      hostNote: hostNote || '',
      createdBy,
    });

    return created(
      res,
      data,
      'Tạo đơn đặt phòng trực tiếp tại quầy thành công! Lịch phòng đã được đồng bộ và khóa trên App Mobile.'
    );
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi tạo đơn đặt phòng trực tiếp');
  }
};

// 2. Lấy danh sách homestay thuộc quyền quản lý của Host
const getHostHomestays = async (req, res) => {
  try {
    const hostId = req.query.hostId || req.user?.id || 8;
    const data = await HomestayModel.findByHostId(hostId);
    return success(res, data, 'Lấy danh sách homestay của chủ nhà thành công');
  } catch (err) {
    return error(res, 'Lỗi khi tải danh sách homestay');
  }
};

// 3. Lấy danh sách đơn đặt phòng thuộc homestay của Host
const getHostBookings = async (req, res) => {
  try {
    const hostId = req.query.hostId || req.user?.id || 8;
    const { homestayId, status, source, search } = req.query;

    const data = await BookingModel.findAll({
      hostId,
      homestayId,
      status,
      source,
      search,
    });

    return success(res, data, 'Lấy danh sách đơn phòng của host thành công');
  } catch (err) {
    return error(res, 'Lỗi khi tải danh sách đơn đặt phòng');
  }
};

// 4. Thống kê doanh thu cho Host (Doanh thu tổng, Hoa hồng trả app, Thực nhận của chủ nhà)
const getHostDashboard = async (req, res) => {
  try {
    const hostId = req.query.hostId || req.user?.id || 8;
    const stats = await BookingModel.getHostStats(hostId);
    const homestays = await HomestayModel.findByHostId(hostId);

    return success(
      res,
      {
        stats,
        homestaysCount: homestays.length,
      },
      'Lấy thống kê doanh thu chủ nhà thành công'
    );
  } catch (err) {
    return error(res, 'Lỗi khi lấy thống kê chủ nhà');
  }
};

// 5. Quick Manage: Xem thông tin homestay và lịch bận qua token không cần đăng nhập
const getQuickManageByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const homestay = await HomestayModel.findByToken(token);
    if (!homestay) {
      return notFound(res, 'Link quản lý nhanh không hợp lệ hoặc đã hết hạn.');
    }

    const unavailableDates = await BookingModel.getUnavailableDates(homestay.id);
    const recentBookings = await BookingModel.findAll({ homestayId: homestay.id, limit: 10 });

    return success(
      res,
      {
        homestay,
        unavailableDates,
        recentBookings,
      },
      'Lấy thông tin quản lý nhanh homestay thành công'
    );
  } catch (err) {
    return error(res, 'Lỗi khi tải thông tin homestay qua link nhanh');
  }
};

module.exports = {
  createDirectBooking,
  getHostHomestays,
  getHostBookings,
  getHostDashboard,
  getQuickManageByToken,
};
