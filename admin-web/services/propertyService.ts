import { apiRequest, buildAssetUrl } from "@/lib/apiClient";

export interface PropertyQueryFilters {
  location?: string;
  type?: string;
  guests?: number;
  checkIn?: string;
  checkOut?: string;
}

export interface PropertyAvailabilityResult {
  available: boolean;
  message: string;
}

export interface PropertyUnavailableDateRange {
  checkIn: string;
  checkOut: string;
  status: string;
}

export interface PropertySummary {
  id: number;
  hostId: number;
  title: string;
  description: string;
  type: string;
  price: number;
  location: string;
  city: string;
  country: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  status: string;
  image: string;
  featured: boolean;
  hostName: string;
  reviews: number;
  rating: number;
  manageToken?: string;
  manageTokenActive?: boolean;
  manageTokenExpiresAt?: string | null;
}

export interface PropertyReview {
  id: number;
  rating: number;
  comment: string;
  authorName: string;
  date: string;
}

export interface PropertyDetail extends PropertySummary {
  address: string;
  images: string[];
  originalImages?: string[];
  coverImageOriginal?: string;
  amenities: string[];
  reviewCount: number;
}

function normalizePropertySummary(property: any): PropertySummary {
  return {
    id: Number(property.id),
    hostId: Number(property.hostId || property.host_id),
    title: property.title,
    description: property.description || "",
    type: property.type || property.property_type,
    price: Number(property.price || property.price_per_night || 0),
    location: property.location,
    city: property.city,
    country: property.country,
    maxGuests: Number(property.maxGuests || property.max_guests || 0),
    bedrooms: Number(property.bedrooms || 0),
    bathrooms: Number(property.bathrooms || 0),
    status: property.status,
    image: buildAssetUrl(property.image || property.cover_image),
    featured: Boolean(property.featured),
    hostName: property.hostName,
    reviews: Number(property.reviews || 0),
    rating: Number(property.rating || 0),
    manageToken: property.manageToken || "",
    manageTokenActive: Boolean(property.manageTokenActive),
    manageTokenExpiresAt: property.manageTokenExpiresAt || null,
  };
}

function normalizePropertyDetail(property: any): PropertyDetail {
  const summary = normalizePropertySummary(property);

  return {
    ...summary,
    image: buildAssetUrl(
      property.displayImage || property.image || property.cover_image,
    ),
    address: property.address || property.street_address || "",
    images: (property.displayImages || property.images || [])
      .map((image: string) => buildAssetUrl(image))
      .filter(Boolean),
    originalImages: (property.originalImages || property.images || [])
      .map((image: string) => buildAssetUrl(image))
      .filter(Boolean),
    coverImageOriginal: buildAssetUrl(
      property.coverImageOriginal || property.cover_image || "",
    ),
    amenities: property.amenities || [],
    reviewCount: Number(property.reviewCount || 0),
    reviews:
      Array.isArray(property.reviews) && property.reviews.length > 0
        ? Number(property.reviews.length)
        : summary.reviews,
  };
}

