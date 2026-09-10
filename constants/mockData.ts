export type Homestay = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  locationId: string;
  location: string;
  type: string;
  rating: number;
  reviewCount: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  description: string;
  isNew?: boolean;
  isFeatured?: boolean;
};

export type Location = {
  id: string;
  name: string;
  description: string;
  homestayCount: number;
  icon: 'location-outline' | 'leaf-outline' | 'water-outline' | 'compass-outline' | 'home-outline';
  image: string;
};

export type CustomerProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  avatar: string;
};

export type Booking = {
  id: string;
  homestayId: string;
  homestayName: string;
  homestayImage: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: string;
};

export const mockLocations: Location[] = [
  { id: '1', name: 'Đà Lạt', description: 'Thành phố ngàn hoa mát mẻ quanh năm', homestayCount: 25, icon: 'leaf-outline', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8fdf1f9?auto=format&fit=crop&w=900&q=80' },
  { id: '2', name: 'Sa Pa', description: 'Sapa sương mơ, đà lạt miền Bắc', homestayCount: 18, icon: 'compass-outline', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80' },
  { id: '3', name: 'Phú Quốc', description: 'Hòn ngọc ngào đảo biển xanh', homestayCount: 32, icon: 'water-outline', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80' },
  { id: '4', name: 'Hội An', description: 'Phố cổ ngàn đèn lồng lung linh', homestayCount: 15, icon: 'home-outline', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80' },
  { id: '5', name: 'Nha Trang', description: 'Thành phố biển xinh đẹp miền Trung', homestayCount: 22, icon: 'water-outline', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80' },
];

export const mockHomestays: Homestay[] = [
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
    amenities: ['Hồ bơi riêng', 'BBQ', 'View núi', 'Bếp đầy đủ', 'WiFi', 'Điều hòa', 'Bãi đỗ xe', 'Sân vườn'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Villa Lavender Dream nằm giữa đồi lavender thơ mộng tại Đà Lạt. Không gian rộng rãi, view núi tuyệt đẹp, hồ bơi riêng và khu BBQ ngoài trời. Lý tưởng cho gia đình, nhóm bạn nghỉ dưỡng cuối tuần.',
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
    amenities: ['View sương mây', 'Sân thượng', 'Nướng BBQ', 'Bếp', 'WiFi', 'Nóng lạnh', 'Máy giặt', 'Xe đưa đón'],
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1564013799859-5f3b72abc431?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Cloud Nine mang đến trải nghiệm "đứng trên mây" với view sương mây tuyệt đẹp mỗi sáng sớm. Không gian ấm cúng, gỗ tự nhiên, sân thượng rộng rãi cho tiệc nướng BBQ thư giãn.',
    isFeatured: true,
  },
  {
    id: '3',
    name: 'Seaside Bliss Villa',
    price: 3500000,
    oldPrice: 4200000,
    locationId: '3',
    location: 'Phú Quốc',
    type: 'Villa',
    rating: 4.9,
    reviewCount: 89,
    maxGuests: 10,
    bedrooms: 5,
    bathrooms: 4,
    amenities: ['Biển ngay trước cửa', 'Hồ bơi vô cực', 'BBQ', 'Bếp', 'WiFi', 'Điều hòa', 'Bãi đỗ xe', 'Dịch vụ massage', 'Xe đạp'],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Seaside Bliss Villa tọa lạc ngay bãi biển Khem đẹp nhất Phú Quốc. Hồ bơi vô cực nhìn ra biển, 5 phòng ngủ sang trọng, đầy đủ tiện nghi cao cấp. Thiên đường nghỉ dưỡng gia đình, nhóm lớn.',
    isFeatured: true,
    isNew: true,
  },
  {
    id: '4',
    name: 'Rice Terrace Homestay',
    price: 1200000,
    locationId: '2',
    location: 'Sa Pa',
    type: 'Homestay',
    rating: 4.7,
    reviewCount: 134,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['View ruộng bậc thang', 'Sương mây', 'Lò nướng', 'Bếp', 'WiFi', 'Nóng lạnh', 'Hướng dẫn tour', 'Xe máy cho thuê'],
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Homestay truyền thống người Mông tại Sa Pa với view ruộng bậc thang tuyệt đẹp. Không gian gỗ nguyên bản, ấm cúng, gần chợ Sa Pa và Fansipan. Trải nghiệm văn hóa bản địa độc đáo.',
    isNew: true,
  },
  {
    id: '5',
    name: 'Ancient Town Riverside',
    price: 2100000,
    locationId: '4',
    location: 'Hội An',
    type: 'Homestay',
    rating: 4.8,
    reviewCount: 178,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['Gần phố cổ', 'View sông', 'Xe đạp miễn phí', 'Bếp', 'WiFi', 'Điều hòa', 'Máy giặt', 'Tour đèn lồng'],
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Ancient Town Riverside tọa lạc ngay bên sông Thu Bồn, chỉ 5 phút đi bộ đến phố cổ Hội An. Kiến trúc cổ truyền, view sông thơ mộng, xe đạp miễn phí khám phá phố cổ về đêm.',
    isFeatured: true,
  },
  {
    id: '6',
    name: 'Ocean View Resort',
    price: 2800000,
    oldPrice: 3500000,
    locationId: '5',
    location: 'Nha Trang',
    type: 'Resort',
    rating: 4.6,
    reviewCount: 92,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['View biển panoramic', 'Hồ bơi', 'Spa', 'Nhà hàng', 'WiFi', 'Điều hòa', 'Bãi đỗ xe', 'Thư viện sách', 'Kayak'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Ocean View Resort Nha Trang với view biển panoramic 180 độ. Phòng nghỉ sang trọng, hồ bơi ngoài trời, spa thư giãn, nhà hàng ăn uống ngon. Lý tưởng cho kỳ nghỉ couples hoặc gia đình nhỏ.',
    isNew: true,
  },
  {
    id: '7',
    name: 'Pine Hill Cabin',
    price: 950000,
    locationId: '1',
    location: 'Đà Lạt',
    type: 'Cabin',
    rating: 4.5,
    reviewCount: 67,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['Rừng thông', 'Lò sưởi', 'BBQ', 'Bếp', 'WiFi', 'Nóng lạnh', 'View đồi', 'Đường đi bộ'],
    images: [
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Pine Hill Cabin giấu mình trong rừng thông Đà Lạt mát mẻ. Kiến trúc cabin gỗ ấm áp, lò sưởi thơ mộng, khu BBQ ngoài trời. Không gian riêng tư, bình yên cho cặp đôi hoặc gia đình nhỏ.',
  },
  {
    id: '8',
    name: 'Bamboo Eco Homestay',
    price: 1500000,
    locationId: '4',
    location: 'Hội An',
    type: 'Eco Homestay',
    rating: 4.7,
    reviewCount: 112,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['Kiến trúc tre', 'Vuông vườn', 'Nấu ăn cùng chủ nhà', 'Xe đạp', 'WiFi', 'Điều hòa', 'Yoga buổi sáng', 'Tour làng nghề'],
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Bamboo Eco Homestay Hội An với kiến trúc tre bambu độc đáo, thân thiện môi trường. Trải nghiệm nấu ăn cùng chủ nhà, yoga buổi sáng, tham quan làng nghề truyền thống. Không gian xanh, mát, chữa lành.',
  },
];

export const mockUser: CustomerProfile = {
  id: '1',
  name: 'Phạm Xuân Chuẩn',
  email: 'phamchuan2608@gmail.com',
  phone: '0901234567',
  address: 'Hà Nội, Việt Nam',
  birthDate: '01/01/2000',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
};

export const mockBookings: Booking[] = [
  {
    id: 'BK001',
    homestayId: '1',
    homestayName: 'Villa Lavender Dream',
    homestayImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    location: 'Đà Lạt',
    checkIn: '2026-09-15',
    checkOut: '2026-09-17',
    guests: 4,
    totalPrice: 5000000,
    status: 'confirmed',
    createdAt: '2026-08-20',
  },
  {
    id: 'BK002',
    homestayId: '3',
    homestayName: 'Seaside Bliss Villa',
    homestayImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80',
    location: 'Phú Quốc',
    checkIn: '2026-10-01',
    checkOut: '2026-10-04',
    guests: 6,
    totalPrice: 10500000,
    status: 'pending',
    createdAt: '2026-08-25',
  },
  {
    id: 'BK003',
    homestayId: '5',
    homestayName: 'Ancient Town Riverside',
    homestayImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
    location: 'Hội An',
    checkIn: '2026-07-20',
    checkOut: '2026-07-22',
    guests: 3,
    totalPrice: 4200000,
    status: 'completed',
    createdAt: '2026-07-10',
  },
];

export const formatPrice = (price: number) => `${new Intl.NumberFormat('vi-VN').format(price)} ₫`;

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};