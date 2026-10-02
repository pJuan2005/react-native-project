import Link from "next/link";
import { Building2, Compass, Sparkles } from "lucide-react";

interface FinalCTAProps {
  onExploreClick: () => void;
  isHost?: boolean;
}

export function FinalCTA({ onExploreClick, isHost }: FinalCTAProps) {
  return (
    <section style={{ padding: "60px 0 84px", background: "#fcfbf9" }}>
      <div className="container">
        <div
          style={{
            background: "linear-gradient(135deg, #0e1726 0%, #162438 50%, #1a3652 100%)",
            borderRadius: 28,
            padding: "56px 36px",
            color: "#ffffff",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(14, 23, 38, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 16px",
              borderRadius: 20,
              background: "rgba(56, 189, 248, 0.15)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "#7dd3fc",
              fontSize: "0.82rem",
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            <Sparkles size={14} />
            <span>Hành trình nghỉ dưỡng của bạn</span>
          </div>

          <h2
            style={{
              fontSize: "2.4rem",
              fontWeight: 800,
              color: "#ffffff",
              margin: "0 0 14px",
              letterSpacing: "-0.6px",
              lineHeight: 1.25,
            }}
          >
            Tìm nơi phù hợp cho hành trình tiếp theo.
          </h2>

          <p
            style={{
              fontSize: "1.02rem",
              color: "#cbd5e1",
              maxWidth: 620,
              margin: "0 auto 34px",
              lineHeight: 1.65,
            }}
          >
            Khám phá những homestay độc đáo, không gian nghỉ dưỡng yên bình và sẵn sàng cho những trải nghiệm đáng nhớ cùng người thân.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={onExploreClick}
              className="btn-primary-hs"
              style={{
                padding: "14px 32px",
                fontSize: "0.98rem",
                borderRadius: 12,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Compass size={17} />
              <span>Khám phá chỗ nghỉ</span>
            </button>

            {!isHost ? (
              <Link href="/auth/register" style={{ textDecoration: "none" }}>
                <button
                  className="btn-outline-hs"
                  style={{
                    padding: "13px 26px",
                    fontSize: "0.95rem",
                    borderRadius: 12,
                    borderColor: "rgba(255, 255, 255, 0.35)",
                    color: "#ffffff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Building2 size={16} />
                  <span>Trở thành Chủ Homestay</span>
                </button>
              </Link>
            ) : (
              <Link href="/host/dashboard" style={{ textDecoration: "none" }}>
                <button
                  className="btn-outline-hs"
                  style={{
                    padding: "13px 26px",
                    fontSize: "0.95rem",
                    borderRadius: 12,
                    borderColor: "rgba(255, 255, 255, 0.35)",
                    color: "#ffffff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Building2 size={16} />
                  <span>Quản lý phòng nghỉ của tôi</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
