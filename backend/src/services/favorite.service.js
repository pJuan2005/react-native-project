const FavoriteModel = require('../models/favorite.model');

class FavoriteService {
  static async getFavorites(userId) {
    return FavoriteModel.findByUserId(userId);
  }

  static async toggleFavorite(userId, propertyId) {
    if (!propertyId) {
      throw new Error('Thiếu mã chỗ nghỉ');
    }
    return FavoriteModel.toggle(userId, propertyId);
  }

  static async removeFavorite(userId, propertyId) {
    return FavoriteModel.remove(userId, propertyId);
  }
}

module.exports = FavoriteService;
