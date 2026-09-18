const FavoriteModel = require('../models/favorite.model');

class FavoriteService {
  static async getFavorites(userId) {
    return FavoriteModel.findByUserId(userId);
  }

  static async toggleFavorite(userId, homestayId) {
    if (!homestayId) {
      throw new Error('Thiếu mã homestay');
    }
    return FavoriteModel.toggle(userId, homestayId);
  }

  static async removeFavorite(userId, homestayId) {
    return FavoriteModel.remove(userId, homestayId);
  }
}

module.exports = FavoriteService;
