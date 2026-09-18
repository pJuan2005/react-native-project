const LocationModel = require('../models/location.model');
const HomestayModel = require('../models/homestay.model');

class LocationService {
  static async getAllLocations() {
    return LocationModel.findAll();
  }

  static async getLocationById(id) {
    const location = await LocationModel.findById(id);
    if (!location) {
      throw new Error('Không tìm thấy địa điểm');
    }
    const homestays = await HomestayModel.findAll({ locationId: id });
    return {
      ...location,
      homestays,
    };
  }
}

module.exports = LocationService;
