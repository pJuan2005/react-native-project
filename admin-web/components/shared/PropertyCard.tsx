import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Users, Bed } from "lucide-react";
import { isBackendUploadImage } from "@/lib/image";

interface Property {
  id: number;
  title: string;
  image: string;
  location: string;
  type: string;
  rating: number;
  reviews: number;
  price: number;
  maxGuests: number;
  bedrooms: number;
}

interface PropertyCardProps {
  property: Property;
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount || 0) + " ₫";
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/listings/${property.id}`} style={{ textDecoration: "none" }}>
      <div
        className="hs-card hs-property-card"
        style={{ cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div style={{ overflow: "hidden", position: "relative", aspectRatio: "16 / 10", background: "#f1f5f9" }}>
          <Image
            src={property.image}
            alt={property.title}
            className="hs-property-img"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={isBackendUploadImage(property.image)}
            style={{ objectFit: "cover" }}
          />
        </div>

        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
          <div>
            {/* TYPE */}
            <div style={{ marginBottom: 8 }}>
              <span
                style={{
                  background: "#eff6ff",
                  color: "#2563EB",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  border: "1px solid #dbeafe",
                }}
              >
                {property.type}
              </span>
            </div>

            {/* TITLE */}
            <h3
              style={{
                fontWeight: 700,
                color: "#0f172a",
                fontSize: "0.95rem",
                marginBottom: 6,
                lineHeight: 1.4,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                minHeight: 40,
              }}
            >
              {property.title}
            </h3>

            {/* LOCATION */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 10,
              }}
            >
              <MapPin size={13} color="#64748b" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "0.8rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {property.location}
              </span>
            </div>

            {/* INFO */}
            <div
              style={{
                display: "flex",
                gap: 14,
                marginBottom: 14,
                fontSize: "0.8rem",
                color: "#64748b",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Users size={13} color="#2563EB" /> {property.maxGuests} khách
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Bed size={13} color="#2563EB" /> {property.bedrooms} phòng ngủ
              </span>
            </div>
          </div>

          {/* FOOTER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 12,
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#0f172a" }}>
                {property.rating}
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.76rem" }}>
                ({property.reviews})
              </span>
            </div>

            <div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  color: "#2563EB",
                }}
              >
                {formatPrice(property.price)}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                {" "}/ đêm
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
