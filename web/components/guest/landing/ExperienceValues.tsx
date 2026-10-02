import { CalendarCheck, Eye, QrCode, Search } from "lucide-react";

const VALUES = [
  {
    icon: <Search size={24} color="#2563EB" />,
    title: "Tìm kiếm chỗ nghỉ trực quan",
    desc: "Bộ lọc thông minh theo địa điểm du lịch, khoảng giá, số khách và loại hình villa, cabin hay homestay nguyên căn.",
  },
  {
    icon: <Eye size={24} color="#059669" />,
    title: "Hình ảnh & Thông tin rõ ràng",
    desc: "Cung cấp đầy đủ hình ảnh không gian phòng, số phòng ngủ, phòng tắm cùng danh mục tiện nghi cụ thể.",
  },
  {
    icon: <CalendarCheck size={24} color="#d97706" />,
    title: "Kiểm tra lịch phòng theo ngày",
    desc: "Lựa chọn ngày nhận phòng và trả phòng dễ dàng, kiểm tra khoảng ngày còn trống để lên kế hoạch du lịch chu đáo.",
  },
  {
    icon: <QrCode size={24} color="#7c3aed" />,
    title: "Thanh toán VietQR thuận tiện",
    desc: "Quét mã VietQR chuyển khoản ngân hàng chính xác đến từng đồng, tải ảnh chụp biên lai đối soát minh bạch.",
  },
];

export function ExperienceValues() {
  return (
    <section style={{ padding: "80px 0", background: "#fcfbf9", borderTop: "1px solid #f1f5f9" }}>
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              color: "#2563EB",
              display: "block",
              marginBottom: 6,
            }}
          >
            Trải nghiệm lưu trú
          </span>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.5px",
              lineHeight: 1.25,
            }}
          >
            Đồng hành cùng bạn trong mỗi chuyến đi
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#64748b", margin: "8px 0 0" }}>
            Giải pháp đặt phòng homestay đơn giản, minh bạch và an tâm cho kỳ nghỉ của bạn
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 24,
          }}
        >
          {VALUES.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "32px 24px",
                borderRadius: 20,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  border: "1px solid #f1f5f9",
                }}
              >
                {item.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.08rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: "0 0 10px",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "0.87rem",
                  color: "#64748b",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
