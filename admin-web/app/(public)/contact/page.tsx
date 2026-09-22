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
    title: "Email",
    lines: ["phamchuan2608@gmail.com"],
  },
  {
    icon: <Phone size={22} color="#059669" />,
    bg: "#ecfdf5",
    title: "Phone",
    lines: ["0362111527", "Mon - Sat, 8am - 9pm"],
  },
  {
    icon: <MapPin size={22} color="#7c3aed" />,
    bg: "#f5f3ff",
    title: "Address",
    lines: ["Bình Giang, Hải Phòng", "Việt Nam"],
  },
  {
    icon: <HeadphonesIcon size={22} color="#d97706" />,
    bg: "#fef3c7",
    title: "Support",
    lines: ["24/7 Guest Support", "Direct support for hosts and guests"],
  },
];

const supportChannels = [
  {
    icon: <MessageSquare size={24} color="#2563EB" />,
    bg: "#eff6ff",
    title: "Live Chat",
    desc: "Chat with us directly when you need support for booking, hosting, or account issues.",
    action: "Start Chat",
  },
  {
    icon: <HeadphonesIcon size={24} color="#7c3aed" />,
    bg: "#f5f3ff",
    title: "Phone Support",
    desc: "Call directly during working hours when you need a faster conversation.",
    action: "Call Now",
  },
  {
    icon: <BookOpen size={24} color="#059669" />,
    bg: "#ecfdf5",
    title: "Help Center",
    desc: "Browse guides for booking, payment proof, hosting workflows, and account settings.",
    action: "Browse Guides",
  },
  {
    icon: <Shield size={24} color="#dc2626" />,
    bg: "#fef2f2",
    title: "Safety Support",
    desc: "Reach out quickly if you need help with trust, safety, or booking-related concerns.",
    action: "Contact Support",
  },
];

