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

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/listings/${property.id}`} style={{ textDecoration: "none" }}>
      <div
        className="hs-card hs-property-card"
        style={{ cursor: "pointer", height: "100%" }}
      >
        <div style={{ overflow: "hidden", position: "relative", aspectRatio: "16 / 10" }}>
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

        <div style={{ padding: "16px 18px" }}>
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
              }}
            >
              {property.type}
            </span>
          </div>

          {/* TITLE */}
          <h3
            style={{
              fontWeight: 700,
              color: "#1e293b",
              fontSize: "0.95rem",
              marginBottom: 6,
              lineHeight: 1.35,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
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
            <MapPin size={12} color="#94a3b8" />
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
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
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Users size={12} color="#94a3b8" /> {property.maxGuests} guests
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Bed size={12} color="#94a3b8" /> {property.bedrooms} beds
            </span>
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
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontWeight: 700, fontSize: "0.87rem" }}>
                {property.rating}
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                ({property.reviews})
              </span>
            </div>

            <div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  color: "#1e293b",
                }}
              >
                ${property.price}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                /night
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
