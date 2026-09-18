const FavoriteService = require('../services/favorite.service');
const { success, badRequest, error } = require('../utils/response');

const getFavorites = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id || '1';
    const data = await FavoriteService.getFavorites(userId);
    return success(res, data, 'Lấy danh sách homestay yêu thích thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy danh sách yêu thích');
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const userId = req.body.userId || req.query.userId || req.user?.id || '1';
    const { homestayId } = req.body;

    const result = await FavoriteService.toggleFavorite(userId, homestayId);
    return success(res, result, result.message);
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi thao tác yêu thích');
  }
};

const removeFavorite = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId || req.user?.id || '1';
    const { homestayId } = req.params;

    await FavoriteService.removeFavorite(userId, homestayId);
    return success(res, null, 'Đã xóa khỏi danh sách yêu thích');
  } catch (err) {
    return error(res, 'Lỗi khi xóa homestay yêu thích');
  }
};

module.exports = {
  getFavorites,
  toggleFavorite,
  removeFavorite,
};
