"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  FileImage,
  ImagePlus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import {
  deleteHostProperty,
  getHostPropertyById,
  updateHostProperty,
} from "@/services/propertyService";
import {
  AMENITY_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  MAX_PROPERTY_IMAGE_COUNT,
  MAX_PROPERTY_IMAGE_SIZE_MB,
  buildImageSizeError,
  validatePropertyForm,
  createPropertyFormData,
  createEmptyPropertyForm,
  createPropertyFormFromDetail,
  isImageFileTooLarge,
  type PropertyFormErrors,
} from "@/lib/propertyForm";

type HostPropertyDetail = Awaited<ReturnType<typeof getHostPropertyById>>;

export default function HostEditPropertyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isInitializing } = useAuth();
  const hostId = user?.id;
  const propertyId = Number(params?.id);

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<HostPropertyDetail | null>(null);
  const [form, setForm] = useState(createEmptyPropertyForm());
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [detailImages, setDetailImages] = useState<File[]>([]);
  const [existingDetailImages, setExistingDetailImages] = useState<string[]>([]);
  const [removedDetailImages, setRemovedDetailImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<PropertyFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperty() {
      if (!hostId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getHostPropertyById(propertyId, hostId);
        setProperty(data);
        setForm(createPropertyFormFromDetail(data));
        setExistingDetailImages(data.originalImages || data.images || []);
      } catch (error) {
        setGeneralError(
          error instanceof Error
            ? error.message
            : "Unable to load the host property details.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (Number.isInteger(propertyId) && propertyId > 0) {
      fetchProperty();
    } else {
      setLoading(false);
      setGeneralError("Invalid property ID.");
    }
  }, [hostId, propertyId]);

  useEffect(() => {
    if (!coverImage) {
      setCoverPreview(property?.image || null);
      return;
    }

    const objectUrl = URL.createObjectURL(coverImage);
    setCoverPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [coverImage, property?.image]);

  function updateField(
    key: keyof typeof form,
    value: string | string[],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleAmenity(amenity: string) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity],
    }));
  }

  function removeExistingDetailImage(image: string) {
    setExistingDetailImages((prev) => prev.filter((item) => item !== image));
    setRemovedDetailImages((prev) =>
      prev.includes(image) ? prev : [...prev, image],
    );
  }

  function removeNewDetailImage(index: number) {
    setDetailImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hostId) {
      setGeneralError("Host session is invalid. Please sign in again.");
      return;
    }

    const validateErrors = validatePropertyForm(form, {
      requireCoverImage: true,
      hasCoverImage: Boolean(coverImage || property?.image),
    });

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      setGeneralError("Please review the property information before saving.");
      return;
    }

    try {
      setIsSubmitting(true);
      setGeneralError(null);

      const formData = createPropertyFormData({
        form,
        hostId,
        coverImage,
        detailImages,
        removedDetailImages,
      });

      const previousStatus = property?.status?.toLowerCase();
      const response = await updateHostProperty(propertyId, formData);
      const data = response.data as HostPropertyDetail;

      setProperty(data);
      setForm(createPropertyFormFromDetail(data));
      setExistingDetailImages(data.originalImages || data.images || []);
      setRemovedDetailImages([]);
      setDetailImages([]);
      setCoverImage(null);
      setErrors({});

      setNotice(
        previousStatus === "approved" && data.status.toLowerCase() === "pending"
          ? "Property updated. The listing has been moved back to pending review."
          : "Property updated successfully.",
      );
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : "Unable to update the property. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!hostId) {
      setGeneralError("Host session is invalid. Please sign in again.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this property? It will be hidden from the system.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteHostProperty(propertyId, hostId);
      router.push("/host/my-properties");
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : "Unable to delete the property.",
      );
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <PageState message="Loading property data..." />;
  }

  if (isInitializing || !user) {
    return <PageState message="Checking host session..." />;
  }

  if (!property) {
    return (
      <PageState
        message={generalError || "The property to edit was not found."}
        action={
          <Link href="/host/my-properties" className="btn-primary-hs">
            Back to property list
          </Link>
        }
      />
    );
  }

  return (
    <div style={{ padding: "28px", maxWidth: 1040, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontWeight: 800,
              color: "#1e293b",
              marginBottom: 4,
              fontSize: "1.5rem",
            }}
          >
            Edit Property
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            You are editing <strong>{property.title}</strong>.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/host/my-properties" className="btn-outline-hs">
            Back
          </Link>
          <span className="hs-badge hs-badge-pending">{property.status}</span>
        </div>
      </div>

      {notice && (
        <div
          style={{
            marginBottom: 18,
            padding: "12px 16px",
            borderRadius: 10,
            background: "#dcfce7",
            color: "#166534",
            fontWeight: 600,
          }}
        >
          {notice}
        </div>
      )}

      {generalError && (
        <div
          style={{
            marginBottom: 18,
            padding: "12px 16px",
            borderRadius: 10,
            background: "#fee2e2",
            color: "#b91c1c",
            fontWeight: 600,
          }}
        >
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="row g-4">
        <div className="col-lg-8">
          <div className="hs-card" style={{ padding: "24px", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 18 }}>
              Basic information
            </h3>
            <div className="row g-3">
              <div className="col-12">
                <label className="hs-form-label">Property title</label>
                <input
                  className="hs-form-control"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
                {errors.title && <ErrorText message={errors.title} />}
              </div>

              <div className="col-md-6">
                <label className="hs-form-label">Property type</label>
                <select
                  className="hs-form-control"
                  value={form.type}
                  onChange={(event) => updateField("type", event.target.value)}
                >
                  {PROPERTY_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.type && <ErrorText message={errors.type} />}
              </div>

              <div className="col-md-6">
                <label className="hs-form-label">Price per night</label>
                <input
                  type="number"
                  min="1"
                  className="hs-form-control"
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                />
                {errors.price && <ErrorText message={errors.price} />}
              </div>

              <div className="col-12">
                <label className="hs-form-label">Address</label>
                <input
                  className="hs-form-control"
                  value={form.address}
                  onChange={(event) => updateField("address", event.target.value)}
                />
                {errors.address && <ErrorText message={errors.address} />}
              </div>

              <div className="col-md-6">
                <label className="hs-form-label">City</label>
                <input
                  className="hs-form-control"
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                />
                {errors.city && <ErrorText message={errors.city} />}
              </div>

              <div className="col-md-6">
                <label className="hs-form-label">Country</label>
                <input
                  className="hs-form-control"
                  value={form.country}
                  onChange={(event) => updateField("country", event.target.value)}
                />
                {errors.country && <ErrorText message={errors.country} />}
              </div>
            </div>
          </div>

          <div className="hs-card" style={{ padding: "24px", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 18 }}>
              Capacity details
            </h3>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="hs-form-label">Maximum guests</label>
                <input
                  type="number"
                  min="1"
                  className="hs-form-control"
                  value={form.maxGuests}
                  onChange={(event) => updateField("maxGuests", event.target.value)}
                />
                {errors.maxGuests && <ErrorText message={errors.maxGuests} />}
              </div>

              <div className="col-md-4">
                <label className="hs-form-label">Bedrooms</label>
                <input
                  type="number"
                  min="0"
                  className="hs-form-control"
                  value={form.bedrooms}
                  onChange={(event) => updateField("bedrooms", event.target.value)}
                />
                {errors.bedrooms && <ErrorText message={errors.bedrooms} />}
              </div>

              <div className="col-md-4">
                <label className="hs-form-label">Bathrooms</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="hs-form-control"
                  value={form.bathrooms}
                  onChange={(event) => updateField("bathrooms", event.target.value)}
                />
                {errors.bathrooms && <ErrorText message={errors.bathrooms} />}
              </div>

              <div className="col-12">
                <label className="hs-form-label">Description</label>
                <textarea
                  className="hs-form-control"
                  rows={6}
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  style={{ resize: "vertical" }}
                />
                {errors.description && <ErrorText message={errors.description} />}
              </div>
            </div>
          </div>

          <div className="hs-card" style={{ padding: "24px", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>
              Amenities
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 10,
              }}
            >
              {AMENITY_OPTIONS.map((amenity) => {
                const selected = form.amenities.includes(amenity);

                return (
                  <label
                    key={amenity}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      border: `1.5px solid ${selected ? "#2563eb" : "#e2e8f0"}`,
                      borderRadius: 8,
                      cursor: "pointer",
                      background: selected ? "#eff6ff" : "#fff",
                      color: selected ? "#2563eb" : "#475569",
                      fontWeight: selected ? 600 : 400,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleAmenity(amenity)}
                      style={{ accentColor: "#2563eb" }}
                    />
                    {amenity}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="hs-card" style={{ padding: "24px", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 14 }}>
              Cover image
            </h3>
            <label
              style={{
                display: "block",
                border: "2px dashed #bfdbfe",
                borderRadius: 12,
                padding: "18px",
                background: "#f8fafc",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <FileImage size={26} color="#2563eb" style={{ marginBottom: 10 }} />
              <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                Replace cover image
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                Upload a new image only if you want to replace the current one. Maximum {MAX_PROPERTY_IMAGE_SIZE_MB} MB.
              </div>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;

                  if (file && isImageFileTooLarge(file)) {
                    setCoverImage(null);
                    setErrors((prev) => ({
                      ...prev,
                      coverImage: `Cover image must be ${MAX_PROPERTY_IMAGE_SIZE_MB} MB or smaller.`,
                    }));
                    setGeneralError(buildImageSizeError(file));
                    return;
                  }

                  setCoverImage(file);
                  setGeneralError(null);
                  setErrors((prev) => ({ ...prev, coverImage: undefined }));
                }}
              />
            </label>
            {errors.coverImage && <ErrorText message={errors.coverImage} />}

            {coverPreview && (
              <div style={{ marginTop: 14 }}>
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  style={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 10,
                  }}
                />
                {coverImage && (
                  <div style={{ marginTop: 8, fontSize: "0.82rem", color: "#64748b" }}>
                    {coverImage.name}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hs-card" style={{ padding: "24px", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 14 }}>
              Existing detail images
            </h3>

            {existingDetailImages.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: "0.84rem", marginBottom: 12 }}>
                No detail images yet.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                {existingDetailImages.map((image) => (
                  <div
                    key={image}
                    style={{
                      position: "relative",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={image}
                      alt="Detail image"
                      style={{
                        width: "100%",
                        height: 110,
                        objectFit: "cover",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingDetailImage(image)}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        border: "none",
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "rgba(220,38,38,0.9)",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label
              style={{
                display: "block",
                border: "2px dashed #cbd5e1",
                borderRadius: 12,
                padding: "18px",
                background: "#fff",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <ImagePlus size={26} color="#2563eb" style={{ marginBottom: 10 }} />
              <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                Add new detail images
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                Upload up to {MAX_PROPERTY_IMAGE_COUNT} images, each up to {MAX_PROPERTY_IMAGE_SIZE_MB} MB
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);
                  const oversizedFile = files.find(isImageFileTooLarge);
                  if (oversizedFile) {
                    setGeneralError(buildImageSizeError(oversizedFile));
                    return;
                  }

                  setDetailImages((prev) => {
                    const nextFiles = [...prev, ...files];

                    if (
                      existingDetailImages.length + nextFiles.length >
                      MAX_PROPERTY_IMAGE_COUNT
                    ) {
                      setGeneralError(
                        `You can upload up to ${MAX_PROPERTY_IMAGE_COUNT} detail images.`,
                      );
                      return prev;
                    }

                    setGeneralError(null);
                    return nextFiles;
                  });
                }}
              />
            </label>

            {detailImages.length > 0 && (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {detailImages.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: "#f8fafc",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#1e293b",
                          fontSize: "0.84rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {file.name}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewDetailImage(index)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#dc2626",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hs-card" style={{ padding: "24px" }}>
            <h3 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>
              Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="submit"
                className="btn-primary-hs"
                disabled={isSubmitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                <Save size={16} />
                {isSubmitting ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                className="btn-outline-hs"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ color: "#dc2626", borderColor: "#fecaca" }}
              >
                {isDeleting ? "Deleting..." : "Delete property"}
              </button>
            </div>

            {property.status.toLowerCase() === "approved" && (
              <div
                style={{
                  marginTop: 14,
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "#fef3c7",
                  color: "#92400e",
                  fontSize: "0.82rem",
                  lineHeight: 1.6,
                }}
              >
                If this property is currently approved, editing it will move it
                back to pending review.
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function ErrorText({ message }: { message: string }) {
  return (
    <div style={{ color: "#dc2626", fontSize: "0.78rem", marginTop: 4 }}>
      {message}
    </div>
  );
}

function PageState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ padding: "48px 28px", textAlign: "center" }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <CheckCircle size={36} color="#2563eb" />
        </div>
        <p style={{ color: "#475569", marginBottom: 18 }}>{message}</p>
        {action}
      </div>
    </div>
  );
}
