import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "Không gian homestay thật sự yên bình và ấm cúng. Buổi sớm thức dậy ngắm biển mây Sa Pa tràn qua thung lũng, nhâm nhi tách trà nóng là kỷ niệm khó quên nhất của gia đình mình trong năm nay.",
    author: "Nguyễn Thùy Linh",
    location: "Hà Nội",
    homestay: "Cloud Nine Homestay • Sa Pa",
    rating: 5,
    avatar: "L",
  },
  {
    quote:
      "Villa sát biển với hồ bơi riêng tư tuyệt đẹp. Từ khâu tìm kiếm, quét mã VietQR thanh toán đến khi nhận phòng đều diễn ra mượt mà, chủ nhà nhiệt tình hỗ trợ suốt kỳ nghỉ.",
    author: "Trần Đức Nam",
    location: "TP. Hồ Chí Minh",
    homestay: "Ocean Breeze Villa • Phú Quốc",
    rating: 5,
    avatar: "N",
  },
  {
    quote:
      "Căn nhà gỗ thông giữa sườn đồi Đà Lạt rất thơm và sạch sẽ. Giá niêm yết rõ ràng, ảnh chụp thực tế đúng 100% so với bên ngoài. Cảm giác nghỉ dưỡng rất thư thái và nhẹ nhàng.",
    author: "Lê Hoàng Yến",
    location: "Đà Nẵng",
    homestay: "Pine Hill Cabin • Đà Lạt",
    rating: 5,
    avatar: "Y",
  },
];

export function GuestStories() {
  return (
    <section style={{ padding: "80px 0", background: "#fcfbf9", borderTop: "1px solid #f1f5f9" }}>
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 52px" }}>
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
            Chia sẻ trải nghiệm
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
            Cảm nhận từ những du khách đã lưu trú
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#64748b", margin: "8px 0 0" }}>
            Mỗi chuyến đi là một câu chuyện đáng nhớ về sự gắn kết và nghỉ ngơi thực thụ
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
            gap: 26,
          }}
        >
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: "#ffffff",
                padding: "32px 28px",
                borderRadius: 20,
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div>
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p
                  style={{
                    fontSize: "0.93rem",
                    color: "#334155",
                    lineHeight: 1.75,
                    fontStyle: "italic",
                    margin: "0 0 24px",
                  }}
                >
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  paddingTop: 18,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2563EB, #7c3aed)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0f172a" }}>
                    {item.author}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>
                    {item.location} • <strong style={{ color: "#2563EB" }}>{item.homestay}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
