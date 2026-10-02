"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Search, User, LogIn, Menu, X, Building2,
  LayoutDashboard, LogOut, CalendarDays, ChevronDown, UserCircle, Shield
} from "lucide-react";
import { useAuth, getUserInitials } from "@/components/context/AuthContext";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isInitializing, logout } = useAuth();

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    router.push("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Guest dropdown menu items
  const guestMenuItems = [
    { icon: <CalendarDays size={15} />, label: "Chuyến đi của tôi", path: "/dashboard" },
    { icon: <UserCircle size={15} />, label: "Hồ sơ & Cài đặt", path: "/dashboard" },
  ];

  // Host dropdown menu items
  const hostMenuItems = [
    { icon: <LayoutDashboard size={15} />, label: "Bảng điều khiển Chủ nhà", path: "/host/dashboard" },
    { icon: <Building2 size={15} />, label: "Homestay của tôi", path: "/host/my-properties" },
    { icon: <CalendarDays size={15} />, label: "Đơn đặt phòng", path: "/host/manage-booking" },
    { icon: <UserCircle size={15} />, label: "Hồ sơ chủ nhà", path: "/host/profile" },
  ];

  // Admin dropdown menu items
  const adminMenuItems = [
    { icon: <Shield size={15} />, label: "Bảng điều khiển Quản trị", path: "/admin/dashboard" },
    { icon: <Building2 size={15} />, label: "Quản lý Homestay", path: "/admin/properties-manage" },
    { icon: <CalendarDays size={15} />, label: "Quản lý Đặt phòng", path: "/admin/manage-booking" },
    { icon: <UserCircle size={15} />, label: "Hồ sơ Quản trị", path: "/admin/profile" },
  ];

  const menuItems = user?.role === "Admin"
    ? adminMenuItems
    : user?.role === "Host"
    ? hostMenuItems
    : guestMenuItems;

  const AvatarDropdown = () => (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#fff", border: "1.5px solid #e2e8f0",
          borderRadius: 100, padding: "5px 12px 5px 5px",
          cursor: "pointer", transition: "all 0.15s"
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: user?.role === "Host"
            ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
            : user?.role === "Admin"
            ? "linear-gradient(135deg, #0f172a, #1e293b)"
            : "linear-gradient(135deg, #2563EB, #1d4ed8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0
        }}>
          {user ? getUserInitials(user.name) : <User size={14} />}
        </div>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user?.name.split(" ")[0]}
        </span>
        <ChevronDown size={13} color="#64748b" style={{ transition: "transform 0.15s", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)" }} />
      </button>

      {dropdownOpen && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          padding: "6px", zIndex: 1001, minWidth: 210
        }}>
          {/* User Info Header */}
          <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid #f1f5f9", marginBottom: 4 }}>
            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.88rem" }}>{user?.name}</div>
            <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{user?.email}</div>
            <span style={{
              display: "inline-flex", marginTop: 5,
              padding: "2px 8px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700,
              background: user?.role === "Host" ? "#f3e8ff" : user?.role === "Admin" ? "#fef3c7" : "#e0f2fe",
              color: user?.role === "Host" ? "#6b21a8" : user?.role === "Admin" ? "#92400e" : "#0c4a6e"
            }}>
              {user?.role === "Admin" ? "Quản trị viên" : user?.role === "Host" ? "Chủ Homestay" : "Khách hàng"}
            </span>
          </div>

          {/* Menu Items */}
          {menuItems.map((item, i) => (
            <Link
              key={i}
              href={item.path}
              onClick={() => setDropdownOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "9px 12px", borderRadius: 8,
                color: "#475569", fontSize: "0.87rem",
                fontWeight: 500, textDecoration: "none",
                transition: "all 0.12s"
              }}
            >
              <span style={{ color: "#2563EB" }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {/* Logout */}
          <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 4, paddingTop: 4 }}>
            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: 9, width: "100%",
                padding: "9px 12px", borderRadius: 8, border: "none",
                background: "none", color: "#dc2626", fontSize: "0.87rem",
                fontWeight: 600, cursor: "pointer", transition: "all 0.12s", textAlign: "left"
              }}
            >
              <LogOut size={15} />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <nav className="hs-navbar">
      <div className="container">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Brand Logo */}
          <Link href="/" className="hs-navbar-brand" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", flexShrink: 0,
              boxShadow: "0 4px 10px rgba(37,99,235,0.25)"
            }}>
              <Home size={19} color="#fff" />
            </div>
            <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", letterSpacing: -0.5 }}>
              Home<span style={{ color: "#2563EB" }}>Stay</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hs-nav-links-desktop" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Link href="/" className={`hs-nav-link ${isActive("/") ? "active" : ""}`}>Trang chủ</Link>
            <Link href="/listings" className={`hs-nav-link ${isActive("/listings") ? "active" : ""}`}>Khám phá</Link>
            <Link href="/about" className={`hs-nav-link ${isActive("/about") ? "active" : ""}`}>Giới thiệu</Link>
            <Link href="/contact" className={`hs-nav-link ${isActive("/contact") ? "active" : ""}`}>Liên hệ</Link>
          </div>

          {/* Auth Section — Desktop */}
          <div className="hs-nav-auth-desktop" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isInitializing ? null : isAuthenticated && user ? (
              user.role === "Admin" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Link href="/admin/dashboard">
                    <button className="btn-primary-hs" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
                      <Shield size={14} /> Cổng Quản trị
                    </button>
                  </Link>
                  <AvatarDropdown />
                </div>
              ) : user.role === "Host" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Link href="/host/dashboard">
                    <button className="btn-primary-hs" style={{ fontSize: "0.85rem", padding: "8px 16px", background: "#059669" }}>
                      <Building2 size={14} /> Cổng Chủ nhà
                    </button>
                  </Link>
                  <AvatarDropdown />
                </div>
              ) : (
                <AvatarDropdown />
              )
            ) : (
              <>
                <Link href="/auth/login" style={{ textDecoration: "none" }}>
                  <button className="btn-outline-hs" style={{ fontSize: "0.85rem", padding: "7px 16px" }}>
                    <LogIn size={14} />
                    <span>Đăng nhập</span>
                  </button>
                </Link>
                <Link href="/auth/register" style={{ textDecoration: "none" }}>
                  <button className="btn-primary-hs" style={{ fontSize: "0.85rem", padding: "7px 16px" }}>
                    <span>Đăng ký</span>
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            style={{ background: "none", border: "1px solid #e2e8f0", cursor: "pointer", padding: 6, borderRadius: 8, display: "none" }}
            className="hs-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} color="#1e293b" /> : <Menu size={20} color="#1e293b" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{ padding: "12px 0 4px", borderTop: "1px solid #e2e8f0", marginTop: 10 }}>
            <Link href="/" className="hs-nav-link" style={{ display: "block", marginBottom: 4 }} onClick={() => setMenuOpen(false)}>Trang chủ</Link>
            <Link href="/listings" className="hs-nav-link" style={{ display: "block", marginBottom: 4 }} onClick={() => setMenuOpen(false)}>Khám phá</Link>
            <Link href="/about" className="hs-nav-link" style={{ display: "block", marginBottom: 4 }} onClick={() => setMenuOpen(false)}>Giới thiệu</Link>
            <Link href="/contact" className="hs-nav-link" style={{ display: "block", marginBottom: 4 }} onClick={() => setMenuOpen(false)}>Liên hệ</Link>

            <hr style={{ margin: "10px 0", border: 0, borderTop: "1px solid #f1f5f9" }} />

            {isInitializing ? null : isAuthenticated && user ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#f8fafc", borderRadius: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: user.role === "Host" ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "linear-gradient(135deg, #2563EB, #1d4ed8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.78rem", fontWeight: 700, color: "#fff", flexShrink: 0
                  }}>
                    {getUserInitials(user.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.87rem" }}>{user.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                      {user.role === "Admin" ? "Quản trị viên" : user.role === "Host" ? "Chủ Homestay" : "Khách hàng"}
                    </div>
                  </div>
                </div>

                {menuItems.map((item, i) => (
                  <Link key={i} href={item.path} className="hs-nav-link" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }} onClick={() => setMenuOpen(false)}>
                    {item.icon} {item.label}
                  </Link>
                ))}

                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, width: "100%",
                    padding: "0.5rem 0.85rem", borderRadius: 6, border: "none",
                    background: "none", color: "#dc2626", fontWeight: 600,
                    fontSize: "0.9rem", cursor: "pointer", marginTop: 4, textAlign: "left"
                  }}
                >
                  <LogOut size={14} /> Đăng xuất
                </button>
              </>
            ) : (
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <Link href="/auth/login" style={{ flex: 1, textDecoration: "none" }} onClick={() => setMenuOpen(false)}>
                  <button className="btn-outline-hs" style={{ width: "100%", fontSize: "0.85rem" }}>Đăng nhập</button>
                </Link>
                <Link href="/auth/register" style={{ flex: 1, textDecoration: "none" }} onClick={() => setMenuOpen(false)}>
                  <button className="btn-primary-hs" style={{ width: "100%", fontSize: "0.85rem" }}>Đăng ký</button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
