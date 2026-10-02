import { BadgePercent, CircleDollarSign, Settings, ShieldCheck } from "lucide-react";
import { PlatformSettingsPanel } from "@/components/shared/PlatformSettingsPanel";

const platformHighlights = [
  {
    icon: CircleDollarSign,
    title: "Tỷ giá quy đổi",
    description: "Giữ tỷ giá quy đổi chuyển khoản ngân hàng và mã VietQR chuẩn xác.",
    color: "#2563EB",
    background: "#eff6ff",
  },
  {
    icon: BadgePercent,
    title: "Quy tắc hoa hồng sàn",
    description: "Phân tách tỷ lệ hoa hồng đơn đặt trực tuyến và đơn đặt tại quầy lễ tân.",
    color: "#7c3aed",
    background: "#f5f3ff",
  },
  {
    icon: ShieldCheck,
    title: "Tài khoản nhận tiền",
    description: "Cấu hình số tài khoản ngân hàng và tên thụ hưởng hiển thị trên mã VietQR.",
    color: "#059669",
    background: "#ecfdf5",
  },
];

export default function AdminPlatformSettingsPage() {
  return (
    <div style={{ padding: "28px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontWeight: 800,
            color: "#1e293b",
            marginBottom: 4,
            fontSize: "1.5rem",
          }}
        >
          Cấu hình Nền tảng
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Quản lý tỷ giá, tỷ lệ chiết khấu hoa hồng và tài khoản ngân hàng thụ hưởng của sàn.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-xl-4">
          <div className="hs-card" style={{ padding: "24px 22px" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <Settings size={24} color="#2563EB" />
            </div>

            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "#1e293b",
                marginBottom: 8,
              }}
            >
              Thiết lập Tài chính Sàn
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.84rem", marginBottom: 20 }}>
              Các thông số này ảnh hưởng trực tiếp đến việc tính tiền thanh toán, tiền chi trả cho chủ nhà và báo cáo doanh thu.
            </p>

            <div style={{ display: "grid", gap: 12 }}>
              {platformHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      padding: "14px 14px",
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 14,
                        background: item.background,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} color={item.color} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#1e293b",
                          fontSize: "0.88rem",
                          marginBottom: 4,
                        }}
                      >
                        {item.title}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-xl-8">
          <PlatformSettingsPanel />
        </div>
      </div>
    </div>
  );
}
