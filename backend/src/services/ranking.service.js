/**
 * Property Ranking & Location Distance Service
 * Tuân thủ nguyên tắc: Tất định, giải thích được, KHÔNG sử dụng Machine Learning.
 */
class PropertyRankingService {
  /**
   * Tính khoảng cách địa lý giữa 2 tọa độ theo công thức Haversine.
   *
   * @param {number} lat1 Vĩ độ điểm 1 (VD: vị trí khách)
   * @param {number} lon1 Kinh độ điểm 1
   * @param {number} lat2 Vĩ độ điểm 2 (VD: tọa độ homestay)
   * @param {number} lon2 Kinh độ điểm 2
   * @returns {number} Khoảng cách tính bằng Kilomet (km) làm tròn 1 chữ số thập phân
   */
  static calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    if (!Number.isFinite(lat1) || !Number.isFinite(lon1) || !Number.isFinite(lat2) || !Number.isFinite(lon2)) {
      return null;
    }

    const R = 6371; // Bán kính trái đất tính bằng km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  }

  /**
   * Tính điểm xếp hạng (Ranking Score) của Homestay theo mô hình Weighted Scoring.
   *
   * Công thức:
   * Score = (Rating * 20)           [Max 100 điểm, đánh giá chất lượng trải nghiệm]
   *       + (min(ReviewCount, 50) * 0.4) [Max 20 điểm, độ tin cậy từ cộng đồng]
   *       + (isFeatured ? 15 : 0)   [Thưởng homestay nổi bật được ban quản trị gắn cờ]
   *       + (isHostVerified ? 15 : 0)[Thưởng chủ nhà đã xác minh danh tính]
   *       - (pricePenalty)          [Khấu trừ nhẹ nếu giá quá chênh lệch với mức trung bình]
   *
   * @param {Object} property Thông tin homestay
   * @returns {number} Điểm xếp hạng (0 - 150)
   */
  static calculatePropertyScore(property) {
    const rating = parseFloat(property.rating || 5.0);
    const reviewCount = parseInt(property.review_count || property.reviews || 0, 10);
    const isFeatured = Boolean(property.is_featured || property.featured);
    const isHostVerified = Boolean(property.is_host_verified || property.isVerified);

    let score = rating * 20; // 0 - 100
    score += Math.min(reviewCount, 50) * 0.4; // 0 - 20
    if (isFeatured) score += 15;
    if (isHostVerified) score += 15;

    return Number(score.toFixed(1));
  }

  /**
   * Sắp xếp và lọc danh sách Homestay theo xếp hạng hoặc khoảng cách.
   *
   * @param {Array} properties Danh sách homestay
   * @param {Object} options Tùy chọn lọc: userLat, userLon, maxDistanceKm, sortBy
   * @returns {Array} Danh sách homestay đã được tính điểm & sắp xếp
   */
  static rankAndFilterProperties(properties, { userLat, userLon, maxDistanceKm, sortBy = 'score' } = {}) {
    let list = properties.map((p) => {
      let distanceKm = null;
      if (Number.isFinite(userLat) && Number.isFinite(userLon) && Number.isFinite(p.latitude) && Number.isFinite(p.longitude)) {
        distanceKm = PropertyRankingService.calculateHaversineDistance(userLat, userLon, p.latitude, p.longitude);
      }

      const rankingScore = PropertyRankingService.calculatePropertyScore(p);
      return {
        ...p,
        distanceKm,
        rankingScore,
      };
    });

    // Lọc theo bán kính (nếu có yêu cầu khoảng cách tối đa)
    if (Number.isFinite(maxDistanceKm) && maxDistanceKm > 0) {
      list = list.filter((p) => p.distanceKm !== null && p.distanceKm <= maxDistanceKm);
    }

    // Sắp xếp
    if (sortBy === 'distance' && Number.isFinite(userLat)) {
      list.sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else {
      // Default: Sắp xếp theo Ranking Score cao nhất trước
      list.sort((a, b) => b.rankingScore - a.rankingScore);
    }

    return list;
  }
}

module.exports = PropertyRankingService;
