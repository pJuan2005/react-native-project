"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Home,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";

type RegisterRole = "Guest" | "Host";

interface FormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  location: string;
  role: RegisterRole;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isInitializing, user } = useAuth();
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    role: "Guest",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

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

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required";
    }

    if (!form.email.includes("@")) {
      nextErrors.email = "Email is invalid";
    }

    if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required";
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);
    setServerError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);

    const result = await register({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim(),
      role: form.role === "Host" ? "host" : "guest",
      location: form.location.trim(),
    });

    setLoading(false);

    if (!result.success) {
      setServerError(result.error || "Registration failed");
      return;
    }

    router.push(result.redirectTo || "/dashboard");
  }

  if (isInitializing) {
    return (
      <div className="hs-auth-page">
        <div className="hs-auth-card" style={{ maxWidth: 420, margin: "0 auto" }}>
          <div style={{ textAlign: "center", color: "#64748b" }}>
            Preparing the registration form...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hs-auth-page">
      <div style={{ width: "100%", maxWidth: 520, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
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
              Create your account
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem" }}>
              Join HomeStay as a guest or host
            </p>
          </div>

          {serverError && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 18,
                color: "#dc2626",
                fontSize: "0.87rem",
                fontWeight: 600,
              }}
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 22 }}>
              <label className="hs-form-label">I want to join as</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  {
                    value: "Guest" as const,
                    title: "Guest",
                    description: "Browse and book stays",
                    icon: User,
                  },
                  {
                    value: "Host" as const,
                    title: "Host",
                    description: "List properties and manage bookings",
                    icon: Building2,
                  },
                ].map((option) => {
                  const Icon = option.icon;
                  const selected = form.role === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, role: option.value }))}
                      style={{
                        padding: "16px 12px",
                        borderRadius: 12,
                        border: `2px solid ${selected ? "#2563EB" : "#e2e8f0"}`,
                        background: selected ? "#eff6ff" : "#fff",
                        cursor: "pointer",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        position: "relative",
                      }}
                    >
                      <div style={{ color: selected ? "#2563EB" : "#94a3b8" }}>
                        <Icon size={22} />
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: selected ? "#2563EB" : "#1e293b",
                          fontSize: "0.9rem",
                        }}
                      >
                        {option.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        {option.description}
                      </div>
                      {selected && (
                        <div style={{ position: "absolute", top: 8, right: 8 }}>
                          <CheckCircle size={16} color="#2563EB" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12">
                <label className="hs-form-label">Full Name</label>
                <div style={{ position: "relative" }}>
                  <User
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
                    type="text"
                    required
                    className="hs-form-control"
                    style={{
                      paddingLeft: 38,
                      borderColor: errors.fullName ? "#dc2626" : undefined,
                    }}
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, fullName: event.target.value }))
                    }
                  />
                </div>
                {errors.fullName && <InlineError message={errors.fullName} />}
              </div>

              <div className="col-md-6">
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
                    style={{
                      paddingLeft: 38,
                      borderColor: errors.email ? "#dc2626" : undefined,
                    }}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                </div>
                {errors.email && <InlineError message={errors.email} />}
              </div>

              <div className="col-md-6">
                <label className="hs-form-label">Phone Number</label>
                <div style={{ position: "relative" }}>
                  <Phone
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
                    type="text"
                    required
                    className="hs-form-control"
                    style={{
                      paddingLeft: 38,
                      borderColor: errors.phone ? "#dc2626" : undefined,
                    }}
                    placeholder="0987654321"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                  />
                </div>
                {errors.phone && <InlineError message={errors.phone} />}
              </div>

              <div className="col-12">
                <label className="hs-form-label">Location</label>
                <div style={{ position: "relative" }}>
                  <MapPin
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
                    type="text"
                    className="hs-form-control"
                    style={{ paddingLeft: 38 }}
                    placeholder="City, country"
                    value={form.location}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, location: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="col-md-6">
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
                    style={{
                      paddingLeft: 38,
                      paddingRight: 42,
                      borderColor: errors.password ? "#dc2626" : undefined,
                    }}
                    placeholder="At least 6 characters"
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
                {errors.password && <InlineError message={errors.password} />}
              </div>

              <div className="col-md-6">
                <label className="hs-form-label">Confirm Password</label>
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
                    style={{
                      paddingLeft: 38,
                      borderColor: errors.confirmPassword ? "#dc2626" : undefined,
                    }}
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        confirmPassword: event.target.value,
                      }))
                    }
                  />
                </div>
                {errors.confirmPassword && (
                  <InlineError message={errors.confirmPassword} />
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary-hs"
              style={{
                width: "100%",
                marginTop: 32,
                fontSize: "0.95rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              disabled={loading}
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
                  Creating account...
                </span>
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: 20,
              paddingTop: 18,
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.88rem" }}>
              Already have an account?{" "}
              <Link
                href="/auth/login"
                style={{ color: "#2563EB", fontWeight: 700, textDecoration: "none" }}
              >
                Sign in
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function InlineError({ message }: { message: string }) {
  return <div style={{ color: "#dc2626", fontSize: "0.78rem", marginTop: 4 }}>{message}</div>;
}
