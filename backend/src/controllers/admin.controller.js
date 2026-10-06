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
    const { status, source, search } = req.query;
    const data = await AdminService.getAllBookings({ status, source, search });
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

const createProperty = async (req, res) => {
  try {
    const {
      name,
      title,
      description,
      price,
      price_per_night,
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

    const finalName = name || title;
    const finalPrice = price_per_night || price;
    if (!finalName || !finalPrice || !location_id || !type_id) {
      return badRequest(res, 'Vui lòng điền đầy đủ các trường bắt buộc');
    }

    const propertyId = await AdminService.createProperty({
      name: finalName,
      title: finalName,
      description,
      price: finalPrice,
      price_per_night: finalPrice,
      old_price,
      location_id,
      type_id,
      max_guests,
      bedrooms,
      bathrooms,
      image_url,
      is_featured,
      is_new,
    });

    return created(res, { id: propertyId }, 'Thêm mới chỗ nghỉ thành công');
  } catch (err) {
    return error(res, 'Lỗi khi thêm mới chỗ nghỉ');
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await AdminService.deleteProperty(id);
    if (!ok) {
      return notFound(res, 'Không tìm thấy chỗ nghỉ với ID yêu cầu');
    }
    return success(res, null, 'Đã ẩn/xóa chỗ nghỉ thành công');
  } catch (err) {
    return error(res, 'Lỗi khi xóa chỗ nghỉ');
  }
};

module.exports = {
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  createProperty,
  createHomestay: createProperty,
  deleteProperty,
  deleteHomestay: deleteProperty,
};
