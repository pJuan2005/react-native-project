const LocationService = require('../services/location.service');
const { success, notFound, error } = require('../utils/response');

const getLocations = async (req, res) => {
  try {
    const data = await LocationService.getAllLocations();
    return success(res, data, 'Lấy danh sách địa điểm thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy danh sách địa điểm');
  }
};

const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await LocationService.getLocationById(id);
    return success(res, data, 'Lấy thông tin chi tiết địa điểm thành công');
  } catch (err) {
    return notFound(res, err.message || 'Không tìm thấy địa điểm');
  }
};

module.exports = {
  getLocations,
  getLocationById,
};
