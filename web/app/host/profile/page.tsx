"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Mail, MapPin, Phone, User } from "lucide-react";
import { useAuth, getUserInitials } from "@/components/context/AuthContext";
import { AccountSettingsPanel } from "@/components/shared/AccountSettingsPanel";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getHostBookings } from "@/services/bookingService";
import { getHostProperties } from "@/services/propertyService";

export default function HostProfilePage() {
  const { user, isInitializing } = useAuth();
  const [stats, setStats] = useState({
    properties: 0,
    bookings: 0,
    pendingReviews: 0,
  });
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    if (isInitializing || !user || user.role !== "Host") {
      return;
    }

    async function loadStats() {
      try {
        const [properties, bookings] = await Promise.all([
          getHostProperties(),
          getHostBookings(),
        ]);

        setStats({
          properties: properties.length,
          bookings: bookings.length,
          pendingReviews: bookings.filter(
            (booking) => booking.paymentStatus === "proof_uploaded",
          ).length,
        });
      } catch (_error) {
        setStatsError("Unable to load host statistics right now.");
      }
    }

    loadStats();
  }, [isInitializing, user]);

  if (isInitializing || !user || user.role !== "Host") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
        }}
      >
        Loading host profile...
      </div>
    );
  }

  const initials = getUserInitials(user.name);
  const memberSince = user.joined
    ? new Date(user.joined).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "January 2026";

  return (
    <div style={{ padding: "28px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontWeight: 800,
            color: "#1e293b",
            marginBottom: 4,
            fontSize: "1.5rem",
          }}
        >
          My Profile
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Manage your host information and account security.
        </p>
      </div>

      {statsError && (
        <div
          style={{
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#c2410c",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 16,
            fontSize: "0.84rem",
          }}
        >
          {statsError}
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="hs-card" style={{ padding: "28px 22px" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2563EB, #7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  fontSize: "1.95rem",
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                {initials}
              </div>
              <h2
                style={{
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: 4,
                  fontSize: "1.08rem",
                }}
              >
                {user.name}
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.83rem", marginBottom: 12 }}>
                {user.email}
              </p>
              <StatusBadge status="Host" />
            </div>

            <div
              style={{
                borderTop: "1px solid #e2e8f0",
                paddingTop: 16,
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#64748b" }}>
                <Mail size={14} color="#2563EB" />
                <span>{user.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#64748b" }}>
                <Phone size={14} color="#2563EB" />
                <span>{user.phone || "Not updated yet"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#64748b" }}>
                <MapPin size={14} color="#2563EB" />
                <span>{user.location || "Not updated yet"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#64748b" }}>
                <CalendarDays size={14} color="#2563EB" />
                <span>Member since {memberSince}</span>
              </div>
            </div>
          </div>

          <div className="hs-card" style={{ padding: "18px 20px", marginTop: 16 }}>
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#94a3b8",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Host Summary
            </div>
            {[
              { label: "Properties", value: stats.properties, color: "#2563EB" },
              { label: "Bookings", value: stats.bookings, color: "#16a34a" },
              { label: "Awaiting review", value: stats.pendingReviews, color: "#d97706" },
            ].map((item, index) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom:
                    index < 2 ? "1px solid #f1f5f9" : "none",
                }}
              >
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  {item.label}
                </span>
                <span style={{ fontWeight: 700, color: item.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-8">
          <AccountSettingsPanel
            user={user}
            profileTitle="Host Information"
            passwordTitle="Change Password"
          />
        </div>
      </div>
    </div>
  );
}
