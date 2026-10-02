"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { PropertyCard } from "@/components/shared/PropertyCard";
import { getProperties, type PropertySummary } from "@/services/propertyService";

export function FeaturedProperties() {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getProperties({ guests: 1 })
      .then((data) => {
        if (isMounted) {
          setProperties(data.slice(0, 6));
        }
      })
      .catch((err) => {
        console.warn("Lỗi khi tải homestay nổi bật:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section style={{ padding: "74px 0 80px", background: "#ffffff", borderTop: "1px solid #f1f5f9" }}>
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 16,
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
              Bộ sưu tập tuyển chọn
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
              Homestay & Villa được yêu thích nhất
            </h2>
            <p style={{ fontSize: "0.92rem", color: "#64748b", margin: "6px 0 0" }}>
              Những không gian nghỉ dưỡng có chất lượng phục vụ và điểm đánh giá cao từ du khách
            </p>
          </div>

          <Link
            href="/listings"
            className="btn-outline-hs"
            style={{
              fontSize: "0.85rem",
              padding: "10px 20px",
              borderRadius: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>Xem tất cả chỗ nghỉ</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#94a3b8", fontSize: "0.92rem" }}>
            Đang tải danh sách chỗ nghỉ tuyển chọn...
          </div>
        ) : properties.length === 0 ? (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              background: "#f8fafc",
              borderRadius: 18,
              border: "1px solid #e2e8f0",
            }}
          >
            <Compass size={32} color="#94a3b8" style={{ marginBottom: 10 }} />
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem" }}>
              Hiện chưa có chỗ nghỉ nào khả dụng. Vui lòng quay lại sau!
            </p>
          </div>
        ) : (
          <div className="hs-properties-grid">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
