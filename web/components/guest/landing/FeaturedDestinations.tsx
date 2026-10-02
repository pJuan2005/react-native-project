"use client";

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { destinations } from "@/lib/destinations";

export function FeaturedDestinations() {
  return (
    <section style={{ padding: "68px 0 74px", background: "#fcfbf9" }}>
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                color: "#2563EB",
                display: "block",
                marginBottom: 6,
              }}
            >
              Điểm đến lý tưởng
            </span>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.5px",
                lineHeight: 1.25,
              }}
            >
              Khám phá những miền đất đẹp nhất Việt Nam
            </h2>
            <p style={{ fontSize: "0.92rem", color: "#64748b", margin: "6px 0 0" }}>
              Từ thung lũng sương mờ Sa Pa, đồi thông Đà Lạt đến biển ngọc Phú Quốc
            </p>
          </div>

          <Link
            href="/listings"
            style={{
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "#2563EB",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>Xem tất cả điểm đến</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="hs-dest-grid">
          {destinations.map((dest) => (
            <Link
              key={dest.name}
              href={`/listings?location=${encodeURIComponent(dest.name)}`}
              className="hs-dest-card"
              style={{ textDecoration: "none" }}
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="hs-dest-img"
                loading="lazy"
              />
              <div className="hs-dest-overlay">
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <MapPin size={13} color="#93c5fd" />
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.05rem",
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "-0.2px",
                    }}
                  >
                    {dest.name}
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#cbd5e1", fontWeight: 500 }}>
                  {dest.properties} chỗ nghỉ đang mở bán
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
