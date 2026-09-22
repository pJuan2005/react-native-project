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
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
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
                }}
              >
                <Home size={18} color="#fff" />
              </div>
              <span
                style={{
                  color: "#f1f5f9",
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
                maxWidth: 320,
              }}
            >
              Find your ideal stay with a booking flow designed for real trips,
              trusted communication, and a smoother hosting experience.
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
                  <span className="hs-social-icon">{item.icon}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h5>Explore</h5>
            <Link href="/">Home</Link>
            <Link href="/listings">Explore Stays</Link>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
            <a href="#!">How It Works</a>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h5>Hosting</h5>
            <Link href="/auth/register">Become a Host</Link>
            <Link href="/auth/login">Host Login</Link>
            <a href="#!">Hosting Guide</a>
            <a href="#!">Policies</a>
            <a href="#!">Community</a>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h5>Support</h5>
            <a href="#!">Help Center</a>
            <a href="#!">Safety</a>
            <a href="#!">Privacy Policy</a>
            <a href="#!">Terms of Service</a>
            <a href="#!">Cookie Policy</a>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h5>Contact</h5>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <MapPin
                  size={14}
                  style={{ flexShrink: 0, marginTop: 3, color: "#2563EB" }}
                />
                <span
                  style={{
                    fontSize: "0.87rem",
                    lineHeight: 1.6,
                    color: "#94a3b8",
                  }}
                >
                  Bình Giang,
                  <br />
                  Hải Phòng, Việt Nam
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={14} style={{ color: "#2563EB", flexShrink: 0 }} />
                <a
                  href="mailto:phamchuan2608@gmail.com"
                  style={{ fontSize: "0.87rem" }}
                >
                  phamchuan2608@gmail.com
                </a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Phone size={14} style={{ color: "#2563EB", flexShrink: 0 }} />
                <a href="tel:0362111527" style={{ fontSize: "0.87rem" }}>
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
            © 2026 HomeStay. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="#!" style={{ fontSize: "0.83rem", color: "#64748b" }}>
              Privacy
            </a>
            <a href="#!" style={{ fontSize: "0.83rem", color: "#64748b" }}>
              Terms
            </a>
            <a href="#!" style={{ fontSize: "0.83rem", color: "#64748b" }}>
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

