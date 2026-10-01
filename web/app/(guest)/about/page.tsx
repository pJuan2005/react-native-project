"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle,
  Code2,
  Globe,
  Home,
  MessageCircle,
  Shield,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import { getProperties, type PropertySummary } from "@/services/propertyService";

const IMG_HERO =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80";
const IMG_PRODUCT =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80";

interface AboutStats {
  propertyCount: number;
  cityCount: number;
  hostCount: number;
  averageRating: number;
}

const platformHighlights = [
  {
    icon: <Home size={24} color="#2563EB" />,
    bg: "#eff6ff",
    title: "Property Management",
    desc: "Hosts can create, update, and manage listings while admins review and approve every public stay.",
  },
  {
    icon: <Shield size={24} color="#059669" />,
    bg: "#ecfdf5",
    title: "Booking Verification",
    desc: "Guests create booking requests, upload payment proof, and wait for host or admin confirmation.",
  },
  {
    icon: <Star size={24} color="#d97706" />,
    bg: "#fef3c7",
    title: "Review Flow",
    desc: "Reviews are only available after a confirmed stay has passed checkout, keeping feedback tied to real bookings.",
  },
  {
    icon: <MessageCircle size={24} color="#7c3aed" />,
    bg: "#f5f3ff",
    title: "Booking Chat",
    desc: "Confirmed bookings can open dedicated conversations between guest, host, and admin when needed.",
  },
];

const builderPrinciples = [
  "A focused booking flow from property approval to payment proof review.",
  "Real roles for guest, host, and admin instead of a frontend-only demo.",
  "Data-backed listing, dashboard, report, and review modules connected to the current database.",
  "A structure that is practical for both demo presentation and future extension.",
];

