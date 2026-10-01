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
    errors.title = "Title is required.";
  }

  if (!form.type.trim()) {
    errors.type = "Property type is required.";
  }

  if (!form.address.trim()) {
    errors.address = "Address is required.";
  }

  if (!form.city.trim()) {
    errors.city = "City is required.";
  }

  if (!form.country.trim()) {
    errors.country = "Country is required.";
  }

  const price = Number(form.price);
  if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Price per night must be greater than 0.";
  }

  if (!form.description.trim() || form.description.trim().length < 20) {
    errors.description = "Description must be at least 20 characters.";
  }

  const maxGuests = Number(form.maxGuests);
  if (!Number.isInteger(maxGuests) || maxGuests <= 0) {
    errors.maxGuests = "Maximum guests must be greater than 0.";
  }

  const bedrooms = Number(form.bedrooms);
  if (!Number.isInteger(bedrooms) || bedrooms < 0) {
    errors.bedrooms = "Bedrooms value is invalid.";
  }

  const bathrooms = Number(form.bathrooms);
  if (!Number.isFinite(bathrooms) || bathrooms < 0) {
    errors.bathrooms = "Bathrooms value is invalid.";
  }

  if (options.requireCoverImage && !options.hasCoverImage) {
    errors.coverImage = "A cover image is required for this property.";
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
  return `Image "${file.name}" exceeds ${MAX_PROPERTY_IMAGE_SIZE_MB} MB. Please choose a smaller file.`;
}

export function isImageFileTooLarge(file: File) {
  return file.size > MAX_PROPERTY_IMAGE_SIZE_BYTES;
}
