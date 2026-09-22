"use client";
// ============================================================
// TARGET: frontend/app/host/layout.tsx
// ============================================================

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Building2, Plus, CalendarDays, User, LogOut,
  Home, Menu, Bell, ChevronRight, ExternalLink
} from "lucide-react";
// Adjust this import path if you end up putting Context in a different clear spot.
import { useAuth, getUserInitials } from "@/components/context/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/host/dashboard" },
  { icon: Building2, label: "My Properties", path: "/host/my-properties" },
  { icon: Plus, label: "Add New Property", path: "/host/add-property" },
  { icon: CalendarDays, label: "Bookings", path: "/host/manage-booking" },
  { icon: User, label: "Profile", path: "/host/profile" },
];

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isInitializing } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path);

  useEffect(() => {
    if (!isInitializing && (!user || user.role !== "Host")) {
      router.replace("/auth/login");
    }
  }, [isInitializing, router, user]);

  async function handleLogout() {
    await logout();
    router.push("/auth/login");
  }

  if (isInitializing || !user || user.role !== "Host") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
        Checking host access...
      </div>
    );
  }

  const displayName = user?.name || "Made Wijaya";
  const initials = getUserInitials(displayName);
  const currentPage = navItems.find(n => isActive(n.path))?.label || "Dashboard";

  const SidebarContent = () => (
    <>
      <div className="hs-sidebar-logo">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Home size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "#1e293b", letterSpacing: -0.4 }}>HomeStay</span>
        </Link>

        {/* Host Profile Card */}
        <div style={{
          marginTop: 14, padding: "12px 14px", background: "#eff6ff",
          borderRadius: 10, display: "flex", alignItems: "center", gap: 10,
          border: "1px solid #dbeafe"
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.82rem", fontWeight: 700, color: "#fff", flexShrink: 0
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#7c3aed", fontWeight: 600 }}>Host Account</div>
          </div>
        </div>
      </div>

      <div className="hs-sidebar-nav">
        <div style={{ color: "#94a3b8", fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 14px 10px" }}>
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`hs-sidebar-item ${active ? "active" : ""}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <Icon size={17} />
              {item.label}
              {active && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
            </Link>
          );
        })}
      </div>

      <div className="hs-sidebar-footer">
        <Link href="/" className="hs-sidebar-item" style={{ marginBottom: 4 }}>
          <ExternalLink size={16} /> Back to Website
        </Link>
        <button
          className="hs-sidebar-item"
          style={{ color: "#dc2626" }}
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="hs-host-layout">
      {/* Desktop Sidebar */}
      <aside className="hs-host-sidebar d-none d-md-flex" style={{ flexDirection: "column" }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <>
          <div className="hs-mobile-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="hs-mobile-sidebar hs-host-sidebar" style={{ display: "flex", flexDirection: "column", background: "#fff" }}>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="hs-host-main">
        <div className="hs-host-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="d-md-none"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={22} color="#1e293b" />
            </button>
            <div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 500 }}>Host Panel</div>
              <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "1.05rem" }}>{currentPage}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button
                style={{ background: "#f1f5f9", border: "none", width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={16} color="#64748b" />
                <span style={{ position: "absolute", top: 6, right: 7, width: 7, height: 7, borderRadius: "50%", background: "#dc2626" }} />
              </button>
              {notifOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
                  boxShadow: "0 8px 28px rgba(0,0,0,0.12)", padding: "6px", zIndex: 999, minWidth: 260
                }}>
                  <div style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, color: "#1e293b", fontSize: "0.87rem" }}>
                    Notifications (2)
                  </div>
                  {[
                    { title: "New booking request", desc: "Bob Williams booked Bali Bamboo House", time: "2m ago", dot: "#2563EB" },
                    { title: "Property approved", desc: "Your listing is now live!", time: "1h ago", dot: "#16a34a" },
                  ].map((n, i) => (
                    <div key={i} style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: n.dot, marginTop: 5, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.83rem" }}>{n.title}</div>
                          <div style={{ color: "#64748b", fontSize: "0.77rem" }}>{n.desc}</div>
                          <div style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: 2 }}>{n.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: 700, color: "#fff", cursor: "pointer"
            }}>
              {initials}
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
