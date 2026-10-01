"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Compass,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  CalendarDays,
  CheckCircle2,
  TreePine,
  Coffee,
  Building2,
  Bed,
  Users,
} from "lucide-react";
import { destinations } from "@/lib/destinations";
import { PropertyCard } from "@/components/shared/PropertyCard";
import { getProperties, type PropertySummary } from "@/services/propertyService";
import { getMyBookings, type BookingRecord } from "@/services/bookingService";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/components/context/AuthContext";
import { HeroScene3D } from "@/components/guest/HeroScene3D";

const QUICK_SEARCH_TAGS = [
  "Đà Lạt",
  "Sa Pa",
  "Phú Quốc",
  "Hội An",
  "Nha Trang",
  "Ninh Bình",
  "Villa",
  "Cabin",
];

const HOSPITALITY_VALUES = [
  {
    icon: <TreePine size={24} color="#16a34a" />,
    title: "Chỗ nghỉ độc đáo giữa thiên nhiên",
    description:
      "Tuyển chọn những căn villa, homestay gỗ nguyên căn có kiến trúc ấn tượng, view đồi núi săn mây hoặc sát bờ biển riêng tư.",
  },
  {
    icon: <ShieldCheck size={24} color="#2563EB" />,
    title: "Chủ nhà tận tâm & Đã xác minh",
    description:
      "100% cơ sở lưu trú được kiểm duyệt kỹ lưỡng về hình ảnh thực tế và xác minh danh tính chủ nhà, bảo đảm an tâm tuyệt đối.",
  },
  {
    icon: <Coffee size={24} color="#d97706" />,
    title: "Trải nghiệm bản địa sâu sắc",
    description:
      "Không chỉ là nơi dừng chân, mỗi chuyến đi là một trải nghiệm văn hóa địa phương ấm cúng và đầy ắp kỷ niệm đáng nhớ.",
  },
  {
    icon: <Sparkles size={24} color="#9333ea" />,
    title: "Đặt phòng & VietQR tức thì",
    description:
      "Thao tác đặt phòng mượt mà, đồng bộ lịch chống overbooking thời gian thực và thanh toán quét mã VietQR tiện lợi.",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Discover",
    subtitle: "Khám phá",
    description: "Tìm kiếm chỗ nghỉ phù hợp với sở thích, phong cách du lịch và ngân sách của bạn.",
  },
  {
    step: "02",
    title: "Book",
    subtitle: "Đặt chỗ",
    description: "Chọn ngày nhận/trả phòng và hoàn tất thanh toán chuyển khoản VietQR nhanh chóng.",
  },
  {
    step: "03",
    title: "Enjoy",
    subtitle: "Trải nghiệm",
    description: "Nhận phòng thảnh thơi, tận hưởng kỳ nghỉ trọn vẹn và tích lũy điểm thưởng thành viên.",
  },
];

const EDITORIAL_TESTIMONIALS = [
  {
    quote:
      "Không gian homestay thật sự yên bình đúng như trên ảnh. Sáng sớm thức dậy ngắm biển mây Sa Pa tràn qua thung lũng, nhâm nhi tách trà nóng là cảm giác khó quên nhất năm nay của gia đình mình.",
    author: "Nguyễn Thùy Linh",
    location: "Hà Nội",
    stayedAt: "Cloud Nine Homestay • Sa Pa",
    rating: 5,
    avatarChar: "L",
  },
  {
    quote:
      "Villa sát biển với hồ bơi vô cực riêng tư. Mọi thứ từ khâu đặt phòng, thanh toán VietQR đến đón tiếp của chủ nhà đều cực kỳ chu đáo và chuyên nghiệp. Chắc chắn sẽ quay lại!",
    author: "Trần Đức Nam",
    location: "TP. Hồ Chí Minh",
    stayedAt: "Ocean Breeze Villa • Phú Quốc",
    rating: 5,
    avatarChar: "N",
  },
  {
    quote:
      "Một căn nhà gỗ thông ấm cúng giữa sườn đồi Đà Lạt. Giá niêm yết rõ ràng không phụ phí ẩn, tích điểm thưởng chuyến này được đổi luôn voucher giảm giá cho chuyến sau. Rất hài lòng.",
    author: "Lê Hoàng Yến",
    location: "Đà Nẵng",
    stayedAt: "Pine Hill Cabin • Đà Lạt",
    rating: 5,
    avatarChar: "Y",
  },
];