export default function AboutPage() {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAboutStats() {
      try {
        const data = await getProperties();

        if (!mounted) {
          return;
        }

        setProperties(data);
      } catch (_error) {
        if (mounted) {
          setProperties([]);
        }
      } finally {
        if (mounted) {
          setLoadingStats(false);
        }
      }
    }

    loadAboutStats();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo<AboutStats>(() => {
    const uniqueCities = new Set(
      properties.map((property) => property.city).filter(Boolean),
    ).size;
    const uniqueHosts = new Set(
      properties.map((property) => property.hostId).filter(Boolean),
    ).size;
    const ratedProperties = properties.filter((property) => property.rating > 0);
    const averageRating =
      ratedProperties.length > 0
        ? ratedProperties.reduce((sum, property) => sum + property.rating, 0) /
          ratedProperties.length
        : 0;

    return {
      propertyCount: properties.length,
      cityCount: uniqueCities,
      hostCount: uniqueHosts,
      averageRating,
    };
  }, [properties]);

  const statCards = [
    {
      icon: <Home size={22} color="#2563EB" />,
      value: loadingStats ? "..." : `${stats.propertyCount}`,
      label: "Approved stays",
      bg: "#eff6ff",
    },
    {
      icon: <Globe size={22} color="#059669" />,
      value: loadingStats ? "..." : `${stats.cityCount}`,
      label: "Destinations",
      bg: "#ecfdf5",
    },
    {
      icon: <Users size={22} color="#7c3aed" />,
      value: loadingStats ? "..." : `${stats.hostCount}`,
      label: "Active hosts",
      bg: "#f5f3ff",
    },
    {
      icon: <Star size={22} color="#d97706" />,
      value: loadingStats
        ? "..."
        : stats.averageRating > 0
        ? stats.averageRating.toFixed(1)
        : "New",
      label: "Average rating",
      bg: "#fef3c7",
    },
  ];

  return (
    <div style={{ background: "#fff" }}>
      <section
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #1d4ed8 100%)",
          padding: "80px 0 72px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="container" style={{ position: "relative" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 100,
              padding: "6px 16px",
              marginBottom: 20,
            }}
          >
            <Award size={14} color="#93c5fd" />
            <span style={{ fontSize: "0.8rem", color: "#93c5fd", fontWeight: 600 }}>
              About the project
            </span>
          </div>

          <h1
            style={{
              color: "#fff",
              marginBottom: 18,
              fontSize: "clamp(2rem, 5vw, 3rem)",
              letterSpacing: -1,
              maxWidth: 760,
              marginInline: "auto",
            }}
          >
            A Booking Platform Built and Maintained by{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Phạm Xuân Chuẩn
            </span>
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "1.05rem",
              maxWidth: 620,
              margin: "0 auto 36px",
              lineHeight: 1.75,
            }}
          >
            HomeStay is a full-stack booking platform started in 2026, designed
            around real role-based flows for guests, hosts, and admins.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/listings">
              <button
                className="btn-primary-hs"
                style={{
                  fontSize: "0.95rem",
                  padding: "12px 28px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Explore properties <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/contact">
              <button
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "12px 28px",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Contact the developer
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: "60px 0", background: "#f8fafc" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 className="hs-section-title" style={{ marginBottom: 10 }}>
              Live Platform Snapshot
            </h2>
            <p className="hs-section-subtitle" style={{ maxWidth: 620, margin: "0 auto" }}>
              A quick overview of the current platform footprint across public
              stays, destinations, hosts, and guest ratings.
            </p>
          </div>

          <div className="row g-4">
            {statCards.map((stat) => (
              <div key={stat.label} className="col-lg-3 col-sm-6">
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: "28px 24px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: stat.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "#1e293b", letterSpacing: -1 }}>
                    {stat.value}
                  </div>
                  <div style={{ color: "#64748b", fontSize: "0.87rem", marginTop: 4 }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0" }}>
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <div style={{ position: "relative" }}>
                <img
                  src={IMG_PRODUCT}
                  alt="HomeStay product workflow"
                  style={{ width: "100%", borderRadius: 20, objectFit: "cover", height: 420 }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 24,
                    left: 24,
                    right: 24,
                    background: "rgba(15,23,42,0.86)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 12,
                    padding: "16px 20px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div style={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}>
                    Started in 2026
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                    Designed as a full-stack booking system with property approval,
                    payment proof, review flow, reporting, and role-based dashboards.
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div
                style={{
                  display: "inline-block",
                  background: "#eff6ff",
                  borderRadius: 8,
                  padding: "4px 14px",
                  marginBottom: 16,
                }}
              >
                <span style={{ color: "#2563EB", fontSize: "0.8rem", fontWeight: 700 }}>
                  PROJECT STORY
                </span>
              </div>
              <h2
                style={{
                  fontWeight: 800,
                  color: "#1e293b",
                  marginBottom: 18,
                  letterSpacing: -0.5,
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                }}
              >
                Built as a Real Booking Flow, Not Just a UI Demo
              </h2>
              <p style={{ color: "#64748b", lineHeight: 1.8, marginBottom: 20, fontSize: "0.97rem" }}>
                This project was developed independently by Phạm Xuân Chuẩn to
                model a more complete booking platform: properties are created by
                hosts, reviewed by admins, booked by guests, verified through
                payment proof, and closed with reviews after checkout.
              </p>
              <p style={{ color: "#64748b", lineHeight: 1.8, marginBottom: 28, fontSize: "0.97rem" }}>
                The goal is to bring property management, booking workflows,
                role permissions, and public browsing into one consistent and
                practical experience.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {builderPrinciples.map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#dcfce7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle size={13} color="#16a34a" />
                    </div>
                    <span style={{ color: "#475569", fontSize: "0.9rem" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f8fafc" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div
              style={{
                display: "inline-block",
                background: "#eff6ff",
                borderRadius: 8,
                padding: "4px 14px",
                marginBottom: 14,
              }}
            >
              <span style={{ color: "#2563EB", fontSize: "0.8rem", fontWeight: 700 }}>
                PLATFORM MODULES
              </span>
            </div>
            <h2 className="hs-section-title" style={{ marginBottom: 12 }}>
              What the Current Platform Already Covers
            </h2>
            <p className="hs-section-subtitle" style={{ maxWidth: 620, margin: "0 auto" }}>
              These are the main flows already wired into the current system and
              backed by the existing database and API layer.
            </p>
          </div>

          <div className="row g-4">
            {platformHighlights.map((item) => (
              <div key={item.title} className="col-lg-3 col-md-6">
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: "28px 24px",
                    border: "1px solid #e2e8f0",
                    height: "100%",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: item.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 18,
                    }}
                  >
                    {item.icon}
                  </div>
                  <h4 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 10, fontSize: "1rem" }}>
                    {item.title}
                  </h4>
                  <p style={{ color: "#64748b", fontSize: "0.88rem", lineHeight: 1.75, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div
              style={{
                display: "inline-block",
                background: "#eff6ff",
                borderRadius: 8,
                padding: "4px 14px",
                marginBottom: 14,
              }}
            >
              <span style={{ color: "#2563EB", fontSize: "0.8rem", fontWeight: 700 }}>
                BUILT BY
              </span>
            </div>
            <h2 className="hs-section-title" style={{ marginBottom: 12 }}>
              The Person Behind HomeStay
            </h2>
            <p className="hs-section-subtitle" style={{ maxWidth: 520, margin: "0 auto" }}>
              This project is currently developed and maintained by a single
              builder.
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-8">
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)",
                  padding: "32px 28px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2563EB, #7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.25)",
                  }}
                >
                  <UserRound size={34} color="#fff" />
                </div>

                <div style={{ fontWeight: 800, color: "#1e293b", fontSize: "1.35rem", marginBottom: 6 }}>
                  Phạm Xuân Chuẩn
                </div>
                <div style={{ color: "#64748b", fontSize: "0.92rem", marginBottom: 18 }}>
                  Solo Developer • Product Builder
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#eff6ff",
                    color: "#2563EB",
                    borderRadius: 999,
                    padding: "7px 14px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    marginBottom: 18,
                  }}
                >
                  <Code2 size={14} />
                  Active since 2026
                </div>

                <p style={{ color: "#64748b", lineHeight: 1.8, margin: 0 }}>
                  Focused on turning a booking project into a more complete
                  full-stack product, with real workflows for property approval,
                  payment proof validation, review control, dashboards, reports,
                  and role-based management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "80px 0",
          textAlign: "center",
          background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
        }}
      >
        <div className="container">
          <h2
            style={{
              color: "#fff",
              fontWeight: 800,
              marginBottom: 16,
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            }}
          >
            Want to Explore the Current Build?
          </h2>
          <p
            style={{
              color: "#94a3b8",
              marginBottom: 36,
              fontSize: "1rem",
              maxWidth: 560,
              marginInline: "auto",
            }}
          >
            Browse the live listings, test the booking flow, or contact Phạm Xuân
            Chuẩn directly for more details about the project.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/listings">
              <button
                className="btn-primary-hs"
                style={{
                  fontSize: "0.95rem",
                  padding: "12px 28px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Browse listings <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/contact">
              <button
                style={{
                  background: "transparent",
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "12px 28px",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Contact
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
