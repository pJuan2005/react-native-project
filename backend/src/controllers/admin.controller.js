const AdminService = require('../services/admin.service');
const { success, badRequest, notFound, error, created } = require('../utils/response');

const getDashboardStats = async (req, res) => {
  try {
    const data = await AdminService.getDashboardStats();
    return success(res, data, 'Lấy thống kê dashboard thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy dữ liệu thống kê quản trị');
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status, search } = req.query;
    const data = await AdminService.getAllBookings({ status, search });
    return success(res, data, 'Lấy danh sách đơn đặt phòng thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy danh sách đơn đặt phòng');
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancelled_reason } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return badRequest(res, 'Trạng thái đơn phòng không hợp lệ');
    }

    await AdminService.updateBookingStatus(id, status, cancelled_reason);
    return success(res, null, `Cập nhật trạng thái đơn sang "${status}" thành công`);
  } catch (err) {
    return error(res, 'Lỗi khi cập nhật trạng thái đơn đặt phòng');
  }
};

const createHomestay = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      old_price,
      location_id,
      type_id,
      max_guests,
      bedrooms,
      bathrooms,
      image_url,
      is_featured,
      is_new,
    } = req.body;

    if (!name || !price || !location_id || !type_id) {
      return badRequest(res, 'Vui lòng điền đầy đủ các trường bắt buộc');
    }

    const homestayId = await AdminService.createHomestay({
      name,
      description,
      price,
      oldPrice: old_price,
      locationId: location_id,
      typeId: type_id,
      maxGuests: max_guests,
      bedrooms,
      bathrooms,
      imageUrl: image_url,
      isFeatured: is_featured,
      isNew: is_new,
    });

    return created(res, { id: homestayId }, 'Thêm homestay mới thành công');
  } catch (err) {
    return error(res, 'Lỗi khi thêm homestay mới');
  }
};

const deleteHomestay = async (req, res) => {
  try {
    const { id } = req.params;
    await AdminService.deleteHomestay(id);
    return success(res, null, 'Đã ngừng kinh doanh homestay thành công');
  } catch (err) {
    return error(res, 'Lỗi khi xóa homestay');
  }
};

module.exports = {
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  createHomestay,
  deleteHomestay,
};
