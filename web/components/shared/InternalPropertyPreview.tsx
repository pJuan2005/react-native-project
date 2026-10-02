"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  ExternalLink,
  MapPin,
  ShieldAlert,
  Star,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAuth } from "@/components/context/AuthContext";
import {
  getAdminPropertyById,
  getHostPropertyById,
  type PropertyReview,
} from "@/services/propertyService";
import { isBackendUploadImage } from "@/lib/image";

type InternalPreviewMode = "admin" | "host";
type InternalPropertyDetail = Awaited<ReturnType<typeof getAdminPropertyById>>;

interface InternalPropertyPreviewProps {
  mode: InternalPreviewMode;
}

function getBackHref(mode: InternalPreviewMode) {
  return mode === "admin" ? "/admin/properties-manage" : "/host/my-properties";
}

function getEditHref(mode: InternalPreviewMode, propertyId: number) {
  return mode === "admin"
    ? `/admin/edit-property/${propertyId}`
    : `/host/edit-property/${propertyId}`;
}

function formatCurrency(value: number) {
  return `${Number(value || 0).toLocaleString("vi-VN")} ₫ / đêm`;
}

export function InternalPropertyPreview({
  mode,
}: InternalPropertyPreviewProps) {
  const params = useParams<{ id: string }>();
  const { user, isInitializing } = useAuth();
  const [property, setProperty] = useState<InternalPropertyDetail | null>(null);
  const [activeImage, setActiveImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    let isMounted = true;

    async function loadProperty() {
      setIsLoading(true);
      setPageError("");

      try {
        const propertyId = Number(params.id);

        if (!Number.isFinite(propertyId) || propertyId <= 0) {
          throw new Error("Mã chỗ nghỉ không hợp lệ.");
        }

        const response =
          mode === "admin"
            ? await getAdminPropertyById(propertyId)
            : await getHostPropertyById(propertyId, user?.id);

        if (!isMounted) {
          return;
        }

        setProperty(response);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setProperty(null);
        setPageError(
          error instanceof Error
            ? error.message
            : "Không thể tải thông tin xem trước chỗ nghỉ này.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProperty();

    return () => {
      isMounted = false;
    };
  }, [isInitializing, mode, params.id, user?.id]);

  const galleryImages = useMemo(() => {
    if (!property) {
      return [];
    }

    const set = new Set<string>();

    if (property.coverImageOriginal) {
      set.add(property.coverImageOriginal);
    }

    if (property.image) {
      set.add(property.image);
    }

    (property.originalImages || []).forEach((img) => set.add(img));
    (property.images || []).forEach((img) => set.add(img));

    return Array.from(set).filter(Boolean);
  }, [property]);

  useEffect(() => {
    if (galleryImages.length > 0) {
      setActiveImage(galleryImages[0]);
    }
  }, [galleryImages]);

  if (isLoading) {
    return (
      <div
        style={{
          padding: 30,
          textAlign: "center",
          color: "#64748b",
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Đang tải thông tin chỗ nghỉ...
      </div>
    );
  }

  if (pageError || !property) {
    return (
      <div style={{ padding: "30px 24px" }}>
        <div
          className="hs-card"
          style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px", textAlign: "center" }}
        >
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>
            Không thể xem trước chỗ nghỉ
          </h2>
          <p style={{ color: "#64748b", marginBottom: 20 }}>
            {pageError || "Chỗ nghỉ không tồn tại hoặc đã bị xóa."}
          </p>
          <Link href={getBackHref(mode)}>
            <button className="btn-primary-hs">Quay lại danh sách</button>
          </Link>
        </div>
      </div>
    );
  }

  const reviews: PropertyReview[] = Array.isArray(property.reviews)
    ? (property.reviews as any)
    : [];
  const showInternalNote = property.status !== "approved";

  return (
    <div style={{ padding: "28px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Link
            href={getBackHref(mode)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#64748b",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            <ArrowLeft size={14} />
            <span>Quay lại danh sách</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ fontWeight: 800, color: "#1e293b", fontSize: "1.6rem", margin: 0 }}>
              {property.title}
            </h1>
            <StatusBadge status={property.status} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#64748b",
              fontSize: "0.88rem",
              marginTop: 6,
            }}
          >
            <MapPin size={14} color="#2563eb" />
            <span>{property.location}</span>
            <span>•</span>
            <span>Chủ nhà: <strong>{property.hostName}</strong></span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={getEditHref(mode, property.id)}>
            <button className="btn-primary-hs">Chỉnh sửa chỗ nghỉ</button>
          </Link>
          {mode === "host" &&
            property.status === "approved" &&
            property.manageToken &&
            property.manageTokenActive && (
            <Link
              href={`/quick-manage/${property.manageToken}`}
              target="_blank"
              rel="noreferrer"
            >
              <button
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1px dashed #93c5fd",
                  background: "#f8fafc",
                  color: "#1d4ed8",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                }}
              >
                <ExternalLink size={15} />
                Quản lý tại quầy
              </button>
            </Link>
          )}
          {property.status === "approved" && (
            <Link href={`/listings/${property.id}`}>
              <button
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  color: "#1e293b",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                }}
              >
                <ExternalLink size={15} />
                Xem trang công khai
              </button>
            </Link>
          )}
        </div>
      </div>

      {showInternalNote && (
        <div
          style={{
            marginBottom: 20,
            padding: "14px 16px",
            borderRadius: 12,
            border: "1px solid #fde68a",
            background: "#fffbeb",
            color: "#92400e",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            fontSize: "0.88rem",
          }}
        >
          <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            Chỗ nghỉ này chưa được mở bán công khai. Bạn đang ở chế độ xem trước nội bộ dành riêng cho Chủ nhà và Quản trị viên.
          </div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="hs-card" style={{ padding: 18 }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 440,
                borderRadius: 18,
                overflow: "hidden",
                background: "#e2e8f0",
                marginBottom: 14,
              }}
            >
              {activeImage && (
                <Image
                  src={activeImage}
                  alt={property.title}
                  fill
                  sizes="(max-width: 1200px) 100vw, 66vw"
                  unoptimized={isBackendUploadImage(activeImage)}
                  style={{ objectFit: "cover" }}
                />
              )}
            </div>

            {galleryImages.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                  gap: 12,
                }}
              >
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setActiveImage(image)}
                    style={{
                      position: "relative",
                      height: 86,
                      borderRadius: 12,
                      overflow: "hidden",
                      border:
                        activeImage === image
                          ? "2px solid #2563eb"
                          : "1px solid #dbe2ea",
                      padding: 0,
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <Image
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      fill
                      sizes="110px"
                      unoptimized={isBackendUploadImage(image)}
                      style={{ objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hs-card" style={{ marginTop: 18, padding: "22px 24px" }}>
            <h3
              style={{
                fontWeight: 800,
                color: "#1e293b",
                marginBottom: 14,
                fontSize: "1.15rem",
              }}
            >
              Mô tả chỗ nghỉ
            </h3>
            <p
              style={{
                margin: 0,
                color: "#475569",
                lineHeight: 1.8,
                whiteSpace: "pre-line",
              }}
            >
              {property.description || "Chưa có mô tả nào được thêm vào."}
            </p>
          </div>

          <div className="hs-card" style={{ marginTop: 18, padding: "22px 24px" }}>
            <h3
              style={{
                fontWeight: 800,
                color: "#1e293b",
                marginBottom: 16,
                fontSize: "1.15rem",
              }}
            >
              Tiện nghi chỗ nghỉ
            </h3>
            {property.amenities.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    style={{
                      background: "#f8fbff",
                      border: "1px solid #dbeafe",
                      borderRadius: 12,
                      padding: "12px 14px",
                      fontWeight: 600,
                      color: "#2563eb",
                    }}
                  >
                    {amenity}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: "#94a3b8" }}>
                Chưa có tiện nghi nào được thiết lập.
              </p>
            )}
          </div>

          <div className="hs-card" style={{ marginTop: 18, padding: "22px 24px" }}>
            <h3
              style={{
                fontWeight: 800,
                color: "#1e293b",
                marginBottom: 16,
                fontSize: "1.15rem",
              }}
            >
              Đánh giá từ khách hàng
            </h3>
            {reviews.length > 0 ? (
              <div style={{ display: "grid", gap: 14 }}>
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 14,
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <strong style={{ color: "#1e293b" }}>{review.authorName}</strong>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color: "#f59e0b",
                          fontWeight: 700,
                        }}
                      >
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        {review.rating}
                      </div>
                    </div>
                    <div style={{ color: "#64748b", fontSize: "0.82rem", marginBottom: 8 }}>
                      {review.date}
                    </div>
                    <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: "#94a3b8" }}>
                Chỗ nghỉ này chưa có đánh giá nào.
              </p>
            )}
          </div>
        </div>

        <div className="col-xl-4">
          <div className="hs-card" style={{ padding: "22px 24px" }}>
            <div
              style={{
                fontSize: "1.55rem",
                fontWeight: 800,
                color: "#1e293b",
                marginBottom: 8,
              }}
            >
              {formatCurrency(property.price)}
            </div>
            <div
              style={{
                display: "grid",
                gap: 12,
                marginTop: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  color: "#475569",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Users size={16} color="#2563eb" />
                  Sức chứa
                </span>
                <strong>{property.maxGuests} khách</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  color: "#475569",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <BedDouble size={16} color="#2563eb" />
                  Phòng ngủ
                </span>
                <strong>{property.bedrooms} phòng</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  color: "#475569",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Bath size={16} color="#2563eb" />
                  Phòng tắm
                </span>
                <strong>{property.bathrooms} phòng</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  color: "#475569",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Star size={16} color="#f59e0b" />
                  Đánh giá
                </span>
                <strong>
                  {property.rating.toFixed(1)} ({property.reviewCount} đánh giá)
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
