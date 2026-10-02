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
    title: "Quản lý Chỗ nghỉ Toàn diện",
    desc: "Chủ nhà dễ dàng đăng tải, cập nhật phòng và tiện nghi; Ban quản trị kiểm duyệt chặt chẽ từng cơ sở trước khi mở bán công khai.",
  },
  {
    icon: <Shield size={24} color="#059669" />,
    bg: "#ecfdf5",
    title: "Quy trình Đặt phòng Minh bạch",
    desc: "Khách hàng tạo đơn đặt phòng, quét mã VietQR và gửi ảnh biên lai; Hệ thống kiểm tra trùng lịch tự động và hỗ trợ xác nhận tức thì.",
  },
  {
    icon: <Star size={24} color="#d97706" />,
    bg: "#fef3c7",
    title: "Đánh giá Thực từ Khách lưu trú",
    desc: "Đánh giá chỉ mở sau khi kỳ nghỉ đã hoàn tất trả phòng, đảm bảo phản hồi chân thực 100% gắn liền với trải nghiệm thực tế.",
  },
  {
    icon: <MessageCircle size={24} color="#7c3aed" />,
    bg: "#f5f3ff",
    title: "Trao đổi Trực tiếp Thuận tiện",
    desc: "Kênh trao đổi riêng giữa Khách, Chủ nhà và Ban quản trị giải đáp nhanh thắc mắc về đường đi, nhận phòng và hỗ trợ lưu trú.",
  },
];

const builderPrinciples = [
  "Quy trình đặt phòng khép kín từ kiểm duyệt chỗ nghỉ đến đối soát biên lai chuyển khoản ngân hàng.",
  "Phân quyền thực tế đa vai trò: Khách hàng (Guest), Chủ nhà (Host) và Quản trị viên (Admin).",
  "Hệ sinh thái đồng bộ dữ liệu thời gian thực giữa Ứng dụng Di động và Nền tảng Quản trị Web.",
  "Kiến trúc kỹ thuật chuẩn mực, an toàn giao dịch và tối ưu hóa trải nghiệm trên mọi thiết bị.",
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
      } catch (error) {
        console.error("Unable to load platform statistics:", error);
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

  const stats: AboutStats = useMemo(() => {
    const propertyCount = properties.length;
    const cities = new Set(properties.map((item) => item.city).filter(Boolean));
    const hosts = new Set(properties.map((item) => item.hostId).filter(Boolean));
    const ratingSum = properties.reduce(
      (sum, item) => sum + Number(item.rating || 0),
      0,
    );
    const averageRating =
      propertyCount > 0 ? Number((ratingSum / propertyCount).toFixed(1)) : 4.9;

    return {
      propertyCount,
      cityCount: cities.size,
      hostCount: hosts.size,
      averageRating,
    };
  }, [properties]);

  return (
    <div style={{ background: "#f8fafc" }}>
      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          minHeight: 460,
          display: "flex",
          alignItems: "center",
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.76), rgba(15, 23, 42, 0.84)), url(${IMG_HERO})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#fff",
        }}
      >
        <div className="container" style={{ padding: "80px 20px" }}>
          <div style={{ maxWidth: 760 }}>
            <span
              style={{
                display: "inline-block",
                padding: "6px 14px",
                borderRadius: 20,
                background: "rgba(37, 99, 235, 0.28)",
                border: "1px solid rgba(147, 197, 253, 0.35)",
                color: "#bfdbfe",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Về nền tảng HomeStay
            </span>
            <h1
              style={{
                fontSize: "2.8rem",
                fontWeight: 800,
                letterSpacing: "-0.8px",
                lineHeight: 1.15,
                margin: "0 0 16px",
              }}
            >
              Hệ sinh thái kết nối lưu trú & du lịch nghỉ dưỡng xanh
            </h1>
            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.7,
                color: "#cbd5e1",
                margin: "0 0 28px",
              }}
            >
              Chúng tôi mang đến giải pháp đặt chỗ nghỉ dưỡng thông minh, minh bạch và an toàn. Nơi du khách dễ dàng tìm thấy những căn homestay mang đậm dấu ấn bản địa, và các chủ nhà có công cụ quản lý chuyên nghiệp, chống overbooking hiệu quả.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/listings">
                <button className="btn-primary-hs" style={{ padding: "12px 24px" }}>
                  Khám phá chỗ nghỉ ngay <ArrowRight size={16} />
                </button>
              </Link>
              <Link href="/contact">
                <button
                  className="btn-outline-hs"
                  style={{
                    padding: "12px 24px",
                    color: "#fff",
                    borderColor: "rgba(255, 255, 255, 0.35)",
                  }}
                >
                  Liên hệ hỗ trợ
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ transform: "translateY(-30px)", position: "relative", zIndex: 10 }}>
        <div className="container">
          <div
            className="hs-card"
            style={{
              padding: "24px 28px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
            }}
          >
            {[
              {
                icon: <Building2 size={24} color="#2563EB" />,
                value: loadingStats ? "..." : `${stats.propertyCount}+`,
                label: "Chỗ nghỉ trên toàn quốc",
              },
              {
                icon: <Globe size={24} color="#059669" />,
                value: loadingStats ? "..." : `${stats.cityCount}+`,
                label: "Tỉnh thành & Điểm đến",
              },
              {
                icon: <UserRound size={24} color="#7c3aed" />,
                value: loadingStats ? "..." : `${stats.hostCount}+`,
                label: "Chủ nhà đồng hành",
              },
              {
                icon: <Star size={24} color="#d97706" />,
                value: loadingStats ? "..." : `${stats.averageRating}★`,
                label: "Điểm đánh giá trung bình",
              },
            ].map((stat, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#1e293b" }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#64748b" }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section style={{ padding: "40px 0 70px" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#2563EB",
                display: "block",
                marginBottom: 6,
              }}
            >
              Hệ thống vận hành
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
              Các tính năng cốt lõi của nền tảng
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {platformHighlights.map((item, idx) => (
              <div
                key={idx}
                className="hs-card"
                style={{ padding: 26, display: "flex", flexDirection: "column", height: "100%" }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
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
                <h3 style={{ fontSize: "1.08rem", fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>
                  {item.title}
                </h3>
                <p style={{ color: "#64748b", fontSize: "0.87rem", lineHeight: 1.65, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section style={{ padding: "70px 0", background: "#fff", borderTop: "1px solid #e2e8f0" }}>
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "#2563EB",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Cam kết phát triển
              </span>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#1e293b", margin: "0 0 16px" }}>
                Xây dựng nền tảng vững chắc và an toàn
              </h2>
              <p style={{ color: "#64748b", lineHeight: 1.7, fontSize: "0.92rem", marginBottom: 24 }}>
                Hệ thống được thiết kế xuất phát từ nhu cầu thực tiễn của các cơ sở homestay vừa và nhỏ tại Việt Nam. Không chỉ là nơi quảng bá hình ảnh, chúng tôi số hóa toàn bộ khâu tiếp nhận khách, thanh toán và đối soát dòng tiền.
              </p>

              <div style={{ display: "grid", gap: 12 }}>
                {builderPrinciples.map((text, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <CheckCircle size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.6 }}>
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-6">
              <div
                style={{
                  position: "relative",
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 16px 40px rgba(0, 0, 0, 0.1)",
                  height: 380,
                }}
              >
                <img
                  src={IMG_PRODUCT}
                  alt="Đội ngũ phát triển"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
