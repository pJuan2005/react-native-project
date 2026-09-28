"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import {
  getProperties,
  type PropertyQueryFilters,
  type PropertySummary,
} from "@/services/propertyService";
import { PropertyCard } from "@/components/shared/PropertyCard";
import { PaginationControls } from "@/components/shared/PaginationControls";

const PROPERTY_TYPES = [
  "All",
  "Villa",
  "Homestay",
  "Resort",
  "Cabin",
  "Eco Homestay",
  "Apartment",
];

const ITEMS_PER_PAGE = 6;

function formatPrice(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount || 0) + " ₫";
}

function ListingContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceMax, setPriceMax] = useState(10000000);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const locationQuery = searchParams.get("location")?.trim() || "";
  const typeQuery = searchParams.get("type")?.trim() || "";
  const checkInQuery = searchParams.get("checkIn")?.trim() || "";
  const checkOutQuery = searchParams.get("checkOut")?.trim() || "";
  const hasGuestQuery = searchParams.has("guests");
  const guestsQuery = Number(searchParams.get("guests") || 1);
  const requiredGuests = Number.isFinite(guestsQuery) && guestsQuery > 0 ? guestsQuery : 1;
  const initialPropertyType = PROPERTY_TYPES.includes(typeQuery) ? typeQuery : "All";

  const serverFilters = useMemo<PropertyQueryFilters>(
    () => ({
      location: locationQuery,
      type: initialPropertyType !== "All" ? initialPropertyType : undefined,
      guests: requiredGuests > 1 ? requiredGuests : undefined,
      checkIn: checkInQuery || undefined,
      checkOut: checkOutQuery || undefined,
    }),
    [checkInQuery, checkOutQuery, initialPropertyType, locationQuery, requiredGuests],
  );

  useEffect(() => {
    setLoading(true);

    getProperties(serverFilters)
      .then(setProperties)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [serverFilters]);

  useEffect(() => {
    setSearchQuery(locationQuery);
    setSelectedType(initialPropertyType);
    setSelectedCities([]);
    setCurrentPage(1);
  }, [initialPropertyType, locationQuery, requiredGuests, checkInQuery, checkOutQuery]);

  const cityOptions = useMemo(
    () => [...new Set(properties.map((property) => property.city).filter(Boolean))].sort(),
    [properties],
  );

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !normalizedQuery ||
        property.title.toLowerCase().includes(normalizedQuery) ||
        property.location.toLowerCase().includes(normalizedQuery) ||
        property.city.toLowerCase().includes(normalizedQuery);

      const matchesPrice = property.price <= priceMax;
      const matchesType =
        selectedType === "All" || property.type === selectedType;
      const matchesRating = property.rating >= selectedRating;
      const matchesCity =
        selectedCities.length === 0 || selectedCities.includes(property.city);
      const matchesGuests = property.maxGuests >= requiredGuests;

      return (
        matchesSearch &&
        matchesPrice &&
        matchesType &&
        matchesRating &&
        matchesCity &&
        matchesGuests
      );
    });
  }, [
    priceMax,
    properties,
    requiredGuests,
    searchQuery,
    selectedCities,
    selectedRating,
    selectedType,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, priceMax, selectedType, selectedRating, selectedCities]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperties.length / ITEMS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProperties = filteredProperties.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  function toggleCity(city: string) {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((item) => item !== city) : [...prev, city],
    );
  }

  function clearFilters() {
    setSearchQuery("");
    setPriceMax(10000000);
    setSelectedType("All");
    setSelectedRating(0);
    setSelectedCities([]);
  }

  const tripSummary = useMemo(() => {
    const parts: string[] = [];

    if (locationQuery) {
      parts.push(`tại ${locationQuery}`);
    }

    if (hasGuestQuery) {
      parts.push(
        requiredGuests > 1
          ? `cho ${requiredGuests} khách`
          : "cho 1 khách",
      );
    }

    if (checkInQuery && checkOutQuery) {
      parts.push(`từ ${checkInQuery} đến ${checkOutQuery}`);
    }

    return parts.length > 0 ? `Kết quả tìm kiếm ${parts.join(" ")}` : "";
  }, [checkInQuery, checkOutQuery, hasGuestQuery, locationQuery, requiredGuests]);

  function FilterSidebar() {
    return (
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h5 style={{ fontWeight: 800, fontSize: "0.95rem", margin: 0, display: "flex", alignItems: "center", gap: 6, color: "#0f172a" }}>
            <SlidersHorizontal size={16} color="#2563EB" /> Bộ lọc tìm kiếm
          </h5>
          <button
            onClick={clearFilters}
            style={{
              border: "none",
              background: "none",
              color: "#2563EB",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.78rem",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <X size={13} /> Xóa lọc
          </button>
        </div>

        {/* Price Slider */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>Mức giá tối đa</label>
            <span style={{ color: "#2563EB", fontWeight: 800, fontSize: "0.88rem" }}>{formatPrice(priceMax)}</span>
          </div>
          <input
            type="range"
            min={500000}
            max={10000000}
            step={250000}
            value={priceMax}
            onChange={(event) => setPriceMax(Number(event.target.value))}
            style={{ width: "100%", accentColor: "#2563EB", cursor: "pointer" }}
          />
        </div>

        {/* Property Type */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 8 }}>Loại hình chỗ nghỉ</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  border:
                    selectedType === type
                      ? "1.5px solid #2563EB"
                      : "1px solid #e2e8f0",
                  background: selectedType === type ? "#eff6ff" : "#fff",
                  color: selectedType === type ? "#2563EB" : "#475569",
                  fontWeight: selectedType === type ? 700 : 500,
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  transition: "all 0.15s",
                }}
              >
                {type === "All" ? "Tất cả" : type}
              </button>
            ))}
          </div>
        </div>

        {/* City Options */}
        {cityOptions.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 8 }}>Địa điểm / Thành phố</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cityOptions.map((city) => (
                <label key={city} style={{ fontSize: "0.84rem", color: "#475569", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedCities.includes(city)}
                    onChange={() => toggleCity(city)}
                    style={{ accentColor: "#2563EB", width: 15, height: 15 }}
                  />
                  <span>{city}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Rating Filter */}
        <div>
          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 8 }}>Đánh giá sao</label>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 4, 4.5, 4.8].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  borderRadius: 8,
                  border:
                    selectedRating === rating
                      ? "1.5px solid #2563EB"
                      : "1px solid #e2e8f0",
                  background: selectedRating === rating ? "#eff6ff" : "#fff",
                  color: selectedRating === rating ? "#2563EB" : "#475569",
                  fontWeight: selectedRating === rating ? 700 : 500,
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  transition: "all 0.15s",
                }}
              >
                {rating === 0 ? "Tất cả" : `${rating}★+`}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#64748b", fontSize: "0.95rem" }}>
        Đang tải danh sách homestay...
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Page Title Bar */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "28px 0",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ fontWeight: 800, fontSize: "1.75rem", color: "#0f172a", margin: 0 }}>
                Khám Phá Homestay & Villa
              </h1>
              <p style={{ color: "#64748b", fontSize: "0.88rem", margin: "4px 0 0" }}>
                {tripSummary || `Tìm thấy ${filteredProperties.length} chỗ nghỉ sẵn sàng đón khách`}
              </p>
            </div>

            {/* Keyword Search Input */}
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                placeholder="Tìm theo tên homestay, địa điểm..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                style={{
                  padding: "9px 12px 9px 36px",
                  borderRadius: 12,
                  border: "1.5px solid #e2e8f0",
                  minWidth: 280,
                  fontSize: "0.88rem",
                  outline: "none",
                  color: "#0f172a",
                  background: "#fff",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ padding: "32px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 28, alignItems: "start" }}>
          {/* Left Sidebar Filters */}
          <div style={{ position: "sticky", top: 80 }}>
            <FilterSidebar />
          </div>

          {/* Right Properties Grid */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
                color: "#64748b",
                fontSize: "0.85rem",
              }}
            >
              <Filter size={15} color="#2563EB" />
              <span>
                Hiển thị <strong>{paginatedProperties.length}</strong> / <strong>{filteredProperties.length}</strong> homestay phù hợp với tiêu chí
              </span>
            </div>

            {paginatedProperties.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  padding: "60px 20px",
                  borderRadius: 16,
                  textAlign: "center",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ width: 50, height: 50, borderRadius: 25, background: "#f1f5f9", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Search size={24} color="#94a3b8" />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
                  Không tìm thấy homestay phù hợp
                </h3>
                <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0 0 16px" }}>
                  Hãy thử mở rộng bộ lọc giá, đổi địa điểm hoặc bỏ chọn bộ lọc để xem thêm chỗ nghỉ khác.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary-hs"
                  style={{ fontSize: "0.85rem", padding: "8px 20px" }}
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 20,
                  }}
                >
                  {paginatedProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                <div style={{ marginTop: 28 }}>
                  <PaginationControls
                    currentPage={safeCurrentPage}
                    totalPages={totalPages}
                    totalItems={filteredProperties.length}
                    pageSize={ITEMS_PER_PAGE}
                    itemLabel="chỗ nghỉ"
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: "center", color: "#64748b" }}>Đang tải danh sách homestay...</div>}>
      <ListingContent />
    </Suspense>
  );
}
