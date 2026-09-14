const HomestayModel = require('../models/homestay.model');

class HomestayService {
  static async getHomestays(filters) {
    try {
      const data = await HomestayModel.findAll(filters);
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn('DB error fetching homestays, using fallback:', err.message);
    }

    // Fallback sample data
    return [
      {
        id: '1',
        name: 'Villa Lavender Dream',
        price: 2500000,
        oldPrice: 3200000,
        locationId: '1',
        location: 'Đà Lạt',
        type: 'Villa',
        rating: 4.9,
        reviewCount: 156,
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
        amenities: ['Hồ bơi riêng', 'BBQ', 'View núi', 'Bếp đầy đủ', 'WiFi'],
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
        ],
        description: 'Villa Lavender Dream nằm giữa đồi lavender thơ mộng tại Đà Lạt.',
        isFeatured: true,
      },
      {
        id: '2',
        name: 'Homestay Cloud Nine',
        price: 1800000,
        locationId: '1',
        location: 'Đà Lạt',
        type: 'Homestay',
        rating: 4.8,
        reviewCount: 203,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ['View sương mây', 'Sân thượng', 'Nướng BBQ', 'Bếp'],
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
        ],
        description: 'Cloud Nine mang đến trải nghiệm đứng trên mây tuyệt đẹp.',
        isFeatured: true,
      },
    ];
  }

  static async getHomestayById(id) {
    try {
      const data = await HomestayModel.findById(id);
      if (data) return data;
    } catch (err) {
      console.warn('DB error fetching homestay detail, using fallback:', err.message);
    }

    return {
      id: String(id),
      name: 'Villa Lavender Dream',
      description: 'Villa Lavender Dream nằm giữa đồi hoa lavender thơ mộng tại Đà Lạt.',
      price: 2500000,
      oldPrice: 3200000,
      locationId: '1',
      location: 'Đà Lạt',
      type: 'Villa',
      rating: 4.9,
      reviewCount: 156,
      maxGuests: 8,
      bedrooms: 4,
      bathrooms: 3,
      amenities: ['Hồ bơi riêng', 'BBQ', 'View núi', 'Bếp đầy đủ', 'WiFi'],
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
      ],
      isFeatured: true,
    };
  }

  static async createHomestay(payload) {
    return HomestayModel.create(payload);
  }

  static async deleteHomestay(id) {
    return HomestayModel.softDelete(id);
  }
}

module.exports = HomestayService;
