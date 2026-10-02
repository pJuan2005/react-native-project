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
      setGeneralError("Phiên đăng nhập chủ nhà không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    const validateErrors = validatePropertyForm(form, {
      requireCoverImage: true,
      hasCoverImage: Boolean(coverImage),
    });

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      setGeneralError("Vui lòng kiểm tra lại thông tin chỗ nghỉ trước khi gửi phê duyệt.");
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
          : "Không thể đăng chỗ nghỉ mới. Vui lòng thử lại.",
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
            Đăng ký chỗ nghỉ thành công! 🎉
          </h2>
          <p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: 24 }}>
            Chỗ nghỉ <strong>{createdProperty.title}</strong> đã được gửi lên hệ thống
            và đang ở trạng thái <strong>Chờ quản trị viên phê duyệt</strong>.
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
              Trạng thái hiện tại: Đang chờ duyệt
            </div>
            <div style={{ color: "#92400e", fontSize: "0.82rem" }}>
              Ban quản trị sẽ kiểm tra thông tin và mở bán chỗ nghỉ trên trang khám phá công khai trong vòng 24 giờ.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="btn-primary-hs"
              onClick={() => router.push("/host/my-properties")}
            >
              Về danh sách chỗ nghỉ
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
              Đăng thêm chỗ nghỉ khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isInitializing || !user) {
    return <PageState message="Đang kiểm tra phiên đăng nhập chủ nhà..." />;
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
            Đăng Chỗ Nghỉ Mới
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Điền đầy đủ thông tin để gửi hồ sơ chỗ nghỉ của bạn lên hệ thống duyệt.
          </p>
        </div>
        <Link href="/host/my-properties" className="btn-outline-hs">
          Quay lại danh sách
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
              Thông tin cơ bản
            </h3>
            <div className="row g-3">
              <div className="col-12">
                <label className="hs-form-label">Tên chỗ nghỉ / Homestay *</label>
                <input
                  className="hs-form-control"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="Ví dụ: Hoàng Hôn Homestay & Coffee Đà Lạt"
                />
                {errors.title && <ErrorText message={errors.title} />}
              </div>

              <div className="col-md-6">
                <label className="hs-form-label">Loại hình chỗ nghỉ *</label>
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
                <label className="hs-form-label">Giá thuê mỗi đêm (VNĐ) *</label>
                <input
                  type="number"
                  min="1"
                  className="hs-form-control"
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  placeholder="Ví dụ: 1200000"
                />
                {errors.price && <ErrorText message={errors.price} />}
              </div>

              <div className="col-12">
                <label className="hs-form-label">Địa chỉ cụ thể *</label>
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
                    placeholder="Ví dụ: 12/4 Đường Khe Sanh, Phường 10"
                  />
                </div>
                {errors.address && <ErrorText message={errors.address} />}
              </div>

              <div className="col-md-6">
                <label className="hs-form-label">Tỉnh / Thành phố *</label>
                <input
                  className="hs-form-control"
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  placeholder="Ví dụ: Đà Lạt, Lâm Đồng"
                />
                {errors.city && <ErrorText message={errors.city} />}
              </div>

              <div className="col-md-6">
                <label className="hs-form-label">Quốc gia</label>
                <input
                  className="hs-form-control"
                  value={form.country}
                  onChange={(event) => updateField("country", event.target.value)}
                  placeholder="Việt Nam"
                />
                {errors.country && <ErrorText message={errors.country} />}
              </div>
            </div>
          </div>

          <div className="hs-card" style={{ padding: "24px", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 18 }}>
              Sức chứa & Không gian
            </h3>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="hs-form-label">Số khách tối đa *</label>
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
                <label className="hs-form-label">Số phòng ngủ *</label>
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
                <label className="hs-form-label">Số phòng tắm *</label>
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
                <label className="hs-form-label">Mô tả chỗ nghỉ *</label>
                <textarea
                  className="hs-form-control"
                  rows={6}
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Mô tả phong cách kiến trúc, tầm nhìn cảnh quan, không gian xung quanh và các điểm nhấn nổi bật..."
                  style={{ resize: "vertical" }}
                />
                {errors.description && <ErrorText message={errors.description} />}
              </div>
            </div>
          </div>

          <div className="hs-card" style={{ padding: "24px", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>
              Tiện nghi chỗ nghỉ
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: 16 }}>
              Chọn các tiện nghi hiện có sẵn tại homestay của bạn.
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
              Ảnh bìa đại diện chỗ nghỉ *
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
                Tải lên ảnh bìa
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                Khuyến nghị độ phân giải 1600 x 900 trở lên, tối đa {MAX_PROPERTY_IMAGE_SIZE_MB} MB
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
                      coverImage: `Ảnh bìa phải nhỏ hơn hoặc bằng ${MAX_PROPERTY_IMAGE_SIZE_MB} MB.`,
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
                  alt="Ảnh xem trước"
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
              Ảnh chi tiết phòng & không gian
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
                Thêm ảnh chi tiết
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                Tải lên tối đa {MAX_PROPERTY_IMAGE_COUNT} ảnh, mỗi ảnh không quá {MAX_PROPERTY_IMAGE_SIZE_MB} MB
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
                        `Bạn chỉ có thể tải lên tối đa ${MAX_PROPERTY_IMAGE_COUNT} ảnh chi tiết.`,
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
              Hoàn tất đăng tin
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
                {isSubmitting ? "Đang gửi hồ sơ..." : "Tạo & Gửi duyệt chỗ nghỉ"}
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