function buildPropertyQueryString(filters: PropertyQueryFilters = {}) {
  const params = new URLSearchParams();

  if (filters.location?.trim()) {
    params.set("location", filters.location.trim());
  }

  if (filters.type?.trim()) {
    params.set("type", filters.type.trim());
  }

  if (Number.isFinite(filters.guests) && Number(filters.guests) > 0) {
    params.set("guests", String(filters.guests));
  }

  if (filters.checkIn?.trim()) {
    params.set("checkIn", filters.checkIn.trim());
  }

  if (filters.checkOut?.trim()) {
    params.set("checkOut", filters.checkOut.trim());
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function getProperties(filters: PropertyQueryFilters = {}) {
  const queryString = buildPropertyQueryString(filters);
  const data = await apiRequest<any[]>(`/api/properties${queryString}`);
  return data.map(normalizePropertySummary);
}

export async function getPropertyById(id: string | number) {
  const data = await apiRequest<any>(`/api/properties/${id}`);
  const detail = normalizePropertyDetail(data);

  return {
    ...detail,
    reviews: (data.reviews || []).map(
      (review: any): PropertyReview => ({
        id: Number(review.id),
        rating: Number(review.rating),
        comment: review.comment,
        authorName: review.authorName,
        date: review.date,
      }),
    ),
  };
}

export async function getPropertyAvailability(
  id: string | number,
  filters: { checkIn: string; checkOut: string },
) {
  const params = new URLSearchParams({
    checkIn: filters.checkIn,
    checkOut: filters.checkOut,
  });

  const data = await apiRequest<PropertyAvailabilityResult>(
    `/api/properties/${id}/availability?${params.toString()}`,
  );

  return {
    available: Boolean(data.available),
    message: String(data.message || ""),
  };
}

export async function getPropertyUnavailableDates(id: string | number) {
  const data = await apiRequest<{ ranges: PropertyUnavailableDateRange[] }>(
    `/api/properties/${id}/unavailable-dates`,
  );

  return (data.ranges || []).map((range) => ({
    checkIn: String(range.checkIn || ""),
    checkOut: String(range.checkOut || ""),
    status: String(range.status || ""),
  }));
}

export async function getAdminProperties() {
  const data = await apiRequest<any[]>("/api/admin/properties");
  return data.map(normalizePropertySummary);
}

export async function getAdminPropertyById(id: string | number) {
  const data = await apiRequest<any>(`/api/admin/properties/${id}`);
  return {
    ...normalizePropertyDetail(data),
    reviews: (data.reviews || []).map(
      (review: any): PropertyReview => ({
        id: Number(review.id),
        rating: Number(review.rating),
        comment: review.comment,
        authorName: review.authorName,
        date: review.date,
      }),
    ),
  };
}

export async function updatePropertyStatus(id: number, status: string) {
  return apiRequest<{ message: string; data: { id: number; status: string } }>(
    `/api/admin/properties/${id}/status`,
    {
      method: "PUT",
      body: JSON.stringify({ status }),
    },
  );
}

export async function updateAdminProperty(id: number, formData: FormData) {
  return apiRequest<{ message: string; data: PropertyDetail }>(
    `/api/admin/properties/${id}`,
    {
      method: "PUT",
      body: formData,
    },
  );
}

export async function deleteProperty(id: number) {
  return apiRequest<{ message: string }>(`/api/admin/properties/${id}`, {
    method: "DELETE",
  });
}

export async function regenerateAdminManageLink(id: number) {
  return apiRequest<{
    message: string;
    data: { id: number; manageToken: string; manageTokenActive: boolean };
  }>(`/api/admin/properties/${id}/manage-link/regenerate`, {
    method: "POST",
  });
}

export async function updateAdminManageLinkState(id: number, isActive: boolean) {
  return apiRequest<{
    message: string;
    data: { id: number; manageToken: string; manageTokenActive: boolean };
  }>(`/api/admin/properties/${id}/manage-link/status`, {
    method: "PUT",
    body: JSON.stringify({ isActive }),
  });
}

export async function getHostProperties(hostId?: number) {
  const query = typeof hostId === "number" ? `?hostId=${hostId}` : "";
  const data = await apiRequest<any[]>(`/api/host/properties${query}`);
  return data.map(normalizePropertySummary);
}

export async function getHostPropertyById(id: string | number, hostId?: number) {
  const query = typeof hostId === "number" ? `?hostId=${hostId}` : "";
  const data = await apiRequest<any>(`/api/host/properties/${id}${query}`);

  return {
    ...normalizePropertyDetail(data),
    reviews: (data.reviews || []).map(
      (review: any): PropertyReview => ({
        id: Number(review.id),
        rating: Number(review.rating),
        comment: review.comment,
        authorName: review.authorName,
        date: review.date,
      }),
    ),
  };
}

export async function createHostProperty(formData: FormData) {
  return apiRequest<{ message: string; data: PropertyDetail }>(
    "/api/host/properties",
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function updateHostProperty(
  id: number,
  formData: FormData,
) {
  return apiRequest<{ message: string; data: PropertyDetail }>(
    `/api/host/properties/${id}`,
    {
      method: "PUT",
      body: formData,
    },
  );
}

export async function deleteHostProperty(id: number, hostId?: number) {
  const query = typeof hostId === "number" ? `?hostId=${hostId}` : "";
  return apiRequest<{ message: string }>(
    `/api/host/properties/${id}${query}`,
    {
      method: "DELETE",
    },
  );
}

export async function regenerateHostManageLink(id: number, hostId?: number) {
  const query = typeof hostId === "number" ? `?hostId=${hostId}` : "";
  return apiRequest<{
    message: string;
    data: { id: number; manageToken: string; manageTokenActive: boolean };
  }>(`/api/host/properties/${id}/manage-link/regenerate${query}`, {
    method: "POST",
  });
}

export async function updateHostManageLinkState(
  id: number,
  isActive: boolean,
  hostId?: number,
) {
  const query = typeof hostId === "number" ? `?hostId=${hostId}` : "";
  return apiRequest<{
    message: string;
    data: { id: number; manageToken: string; manageTokenActive: boolean };
  }>(`/api/host/properties/${id}/manage-link/status${query}`, {
    method: "PUT",
    body: JSON.stringify({ isActive }),
  });
}
