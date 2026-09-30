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
  Star,
  Sparkles,
  Building2,
  CalendarDays,
  Compass,
  CheckCircle2,
  Heart,
  Quote,
  Hotel,
} from "lucide-react";
import { destinations } from "@/lib/destinations";
import { PropertyCard } from "@/components/shared/PropertyCard";
import { getProperties, type PropertySummary } from "@/services/propertyService";
import { getMyBookings, type BookingRecord } from "@/services/bookingService";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/components/context/AuthContext";
import { HeroScene3D } from "@/components/landing/HeroScene3D";

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

const TESTIMONIALS = [
  {
    name: "Hoàng Minh Tuấn",
    location: "Hà Nội",
    avatar: "T",
    homestay: "Villa Lavender Dream Đà Lạt",
    rating: 5,
    comment:
      "Chuyến đi nghỉ dưỡng của gia đình mình thật sự tuyệt vời! Homestay view đồi thông cực chill, phòng ốc sạch sẽ tinh tươm. Thanh toán quét mã VietQR rất nhanh gọn.",
    date: "Tháng 9, 2026",
  },
  {
    name: "Nguyễn Thùy Linh",
    location: "TP. Hồ Chí Minh",
    avatar: "L",
    homestay: "Homestay Cloud Nine Sa Pa",
    rating: 5,
    comment:
      "Sáng thức dậy săn mây ngay ban công ngắm trọn thung lũng Mường Hoa. Chủ nhà cực kỳ thân thiện và nhiệt tình hỗ trợ. Đặt phòng qua app xác nhận rất nhanh!",
    date: "Tháng 9, 2026",
  },
  {
    name: "Trần Đức Nam",
    location: "Đà Nẵng",
    avatar: "N",
    homestay: "Ocean Breeze Villa Phú Quốc",
    rating: 5,
    comment:
      "Villa sát biển với hồ bơi vô cực riêng tư. Giá niêm yết minh bạch không có phí ẩn, tích điểm đổi voucher được giảm thêm 200k đơn sau. Rất hài lòng!",
    date: "Tháng 8, 2026",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitializing } = useAuth();

  const [searchForm, setSearchForm] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
  });
  const [searchError, setSearchError] = useState("");
  const [featuredProperties, setFeaturedProperties] = useState<PropertySummary[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [recentBooking, setRecentBooking] = useState<BookingRecord | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoadingFeatured(true);
      try {
        const props = await getProperties({ guests: 1 });
        setFeaturedProperties(props.slice(0, 6));
      } catch (err) {
        console.warn("Failed to load featured properties:", err);
      } finally {
        setIsLoadingFeatured(false);
      }

      // If user is authenticated, load their most recent booking
      if (isAuthenticated) {
        try {
          const bookings = await getMyBookings();
          if (bookings && bookings.length > 0) {
            setRecentBooking(bookings[0]);
          }
        } catch (_) {}
      }
    }

    loadData();
  }, [isAuthenticated]);

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

  const scrollToSearch = () => {
    const el = document.getElementById("search-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/listings");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      {/* SECTION 1: NAVBAR */}
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* SECTION 2: HERO SECTION WITH THREE.JS 3D SHOWCASE */}
        <section
          style={{
            position: "relative",
            background: "linear-gradient(135deg, #090e17 0%, #0f172a 40%, #1e3a8a 100%)",
            color: "#fff",
            overflow: "hidden",
            padding: "50px 0 60px",
          }}
        >
          {/* Subtle ambient gradient orb */}
          <div
            style={{
              position: "absolute",
              top: "-15%",
              right: "-5%",
              width: "550px",
              height: "550px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(37, 99, 235, 0.05) 60%, transparent 80%)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          <div className="container" style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 0.9fr",
                gap: 32,
                alignItems: "center",
              }}
              className="hs-hero-grid"
            >
              {/* Left Column: Headline & Action */}
              <div style={{ paddingRight: 10 }}>
                {/* Auth State Switcher in Hero */}
                {isAuthenticated && user ? (
                  /* AUTHENTICATED USER GREETING */
                  <div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 14px",
                        borderRadius: 20,
                        background: "rgba(16, 185, 129, 0.2)",
                        border: "1px solid rgba(52, 211, 153, 0.35)",
                        color: "#6ee7b7",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        marginBottom: 16,
                      }}
                    >
                      <Sparkles size={14} color="#34d399" />
                      <span>Chào mừng trở lại, {user.name.split(" ")[0]}!</span>
                    </div>

                    <h1
                      style={{
                        fontSize: "2.8rem",
                        fontWeight: 800,
                        color: "#fff",
                        lineHeight: 1.18,
                        letterSpacing: "-0.8px",
                        margin: "0 0 16px",
                      }}
                    >
                      Sẵn Sàng Cho Kỳ Nghỉ <br />
                      <span
                        style={{
                          background: "linear-gradient(90deg, #38bdf8, #818cf8, #34d399)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        Tiếp Theo Của Bạn?
                      </span>
                    </h1>

                    <p
                      style={{
                        fontSize: "1.02rem",
                        color: "#cbd5e1",
                        lineHeight: 1.65,
                        margin: "0 0 24px",
                        maxWidth: 540,
                      }}
                    >
                      Khám phá những căn homestay và villa độc đáo nhất, tận hưởng kỳ nghỉ yên bình cùng gia đình và bạn bè với mức giá ưu đãi đặc quyền.
                    </p>

                    {/* Upcoming Stay Card (If any) */}
                    {recentBooking && recentBooking.status !== "cancelled" && (
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.08)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: 16,
                          padding: "14px 18px",
                          marginBottom: 24,
                          maxWidth: 500,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              background: "rgba(37, 99, 235, 0.3)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#60a5fa",
                              flexShrink: 0,
                            }}
                          >
                            <CalendarDays size={20} />
                          </div>
                          <div>
                            <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
                              Chuyến đi sắp tới
                            </span>
                            <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>
                              {recentBooking.propertyTitle}
                            </div>
                            <span style={{ fontSize: "0.76rem", color: "#38bdf8" }}>
                              {recentBooking.checkIn} ➔ {recentBooking.checkOut} ({recentBooking.nights} đêm)
                            </span>
                          </div>
                        </div>

                        <Link
                          href="/dashboard"
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: "#2563EB",
                            color: "#fff",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            textDecoration: "none",
                            flexShrink: 0,
                          }}
                        >
                          Chi tiết
                        </Link>
                      </div>
                    )}

                    {/* CTA Actions for Logged in user */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                      <button
                        onClick={scrollToSearch}
                        className="btn-primary-hs"
                        style={{ padding: "12px 26px", fontSize: "0.95rem", borderRadius: 12 }}
                      >
                        <Search size={16} />
                        <span>Tìm chỗ nghỉ mới</span>
                      </button>

                      <Link href="/dashboard" style={{ textDecoration: "none" }}>
                        <button
                          className="btn-outline-hs"
                          style={{
                            padding: "11px 22px",
                            fontSize: "0.95rem",
                            borderRadius: 12,
                            borderColor: "rgba(255,255,255,0.3)",
                            color: "#fff",
                          }}
                        >
                          <CalendarDays size={16} />
                          <span>Chuyến đi của tôi</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* PUBLIC GUEST HERO CONTENT */
                  <div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        borderRadius: 20,
                        background: "rgba(37, 99, 235, 0.25)",
                        border: "1px solid rgba(147, 197, 253, 0.3)",
                        color: "#bfdbfe",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        marginBottom: 16,
                      }}
                    >
                      <Sparkles size={14} color="#60a5fa" />
                      <span>Trải nghiệm nghỉ dưỡng xanh & sang trọng trên toàn quốc</span>
                    </div>

                    <h1
                      style={{
                        fontSize: "2.9rem",
                        fontWeight: 800,
                        color: "#fff",
                        lineHeight: 1.15,
                        letterSpacing: "-0.8px",
                        margin: "0 0 16px",
                      }}
                    >
                      Tìm Nơi Trú Ẩn <br />
                      <span
                        style={{
                          background: "linear-gradient(90deg, #38bdf8, #818cf8, #34d399)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        Bình Yên Cho Tâm Hồn
                      </span>
                    </h1>

                    <p
                      style={{
                        fontSize: "1.05rem",
                        color: "#cbd5e1",
                        lineHeight: 1.65,
                        margin: "0 0 26px",
                        maxWidth: 540,
                      }}
                    >
                      Khám phá hơn 500+ homestay, villa nghỉ dưỡng cao cấp giữa thiên nhiên Đà Lạt, Sa Pa, Phú Quốc... Giá niêm yết minh bạch, đồng bộ chống overbooking và thanh toán quét mã VietQR tiện lợi.
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
                      <button
                        onClick={scrollToSearch}
                        className="btn-primary-hs"
                        style={{ padding: "13px 28px", fontSize: "0.98rem", borderRadius: 12 }}
                      >
                        <Compass size={17} />
                        <span>Khám phá ngay</span>
                      </button>

                      <Link href="/auth/register" style={{ textDecoration: "none" }}>
                        <button
                          className="btn-outline-hs"
                          style={{
                            padding: "12px 22px",
                            fontSize: "0.95rem",
                            borderRadius: 12,
                            borderColor: "rgba(255,255,255,0.3)",
                            color: "#fff",
                          }}
                        >
                          <Building2 size={16} />
                          <span>Dành cho Chủ nhà</span>
                        </button>
                      </Link>
                    </div>

                    {/* Trust Signals */}
                    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", fontSize: "0.82rem", color: "#94a3b8" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckCircle2 size={15} color="#34d399" />
                        <span>100% Chủ nhà xác minh</span>
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckCircle2 size={15} color="#34d399" />
                        <span>Chống Overbooking 100%</span>
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckCircle2 size={15} color="#34d399" />
                        <span>VietQR tiện lợi</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Interactive 3D Three.js Scene */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "460px",
                  borderRadius: 24,
                  overflow: "hidden",
                  background: "radial-gradient(circle at center, rgba(30, 58, 138, 0.45) 0%, rgba(15, 23, 42, 0.8) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
                }}
              >
                <HeroScene3D />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SEARCH BAR WIDGET */}
        <section
          id="search-section"
          style={{
            position: "relative",
            zIndex: 10,
            marginTop: "-34px",
            paddingBottom: "20px",
          }}
        >
          <div className="container">
            <div className="hs-search-card" style={{ margin: "0 auto", maxWidth: 960 }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, paddingTop: 12, borderTop: "1px solid #f1f5f9", flexWrap: "wrap" }}>
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
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      background: "#f1f5f9",
                      border: "none",
                      color: "#475569",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: POPULAR DESTINATIONS */}
        <section style={{ padding: "50px 0 60px", background: "#fff" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 26, flexWrap: "wrap", gap: 12 }}>
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

        {/* SECTION 5: FEATURED HOMESTAYS */}
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

        {/* SECTION 6: WHY CHOOSE US (CAM KẾT GIÁ TRỊ) */}
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              <div style={{ padding: "26px 22px", borderRadius: 16, background: "#eff6ff", border: "1px solid #dbeafe" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#2563EB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Shield size={20} />
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
                  100% Chủ Nhà Xác Minh
                </h3>
                <p style={{ fontSize: "0.84rem", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                  Tất cả homestay trên sàn đều được ban quản trị kiểm duyệt chặt chẽ hình ảnh thực tế và xác minh CCCD/giấy phép kinh doanh của chủ nhà.
                </p>
              </div>

              <div style={{ padding: "26px 22px", borderRadius: 16, background: "#f0fdf4", border: "1px solid #dcfce7" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#16a34a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Award size={20} />
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
                  Giá Minh Bạch & VietQR
                </h3>
                <p style={{ fontSize: "0.84rem", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                  Giá phòng niêm yết rõ ràng không có phụ phí ẩn, hỗ trợ thanh toán VietQR quét mã chuyển khoản tức thì qua ứng dụng ngân hàng.
                </p>
              </div>

              <div style={{ padding: "26px 22px", borderRadius: 16, background: "#faf5ff", border: "1px solid #f3e8ff" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#9333ea", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Clock size={20} />
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
                  Chống Overbooking 100%
                </h3>
                <p style={{ fontSize: "0.84rem", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                  Hệ thống kết nối trực tiếp với Mobile App và Lễ tân tại quầy homestay, khóa phòng thời gian thực, đảm bảo không bao giờ bị bán trùng phòng.
                </p>
              </div>

              <div style={{ padding: "26px 22px", borderRadius: 16, background: "#fffbeb", border: "1px solid #fef3c7" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#d97706", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Star size={20} />
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
                  Tích Lũy Điểm Thưởng Đổi Quà
                </h3>
                <p style={{ fontSize: "0.84rem", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                  Tặng ngay +100 điểm khi đặt phòng và +150 điểm khi đánh giá 5★ để quy đổi các voucher giảm giá giá trị cao cho chuyến đi tiếp theo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: HOW IT WORKS (QUY TRÌNH 4 BƯỚC) */}
        <section style={{ padding: "64px 0", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#2563EB", display: "block", marginBottom: 4 }}>
                Quy trình đặt chỗ
              </span>
              <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Trải Nghiệm Đặt Homestay Trong 4 Bước
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20 }}>
              {[
                { step: "01", title: "Khám phá", desc: "Tìm kiếm homestay theo địa điểm, mức giá, tiện nghi và số lượng khách." },
                { step: "02", title: "Chọn ngày", desc: "Kiểm tra lịch phòng trống thời gian thực và chọn thời gian lưu trú." },
                { step: "03", title: "Đặt & Thanh toán", desc: "Xác nhận đặt chỗ và quét mã VietQR chuyển khoản nhanh gọn." },
                { step: "04", title: "Nhận phòng", desc: "Thảnh thơi tận hưởng kỳ nghỉ và tích lũy điểm thưởng thành viên." },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#fff",
                    padding: "26px 20px",
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      fontSize: "2.4rem",
                      fontWeight: 900,
                      color: "#e2e8f0",
                      lineHeight: 1,
                      display: "block",
                      marginBottom: 10,
                    }}
                  >
                    {item.step}
                  </span>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: "0.84rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 8: TESTIMONIALS */}
        <section style={{ padding: "64px 0", background: "#fff", borderTop: "1px solid #e2e8f0" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#2563EB", display: "block", marginBottom: 4 }}>
                Đánh giá từ khách hàng
              </span>
              <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Những Trải Nghiệm Khó Quên
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              {TESTIMONIALS.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#f8fafc",
                    padding: "26px",
                    borderRadius: 18,
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {/* Stars */}
                    <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>

                    <p style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.7, fontStyle: "italic", margin: "0 0 18px" }}>
                      &ldquo;{t.comment}&rdquo;
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #2563EB, #7c3aed)",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>{t.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {t.location} • {t.homestay}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 9: FINAL CALL TO ACTION (CTA) */}
        <section style={{ padding: "60px 0 80px", background: "#f8fafc" }}>
          <div className="container">
            <div
              style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
                borderRadius: 24,
                padding: "48px 36px",
                color: "#fff",
                textAlign: "center",
                boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 14px",
                  borderRadius: 20,
                  background: "rgba(56, 189, 248, 0.15)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  color: "#7dd3fc",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  marginBottom: 14,
                }}
              >
                <Sparkles size={13} />
                <span>Khởi đầu chuyến đi của bạn</span>
              </div>

              <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
                Kỳ Nghỉ Trong Mơ Của Bạn Đang Chờ Đón
              </h2>

              <p style={{ fontSize: "0.95rem", color: "#cbd5e1", maxWidth: 600, margin: "0 auto 28px", lineHeight: 1.6 }}>
                Đặt chỗ ngay hôm nay để nhận ưu đãi giảm giá và trải nghiệm những khoảnh khắc nghỉ dưỡng trọn vẹn nhất.
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                <button
                  onClick={scrollToSearch}
                  className="btn-primary-hs"
                  style={{ padding: "13px 30px", fontSize: "0.95rem", borderRadius: 12 }}
                >
                  <Search size={16} />
                  <span>Tìm homestay ngay</span>
                </button>

                <Link href="/auth/register" style={{ textDecoration: "none" }}>
                  <button
                    className="btn-outline-hs"
                    style={{
                      padding: "12px 24px",
                      fontSize: "0.95rem",
                      borderRadius: 12,
                      borderColor: "rgba(255,255,255,0.3)",
                      color: "#fff",
                    }}
                  >
                    <Building2 size={16} />
                    <span>Trở thành Chủ nhà</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* SECTION 10: FOOTER */}
      <Footer />
    </div>
  );
}
