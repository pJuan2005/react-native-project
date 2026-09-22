"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Home,
  MapPin,
  Send,
  Star,
} from "lucide-react";
import { useAuth, getUserInitials } from "@/components/context/AuthContext";
import { createReview } from "@/services/reviewService";
import { getMyBookingById, type BookingRecord } from "@/services/bookingService";

function StarRating({
  value,
  hovered,
  onHover,
  onLeave,
  onClick,
}: {
  value: number;
  hovered: number;
  onHover: (value: number) => void;
  onLeave: () => void;
  onClick: (value: number) => void;
}) {
  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  const active = hovered || value;

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onClick(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={onLeave}
            style={{
              background: "none",
              border: "none",
              padding: 2,
              cursor: "pointer",
              transition: "transform 0.12s",
              transform: active >= star ? "scale(1.15)" : "scale(1)",
            }}
          >
            <Star
              size={36}
              fill={active >= star ? "#f59e0b" : "none"}
              color={active >= star ? "#f59e0b" : "#d1d5db"}
            />
          </button>
        ))}
      </div>
      {active > 0 && (
        <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "0.92rem" }}>
          {labels[active]}
        </span>
      )}
    </div>
  );
}

function isCheckoutPast(checkOutDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkout = new Date(`${checkOutDate}T00:00:00`);
  checkout.setHours(0, 0, 0, 0);

  return checkout < today;
}

