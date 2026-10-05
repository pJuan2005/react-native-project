"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, CalendarDays, Compass, Sparkles } from "lucide-react";
import { SearchWidget } from "./SearchWidget";
import type { BookingRecord } from "@/services/bookingService";

const AtmosphericHero3D = dynamic(
  () => import("./AtmosphericHero3D").then((mod) => mod.AtmosphericHero3D),
  { ssr: false }
);

interface HeroSectionProps {
  user: { name: string; email: string; role?: string } | null;
  isAuthenticated: boolean;
  recentBooking: BookingRecord | null;
}

export function HeroSection({ user, isAuthenticated, recentBooking }: HeroSectionProps) {
  const scrollToSearch = () => {
    const el = document.getElementById("hero-search-container");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section
      style={{
        position: "relative",
        minHeight: "88vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: "#ffffff",
        overflow: "hidden",
        padding: "60px 0 40px",
      }}
    >
      {/* 1. ATMOSPHERIC 3D CANVAS (Integrated Natural Lakefront Atmosphere) */}
      <AtmosphericHero3D />

      {/* 2. CINEMATIC GRADIENT MASK (Blend 3D cleanly into Content & Page background) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(14, 23, 38, 0.85) 0%, rgba(14, 23, 38, 0.55) 50%, rgba(252, 251, 249, 0.95) 92%, #fcfbf9 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* 3. HERO CONTENT CONTAINER */}
      <div className="container" style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ maxWidth: 840, margin: "0 auto 36px", textAlign: "center" }}>
          {/* Eyebrow Pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 18px",
              borderRadius: 30,
              background: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              color: "#e2e8f0",
              fontSize: "0.84rem",
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            <Sparkles size={15} color="#fbbf24" />
            <span>
              {isAuthenticated && user
                ? `Chào mừng bạn quay trở lại, ${user.name.split(" ")[0]}`
                : "Không gian nghỉ dưỡng & Homestay nguyên căn"}
            </span>
          </div>

          {/* Main Editorial Headline */}
          <h1
            style={{
              fontSize: "3.4rem",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-1px",
              margin: "0 0 20px",
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
            }}
            className="hs-hero-title"
          >
            Tìm một nơi khiến bạn muốn ở lại.
          </h1>

          {/* Subheading */}
          <p
            style={{
              fontSize: "1.1rem",
              color: "#e2e8f0",
              lineHeight: 1.7,
              margin: "0 auto 28px",
              maxWidth: 680,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.35)",
            }}
          >
            Khám phá những homestay độc đáo, không gian nghỉ dưỡng yên bình và những điểm đến phù hợp với hành trình của bạn.
          </p>

          {/* Quick Active Booking Snippet (If guest has upcoming trip) */}
          {isAuthenticated && recentBooking && recentBooking.status !== "cancelled" && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(255, 255, 255, 0.14)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 16,
                padding: "10px 18px",
                marginBottom: 24,
                textAlign: "left",
              }}
            >
              <CalendarDays size={18} color="#38bdf8" />
              <div>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
                  Chuyến đi sắp tới:
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff", marginLeft: 6 }}>
                  {recentBooking.propertyTitle} ({recentBooking.checkIn} ➔ {recentBooking.checkOut})
                </span>
              </div>
              <Link
                href="/dashboard"
                style={{
                  fontSize: "0.78rem",
                  color: "#38bdf8",
                  fontWeight: 700,
                  textDecoration: "none",
                  marginLeft: 8,
                }}
              >
                Chi tiết →
              </Link>
            </div>
          )}

          {/* Hero CTAs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={scrollToSearch}
              className="btn-primary-hs"
              style={{
                padding: "14px 30px",
                fontSize: "0.98rem",
                borderRadius: 14,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 10px 25px rgba(37, 99, 235, 0.35)",
              }}
            >
              <Compass size={17} />
              <span>Khám phá chỗ nghỉ</span>
            </button>

            <Link href="/listings" style={{ textDecoration: "none" }}>
              <button
                className="btn-outline-hs"
                style={{
                  padding: "13px 26px",
                  fontSize: "0.96rem",
                  borderRadius: 14,
                  borderColor: "rgba(255, 255, 255, 0.4)",
                  color: "#ffffff",
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(8px)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>Xem tất cả chỗ nghỉ</span>
                <ArrowRight size={15} />
              </button>
            </Link>
          </div>
        </div>

        {/* 4. PROMINENT SEARCH WIDGET OVERLAY */}
        <div id="hero-search-container" style={{ position: "relative", zIndex: 12, marginTop: 16 }}>
          <SearchWidget />
        </div>
      </div>
    </section>
  );
}