export default function LandingHomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [searchForm, setSearchForm] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: "2",
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

      // If user is logged in, fetch their most recent active booking
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
    const el = document.getElementById("booking-search-widget");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      router.push("/listings");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fcfbf9", color: "#1e293b" }}>
      {/* 1. NAVBAR */}
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* 2. HERO SECTION WITH LUXURY 3D VILLA DIORAMA */}
        <section
          style={{
            position: "relative",
            minHeight: "86vh",
            display: "flex",
            alignItems: "center",
            background: "linear-gradient(135deg, #09121d 0%, #0f2137 40%, #163654 100%)",
            color: "#fff",
            overflow: "hidden",
            padding: "40px 0 70px",
          }}
        >
          {/* Subtle Ambient Golden Radial Glow */}
          <div
            style={{
              position: "absolute",
              top: "-15%",
              right: "-8%",
              width: "650px",
              height: "650px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(37, 99, 235, 0.05) 55%, transparent 75%)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          <div className="container" style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.05fr 0.95fr",
                gap: 36,
                alignItems: "center",
              }}
              className="hs-hero-grid"
            >
              {/* Left Column: Editorial Headline & Actions */}
              <div>
                {isAuthenticated && user ? (
                  /* AUTHENTICATED USER HERO */
                  <div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 14px",
                        borderRadius: 20,
                        background: "rgba(16, 185, 129, 0.18)",
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
                        fontSize: "3rem",
                        fontWeight: 800,
                        color: "#fff",
                        lineHeight: 1.15,
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
                        fontSize: "1.05rem",
                        color: "#cbd5e1",
                        lineHeight: 1.65,
                        margin: "0 0 24px",
                        maxWidth: 520,
                      }}
                    >
                      Khám phá những căn homestay và villa độc đáo nhất, tận hưởng kỳ nghỉ yên bình cùng gia đình và bạn bè với mức giá ưu đãi đặc quyền.
                    </p>

                    {/* Upcoming Stay Card (If any active booking exists) */}
                    {recentBooking && recentBooking.status !== "cancelled" && (
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.08)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: 16,
                          padding: "14px 18px",
                          marginBottom: 24,
                          maxWidth: 480,
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
                            padding: "7px 14px",
                            borderRadius: 8,
                            background: "#2563EB",
                            color: "#fff",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            textDecoration: "none",
                            flexShrink: 0,
                          }}
                        >
                          Xem đơn
                        </Link>
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                      <button
                        onClick={scrollToSearch}
                        className="btn-primary-hs"
                        style={{ padding: "13px 28px", fontSize: "0.95rem", borderRadius: 12 }}
                      >
                        <Search size={16} />
                        <span>Tìm chỗ nghỉ mới</span>
                      </button>

                      <Link href="/dashboard" style={{ textDecoration: "none" }}>
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
                          <CalendarDays size={16} />
                          <span>Chuyến đi của tôi</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* PUBLIC GUEST HERO CONTENT */
                  <div>
                    {/* Eyebrow badge */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 14px",
                        borderRadius: 20,
                        background: "rgba(37, 99, 235, 0.22)",
                        border: "1px solid rgba(147, 197, 253, 0.3)",
                        color: "#bfdbfe",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        marginBottom: 18,
                      }}
                    >
                      <Sparkles size={13} color="#60a5fa" />
                      <span>Stay somewhere special</span>
                    </div>

                    {/* Headline */}
                    <h1
                      style={{
                        fontSize: "3.2rem",
                        fontWeight: 800,
                        color: "#fff",
                        lineHeight: 1.12,
                        letterSpacing: "-1px",
                        margin: "0 0 18px",
                      }}
                    >
                      Exclusive Luxury Villas for <br />
                      <span
                        style={{
                          background: "linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #34d399 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        Unforgettable Escapes.
                      </span>
                    </h1>

                    {/* Subheadline */}
                    <p
                      style={{
                        fontSize: "1.08rem",
                        color: "#cbd5e1",
                        lineHeight: 1.65,
                        margin: "0 0 28px",
                        maxWidth: 520,
                      }}
                    >
                      Khám phá những căn homestay và villa độc đáo giữa rừng thông Đà Lạt, thung lũng mây Sa Pa hay biển xanh Phú Quốc. Nơi trú ẩn bình yên giúp bạn thư giãn và tái tạo năng lượng.
                    </p>

                    {/* CTA Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 30 }}>
                      <button
                        onClick={scrollToSearch}
                        className="btn-primary-hs"
                        style={{ padding: "14px 30px", fontSize: "0.98rem", borderRadius: 12, fontWeight: 700 }}
                      >
                        <Compass size={17} />
                        <span>Khám phá chỗ nghỉ</span>
                      </button>

                      <Link href="/listings" style={{ textDecoration: "none" }}>
                        <button
                          className="btn-outline-hs"
                          style={{
                            padding: "13px 24px",
                            fontSize: "0.95rem",
                            borderRadius: 12,
                            borderColor: "rgba(255,255,255,0.3)",
                            color: "#fff",
                          }}
                        >
                          <span>Xem tất cả homestay</span>
                          <ArrowRight size={15} />
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
                        <span>Thanh toán VietQR tiện lợi</span>
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
                  height: "480px",
                  borderRadius: 24,
                  overflow: "hidden",
                  background: "radial-gradient(circle at center, rgba(30, 58, 138, 0.45) 0%, rgba(15, 23, 42, 0.85) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
                }}
              >
                <HeroScene3D />
              </div>
            </div>
          </div>
        </section>

        {/* 3. BOOKING SEARCH WIDGET (Prominent Overlapping Search Bar) */}
        <section
          id="booking-search-widget"
          style={{
            position: "relative",
            zIndex: 20,
            marginTop: "-34px",
            paddingBottom: "24px",
          }}
        >
          <div className="container">
            <div className="hs-search-card" style={{ margin: "0 auto", maxWidth: 960 }}>
              <form onSubmit={handleSearchSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 120px", gap: 12, alignItems: "center" }}>
                  {/* Where / Destination */}
                  <div style={{ padding: "8px 14px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 2 }}>
                      Địa điểm / Homestay
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <MapPin size={15} color="#2563EB" style={{ flexShrink: 0 }} />
                      <input
                        type="text"
                        placeholder="Bạn muốn đi đâu? (Đà Lạt, Sa Pa...)"
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

                  {/* Search CTA */}
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

        {/* 4. FEATURED HOMESTAYS ("Stay somewhere you'll remember") */}
        <section style={{ padding: "50px 0 60px", background: "#fff" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#2563EB", display: "block", marginBottom: 4 }}>
                  Curated Collection
                </span>
                <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.4px" }}>
                  Stay somewhere you&apos;ll remember.
                </h2>
                <p style={{ fontSize: "0.9rem", color: "#64748b", margin: "4px 0 0" }}>
                  Tuyển chọn những chỗ nghỉ độc đáo được yêu thích nhất với điểm đánh giá xuất sắc từ cộng đồng du khách
                </p>
              </div>

              <Link
                href="/listings"
                className="btn-outline-hs"
                style={{ fontSize: "0.85rem", padding: "8px 18px" }}
              >
                <span>Xem tất cả chỗ nghỉ</span>
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

        {/* 5. POPULAR DESTINATIONS */}
        <section style={{ padding: "60px 0", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#2563EB", display: "block", marginBottom: 4 }}>
                  Inspiring Getaways
                </span>
                <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.4px" }}>
                  Khám phá các miền đất đẹp nhất Việt Nam
                </h2>
              </div>
              <Link
                href="/listings"
                style={{ fontSize: "0.88rem", fontWeight: 700, color: "#2563EB", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
              >
                <span>Tất cả điểm đến</span>
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

        {/* 6. HOSPITALITY EXPERIENCE ("More than a place to stay") */}
        <section style={{ padding: "70px 0", background: "#fff", borderTop: "1px solid #e2e8f0" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 50px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#2563EB", display: "block", marginBottom: 4 }}>
                Hospitality Standard
              </span>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
                More than a place to stay.
              </h2>
              <p style={{ fontSize: "0.92rem", color: "#64748b", margin: "6px 0 0" }}>
                Chúng tôi mang đến giải pháp nghỉ dưỡng trọn vẹn, kết hợp hài hòa giữa sự tiện nghi cao cấp và vẻ đẹp thiên nhiên thuần khiết.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
              {HOSPITALITY_VALUES.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "30px 24px",
                    borderRadius: 18,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      background: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 18,
                    }}
                  >
                    {item.icon}
                  </div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.65, margin: 0 }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. HOW IT WORKS (Minimal 3 Steps) */}
        <section style={{ padding: "70px 0", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 50px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#2563EB", display: "block", marginBottom: 4 }}>
                Simple & Seamless
              </span>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
                How HomeStay Works
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
              {HOW_IT_WORKS_STEPS.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#fff",
                    padding: "32px 26px",
                    borderRadius: 20,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: 900,
                      color: "#e2e8f0",
                      lineHeight: 1,
                      display: "block",
                      marginBottom: 14,
                    }}
                  >
                    {item.step}
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                      {item.title}
                    </h3>
                    <span style={{ fontSize: "0.82rem", color: "#2563EB", fontWeight: 700 }}>
                      ({item.subtitle})
                    </span>
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "#64748b", lineHeight: 1.65, margin: 0 }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. TESTIMONIALS (Editorial Guest Stories) */}
        <section style={{ padding: "70px 0", background: "#fff", borderTop: "1px solid #e2e8f0" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 50px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#2563EB", display: "block", marginBottom: 4 }}>
                Guest Stories
              </span>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
                Được tin yêu bởi hơn 1,200+ du khách
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 26 }}>
              {EDITORIAL_TESTIMONIALS.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#f8fafc",
                    padding: "30px 26px",
                    borderRadius: 20,
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {/* Stars */}
                    <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>

                    <p style={{ fontSize: "0.92rem", color: "#334155", lineHeight: 1.75, fontStyle: "italic", margin: "0 0 20px" }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #2563EB, #7c3aed)",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {t.avatarChar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a" }}>{t.author}</div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        {t.location} • <strong style={{ color: "#2563EB" }}>{t.stayedAt}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FINAL CALL TO ACTION (CTA) */}
        <section style={{ padding: "60px 0 80px", background: "#f8fafc" }}>
          <div className="container">
            <div
              style={{
                background: "linear-gradient(135deg, #09121d 0%, #0f2137 45%, #163654 100%)",
                borderRadius: 28,
                padding: "54px 36px",
                color: "#fff",
                textAlign: "center",
                boxShadow: "0 24px 50px rgba(15, 23, 42, 0.2)",
                border: "1px solid rgba(255,255,255,0.12)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 16px",
                  borderRadius: 20,
                  background: "rgba(56, 189, 248, 0.15)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  color: "#7dd3fc",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                <Sparkles size={14} />
                <span>Your next stay is waiting</span>
              </div>

              <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", margin: "0 0 14px", letterSpacing: "-0.6px" }}>
                Kỳ nghỉ trong mơ của bạn đang chờ đón.
              </h2>

              <p style={{ fontSize: "1rem", color: "#cbd5e1", maxWidth: 620, margin: "0 auto 32px", lineHeight: 1.65 }}>
                Khám phá ngay bộ sưu tập homestay nguyên căn độc đáo, tận hưởng kỳ nghỉ yên bình cùng gia đình và bạn bè.
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                <button
                  onClick={scrollToSearch}
                  className="btn-primary-hs"
                  style={{ padding: "14px 32px", fontSize: "0.98rem", borderRadius: 12, fontWeight: 700 }}
                >
                  <Search size={16} />
                  <span>Khám phá chỗ nghỉ ngay</span>
                </button>

                <Link href="/auth/register" style={{ textDecoration: "none" }}>
                  <button
                    className="btn-outline-hs"
                    style={{
                      padding: "13px 26px",
                      fontSize: "0.95rem",
                      borderRadius: 12,
                      borderColor: "rgba(255,255,255,0.35)",
                      color: "#fff",
                    }}
                  >
                    <Building2 size={16} />
                    <span>Trở thành Chủ nhà (Host)</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 10. FOOTER */}
      <Footer />
    </div>
  );
}
