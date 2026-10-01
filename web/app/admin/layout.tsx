"use client";
// ============================================================
// TARGET: frontend/app/admin/layout.tsx
// Admin panel — dark sidebar layout
// ============================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Building2, CheckCircle,
  CalendarDays, BarChart2, LogOut, Home, Menu, Bell,
  Shield, ChevronRight, ExternalLink, User, KeyRound, Settings,
} from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",          path: "/admin/dashboard" },
  { icon: Users,           label: "Manage Users",        path: "/admin/user" },
  { icon: Building2,       label: "Manage Properties",   path: "/admin/properties-manage" },
  { icon: KeyRound,        label: "Quick Links",         path: "/admin/quick-manage-links" },
  { icon: CheckCircle,     label: "Property Approvals",  path: "/admin/property-approvals" },
  { icon: CalendarDays,    label: "Manage Bookings",     path: "/admin/manage-booking" },
  { icon: BarChart2,       label: "Reports",             path: "/admin/manage-reports" },
  { icon: User,            label: "Profile",             path: "/admin/profile" },
  { icon: Settings,        label: "Platform Settings",   path: "/admin/platform-settings" },
];

function AdminSidebarContent({
  handleLogout,
  isActive,
  onNavigate,
  user,
}: {
  handleLogout: () => void;
  isActive: (path: string) => boolean;
  onNavigate: () => void;
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
}) {
  return (
    <>
      <div className="hs-admin-logo">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #2563EB, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Home size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "#e2e8f0", letterSpacing: -0.4 }}>HomeStay</span>
        </Link>
        <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(255,255,255,0.07)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Shield size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: "0.83rem", fontWeight: 700, color: "#e2e8f0" }}>{user.name}</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{user.email}</div>
          </div>
        </div>
      </div>

      <div className="hs-admin-nav">
        <div className="hs-admin-section-title">Main Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link key={item.path} href={item.path} className={`hs-admin-item ${active ? "active" : ""}`} onClick={onNavigate}>
              <Icon size={17} /> {item.label}
              {active && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
            </Link>
          );
        })}
      </div>

      <div className="hs-admin-footer">
        <Link href="/" className="hs-admin-item" style={{ color: "#94a3b8", marginBottom: 4 }}>
          <ExternalLink size={16} /> Go to Website
        </Link>
        <button className="hs-admin-item" style={{ color: "#f87171", width: "100%" }} onClick={handleLogout}>
          <LogOut size={17} /> Logout
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isInitializing } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const isActive    = (path: string) => pathname === path || pathname.startsWith(path);
  const currentPage = navItems.find((n) => isActive(n.path))?.label ?? "Dashboard";

  useEffect(() => {
    if (!isInitializing && (!user || user.role !== "Admin")) {
      router.replace("/auth/login");
    }
  }, [isInitializing, router, user]);

  async function handleLogout() {
    await logout();
    router.push("/auth/login");
  }

  if (isInitializing || !user || user.role !== "Admin") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
        Checking admin access...
      </div>
    );
  }

  return (
    <div className="hs-admin-layout">
      <aside className="hs-admin-sidebar d-none d-md-flex" style={{ flexDirection: "column" }}>
        <AdminSidebarContent
          handleLogout={handleLogout}
          isActive={isActive}
          onNavigate={() => setMobileSidebarOpen(false)}
          user={user}
        />
      </aside>

      {mobileSidebarOpen && (
        <>
          <div className="hs-mobile-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="hs-mobile-sidebar hs-admin-sidebar" style={{ display: "flex", flexDirection: "column" }}>
            <AdminSidebarContent
              handleLogout={handleLogout}
              isActive={isActive}
              onNavigate={() => setMobileSidebarOpen(false)}
              user={user}
            />
          </aside>
        </>
      )}

      <div className="hs-admin-main">
        <div className="hs-admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="d-md-none" style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} onClick={() => setMobileSidebarOpen(true)}>
              <Menu size={22} color="#1e293b" />
            </button>
            <div>
              <div style={{ fontSize: "0.78rem", color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                <Shield size={12} color="#2563EB" /> Admin Panel
              </div>
              <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "1.05rem" }}>{currentPage}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <button style={{ background: "#f1f5f9", border: "none", width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}
                onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={16} color="#64748b" />
                <span style={{ position: "absolute", top: 6, right: 7, width: 7, height: 7, borderRadius: "50%", background: "#dc2626" }} />
              </button>
              {notifOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 8px 28px rgba(0,0,0,0.12)", padding: "6px", zIndex: 999, minWidth: 260 }}>
                  <div style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, color: "#1e293b", fontSize: "0.87rem" }}>Admin Alerts (3)</div>
                  {[
                    { title: "New property pending",  desc: "Minimalist Tokyo Studio awaiting approval", time: "5m ago", dot: "#d97706" },
                    { title: "User reported",          desc: "Safety report from guest #1029",            time: "1h ago", dot: "#dc2626" },
                    { title: "Revenue milestone",      desc: "Monthly revenue hit $24,600!",              time: "2h ago", dot: "#16a34a" },
                  ].map((n, i) => (
                    <div key={i} style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f8fafc")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "none")}>
                      <div style={{ display: "flex", gap: 8 }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fce7f3", borderRadius: 8, padding: "5px 12px", border: "1px solid #fbcfe8" }}>
              <Shield size={14} color="#db2777" />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9d174d" }}>Admin</span>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
