"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  FileImage,
  ImagePlus,
  MapPin,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { createHostProperty, type PropertyDetail } from "@/services/propertyService";
import {
  AMENITY_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  MAX_PROPERTY_IMAGE_COUNT,
  MAX_PROPERTY_IMAGE_SIZE_MB,
  buildImageSizeError,
  validatePropertyForm,
  createPropertyFormData,
  createEmptyPropertyForm,
  isImageFileTooLarge,
  type PropertyFormErrors,
} from "@/lib/propertyForm";

export default function AddPropertyPage() {
  const router = useRouter();
  const { user, isInitializing } = useAuth();
  const hostId = user?.id;

  const [form, setForm] = useState(createEmptyPropertyForm());
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [detailImages, setDetailImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<PropertyFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProperty, setCreatedProperty] = useState<PropertyDetail | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!coverImage) {
      setCoverPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(coverImage);
    setCoverPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [coverImage]);

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

  function removeDetailImage(index: number) {
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
      hasCoverImage: Boolean(coverImage),
    });

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      setGeneralError("Please review the property information before submitting.");
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
      });

      const response = await createHostProperty(formData);
      setCreatedProperty(response.data);
      setErrors({});
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : "Unable to create a new property. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdProperty) {
    return (
      <div style={{ padding: "48px 28px", textAlign: "center" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <CheckCircle size={40} color="#16a34a" />
          </div>
          <h2 style={{ fontWeight: 800, color: "#1e293b", marginBottom: 10 }}>
            Property created successfully
          </h2>
          <p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: 24 }}>
            <strong>{createdProperty.title}</strong> has been submitted to the system
            and is currently in <strong>{createdProperty.status}</strong> status.
          </p>

          <div
            style={{
              background: "#fef3c7",
              borderRadius: 10,
              padding: "14px 18px",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: "#92400e",
                fontSize: "0.9rem",
                marginBottom: 4,
              }}
            >
              Current status: pending approval
            </div>
            <div style={{ color: "#92400e", fontSize: "0.82rem" }}>
              You can review this property in the host dashboard or open the
              public detail page after it has been approved by an admin.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="btn-primary-hs"
              onClick={() => router.push("/host/my-properties")}
            >
              Back to property list
            </button>
            <button
              className="btn-outline-hs"
              onClick={() => {
                setCreatedProperty(null);
                setForm(createEmptyPropertyForm());
                setCoverImage(null);
                setDetailImages([]);
              }}
            >
              Create another property
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isInitializing || !user) {
    return <PageState message="Checking host session..." />;
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
            Add New Property
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Complete all details before submitting your property to the platform.
          </p>
        </div>
        <Link href="/host/my-properties" className="btn-outline-hs">
          Back to list
        </Link>
      </div>

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
                  placeholder="Example: Sunset Villa Da Nang"
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
                  placeholder="200"
                />
                {errors.price && <ErrorText message={errors.price} />}
              </div>

              <div className="col-12">
                <label className="hs-form-label">Address</label>
                <div style={{ position: "relative" }}>
                  <MapPin
                    size={15}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    className="hs-form-control"
                    style={{ paddingLeft: 34 }}
                    value={form.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    placeholder="123 Beach Road"
                  />
                </div>
                {errors.address && <ErrorText message={errors.address} />}
              </div>

              <div className="col-md-6">
                <label className="hs-form-label">City</label>
                <input
                  className="hs-form-control"
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  placeholder="Da Nang"
                />
                {errors.city && <ErrorText message={errors.city} />}
              </div>

              <div className="col-md-6">
                <label className="hs-form-label">Country</label>
                <input
                  className="hs-form-control"
                  value={form.country}
                  onChange={(event) => updateField("country", event.target.value)}
                  placeholder="Vietnam"
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
                <div style={{ position: "relative" }}>
                  <Users
                    size={15}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="number"
                    min="1"
                    className="hs-form-control"
                    style={{ paddingLeft: 34 }}
                    value={form.maxGuests}
                    onChange={(event) => updateField("maxGuests", event.target.value)}
                  />
                </div>
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
                  placeholder="Describe the style, location, and standout amenities..."
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
            <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: 16 }}>
              Select the amenities available at this property.
            </p>
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
                Upload cover image
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                Recommended size: 1600 x 900 or larger, up to {MAX_PROPERTY_IMAGE_SIZE_MB} MB
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
              Detail images
            </h3>

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
                Add detail images
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

                    if (nextFiles.length > MAX_PROPERTY_IMAGE_COUNT) {
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
                      onClick={() => removeDetailImage(index)}
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
                {isSubmitting ? "Submitting..." : "Create property"}
              </button>
            </div>
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

function PageState({ message }: { message: string }) {
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
      </div>
    </div>
  );
}
