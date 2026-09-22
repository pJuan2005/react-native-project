// ============================================================
// TARGET: frontend/app/(public)/layout.tsx
// ============================================================

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      <Navbar />
      <main style={{ flex: 1, paddingBottom: 40 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
