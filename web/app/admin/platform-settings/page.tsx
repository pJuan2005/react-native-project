import { BadgePercent, CircleDollarSign, Settings, ShieldCheck } from "lucide-react";
import { PlatformSettingsPanel } from "@/components/shared/PlatformSettingsPanel";

const platformHighlights = [
  {
    icon: CircleDollarSign,
    title: "Exchange Rate",
    description: "Keeps QR payment totals aligned with the USD booking amount.",
    color: "#2563EB",
    background: "#eff6ff",
  },
  {
    icon: BadgePercent,
    title: "Commission Rules",
    description: "Separate online and direct booking fees for reporting and payouts.",
    color: "#7c3aed",
    background: "#f5f3ff",
  },
  {
    icon: ShieldCheck,
    title: "Transfer Account",
    description: "Control the bank account details shown in guest transfer instructions and VietQR.",
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
          Platform Settings
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Manage the exchange rate, commission rules, and bank account details
          used across the admin platform.
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
              Financial Controls
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.84rem", marginBottom: 20 }}>
              These values affect booking calculations, host payouts, and admin
              reporting throughout the system.
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
