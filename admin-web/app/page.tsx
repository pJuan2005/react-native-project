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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Banner: Role Gateway Switcher Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-300">
              Nền tảng Homestay Đa Phân Hệ — Đồng bộ thời gian thực với Mobile App
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="px-2.5 py-1 rounded-md bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white font-bold transition flex items-center gap-1 border border-blue-500/30"
            >
              <Shield size={12} />
              <span>👑 Cổng Admin</span>
            </Link>
            <Link
              href="/host/dashboard"
              className="px-2.5 py-1 rounded-md bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold transition flex items-center gap-1 border border-emerald-500/30"
            >
              <Building2 size={12} />
              <span>🏡 Cổng Chủ Nhà</span>
            </Link>
            <Link
              href="/quick-manage/HMTOKEN_0001"
              className="px-2.5 py-1 rounded-md bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white font-bold transition flex items-center gap-1 border border-amber-500/30"
            >
              <CalendarPlus size={12} />
              <span>🏨 Lễ tân Quầy</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Guest Web Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION WITH SEARCH WIDGET */}
        <section
          className="bg-gradient-to-br from-blue-900 via-sky-900 to-indigo-950 text-white py-14 sm:py-20"
          style={{ position: "relative", overflow: "hidden" }}
        >
          {/* Background Decorative Image */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.25,
              mixBlendMode: "overlay",
              pointerEvents: "none",
            }}
          >
            <Image
              src="/img/banner-home.jpg"
              alt="Homestay Hero"
              fill
              priority
              style={{ objectFit: "cover" }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4" style={{ position: "relative", zIndex: 10 }}>
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4">
                <Sparkles size={14} />
                <span>Trải nghiệm nghỉ dưỡng xanh & sang trọng trên toàn quốc</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Tìm & Đặt Homestay, Villa Cho Kỳ Nghỉ
              </h1>
              <p className="text-sm sm:text-base text-blue-100/90 mt-3 max-w-2xl mx-auto">
                Hơn 500+ chỗ nghỉ nguyên căn độc đáo, view núi săn mây, sát biển và phố cổ. Đặt phòng nhanh chóng và thanh toán tiện lợi qua VietQR.
              </p>
            </div>

            {/* MAIN SEARCH WIDGET FOR DESKTOP & WEB */}
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-100 text-slate-800">
              <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Destination */}
                <div className="sm:col-span-4 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-400 transition">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    Địa điểm / Tên homestay
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600 shrink-0" />
                    <input
                      type="text"
                      placeholder="Bạn muốn đi đâu? (Đà Lạt, Sa Pa...)"
                      value={searchForm.location}
                      onChange={(e) => setSearchForm({ ...searchForm, location: e.target.value })}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Check-in */}
                <div className="sm:col-span-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-400 transition">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    Nhận phòng
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600 shrink-0" />
                    <input
                      type="date"
                      value={searchForm.checkIn}
                      onChange={(e) => setSearchForm({ ...searchForm, checkIn: e.target.value })}
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Check-out */}
                <div className="sm:col-span-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-400 transition">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    Trả phòng
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600 shrink-0" />
                    <input
                      type="date"
                      value={searchForm.checkOut}
                      onChange={(e) => setSearchForm({ ...searchForm, checkOut: e.target.value })}
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/30 transition flex items-center justify-center gap-2"
                  >
                    <Search size={16} />
                    <span>Tìm kiếm</span>
                  </button>
                </div>
              </form>

              {searchError && (
                <p className="text-xs text-red-600 font-semibold mt-2 text-center">
                  ⚠️ {searchError}
                </p>
              )}

              {/* Quick Search Tag Chips */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 flex-wrap">
                <span className="text-xs text-slate-400 font-medium">Gợi ý nhanh:</span>
                {QUICK_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchForm({ ...searchForm, location: tag });
                      router.push(`/listings?location=${encodeURIComponent(tag)}`);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: POPULAR DESTINATIONS */}
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                  Địa điểm du lịch
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  Khám Phá Các Miền Đất Đẹp Nhất Việt Nam
                </h2>
              </div>
              <Link
                href="/listings"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Xem tất cả chỗ nghỉ</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {destinations.map((dest) => (
                <Link
                  key={dest.name}
                  href={`/listings?location=${encodeURIComponent(dest.name)}`}
                  className="group rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition block"
                  style={{
                    position: "relative",
                    minHeight: 220,
                    height: 220,
                    display: "block",
                  }}
                >
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                    className="group-hover:scale-110 transition duration-300"
                    style={{ objectFit: "cover" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.1) 60%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: "14px 12px",
                      color: "#fff",
                      zIndex: 2,
                    }}
                  >
                    <h3 className="font-extrabold text-sm">{dest.name}</h3>
                    <p className="text-[11px] text-slate-300">{dest.properties} chỗ nghỉ</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: FEATURED HOMESTAYS (GUEST WEB RICH GRID) */}
        <section className="py-14 bg-slate-50 border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                  Đề xuất nổi bật
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  Chỗ Nghỉ Đẹp Được Yêu Thích Nhất
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Được đánh giá cao bởi cộng đồng du khách với đầy đủ tiện nghi và mức giá ưu đãi
                </p>
              </div>

              <Link
                href="/listings"
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-xs flex items-center gap-1.5"
              >
                <span>Xem tất cả chỗ nghỉ</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {isLoadingFeatured ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                Đang tải danh sách homestay nổi bật...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: WHY CHOOSE HOMESTAY PLATFORM */}
        <section className="py-16 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                Cam kết chất lượng
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Tại Sao Du Khách Lựa Chọn Homestay Booking?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100 flex flex-col items-start text-left">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-md shadow-blue-500/20">
                  <Shield size={22} />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-1.5">
                  100% Chủ Nhà Xác Minh Danh Tính
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tất cả homestay trên sàn đều được ban quản trị kiểm duyệt chặt chẽ hình ảnh thực tế và xác minh CCCD/giấy phép kinh doanh của chủ nhà.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-start text-left">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-md shadow-emerald-500/20">
                  <Award size={22} />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-1.5">
                  Giá Tốt Nhất & Không Phí Ẩn
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Giá phòng niêm yết minh bạch, hỗ trợ thanh toán VietQR quét mã chuyển khoản tức thì và tự động tích lũy điểm thưởng đổi voucher cho kỳ nghỉ sau.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-purple-50/50 border border-purple-100 flex flex-col items-start text-left">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-4 shadow-md shadow-purple-500/20">
                  <Clock size={22} />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-1.5">
                  Đồng Bộ Hai Chiều & Chống Overbooking
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
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
