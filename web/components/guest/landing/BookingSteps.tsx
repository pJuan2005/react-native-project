const STEPS = [
  {
    step: "01",
    title: "Tìm chỗ nghỉ",
    subtitle: "Lựa chọn không gian",
    description:
      "Khám phá các homestay, villa tại điểm đến yêu thích dựa trên số lượng khách và khoảng giá mong muốn.",
  },
  {
    step: "02",
    title: "Chọn ngày lưu trú",
    subtitle: "Kiểm tra phòng trống",
    description:
      "Chọn ngày nhận phòng và trả phòng để kiểm tra tính khả dụng và xem bảng chi phí chi tiết.",
  },
  {
    step: "03",
    title: "Đặt & Chuyển khoản",
    subtitle: "Thanh toán VietQR",
    description:
      "Gửi yêu cầu đặt phòng, quét mã VietQR ngân hàng chính xác và tải lên ảnh chụp biên lai giao dịch.",
  },
  {
    step: "04",
    title: "Nhận phòng",
    subtitle: "Tận hưởng kỳ nghỉ",
    description:
      "Chủ nhà xác nhận đơn phòng, gửi hướng dẫn nhận phòng chi tiết và sẵn sàng chào đón bạn.",
  },
];

export function BookingSteps() {
  return (
    <section style={{ padding: "80px 0", background: "#ffffff", borderTop: "1px solid #f1f5f9" }}>
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
            Quy trình thuận tiện
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
            Cách thức đặt phòng dễ dàng
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#64748b", margin: "8px 0 0" }}>
            Chỉ với 4 bước đơn giản để chuẩn bị cho kỳ nghỉ tiếp theo của bạn
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
          }}
        >
          {STEPS.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: "#fcfbf9",
                padding: "32px 24px",
                borderRadius: 20,
                border: "1px solid #e2e8f0",
                position: "relative",
              }}
            >
              <span
                style={{
                  fontSize: "2.4rem",
                  fontWeight: 900,
                  color: "#cbd5e1",
                  lineHeight: 1,
                  display: "block",
                  marginBottom: 16,
                  fontFamily: "monospace",
                }}
              >
                {item.step}
              </span>
              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: "0 0 4px",
                }}
              >
                {item.title}
              </h3>
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#2563EB",
                  marginBottom: 10,
                }}
              >
                {item.subtitle}
              </div>
              <p
                style={{
                  fontSize: "0.87rem",
                  color: "#64748b",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
