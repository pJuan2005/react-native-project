"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Home,
  Lock,
  LogIn,
  Mail,
} from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isInitializing, user } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isInitializing && isAuthenticated && user) {
      if (user.role === "Admin") {
        router.replace("/admin/dashboard");
        return;
      }

      if (user.role === "Host") {
        router.replace("/host/dashboard");
        return;
      }

      router.replace("/dashboard");
    }
  }, [isAuthenticated, isInitializing, router, user]);

  async function submitLogin(email: string, password: string) {
    setLoading(true);
    setError("");

    const result = await login(email, password);

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Login failed");
      return;
    }

    router.push(result.redirectTo || "/dashboard");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitLogin(form.email, form.password);
  }

  if (isInitializing) {
    return (
      <div className="hs-auth-page">
        <div className="hs-auth-card" style={{ maxWidth: 420, margin: "0 auto" }}>
          <div style={{ textAlign: "center", color: "#64748b" }}>
            Checking your session...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hs-auth-page">
      <div style={{ width: "100%", maxWidth: 500, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Home size={20} color="#fff" />
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.5rem",
                color: "#1e293b",
                letterSpacing: -0.5,
              }}
            >
              HomeStay
            </span>
          </Link>
        </div>

        <div className="hs-auth-card">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h1
              style={{
                fontWeight: 800,
                color: "#1e293b",
                marginBottom: 6,
                fontSize: "1.6rem",
              }}
            >
              Sign in
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.92rem" }}>
              Access your HomeStay account
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 18,
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#dc2626",
                fontSize: "0.87rem",
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label className="hs-form-label">Email</label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={15}
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type="email"
                  required
                  className="hs-form-control"
                  style={{ paddingLeft: 38 }}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label className="hs-form-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={15}
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="hs-form-control"
                  style={{ paddingLeft: 38, paddingRight: 42 }}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 22,
              }}
            >
              <input
                type="checkbox"
                id="remember"
                style={{ accentColor: "#2563EB", width: 16, height: 16 }}
                checked={form.remember}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    remember: event.target.checked,
                  }))
                }
              />
              <label
                htmlFor="remember"
                style={{
                  fontSize: "0.87rem",
                  color: "#475569",
                  cursor: "pointer",
                  margin: 0,
                }}
              >
                Keep me signed in on this browser
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary-hs"
              disabled={loading}
              style={{
                width: "100%",
                fontSize: "0.95rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg
                    style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: 22,
              paddingTop: 20,
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.88rem" }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                style={{ color: "#2563EB", fontWeight: 700, textDecoration: "none" }}
              >
                Create one <ArrowRight size={13} style={{ verticalAlign: "middle" }} />
              </Link>
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link
            href="/"
            style={{ color: "#64748b", fontSize: "0.83rem", textDecoration: "none" }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
