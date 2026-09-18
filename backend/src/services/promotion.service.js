const PromotionModel = require('../models/promotion.model');
const PointModel = require('../models/point.model');

class PromotionService {
  static async getActivePromotions(userId) {
    if (userId) {
      return PromotionModel.findMyVouchers(userId);
    }
    return PromotionModel.findAllActive();
  }

  static async getMyVouchers(userId) {
    return PromotionModel.findMyVouchers(userId);
  }

  static async getRedeemablePromotions() {
    return PromotionModel.findRedeemable();
  }

  static async checkVoucherCode(code, rawTotal = 0) {
    if (!code) {
      throw new Error('Vui lòng nhập mã voucher');
    }
    const promo = await PromotionModel.findByCode(code);
    if (!promo) {
      throw new Error('Mã giảm giá không tồn tại hoặc đã hết hạn');
    }

    const minAmount = parseFloat(promo.min_booking_amount || 0);
    if (rawTotal > 0 && rawTotal < minAmount) {
      throw new Error(`Mã này chỉ áp dụng cho đơn từ ${new Intl.NumberFormat('vi-VN').format(minAmount)} ₫`);
    }

    let discountAmount = 0;
    if (promo.discount_type === 'percent') {
      discountAmount = (rawTotal * parseFloat(promo.discount_value)) / 100;
      if (promo.max_discount_amount && discountAmount > parseFloat(promo.max_discount_amount)) {
        discountAmount = parseFloat(promo.max_discount_amount);
      }
    } else {
      discountAmount = parseFloat(promo.discount_value);
    }

    return {
      isValid: true,
      voucher: promo,
      discountAmount: Math.min(discountAmount, rawTotal),
      finalTotal: Math.max(0, rawTotal - discountAmount),
    };
  }

  static async redeemVoucher(userId, promotionId) {
    return PromotionModel.redeemWithPoints(userId, promotionId);
  }

  static async getPointHistory(userId) {
    return PointModel.findHistoryByUserId(userId);
  }
}

module.exports = PromotionService;
