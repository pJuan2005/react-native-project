const BookingModel = require('../models/booking.model');
const HomestayModel = require('../models/homestay.model');
const UserModel = require('../models/user.model');
const { success, badRequest, notFound, error, created } = require('../utils/response');

// 1. Tạo đơn đặt phòng trực tiếp tại quầy chỗ nghỉ (Khách Walk-in)
const createDirectBooking = async (req, res) => {
  try {
    const {
      propertyId,
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
      propertyId: propertyId || homestayId,
      homestayId: propertyId || homestayId,
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

// 2. Lấy danh sách property thuộc quyền quản lý của Host
const getHostProperties = async (req, res) => {
  try {
    const hostId = req.query.hostId || req.user?.id || 2;
    const data = await HomestayModel.findByHostId(hostId);
    return success(res, data, 'Lấy danh sách chỗ nghỉ của chủ nhà thành công');
  } catch (err) {
    return error(res, 'Lỗi khi tải danh sách chỗ nghỉ');
  }
};

// 3. Lấy danh sách đơn đặt phòng thuộc property của Host
const getHostBookings = async (req, res) => {
  try {
    const hostId = req.query.hostId || req.user?.id || 2;
    const { propertyId, homestayId, status, source, search } = req.query;

    const data = await BookingModel.findAll({
      hostId,
      propertyId: propertyId || homestayId,
      status,
      source,
      search,
    });

    return success(res, data, 'Lấy danh sách đơn đặt phòng của chủ nhà thành công');
  } catch (err) {
    return error(res, 'Lỗi khi tải danh sách đơn đặt phòng');
  }
};

// 4. Lấy thống kê Dashboard cho Host
const getHostDashboard = async (req, res) => {
  try {
    const hostId = req.query.hostId || req.user?.id || 2;
    const properties = await HomestayModel.findByHostId(hostId);
    const bookings = await BookingModel.findAll({ hostId });

    const totalProperties = properties.length;
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed');
    const grossRevenue = confirmedBookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
    const hostPayout = confirmedBookings.reduce((sum, b) => sum + parseFloat(b.host_payout_amount || 0), 0);

    return success(res, {
      totalProperties,
      totalHomestays: totalProperties,
      totalBookings,
      grossRevenue,
      hostPayout,
      recentBookings: bookings.slice(0, 5),
    }, 'Lấy thông tin dashboard chủ nhà thành công');
  } catch (err) {
    return error(res, 'Lỗi khi tải dữ liệu dashboard chủ nhà');
  }
};

// 5. Quản lý nhanh qua Token
const getQuickManageByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const property = await HomestayModel.findByToken(token);
    if (!property) {
      return notFound(res, 'Liên kết quản lý nhanh không tồn tại hoặc đã bị vô hiệu hóa');
    }

    const bookings = await BookingModel.findAll({
      propertyId: property.id,
      limit: 20,
    });

    return success(res, {
      property,
      homestay: property,
      recentBookings: bookings,
    }, 'Xác thực liên kết quản lý nhanh thành công');
  } catch (err) {
    return error(res, 'Lỗi khi tải thông tin quản lý nhanh');
  }
};

module.exports = {
  createDirectBooking,
  getHostHomestays: getHostProperties,
  getHostProperties,
  getHostBookings,
  getHostDashboard,
  getQuickManageByToken,
};