const socialLinks = [
  {
    icon: <Facebook size={18} />,
    label: "Facebook",
    color: "#1877F2",
    bg: "#e7f0fd",
    href: "https://www.facebook.com/pham.chuan.915459/",
  },
  {
    icon: <Instagram size={18} />,
    label: "Instagram",
    color: "#E1306C",
    bg: "#fce4ec",
    href: "#!",
  },
  {
    icon: <Twitter size={18} />,
    label: "Twitter",
    color: "#1DA1F2",
    bg: "#e7f5fe",
    href: "#!",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  }

  return (
    <div style={{ background: "#fff" }}>
      <section
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)",
          padding: "64px 0 56px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.07,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container" style={{ position: "relative" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 100,
              padding: "5px 16px",
              marginBottom: 18,
            }}
          >
            <Mail size={13} color="#93c5fd" />
            <span style={{ fontSize: "0.78rem", color: "#93c5fd", fontWeight: 600 }}>
              Get in Touch
            </span>
          </div>
          <h1
            style={{
              color: "#fff",
              marginBottom: 14,
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              letterSpacing: -0.8,
            }}
          >
            Let&apos;s Talk About Your Stay
          </h1>
          <p
            style={{
              color: "#94a3b8",
              maxWidth: 520,
              margin: "0 auto",
              fontSize: "1rem",
              lineHeight: 1.7,
            }}
          >
            Reach out if you need help with a booking, hosting workflow, or general
            support. We are here to help.
          </p>
        </div>
      </section>

      <section style={{ padding: "60px 0 20px", background: "#f8fafc" }}>
        <div className="container">
          <div className="row g-4">
            {contactInfo.map((item) => (
              <div key={item.title} className="col-lg-3 col-sm-6">
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    padding: "24px 20px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: item.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    {item.icon}
                  </div>
                  <h5 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
                    {item.title}
                  </h5>
                  {item.lines.map((line) => (
                    <div
                      key={line}
                      style={{
                        color: "#64748b",
                        fontSize: "0.87rem",
                        lineHeight: 1.7,
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "56px 0 72px", background: "#f8fafc" }}>
        <div className="container">
          <div className="row g-5 align-items-start">
            <div className="col-lg-7">
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: "36px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                {submitted ? (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: "#dcfce7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                      }}
                    >
                      <CheckCircle size={36} color="#16a34a" />
                    </div>
                    <h3 style={{ fontWeight: 800, color: "#1e293b", marginBottom: 12 }}>
                      Message Sent
                    </h3>
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "0.95rem",
                        lineHeight: 1.7,
                        marginBottom: 24,
                      }}
                    >
                      Thanks for reaching out. We will review your message and get back
                      to you as soon as possible.
                    </p>
                    <button
                      className="btn-outline-hs"
                      onClick={() => {
                        setSubmitted(false);
                        setForm({
                          name: "",
                          email: "",
                          subject: "",
                          category: "",
                          message: "",
                        });
                      }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h3
                      style={{
                        fontWeight: 800,
                        color: "#1e293b",
                        marginBottom: 6,
                        fontSize: "1.3rem",
                      }}
                    >
                      Send a Message
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "0.87rem", marginBottom: 28 }}>
                      Fill out the form below and we will get back to you shortly.
                    </p>

                    <form onSubmit={handleSubmit}>
                      <div className="row g-3">
                        <div className="col-sm-6">
                          <label className="hs-form-label">Full Name *</label>
                          <input
                            type="text"
                            required
                            className="hs-form-control"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, name: event.target.value }))
                            }
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="hs-form-label">Email Address *</label>
                          <input
                            type="email"
                            required
                            className="hs-form-control"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, email: event.target.value }))
                            }
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="hs-form-label">Category</label>
                          <select
                            className="hs-form-control"
                            value={form.category}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, category: event.target.value }))
                            }
                          >
                            <option value="">Select a category</option>
                            <option>Booking Support</option>
                            <option>Host Inquiry</option>
                            <option>Payment Issue</option>
                            <option>Safety Concern</option>
                            <option>Technical Problem</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div className="col-sm-6">
                          <label className="hs-form-label">Subject *</label>
                          <input
                            type="text"
                            required
                            className="hs-form-control"
                            placeholder="Brief subject line"
                            value={form.subject}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, subject: event.target.value }))
                            }
                          />
                        </div>
                        <div className="col-12">
                          <label className="hs-form-label">Message *</label>
                          <textarea
                            required
                            className="hs-form-control"
                            rows={5}
                            placeholder="Tell us how we can help..."
                            value={form.message}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, message: event.target.value }))
                            }
                            style={{ resize: "vertical" }}
                          />
                        </div>
                        <div className="col-12" style={{ paddingTop: 6 }}>
                          <button
                            type="submit"
                            className="btn-primary-hs"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: "0.95rem",
                              padding: "12px 28px",
                            }}
                            disabled={loading}
                          >
                            {loading ? "Sending..." : <><Send size={16} /> Send Message</>}
                          </button>
                        </div>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>

            <div className="col-lg-5">
              <div
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  marginBottom: 24,
                  border: "1px solid #e2e8f0",
                  position: "relative",
                  height: 240,
                }}
              >
                <img
                  src={IMG_CONTACT}
                  alt="Contact"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(135deg, rgba(15,23,42,0.7) 0%, rgba(37,99,235,0.5) 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 10,
                    }}
                  >
                    <MapPin size={22} color="#fff" />
                  </div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
                    Bình Giang, Hải Phòng
                  </div>
                  <div style={{ color: "#93c5fd", fontSize: "0.82rem", marginTop: 4 }}>
                    Việt Nam
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "22px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h5
                  style={{
                    fontWeight: 700,
                    color: "#1e293b",
                    marginBottom: 16,
                    fontSize: "0.97rem",
                  }}
                >
                  Follow Us
                </h5>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target={social.href.startsWith("http") ? "_blank" : undefined}
                      rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 14px",
                        borderRadius: 8,
                        background: social.bg,
                        color: social.color,
                        textDecoration: "none",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                      }}
                    >
                      {social.icon} {social.label}
                    </a>
                  ))}
                </div>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.78rem",
                    marginTop: 14,
                    marginBottom: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Follow along for updates, product improvements, and new travel
                  features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "60px 0 72px" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 className="hs-section-title" style={{ marginBottom: 10 }}>
              Other Ways to Reach Us
            </h2>
            <p className="hs-section-subtitle">
              Choose the support channel that works best for you.
            </p>
          </div>
          <div className="row g-4">
            {supportChannels.map((channel) => (
              <div key={channel.title} className="col-lg-3 col-md-6">
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: "28px 24px",
                    border: "1px solid #e2e8f0",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: channel.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 18,
                    }}
                  >
                    {channel.icon}
                  </div>
                  <h5
                    style={{
                      fontWeight: 700,
                      color: "#1e293b",
                      marginBottom: 8,
                      fontSize: "0.97rem",
                    }}
                  >
                    {channel.title}
                  </h5>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "0.85rem",
                      lineHeight: 1.7,
                      flex: 1,
                      margin: 0,
                    }}
                  >
                    {channel.desc}
                  </p>
                  <button
                    className="btn-outline-hs"
                    style={{ marginTop: 18, fontSize: "0.82rem", padding: "7px 16px" }}
                  >
                    {channel.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
