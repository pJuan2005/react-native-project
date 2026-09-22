"use client";

import { CalendarDays, Mail, MapPin, Shield } from "lucide-react";
import { useAuth, getUserInitials } from "@/components/context/AuthContext";
import { AccountSettingsPanel } from "@/components/shared/AccountSettingsPanel";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function AdminProfilePage() {
  const { user, isInitializing } = useAuth();

  if (isInitializing || !user || user.role !== "Admin") {
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
        Loading admin profile...
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
          Admin Profile
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Update administrator information and secure your account.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="hs-card" style={{ padding: "28px 22px" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #2563EB)",
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
              <StatusBadge status="Admin" />
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
                <Shield size={14} color="#2563EB" />
                <span>Platform administrator</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#64748b" }}>
                <Mail size={14} color="#2563EB" />
                <span>{user.email}</span>
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
        </div>

        <div className="col-lg-8">
          <AccountSettingsPanel
            user={user}
            profileTitle="Administrator Information"
            passwordTitle="Change Password"
          />
        </div>
      </div>
    </div>
  );
}
