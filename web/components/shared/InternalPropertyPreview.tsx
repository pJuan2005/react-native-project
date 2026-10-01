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
  return `$${Number(value || 0).toLocaleString()}/night`;
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
          throw new Error("Invalid property id.");
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
            : "Unable to load this property preview.",
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

    const images = [property.image, ...(property.images || [])].filter(Boolean);
    return Array.from(new Set(images));
  }, [property]);

  useEffect(() => {
    if (galleryImages.length > 0) {
      setActiveImage(galleryImages[0]);
    }
  }, [galleryImages]);

  if (isInitializing || isLoading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
        }}
      >
        Loading property preview...
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ padding: "28px" }}>
        <div
          className="hs-card"
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "32px 28px",
            textAlign: "center",
          }}
        >
          <ShieldAlert size={36} color="#d97706" style={{ marginBottom: 14 }} />
          <h1
            style={{
              fontWeight: 800,
              color: "#1e293b",
              marginBottom: 10,
              fontSize: "1.55rem",
            }}
          >
            Property preview unavailable
          </h1>
          <p style={{ color: "#64748b", marginBottom: 18 }}>
            {pageError || "We could not open this property preview right now."}
          </p>
          <Link href={getBackHref(mode)}>
            <button className="btn-primary-hs">Back to property list</button>
          </Link>
        </div>
      </div>
    );
  }

  const reviews = (property.reviews || []) as PropertyReview[];
  const showInternalNote = property.status !== "approved";

  return (
    <div style={{ padding: "28px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 22,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              color: "#64748b",
              fontWeight: 600,
              fontSize: "0.86rem",
            }}
          >
            <Link
              href={getBackHref(mode)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                textDecoration: "none",
                color: "#2563eb",
              }}
            >
              <ArrowLeft size={15} />
              Back
            </Link>
            <span>•</span>
            <span>
              {mode === "admin" ? "Admin property preview" : "Host property preview"}
            </span>
          </div>
          <h1
            style={{
              fontWeight: 800,
              color: "#1e293b",
              marginBottom: 4,
              fontSize: "1.75rem",
            }}
          >
            {property.title}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              color: "#64748b",
            }}
          >
            <StatusBadge status={property.status} />
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <MapPin size={14} />
              {property.location}
            </span>
            <span>{property.hostName}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={getEditHref(mode, property.id)}>
            <button className="btn-primary-hs">Edit Property</button>
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
                Quick Manage
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
                Open Public Listing
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
            This property is not public yet. You are viewing the internal preview
            that remains available for host and admin management.
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
              About this property
            </h3>
            <p
              style={{
                margin: 0,
                color: "#475569",
                lineHeight: 1.8,
                whiteSpace: "pre-line",
              }}
            >
              {property.description || "No description has been added yet."}
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
              Amenities
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
                No amenities have been configured yet.
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
              Reviews
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
                This property does not have any reviews yet.
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
                  Guests
                </span>
                <strong>{property.maxGuests}</strong>
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
                  Bedrooms
                </span>
                <strong>{property.bedrooms}</strong>
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
                  Bathrooms
                </span>
                <strong>{property.bathrooms}</strong>
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
                  Rating
                </span>
                <strong>
                  {property.rating.toFixed(1)} ({property.reviewCount})
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
