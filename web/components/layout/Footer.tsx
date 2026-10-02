import Link from "next/link";
import {
  Facebook,
  Home,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
  Shield,
  Building2,
} from "lucide-react";

const socialLinks = [
  {
    icon: <Facebook size={16} />,
    href: "https://www.facebook.com/pham.chuan.915459/",
    label: "Facebook",
  },
  { icon: <Instagram size={16} />, href: "#!", label: "Instagram" },
  { icon: <Twitter size={16} />, href: "#!", label: "Twitter" },
  { icon: <Youtube size={16} />, href: "#!", label: "Youtube" },
];

export function Footer() {
  return (
    <footer className="hs-footer">
      <div className="container">
        <div className="row g-4" style={{ display: "flex", flexWrap: "wrap" }}>
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6" style={{ flex: "1 1 300px", marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <Home size={18} color="#fff" />
              </div>
              <span
                style={{
                  color: "#f8fafc",
                  fontWeight: 800,
                  fontSize: "1.3rem",
                  letterSpacing: -0.5,
                }}
              >
                HomeStay
              </span>
            </div>
            <p
              style={{
                fontSize: "0.87rem",
                lineHeight: 1.75,
                color: "#94a3b8",
                marginBottom: 20,
                maxWidth: 340,
              }}
            >
              Hệ sinh thái du lịch & nghỉ dưỡng xanh. Kết nối du khách với những homestay, villa đẹp và độc đáo nhất trên toàn quốc.
            </p>
            <div className="hs-footer-socials">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="hs-social-btn"
                  aria-label={item.label}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore Column */}
          <div className="col-lg-2 col-md-6 col-6" style={{ flex: "1 1 140px", marginBottom: 24 }}>
            <h5 className="hs-footer-title">Khám phá</h5>
            <div className="hs-footer-col">
              <Link href="/">Trang chủ</Link>
              <Link href="/listings">Khám phá Homestay</Link>
              <Link href="/about">Về chúng tôi</Link>
              <Link href="/contact">Liên hệ</Link>
            </div>
          </div>

          {/* Hosting Column */}
          <div className="col-lg-2 col-md-6 col-6" style={{ flex: "1 1 140px", marginBottom: 24 }}>
            <h5 className="hs-footer-title">Dành cho Chủ nhà</h5>
            <div className="hs-footer-col">
              <Link href="/auth/register">Đăng ký Chủ Homestay</Link>
              <Link href="/auth/login">Đăng nhập Quản lý</Link>
              <Link href="/host/dashboard">Cổng Chủ nhà</Link>
              <Link href="/host/my-properties">Quản lý phòng nghỉ</Link>
            </div>
          </div>

          {/* Management Portal Column */}
          <div className="col-lg-2 col-md-6 col-6" style={{ flex: "1 1 140px", marginBottom: 24 }}>
            <h5 className="hs-footer-title">Quản trị viên</h5>
            <div className="hs-footer-col">
              <Link href="/admin/dashboard">Cổng Quản trị</Link>
              <Link href="/admin/manage-booking">Duyệt đặt phòng</Link>
              <Link href="/admin/property-approvals">Phê duyệt chỗ nghỉ</Link>
              <Link href="/admin/manage-reports">Báo cáo tài chính</Link>
            </div>
          </div>

          {/* Contact Column */}
          <div className="col-lg-2 col-md-6 col-6" style={{ flex: "1 1 180px", marginBottom: 24 }}>
            <h5 className="hs-footer-title">Liên hệ</h5>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <MapPin
                  size={15}
                  style={{ flexShrink: 0, marginTop: 3, color: "#38BDF8" }}
                />
                <span style={{ fontSize: "0.87rem", lineHeight: 1.6, color: "#94a3b8" }}>
                  Bình Giang, Hải Phòng, Việt Nam
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={15} style={{ color: "#38BDF8", flexShrink: 0 }} />
                <a
                  href="mailto:phamchuan2608@gmail.com"
                  style={{ fontSize: "0.87rem", color: "#94a3b8", textDecoration: "none" }}
                >
                  phamchuan2608@gmail.com
                </a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Phone size={15} style={{ color: "#38BDF8", flexShrink: 0 }} />
                <a href="tel:0362111527" style={{ fontSize: "0.87rem", color: "#94a3b8", textDecoration: "none" }}>
                  0362111527
                </a>
              </div>
            </div>
          </div>
        </div>

        <hr className="hs-footer-divider" />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: "0.83rem", color: "#64748b" }}>
            © 2026 Nền tảng Đặt phòng HomeStay. Bảo lưu mọi quyền.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontSize: "0.83rem", color: "#64748b" }}>Chính sách bảo mật</span>
            <span style={{ fontSize: "0.83rem", color: "#64748b" }}>Điều khoản dịch vụ</span>
            <span style={{ fontSize: "0.83rem", color: "#64748b" }}>Bảo vệ quyền lợi khách hàng</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
