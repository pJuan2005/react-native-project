"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle,
  Facebook,
  HeadphonesIcon,
  Instagram,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Shield,
  Twitter,
} from "lucide-react";

const IMG_CONTACT =
  "https://images.unsplash.com/photo-1553775282-20af80779df7?auto=format&fit=crop&w=1200&q=80";

const contactInfo = [
  {
    icon: <Mail size={22} color="#2563EB" />,
    bg: "#eff6ff",
    title: "Email liên hệ",
    lines: ["phamchuan2608@gmail.com"],
  },
  {
    icon: <Phone size={22} color="#059669" />,
    bg: "#ecfdf5",
    title: "Hotline hỗ trợ",
    lines: ["0362111527", "Thứ 2 - Thứ 7, 8:00 - 21:00"],
  },
  {
    icon: <MapPin size={22} color="#7c3aed" />,
    bg: "#f5f3ff",
    title: "Địa chỉ văn phòng",
    lines: ["Bình Giang, Hải Phòng", "Việt Nam"],
  },
  {
    icon: <HeadphonesIcon size={22} color="#d97706" />,
    bg: "#fef3c7",
    title: "Chăm sóc khách hàng",
    lines: ["Hỗ trợ kỹ thuật 24/7", "Đồng hành cùng chủ nhà & khách du lịch"],
  },
];

const supportChannels = [
  {
    icon: <MessageSquare size={24} color="#2563EB" />,
    bg: "#eff6ff",
    title: "Trò chuyện trực tuyến",
    desc: "Trao đổi trực tiếp khi bạn cần hỗ trợ nhanh về thông tin đặt phòng, phòng nghỉ hoặc tài khoản.",
    action: "Bắt đầu nhắn tin",
  },
  {
    icon: <HeadphonesIcon size={24} color="#7c3aed" />,
    bg: "#f5f3ff",
    title: "Tổng đài điện thoại",
    desc: "Gọi trực tiếp trong giờ hành chính để được giải đáp và hỗ trợ nhanh chóng nhất.",
    action: "Gọi ngay",
  },
  {
    icon: <BookOpen size={24} color="#059669" />,
    bg: "#ecfdf5",
    title: "Trung tâm trợ giúp",
    desc: "Xem hướng dẫn đặt phòng, thanh toán VietQR, quy trình đăng chỗ nghỉ và cài đặt tài khoản.",
    action: "Xem hướng dẫn",
  },
  {
    icon: <Shield size={24} color="#dc2626" />,
    bg: "#fef2f2",
    title: "An toàn & Khiếu nại",
    desc: "Liên hệ ngay nếu bạn cần hỗ trợ về vấn đề xác minh, an toàn lưu trú hoặc giải quyết tranh chấp.",
    action: "Gửi yêu cầu",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <div style={{ background: "#f8fafc" }}>
      {/* Hero Banner */}
      <section
        style={{
          position: "relative",
          minHeight: 380,
          display: "flex",
          alignItems: "center",
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.76), rgba(15, 23, 42, 0.84)), url(${IMG_CONTACT})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#fff",
        }}
      >
        <div className="container" style={{ padding: "60px 20px" }}>
          <div style={{ maxWidth: 640 }}>
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
                marginBottom: 14,
              }}
            >
              Liên hệ với chúng tôi
            </span>
            <h1
              style={{
                fontSize: "2.6rem",
                fontWeight: 800,
                letterSpacing: "-0.6px",
                lineHeight: 1.18,
                margin: "0 0 14px",
              }}
            >
              Chúng tôi luôn sẵn sàng lắng nghe & hỗ trợ bạn
            </h1>
            <p style={{ fontSize: "1rem", color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
              Bạn có câu hỏi về việc đặt homestay, hợp tác mở bán phòng nghỉ hoặc cần hỗ trợ sự cố? Hãy gửi tin nhắn cho chúng tôi.
            </p>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section style={{ transform: "translateY(-30px)", position: "relative", zIndex: 10 }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {contactInfo.map((item, idx) => (
              <div
                key={idx}
                className="hs-card"
                style={{ padding: "22px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: item.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: "0.95rem", color: "#1e293b", margin: "0 0 4px" }}>
                    {item.title}
                  </h4>
                  {item.lines.map((line, i) => (
                    <div key={i} style={{ color: "#64748b", fontSize: "0.82rem", lineHeight: 1.5 }}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Support Channels */}
      <section style={{ padding: "40px 0 70px" }}>
        <div className="container">
          <div className="row g-5">
            {/* Form */}
            <div className="col-lg-7">
              <div className="hs-card" style={{ padding: "32px 28px" }}>
                <h3 style={{ fontWeight: 800, color: "#1e293b", fontSize: "1.3rem", margin: "0 0 8px" }}>
                  Gửi tin nhắn phản hồi
                </h3>
                <p style={{ color: "#64748b", fontSize: "0.88rem", margin: "0 0 24px" }}>
                  Điền đầy đủ thông tin bên dưới, bộ phận chăm sóc khách hàng sẽ phản hồi qua email trong vòng 24 giờ.
                </p>

                {submitted ? (
                  <div
                    style={{
                      padding: "24px 20px",
                      borderRadius: 14,
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      textAlign: "center",
                    }}
                  >
                    <CheckCircle size={36} color="#16a34a" style={{ marginBottom: 10 }} />
                    <h4 style={{ fontWeight: 800, color: "#15803d", margin: "0 0 6px" }}>
                      Tin nhắn của bạn đã được gửi thành công!
                    </h4>
                    <p style={{ color: "#166534", fontSize: "0.85rem", margin: "0 0 16px" }}>
                      Cảm ơn bạn đã liên hệ. Chúng tôi sẽ xử lý thông tin và phản hồi sớm nhất có thể.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn-outline-hs"
                      style={{ fontSize: "0.82rem", padding: "6px 16px" }}
                    >
                      Gửi tin nhắn khác
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="hs-form-label">Họ và tên *</label>
                        <input
                          type="text"
                          required
                          className="hs-form-control"
                          placeholder="Nguyễn Văn A"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="hs-form-label">Địa chỉ Email *</label>
                        <input
                          type="email"
                          required
                          className="hs-form-control"
                          placeholder="name@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="hs-form-label">Chủ đề cần hỗ trợ *</label>
                      <input
                        type="text"
                        required
                        className="hs-form-control"
                        placeholder="VD: Hỗ trợ đặt phòng, hợp tác homestay..."
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="hs-form-label">Nội dung chi tiết *</label>
                      <textarea
                        required
                        rows={5}
                        className="hs-form-control"
                        placeholder="Mô tả cụ thể thắc mắc hoặc yêu cầu của bạn..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="btn-primary-hs"
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px" }}
                      >
                        <Send size={15} />
                        <span>Gửi tin nhắn</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Channels */}
            <div className="col-lg-5">
              <div style={{ display: "grid", gap: 16 }}>
                {supportChannels.map((channel, i) => (
                  <div
                    key={i}
                    className="hs-card"
                    style={{ padding: "20px 22px", display: "flex", gap: 14, alignItems: "flex-start" }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        background: channel.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {channel.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: 800, color: "#1e293b", fontSize: "0.98rem", margin: "0 0 4px" }}>
                        {channel.title}
                      </h4>
                      <p style={{ color: "#64748b", fontSize: "0.83rem", lineHeight: 1.6, margin: "0 0 10px" }}>
                        {channel.desc}
                      </p>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2563EB", cursor: "pointer" }}>
                        {channel.action} →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
