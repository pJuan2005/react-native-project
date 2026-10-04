"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Search, Users, X } from "lucide-react";

interface SearchWidgetProps {
  onSearch?: () => void;
}

const POPULAR_TAGS = [
  "Đà Lạt",
  "Sa Pa",
  "Phú Quốc",
  "Hội An",
  "Nha Trang",
  "Ninh Bình",
  "Villa",
  "Cabin",
];

export function SearchWidget({ onSearch }: SearchWidgetProps) {
  const router = useRouter();

  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [errorMessage, setErrorMessage] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (checkIn && checkIn < todayStr) {
      setErrorMessage("Ngày nhận phòng không thể trước ngày hiện tại.");
      return;
    }

    if (checkIn && checkOut) {
      if (new Date(checkOut) <= new Date(checkIn)) {
        setErrorMessage("Ngày trả phòng phải sau ngày nhận phòng.");
        return;
      }
    }

    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);

    if (onSearch) onSearch();
    router.push(`/listings?${params.toString()}`);
  };

  const handleTagClick = (tag: string) => {
    setLocation(tag);
    const params = new URLSearchParams();
    params.set("location", tag);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(16px)",
        borderRadius: 24,
        padding: "16px 20px 14px",
        boxShadow: "0 20px 50px rgba(15, 23, 42, 0.22), 0 2px 8px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        maxWidth: 1040,
        margin: "0 auto",
      }}
    >
      <form onSubmit={handleSearch}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr)) 120px",
            gap: 12,
            alignItems: "center",
          }}
          className="hs-search-grid"
        >
          {/* 1. Điểm đến / Homestay */}
          <div
            style={{
              padding: "10px 14px",
              background: "#f8fafc",
              borderRadius: 14,
              border: "1.5px solid #e2e8f0",
              transition: "all 0.15s ease",
            }}
          >
            <label
              htmlFor="search-destination"
              style={{
                display: "block",
                fontSize: "0.72rem",
                fontWeight: 800,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                marginBottom: 3,
                cursor: "pointer",
              }}
            >
              Bạn muốn đi đâu?
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={17} color="#2563EB" style={{ flexShrink: 0 }} />
              <input
                id="search-destination"
                type="text"
                placeholder="Địa điểm, homestay, villa..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              />
              {location && (
                <button
                  type="button"
                  onClick={() => setLocation("")}
                  style={{
                    border: "none",
                    background: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "#94a3b8",
                  }}
                  aria-label="Xóa địa điểm đã nhập"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* 2. Ngày nhận phòng */}
          <div
            style={{
              padding: "10px 14px",
              background: "#f8fafc",
              borderRadius: 14,
              border: "1.5px solid #e2e8f0",
              transition: "all 0.15s ease",
            }}
          >
            <label
              htmlFor="search-checkin"
              style={{
                display: "block",
                fontSize: "0.72rem",
                fontWeight: 800,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                marginBottom: 3,
                cursor: "pointer",
              }}
            >
              Nhận phòng
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={17} color="#2563EB" style={{ flexShrink: 0 }} />
              <input
                id="search-checkin"
                type="date"
                min={todayStr}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>

          {/* 3. Ngày trả phòng */}
          <div
            style={{
              padding: "10px 14px",
              background: "#f8fafc",
              borderRadius: 14,
              border: "1.5px solid #e2e8f0",
              transition: "all 0.15s ease",
            }}
          >
            <label
              htmlFor="search-checkout"
              style={{
                display: "block",
                fontSize: "0.72rem",
                fontWeight: 800,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                marginBottom: 3,
                cursor: "pointer",
              }}
            >
              Trả phòng
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={17} color="#2563EB" style={{ flexShrink: 0 }} />
              <input
                id="search-checkout"
                type="date"
                min={checkIn || todayStr}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>

          {/* 4. Số khách */}
          <div
            style={{
              padding: "10px 14px",
              background: "#f8fafc",
              borderRadius: 14,
              border: "1.5px solid #e2e8f0",
              transition: "all 0.15s ease",
            }}
          >
            <label
              htmlFor="search-guests"
              style={{
                display: "block",
                fontSize: "0.72rem",
                fontWeight: 800,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                marginBottom: 3,
                cursor: "pointer",
              }}
            >
              Số lượng khách
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={17} color="#2563EB" style={{ flexShrink: 0 }} />
              <select
                id="search-guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  cursor: "pointer",
                }}
              >
                <option value="1">1 khách</option>
                <option value="2">2 khách</option>
                <option value="3">3 khách</option>
                <option value="4">4 khách</option>
                <option value="6">6 khách</option>
                <option value="8">8+ khách</option>
              </select>
            </div>
          </div>

          {/* 5. Nút Tìm kiếm */}
          <div>
            <button
              type="submit"
              className="btn-primary-hs"
              style={{
                width: "100%",
                height: 52,
                borderRadius: 14,
                fontSize: "0.95rem",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                boxShadow: "0 8px 20px rgba(37, 99, 235, 0.3)",
              }}
            >
              <Search size={18} />
              <span>Tìm</span>
            </button>
          </div>
        </div>
      </form>

      {errorMessage && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 14px",
            borderRadius: 10,
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "0.82rem",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Dải gợi ý nhanh */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 12,
          paddingTop: 10,
          borderTop: "1px solid #f1f5f9",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 700 }}>
          Gợi ý tìm nhanh:
        </span>
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleTagClick(tag)}
            style={{
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: "0.78rem",
              fontWeight: 600,
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              color: "#475569",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#eff6ff";
              e.currentTarget.style.color = "#2563EB";
              e.currentTarget.style.borderColor = "#bfdbfe";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.color = "#475569";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
