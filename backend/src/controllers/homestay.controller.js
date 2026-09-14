const HomestayService = require('../services/homestay.service');
const { success, notFound, error } = require('../utils/response');

const getHomestays = async (req, res) => {
  try {
    const { locationId, typeId, search, isFeatured, isNew } = req.query;
    const data = await HomestayService.getHomestays({
      locationId,
      typeId,
      search,
      isFeatured: isFeatured === 'true',
      isNew: isNew === 'true',
    });
    return success(res, data, 'Lấy danh sách homestay thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy dữ liệu homestay');
  }
};

const getHomestayById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await HomestayService.getHomestayById(id);
    if (!data) {
      return notFound(res, 'Không tìm thấy homestay với ID yêu cầu');
    }
    return success(res, data, 'Lấy thông tin chi tiết homestay thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy thông tin homestay');
  }
};

module.exports = {
  getHomestays,
  getHomestayById,
};
