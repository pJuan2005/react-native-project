"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  ArrowRight,
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  Shield,
  Sparkles,
  Building2,
  CalendarPlus,
} from "lucide-react";
import { destinations } from "@/lib/destinations";
import { PropertyCard } from "@/components/shared/PropertyCard";
import { getProperties, type PropertySummary } from "@/services/propertyService";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const QUICK_SEARCH_TAGS = [
  "Đà Lạt",
  "Sa Pa",
  "Phú Quốc",
  "Hội An",
  "Nha Trang",
  "Ninh Bình",
  "Villa",
  "Homestay",
];

export default function GuestWebHomePage() {
  const router = useRouter();

  const [searchForm, setSearchForm] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
  });
  const [searchError, setSearchError] = useState("");
  const [featuredProperties, setFeaturedProperties] = useState<PropertySummary[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      setIsLoadingFeatured(true);
      try {
        const data = await getProperties({ guests: 1 });
        setFeaturedProperties(data.slice(0, 6));
      } catch (err) {
        console.warn("Failed to load featured properties:", err);
      } finally {
        setIsLoadingFeatured(false);
      }
    }

    loadFeatured();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");

    if (searchForm.checkIn && searchForm.checkOut) {
      if (new Date(searchForm.checkOut) <= new Date(searchForm.checkIn)) {
        setSearchError("Ngày trả phòng phải sau ngày nhận phòng.");
        return;
      }
    }

    const params = new URLSearchParams();
    if (searchForm.location.trim()) params.set("location", searchForm.location.trim());
    if (searchForm.checkIn) params.set("checkIn", searchForm.checkIn);
    if (searchForm.checkOut) params.set("checkOut", searchForm.checkOut);
    if (searchForm.guests) params.set("guests", searchForm.guests);

    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      {/* Top Banner: Role Gateway Switcher Bar */}
      <div className="hs-topbar">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
            <span style={{ fontWeight: 500, color: "#cbd5e1" }}>
              Nền tảng Homestay Đa Phân Hệ — Đồng bộ thời gian thực với Mobile App
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/admin/dashboard"
              className="hs-topbar-link"
              style={{ background: "rgba(37, 99, 235, 0.25)", color: "#93c5fd", border: "1px solid rgba(59, 130, 246, 0.3)" }}
            >
              <Shield size={12} />
              <span>👑 Cổng Admin</span>
            </Link>
            <Link
              href="/host/dashboard"
              className="hs-topbar-link"
              style={{ background: "rgba(16, 185, 129, 0.25)", color: "#6ee7b7", border: "1px solid rgba(16, 185, 129, 0.3)" }}
            >
              <Building2 size={12} />
              <span>🏡 Cổng Chủ Nhà</span>
            </Link>
            <Link
              href="/quick-manage/HMTOKEN_0001"
              className="hs-topbar-link"
              style={{ background: "rgba(245, 158, 11, 0.25)", color: "#fcd34d", border: "1px solid rgba(245, 158, 11, 0.3)" }}
            >
              <CalendarPlus size={12} />
              <span>🏨 Lễ tân Quầy</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Guest Web Navbar */}
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* HERO SECTION WITH SEARCH WIDGET */}
        <section className="hs-hero">
          {/* Background Decorative Image */}
          <div className="hs-hero-overlay"></div>

          <div className="container" style={{ position: "relative", zIndex: 2 }}>
            <div className="hs-hero-content">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 16px", borderRadius: 20,
                background: "rgba(37,99,235,0.25)", border: "1px solid rgba(147,197,253,0.3)",
                color: "#bfdbfe", fontSize: "0.82rem", fontWeight: 600, marginBottom: 16
              }}>
                <Sparkles size={14} color="#60a5fa" />
                <span>Trải nghiệm nghỉ dưỡng xanh & sang trọng trên toàn quốc</span>
              </div>

              <h1 style={{
                fontSize: "2.8rem", fontWeight: 800, color: "#fff",
                lineHeight: 1.15, letterSpacing: "-0.8px", margin: "0 0 12px"
              }}>
                Tìm & Đặt Homestay Hoàn Hảo Cho Kỳ Nghỉ
              </h1>

              <p style={{
                fontSize: "1.05rem", color: "#e0f2fe", margin: "0 auto",
                maxWidth: 680, lineHeight: 1.6
              }}>
                Hơn 500+ chỗ nghỉ nguyên căn độc đáo, view núi săn mây, sát biển và phố cổ. Đặt phòng nhanh chóng và thanh toán tiện lợi qua VietQR.
              </p>

              {/* MAIN SEARCH WIDGET FOR DESKTOP & WEB */}
              <div className="hs-search-card">
                <form onSubmit={handleSearchSubmit}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 120px", gap: 12, alignItems: "center" }}>
                    {/* Destination */}
                    <div style={{ padding: "8px 14px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 2 }}>
                        Địa điểm / Homestay
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <MapPin size={15} color="#2563EB" style={{ flexShrink: 0 }} />
                        <input
                          type="text"
                          placeholder="Bạn muốn đi đâu? (Đà Lạt...)"
                          value={searchForm.location}
                          onChange={(e) => setSearchForm({ ...searchForm, location: e.target.value })}
                          style={{ border: "none", background: "transparent", width: "100%", outline: "none", fontSize: "0.9rem", fontWeight: 600, color: "#0f172a" }}
                        />
                      </div>
                    </div>

                    {/* Check-in */}
                    <div style={{ padding: "8px 14px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 2 }}>
                        Nhận phòng
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Calendar size={15} color="#2563EB" style={{ flexShrink: 0 }} />
                        <input
                          type="date"
                          value={searchForm.checkIn}
                          onChange={(e) => setSearchForm({ ...searchForm, checkIn: e.target.value })}
                          style={{ border: "none", background: "transparent", width: "100%", outline: "none", fontSize: "0.85rem", fontWeight: 600, color: "#0f172a", cursor: "pointer" }}
                        />
                      </div>
                    </div>

                    {/* Check-out */}
                    <div style={{ padding: "8px 14px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 2 }}>
                        Trả phòng
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Calendar size={15} color="#2563EB" style={{ flexShrink: 0 }} />
                        <input
                          type="date"
                          value={searchForm.checkOut}
                          onChange={(e) => setSearchForm({ ...searchForm, checkOut: e.target.value })}
                          style={{ border: "none", background: "transparent", width: "100%", outline: "none", fontSize: "0.85rem", fontWeight: 600, color: "#0f172a", cursor: "pointer" }}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        className="btn-primary-hs"
                        style={{ width: "100%", height: 50, borderRadius: 12, fontSize: "0.92rem", fontWeight: 700 }}
                      >
                        <Search size={16} />
                        <span>Tìm</span>
                      </button>
                    </div>
                  </div>
                </form>

                {searchError && (
                  <p style={{ color: "#dc2626", fontSize: "0.82rem", fontWeight: 600, margin: "10px 0 0", textAlign: "center" }}>
                    ⚠️ {searchError}
                  </p>
                )}

                {/* Quick Search Tag Chips */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid #f1f5f9", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>Gợi ý nhanh:</span>
                  {QUICK_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearchForm({ ...searchForm, location: tag });
                        router.push(`/listings?location=${encodeURIComponent(tag)}`);
                      }}
                      style={{
                        padding: "4px 10px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600,
                        background: "#f1f5f9", border: "none", color: "#475569", cursor: "pointer", transition: "all 0.15s"
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: POPULAR DESTINATIONS */}
        <section style={{ padding: "60px 0", background: "#fff" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#2563EB", display: "block", marginBottom: 4 }}>
                  Địa điểm du lịch
                </span>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Khám Phá Các Miền Đất Đẹp Nhất Việt Nam
                </h2>
              </div>
              <Link
                href="/listings"
                style={{ fontSize: "0.88rem", fontWeight: 700, color: "#2563EB", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
              >
                <span>Xem tất cả chỗ nghỉ</span>
                <ChevronRight size={15} />
              </Link>
            </div>

            <div className="hs-dest-grid">
              {destinations.map((dest) => (
                <Link
                  key={dest.name}
                  href={`/listings?location=${encodeURIComponent(dest.name)}`}
                  className="hs-dest-card"
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="hs-dest-img"
                  />
                  <div className="hs-dest-overlay">
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#fff" }}>{dest.name}</h3>
                    <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#cbd5e1" }}>{dest.properties} chỗ nghỉ</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: FEATURED HOMESTAYS */}
        <section style={{ padding: "60px 0", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#2563EB", display: "block", marginBottom: 4 }}>
                  Đề xuất nổi bật
                </span>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Chỗ Nghỉ Đẹp Được Yêu Thích Nhất
                </h2>
                <p style={{ fontSize: "0.9rem", color: "#64748b", margin: "4px 0 0" }}>
                  Được đánh giá cao bởi cộng đồng du khách với đầy đủ tiện nghi và mức giá ưu đãi
                </p>
              </div>

              <Link
                href="/listings"
                className="btn-outline-hs"
                style={{ fontSize: "0.85rem", padding: "8px 16px" }}
              >
                <span>Xem tất cả ({featuredProperties.length}+)</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {isLoadingFeatured ? (
              <div style={{ padding: 60, textAlign: "center", color: "#94a3b8", fontSize: "0.95rem" }}>
                Đang tải danh sách homestay nổi bật...
              </div>
            ) : (
              <div className="hs-properties-grid">
                {featuredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: WHY CHOOSE HOMESTAY PLATFORM */}
        <section style={{ padding: "64px 0", background: "#fff", borderTop: "1px solid #e2e8f0" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#2563EB", display: "block", marginBottom: 4 }}>
                Cam kết chất lượng
              </span>
              <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Tại Sao Du Khách Lựa Chọn Homestay Booking?
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
              <div style={{ padding: "28px 24px", borderRadius: 16, background: "#eff6ff", border: "1px solid #dbeafe" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#2563EB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Shield size={22} />
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
                  100% Chủ Nhà Xác Minh Danh Tính
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                  Tất cả homestay trên sàn đều được ban quản trị kiểm duyệt chặt chẽ hình ảnh thực tế và xác minh CCCD/giấy phép kinh doanh của chủ nhà.
                </p>
              </div>

              <div style={{ padding: "28px 24px", borderRadius: 16, background: "#f0fdf4", border: "1px solid #dcfce7" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#16a34a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Award size={22} />
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
                  Giá Tốt Nhất & Không Phí Ẩn
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                  Giá phòng niêm yết minh bạch, hỗ trợ thanh toán VietQR quét mã chuyển khoản tức thì và tự động tích lũy điểm thưởng đổi voucher cho kỳ nghỉ sau.
                </p>
              </div>

              <div style={{ padding: "28px 24px", borderRadius: 16, background: "#faf5ff", border: "1px solid #f3e8ff" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#9333ea", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Clock size={22} />
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
                  Đồng Bộ Hai Chiều & Chống Overbooking
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                  Hệ thống kết nối trực tiếp với Mobile App và Lễ tân tại quầy homestay, khóa phòng thời gian thực, đảm bảo không bao giờ bị bán trùng phòng.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Guest Web Footer */}
      <Footer />
    </div>
  );
}
