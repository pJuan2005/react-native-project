import type { PropertyDetail } from "@/services/propertyService";

export const PROPERTY_TYPE_OPTIONS = [
  "Villa",
  "Apartment",
  "Studio",
  "House",
  "Condo",
  "Cabin",
  "Cottage",
  "Penthouse",
  "Bungalow",
];

export const AMENITY_OPTIONS = [
  "WiFi",
  "Full Kitchen",
  "Air Conditioning",
  "Parking",
  "Pool",
  "Beachfront",
  "Fireplace",
  "Washer/Dryer",
  "Gym Access",
  "Hot Tub",
  "BBQ Grill",
  "Smart TV",
  "Workspace",
  "Elevator",
  "Breakfast Included",
  "Pet Friendly",
  "Sauna",
  "Mountain View",
  "City View",
  "Sea View",
];

export const MAX_PROPERTY_IMAGE_SIZE_MB = 15;
export const MAX_PROPERTY_IMAGE_SIZE_BYTES =
  MAX_PROPERTY_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_PROPERTY_IMAGE_COUNT = 10;

export interface PropertyFormState {
  title: string;
  type: string;
  address: string;
  city: string;
  country: string;
  price: string;
  description: string;
  maxGuests: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
}

export type PropertyFormErrors = Partial<
  Record<keyof PropertyFormState | "coverImage", string>
>;

export function createEmptyPropertyForm(): PropertyFormState {
  return {
    title: "",
    type: PROPERTY_TYPE_OPTIONS[0],
    address: "",
    city: "",
    country: "",
    price: "",
    description: "",
    maxGuests: "2",
    bedrooms: "1",
    bathrooms: "1",
    amenities: [],
  };
}

export function createPropertyFormFromDetail(
  property: PropertyDetail,
): PropertyFormState {
  return {
    title: property.title,
    type: property.type,
    address: property.address,
    city: property.city,
    country: property.country,
    price: String(property.price),
    description: property.description,
    maxGuests: String(property.maxGuests),
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    amenities: [...property.amenities],
  };
}

interface ValidateOptions {
  requireCoverImage?: boolean;
  hasCoverImage?: boolean;
}

export function validatePropertyForm(
  form: PropertyFormState,
  options: ValidateOptions = {},
): PropertyFormErrors {
  const errors: PropertyFormErrors = {};

  if (!form.title.trim()) {
    errors.title = "Vui lòng nhập tên chỗ nghỉ.";
  }

  if (!form.type.trim()) {
    errors.type = "Vui lòng chọn loại hình chỗ nghỉ.";
  }

  if (!form.address.trim()) {
    errors.address = "Vui lòng nhập địa chỉ chỗ nghỉ.";
  }

  if (!form.city.trim()) {
    errors.city = "Vui lòng nhập tỉnh / thành phố.";
  }

  if (!form.country.trim()) {
    errors.country = "Vui lòng nhập quốc gia.";
  }

  const price = Number(form.price);
  if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Giá thuê mỗi đêm phải lớn hơn 0 ₫.";
  }

  if (!form.description.trim() || form.description.trim().length < 20) {
    errors.description = "Mô tả chỗ nghỉ phải có ít nhất 20 ký tự.";
  }

  const maxGuests = Number(form.maxGuests);
  if (!Number.isInteger(maxGuests) || maxGuests <= 0) {
    errors.maxGuests = "Số lượng khách tối đa phải lớn hơn 0.";
  }

  const bedrooms = Number(form.bedrooms);
  if (!Number.isInteger(bedrooms) || bedrooms < 0) {
    errors.bedrooms = "Số lượng phòng ngủ không hợp lệ.";
  }

  const bathrooms = Number(form.bathrooms);
  if (!Number.isFinite(bathrooms) || bathrooms < 0) {
    errors.bathrooms = "Số lượng phòng tắm không hợp lệ.";
  }

  if (options.requireCoverImage && !options.hasCoverImage) {
    errors.coverImage = "Vui lòng tải lên ảnh bìa đại diện cho chỗ nghỉ.";
  }

  return errors;
}

interface CreateFormDataOptions {
  form: PropertyFormState;
  hostId?: number;
  status?: string;
  coverImage?: File | null;
  detailImages?: File[];
  removedDetailImages?: string[];
}

export function createPropertyFormData({
  form,
  hostId,
  status,
  coverImage,
  detailImages = [],
  removedDetailImages = [],
}: CreateFormDataOptions): FormData {
  const formData = new FormData();

  if (hostId) {
    formData.append("hostId", String(hostId));
  }

  formData.append("title", form.title.trim());
  formData.append("type", form.type.trim());
  formData.append("address", form.address.trim());
  formData.append("city", form.city.trim());
  formData.append("country", form.country.trim());
  formData.append("price", form.price);
  formData.append("description", form.description.trim());
  formData.append("maxGuests", form.maxGuests);
  formData.append("bedrooms", form.bedrooms);
  formData.append("bathrooms", form.bathrooms);
  formData.append("amenities", JSON.stringify(form.amenities));

  if (status) {
    formData.append("status", status);
  }

  if (coverImage) {
    formData.append("coverImage", coverImage);
  }

  for (const image of detailImages) {
    formData.append("detailImages", image);
  }

  if (removedDetailImages.length > 0) {
    formData.append(
      "removedDetailImages",
      JSON.stringify(removedDetailImages),
    );
  }

  return formData;
}

export function buildImageSizeError(file: File) {
  return `Tệp ảnh "${file.name}" vượt quá dung lượng cho phép (${MAX_PROPERTY_IMAGE_SIZE_MB} MB). Vui lòng chọn tệp nhỏ hơn.`;
}

export function isImageFileTooLarge(file: File) {
  return file.size > MAX_PROPERTY_IMAGE_SIZE_BYTES;
}