export default function WriteReviewPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const { user, isInitializing } = useAuth();

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(true);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pageError, setPageError] = useState("");
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>(
    {},
  );

  const id = Number(bookingId);

  useEffect(() => {
    if (!isInitializing && (!user || user.role !== "Guest")) {
      router.replace("/auth/login");
    }
  }, [isInitializing, router, user]);

  useEffect(() => {
    if (!isInitializing && user?.role === "Guest" && Number.isInteger(id) && id > 0) {
      setIsLoadingBooking(true);
      setPageError("");

      getMyBookingById(id)
        .then((data) => setBooking(data))
        .catch((error) =>
          setPageError(
            error instanceof Error
              ? error.message
              : "Unable to load this booking right now.",
          ),
        )
        .finally(() => setIsLoadingBooking(false));
    }
  }, [id, isInitializing, user]);

  function validateReview() {
    const nextErrors: { rating?: string; comment?: string } = {};

    if (!rating) {
      nextErrors.rating = "Please select a star rating.";
    }

    if (!comment.trim()) {
      nextErrors.comment = "Please write a comment.";
    } else if (comment.trim().length < 10) {
      nextErrors.comment = "Comment must be at least 10 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!booking || !validateReview()) {
      return;
    }

    setIsSubmitting(true);
    setPageError("");

    try {
      const response = await createReview({
        bookingId: booking.id,
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
      setBooking({
        ...booking,
        reviewId: response.data.id,
        reviewRating: response.data.rating,
        reviewCreatedAt: response.data.date,
      });
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to submit your review right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isInitializing || !user || user.role !== "Guest" || isLoadingBooking) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#64748b" }}>
        Loading your booking...
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div className="hs-card" style={{ padding: "48px 36px", textAlign: "center", maxWidth: 460 }}>
          <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: 16 }} />
          <h2 style={{ color: "#1e293b", fontWeight: 700, marginBottom: 8 }}>Booking Not Found</h2>
          <p style={{ color: "#64748b", marginBottom: 24 }}>
            {pageError || "We could not find this booking in your account."}
          </p>
          <Link href="/dashboard">
            <button className="btn-primary-hs">Go to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  if (booking.status !== "confirmed") {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div className="hs-card" style={{ padding: "48px 36px", textAlign: "center", maxWidth: 460 }}>
          <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: 16 }} />
          <h2 style={{ color: "#1e293b", fontWeight: 700, marginBottom: 8 }}>Not Eligible to Review</h2>
          <p style={{ color: "#64748b", marginBottom: 24 }}>
            Only confirmed bookings can be reviewed. This booking is currently{" "}
            <strong>{booking.status}</strong>.
          </p>
          <Link href="/dashboard">
            <button className="btn-primary-hs">Back to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isCheckoutPast(booking.checkOut)) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div className="hs-card" style={{ padding: "48px 36px", textAlign: "center", maxWidth: 460 }}>
          <CalendarDays size={48} color="#2563EB" style={{ marginBottom: 16 }} />
          <h2 style={{ color: "#1e293b", fontWeight: 700, marginBottom: 8 }}>Your Stay Hasn't Ended Yet</h2>
          <p style={{ color: "#64748b", marginBottom: 24 }}>
            You can write a review after your checkout date:{" "}
            <strong>{booking.checkOut}</strong>.
          </p>
          <Link href="/dashboard">
            <button className="btn-primary-hs">Back to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  if (booking.reviewId) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div className="hs-card" style={{ padding: "48px 36px", textAlign: "center", maxWidth: 460 }}>
          <CheckCircle size={48} color="#16a34a" style={{ marginBottom: 16 }} />
          <h2 style={{ color: "#1e293b", fontWeight: 700, marginBottom: 8 }}>Already Reviewed</h2>
          <p style={{ color: "#64748b", marginBottom: 24 }}>
            You have already submitted a review for this stay. Thank you for your feedback.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/dashboard">
              <button className="btn-primary-hs">My Dashboard</button>
            </Link>
            <Link href={`/listings/${booking.propertyId}`}>
              <button className="btn-outline-hs">View Property</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = getUserInitials(user.name);

  if (submitted) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div className="hs-card" style={{ padding: "52px 40px", textAlign: "center", maxWidth: 480 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>Thank you</div>
          <h2 style={{ color: "#16a34a", fontWeight: 800, marginBottom: 8, fontSize: "1.5rem" }}>Review Submitted</h2>
          <p style={{ color: "#475569", marginBottom: 8 }}>
            Your review for <strong>{booking.propertyTitle}</strong> has been saved.
          </p>
          <div style={{ display: "flex", gap: 3, justifyContent: "center", marginBottom: 24 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={22}
                fill={index < rating ? "#f59e0b" : "none"}
                color={index < rating ? "#f59e0b" : "#e2e8f0"}
              />
            ))}
          </div>
          <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: 28, background: "#f8fafc", padding: "12px 16px", borderRadius: 10, fontStyle: "italic", border: "1px solid #e2e8f0" }}>
            "{comment.trim()}"
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/dashboard">
              <button className="btn-primary-hs">Back to Dashboard</button>
            </Link>
            <Link href={`/listings/${booking.propertyId}`}>
              <button className="btn-outline-hs">View Property</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "32px 0" }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem" }}>
          <button
            onClick={() => router.back()}
            style={{ background: "none", border: "none", color: "#2563EB", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0, fontWeight: 600 }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span style={{ color: "#94a3b8" }}>/</span>
          <Link href="/dashboard" style={{ color: "#64748b", textDecoration: "none" }}>
            Dashboard
          </Link>
          <span style={{ color: "#94a3b8" }}>/</span>
          <span style={{ color: "#1e293b", fontWeight: 600 }}>Write a Review</span>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontWeight: 800, color: "#1e293b", fontSize: "1.6rem", marginBottom: 4 }}>
            Write a Review
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "0.88rem" }}>
            Share your stay experience to help future guests make better decisions.
          </p>
        </div>

        {pageError && (
          <div style={{ marginBottom: 18, borderRadius: 12, padding: "12px 14px", border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", fontSize: "0.84rem" }}>
            {pageError}
          </div>
        )}

        <div className="hs-card" style={{ padding: "18px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src={booking.propertyImage}
            alt={booking.propertyTitle}
            style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem", marginBottom: 4 }}>
              {booking.propertyTitle}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: "0.82rem", marginBottom: 6 }}>
              <MapPin size={12} color="#2563EB" /> {booking.propertyLocation}
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.78rem", color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                <CalendarDays size={11} color="#94a3b8" />
                {booking.checkIn} → {booking.checkOut}
              </span>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                {booking.nights} nights • {booking.guests} guest{booking.guests > 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
              Confirmed
            </span>
            <span style={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem" }}>
              ${booking.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="hs-card" style={{ padding: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, padding: "16px 18px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.92rem" }}>
                Reviewing as {user.name}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                Guest • Verified booking
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span style={{ background: "#eff6ff", color: "#2563EB", fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                <Home size={11} /> Verified Stay
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontWeight: 700, color: "#1e293b", marginBottom: 12, fontSize: "0.95rem" }}>
                Overall Rating <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <StarRating
                value={rating}
                hovered={hovered}
                onHover={setHovered}
                onLeave={() => setHovered(0)}
                onClick={(value) => {
                  setRating(value);
                  setErrors((currentErrors) => ({ ...currentErrors, rating: undefined }));
                }}
              />
              {errors.rating && (
                <div style={{ marginTop: 8, color: "#dc2626", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertTriangle size={13} /> {errors.rating}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontWeight: 700, color: "#1e293b", marginBottom: 8, fontSize: "0.95rem" }}>
                Your Review <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                className="hs-form-control"
                rows={5}
                placeholder="Tell us about the property, location, host support, and anything memorable about your stay..."
                value={comment}
                onChange={(event) => {
                  setComment(event.target.value);
                  if (event.target.value.trim().length >= 10) {
                    setErrors((currentErrors) => ({
                      ...currentErrors,
                      comment: undefined,
                    }));
                  }
                }}
                style={{
                  resize: "vertical",
                  border: errors.comment ? "1.5px solid #dc2626" : undefined,
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {errors.comment ? (
                  <span style={{ color: "#dc2626", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 4 }}>
                    <AlertTriangle size={13} /> {errors.comment}
                  </span>
                ) : (
                  <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>Minimum 10 characters</span>
                )}
                <span style={{ color: comment.length < 10 ? "#94a3b8" : "#16a34a", fontSize: "0.78rem", fontWeight: 600 }}>
                  {comment.length} chars
                </span>
              </div>
            </div>

            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginBottom: 24 }}>
              <div style={{ fontWeight: 700, color: "#92400e", fontSize: "0.82rem", marginBottom: 6 }}>
                Review Guidelines
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, color: "#78350f", fontSize: "0.79rem", lineHeight: 1.7 }}>
                <li>Share your genuine experience and keep it constructive.</li>
                <li>Focus on the property quality, location, and host communication.</li>
                <li>Avoid offensive language or personal attacks.</li>
                <li>Each confirmed stay can only be reviewed once.</li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                type="submit"
                className="btn-primary-hs"
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.95rem" }}
                disabled={isSubmitting}
              >
                <Send size={15} />
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
              <button
                type="button"
                className="btn-outline-hs"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
