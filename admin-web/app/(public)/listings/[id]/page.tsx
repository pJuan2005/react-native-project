"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DatePicker from "react-datepicker";
import {
  MapPin, Star, Users, Bed, Bath, Wifi, Utensils, Car, Wind,
  Waves, Dumbbell, Flame, TreePine, ArrowLeft, Calendar, ChevronLeft,
  ChevronRight, Heart, CheckCircle, MessageSquare, TrendingUp
} from "lucide-react";
import {
  getPropertyAvailability,
  getPropertyById,
  getPropertyUnavailableDates,
  type PropertyUnavailableDateRange,
} from "@/services/propertyService";
import {
  createBooking,
  uploadPaymentProof,
  type BookingRecord,
} from "@/services/bookingService";
import { useAuth } from "@/components/context/AuthContext";
import { PaymentInstructionsCard } from "@/components/shared/PaymentInstructionsCard";

const amenityIcons: Record<string, React.ReactNode> = {
  "Wifi": <Wifi size={16} />,
  "Full Kitchen": <Utensils size={16} />,
  "Kitchen": <Utensils size={16} />,
  "Free Parking": <Car size={16} />,
  "Parking": <Car size={16} />,
  "Air Conditioning": <Wind size={16} />,
  "Swimming Pool": <Waves size={16} />,
  "Private Pool": <Waves size={16} />,
  "Pool": <Waves size={16} />,
  "Gym Access": <Dumbbell size={16} />,
  "Fireplace": <Flame size={16} />,
  "Forest View": <TreePine size={16} />,
  "Beach Access": <Waves size={16} />,
  "TV": <Star size={16} />,
  "Washing Machine": <Wind size={16} />,
  "Balcony": <TreePine size={16} />,
  "Workspace": <Bed size={16} />,
  "Hot Water": <Flame size={16} />,
};

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={size}
          fill={n <= Math.round(rating) ? "#f59e0b" : "none"}
          color={n <= Math.round(rating) ? "#f59e0b" : "#d1d5db"}
        />
      ))}
    </div>
  );
}

function formatUsd(amount: number) {
  return `$${Number(amount || 0).toFixed(2)}`;
}

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  nextDate.setHours(12, 0, 0, 0);
  return nextDate;
}

function buildBlockedCheckInDates(ranges: PropertyUnavailableDateRange[]) {
  const blockedDates: Date[] = [];

  ranges.forEach((range) => {
    const startDate = parseLocalDate(range.checkIn);
    const endDate = parseLocalDate(range.checkOut);

    if (!startDate || !endDate) {
      return;
    }

    for (
      let cursor = new Date(startDate);
      cursor < endDate;
      cursor = addDays(cursor, 1)
    ) {
      blockedDates.push(new Date(cursor));
    }
  });

  return blockedDates;
}

function getNextBlockedStartDate(
  ranges: PropertyUnavailableDateRange[],
  checkIn: string,
) {
  const selectedCheckIn = parseLocalDate(checkIn);

  if (!selectedCheckIn) {
    return null;
  }

  const futureBlockedStarts = ranges
    .map((range) => parseLocalDate(range.checkIn))
    .filter((date): date is Date => date !== null && date > selectedCheckIn)
    .sort((firstDate, secondDate) => firstDate.getTime() - secondDate.getTime());

  return futureBlockedStarts[0] || null;
}

export default function DetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [bookingForm, setBookingForm] = useState({ checkIn: "", checkOut: "", guests: "1" });
  const [liked, setLiked] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [createdBooking, setCreatedBooking] = useState<BookingRecord | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [unavailableRanges, setUnavailableRanges] = useState<
    PropertyUnavailableDateRange[]
  >([]);
  const [availabilityState, setAvailabilityState] = useState<{
    isChecking: boolean;
    isAvailable: boolean | null;
    message: string;
  }>({
    isChecking: false,
    isAvailable: null,
    message: "",
  });

  useEffect(() => {
    if (id) {
      getPropertyById(id as string)
        .then(data => setProperty(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }

    getPropertyUnavailableDates(id as string)
      .then((ranges) => setUnavailableRanges(ranges))
      .catch(() => setUnavailableRanges([]));
  }, [id]);

  useEffect(() => {
    let isCancelled = false;

    async function checkAvailability() {
      if (!property?.id || !bookingForm.checkIn || !bookingForm.checkOut) {
        setAvailabilityState({
          isChecking: false,
          isAvailable: null,
          message: "",
        });
        return;
      }

      if (new Date(bookingForm.checkOut) <= new Date(bookingForm.checkIn)) {
        setAvailabilityState({
          isChecking: false,
          isAvailable: false,
          message: "Check-out date must be after check-in date.",
        });
        return;
      }

      setAvailabilityState({
        isChecking: true,
        isAvailable: null,
        message: "",
      });

      try {
        const response = await getPropertyAvailability(property.id, {
          checkIn: bookingForm.checkIn,
          checkOut: bookingForm.checkOut,
        });

        if (isCancelled) {
          return;
        }

        setAvailabilityState({
          isChecking: false,
          isAvailable: response.available,
          message: response.message,
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setAvailabilityState({
          isChecking: false,
          isAvailable: false,
          message:
            error instanceof Error
              ? error.message
              : "Unable to check availability right now.",
        });
      }
    }

    checkAvailability();

    return () => {
      isCancelled = true;
    };
  }, [bookingForm.checkIn, bookingForm.checkOut, property?.id]);

  useEffect(() => {
    if (!bookingForm.checkIn || !bookingForm.checkOut) {
      return;
    }

    const nextBlockedStartDate = getNextBlockedStartDate(
      unavailableRanges,
      bookingForm.checkIn,
    );
    const selectedCheckOutDate = parseLocalDate(bookingForm.checkOut);

    if (
      nextBlockedStartDate &&
      selectedCheckOutDate &&
      selectedCheckOutDate > nextBlockedStartDate
    ) {
      setBookingForm((currentForm) => ({
        ...currentForm,
        checkOut: formatLocalDate(nextBlockedStartDate),
      }));
    }
  }, [bookingForm.checkIn, bookingForm.checkOut, unavailableRanges]);

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: 36, height: 36, marginBottom: 16 }} viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          <p style={{ color: "#64748b" }}>Loading property details...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!property) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div>
          <div style={{ fontSize: "1rem", marginBottom: 16, color: "#64748b" }}>
            Listing unavailable
          </div>
          <h2 style={{ color: "#1e293b", fontWeight: 700 }}>Property not found</h2>
          <Link href="/listings"><button className="btn-primary-hs" style={{ marginTop: 16 }}>Back to Listings</button></Link>
        </div>
      </div>
    );
  }

  const allImages = Array.from(
    new Set(
      [property.image, ...(Array.isArray(property.images) ? property.images : [])].filter(
        Boolean,
      ),
    ),
  );
  const nights = (() => {
    if (!bookingForm.checkIn || !bookingForm.checkOut) return 0;
    const diff = new Date(bookingForm.checkOut).getTime() - new Date(bookingForm.checkIn).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  })();
  const subtotal = property.price * nights;
  const total = Number(subtotal.toFixed(2));
  const isBookingDisabled =
    isSubmittingBooking ||
    availabilityState.isChecking ||
    availabilityState.isAvailable === false;

  const propertyReviews = property.reviews || [];
  const avgRating = Number(property.rating) || 0;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const selectedCheckInDate = bookingForm.checkIn
    ? parseLocalDate(bookingForm.checkIn)
    : null;
  const selectedCheckOutDate = bookingForm.checkOut
    ? parseLocalDate(bookingForm.checkOut)
    : null;
  const blockedCheckInDates = buildBlockedCheckInDates(unavailableRanges);
  const checkoutMinDate = selectedCheckInDate
    ? addDays(selectedCheckInDate, 1)
    : addDays(today, 1);
  const checkoutMaxDate = bookingForm.checkIn
    ? getNextBlockedStartDate(unavailableRanges, bookingForm.checkIn)
    : null;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role !== "Guest") {
      setBookingError("Only guest accounts can create a booking.");
      return;
    }

    setIsSubmittingBooking(true);
    setBookingError("");
    setBookingMessage("");

    try {
      const response = await createBooking({
        propertyId: Number(property.id),
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        guests: Number(bookingForm.guests),
      });

      setCreatedBooking(response.data);
      setUnavailableRanges((currentRanges) => {
        const alreadyExists = currentRanges.some(
          (range) =>
            range.checkIn === response.data.checkIn &&
            range.checkOut === response.data.checkOut,
        );

        if (alreadyExists) {
          return currentRanges;
        }

        return [
          ...currentRanges,
          {
            checkIn: response.data.checkIn,
            checkOut: response.data.checkOut,
            status: response.data.status,
          },
        ];
      });
      setBookingMessage(response.message);
      setIsPaymentModalOpen(true);
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "Unable to create the booking request right now.",
      );
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleUploadPaymentProof = async (file: File) => {
    if (!createdBooking) {
      return;
    }

    setIsUploadingProof(true);
    setBookingError("");
    setBookingMessage("");

    try {
      const response = await uploadPaymentProof(createdBooking.id, file);
      setCreatedBooking(response.data);
      setBookingMessage(response.message);
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "Unable to upload the payment proof right now.",
      );
    } finally {
      setIsUploadingProof(false);
    }
  };

  // Rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: propertyReviews.filter((r: any) => r.rating === stars).length,
  }));

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem" }}>
            <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#2563EB", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0, fontWeight: 600 }}>
              <ArrowLeft size={14} /> Back
            </button>
            <span style={{ color: "#94a3b8" }}>/</span>
            <Link href="/listings" style={{ color: "#64748b", textDecoration: "none" }}>Listings</Link>
            <span style={{ color: "#94a3b8" }}>/</span>
            <span style={{ color: "#1e293b", fontWeight: 600 }}>{property.title}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 16px" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ background: "#eff6ff", color: "#2563EB", fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                  {property.type}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem" }}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <strong>{avgRating > 0 ? avgRating.toFixed(1) : "New"}</strong>
                  <span style={{ color: "#94a3b8" }}>({property.reviewCount || propertyReviews.length} reviews)</span>
                </span>
              </div>
              <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 800, color: "#1e293b", marginBottom: 6 }}>
                {property.title}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: "0.88rem" }}>
                <MapPin size={14} color="#2563EB" />
                {property.location}
              </div>
            </div>
            <button onClick={() => setLiked(!liked)} style={{
              background: liked ? "#fee2e2" : "#f1f5f9",
              border: "none", borderRadius: 10, padding: "10px",
              cursor: "pointer", transition: "all 0.2s"
            }}>
              <Heart size={20} color={liked ? "#dc2626" : "#94a3b8"} fill={liked ? "#dc2626" : "none"} />
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ position: "relative", marginBottom: 8 }}>
            <img src={allImages[activeImg]} alt={property.title} className="hs-gallery-main" />
            {allImages.length > 1 && (
              <>
                <button onClick={() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)}
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.4)", border: "none", borderRadius: 8, padding: "8px", cursor: "pointer", color: "#fff" }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setActiveImg(i => (i + 1) % allImages.length)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.4)", border: "none", borderRadius: 8, padding: "8px", cursor: "pointer", color: "#fff" }}>
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          <div className="row g-2">
            {allImages.map((img: string, i: number) => (
              <div key={i} className="col-4 col-md-3">
                <img src={img} alt="" className={`hs-gallery-thumb ${activeImg === i ? "active" : ""}`} onClick={() => setActiveImg(i)} />
              </div>
            ))}
          </div>
        </div>

        <div className="row g-4">
          {/* Left: Info */}
          <div className="col-lg-8">
            {/* Quick Info */}
            <div className="hs-card" style={{ padding: "20px 24px", marginBottom: 20 }}>
              <div className="row g-3">
                {[
                  { icon: <Users size={17} color="#2563EB" />, label: `Up to ${property.maxGuests} Guests` },
                  { icon: <Bed size={17} color="#2563EB" />, label: `${property.bedrooms} Bedrooms` },
                  { icon: <Bath size={17} color="#2563EB" />, label: `${property.bathrooms} Bathrooms` },
                  { icon: <Star size={17} color="#f59e0b" />, label: `${avgRating > 0 ? avgRating.toFixed(1) : "New"} Rating` },
                ].map((item, i) => (
                  <div key={i} className="col-6 col-md-3">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
                      {item.icon}
                      <span style={{ fontSize: "0.87rem", fontWeight: 600, color: "#1e293b" }}>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Host Info */}
            <div className="hs-card" style={{ padding: "18px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: "1rem" }}>
                  {property.hostName?.split(" ").map((w: string) => w[0]).join("")}
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#1e293b" }}>Hosted by {property.hostName}</div>
                <div style={{ color: "#64748b", fontSize: "0.83rem" }}>Superhost • Verified</div>
              </div>
            </div>

            {/* Description */}
            <div className="hs-card" style={{ padding: "20px 24px", marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 12, fontSize: "1.1rem" }}>About This Property</h2>
              <p style={{ color: "#475569", lineHeight: 1.75, fontSize: "0.92rem", margin: 0 }}>
                {property.description || "A beautiful property perfect for your next stay. Enjoy wonderful amenities and a great location."}
              </p>
            </div>

            {/* Amenities */}
            <div className="hs-card" style={{ padding: "20px 24px", marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 16, fontSize: "1.1rem" }}>Amenities</h2>
              <div className="row g-2">
                {property.amenities?.map((a: string, i: number) => (
                  <div key={i} className="col-6 col-md-4">
                    <div className="hs-amenity">
                      {amenityIcons[a] || <CheckCircle size={16} />}
                      {a}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== REVIEWS SECTION ===== */}
            <div className="hs-card" style={{ padding: "24px" }}>
              {/* Reviews Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontWeight: 700, color: "#1e293b", margin: 0, fontSize: "1.1rem", marginBottom: 4 }}>
                    Guest Reviews
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Star size={20} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1e293b" }}>
                        {avgRating > 0 ? avgRating.toFixed(1) : "New"}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#475569", fontSize: "0.85rem" }}>
                        {propertyReviews.length} total reviews
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Breakdown */}
                {propertyReviews.length > 0 && (
                  <div style={{ minWidth: 200 }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                      <TrendingUp size={11} /> Breakdown
                    </div>
                    {ratingBreakdown.map(({ stars, count }) => (
                      <div key={stars} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", width: 12, textAlign: "right" }}>{stars}</span>
                        <Star size={10} fill="#f59e0b" color="#f59e0b" />
                        <div style={{ flex: 1, height: 5, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{
                            height: "100%",
                            width: propertyReviews.length > 0 ? `${(count / propertyReviews.length) * 100}%` : "0%",
                            background: "#f59e0b", borderRadius: 99,
                            transition: "width 0.3s"
                          }} />
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8", width: 14 }}>{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Review List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {propertyReviews.length > 0 ? propertyReviews.map((review: any) => (
                  <div key={review.id} style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 14,
                    padding: "18px 20px",
                    transition: "box-shadow 0.2s",
                  }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: `hsl(${review.authorName.charCodeAt(0) * 37 % 360}, 60%, 55%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 800, fontSize: "1rem", flexShrink: 0
                      }}>
                        {review.authorName[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>{review.authorName}</div>
                            <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: 1 }}>
                              {new Date(review.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <StarDisplay rating={review.rating} size={13} />
                            <span style={{
                              background: "#fef3c7", color: "#92400e",
                              fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20
                            }}>
                              {review.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p style={{ color: "#475569", fontSize: "0.88rem", lineHeight: 1.7, margin: 0 }}>
                      {review.comment}
                    </p>
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 5, color: "#16a34a", fontSize: "0.75rem", fontWeight: 600 }}>
                      <CheckCircle size={11} /> Verified Stay
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: "center", padding: "32px 0 8px", color: "#94a3b8" }}>
                    <MessageSquare size={32} color="#e2e8f0" style={{ marginBottom: 8 }} />
                    <p style={{ margin: 0, fontSize: "0.87rem" }}>No reviews yet. Be the first to review this property!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Booking Form */}
          <div className="col-lg-4">
            <div style={{ position: "sticky", top: 80 }}>
              <div className="hs-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                  <div>
                    <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1e293b" }}>${property.price}</span>
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}> / night</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{avgRating > 0 ? avgRating.toFixed(1) : "New"}</span>
                    <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>({propertyReviews.length})</span>
                  </div>
                </div>

                {createdBooking ? (
                  <div style={{ marginTop: 16 }}>
                    <div
                      style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: 14,
                        padding: "14px 16px",
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#1d4ed8",
                          fontSize: "0.96rem",
                          marginBottom: 4,
                        }}
                      >
                        Booking request created
                      </div>
                      <p
                        style={{
                          margin: 0,
                          color: "#475569",
                          fontSize: "0.84rem",
                          lineHeight: 1.7,
                        }}
                      >
                        Complete the transfer, upload your payment proof, and wait
                        for the host or admin to confirm the booking.
                      </p>
                      <p
                        style={{
                          margin: "8px 0 0",
                          color: "#1d4ed8",
                          fontSize: "0.8rem",
                          lineHeight: 1.7,
                          fontWeight: 600,
                        }}
                      >
                        Standard check-in is after 2:00 PM and check-out is
                        before 12:00 PM.
                      </p>
                    </div>

                    <div style={{ display: "grid", gap: 10 }}>
                      <button
                        className="btn-primary-hs"
                        style={{ width: "100%" }}
                        onClick={() => setIsPaymentModalOpen(true)}
                      >
                        View payment instructions
                      </button>
                      <Link href="/dashboard" style={{ width: "100%" }}>
                        <button className="btn-outline-hs" style={{ width: "100%" }}>
                          Go to dashboard
                        </button>
                      </Link>
                    </div>

                    <button
                      className="btn-outline-hs"
                      style={{ width: "100%", marginTop: 16 }}
                      onClick={() => {
                        setCreatedBooking(null);
                        setIsPaymentModalOpen(false);
                        setBookingMessage("");
                        setBookingError("");
                      }}
                    >
                      Create another request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBooking} style={{ marginTop: 16 }}>
                    <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #e2e8f0" }}>
                        <div style={{ padding: "12px 14px", borderRight: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#1e293b", letterSpacing: 0.5, textTransform: "uppercase" }}>Check-in</div>
                          <DatePicker
                            selected={selectedCheckInDate}
                            onChange={(selectedDate: Date | null) => {
                              const nextCheckIn = selectedDate
                                ? formatLocalDate(selectedDate)
                                : "";

                              setBookingForm((currentForm) => {
                                const currentCheckOutDate = currentForm.checkOut
                                  ? parseLocalDate(currentForm.checkOut)
                                  : null;
                                const shouldResetCheckout =
                                  !selectedDate ||
                                  !currentCheckOutDate ||
                                  currentCheckOutDate <= selectedDate;

                                return {
                                  ...currentForm,
                                  checkIn: nextCheckIn,
                                  checkOut: shouldResetCheckout
                                    ? ""
                                    : currentForm.checkOut,
                                };
                              });
                            }}
                            minDate={today}
                            excludeDates={blockedCheckInDates}
                            placeholderText="dd/mm/yyyy"
                            dateFormat="dd/MM/yyyy"
                            className="hs-datepicker-input"
                            wrapperClassName="hs-datepicker-wrapper"
                            popperPlacement="bottom-start"
                            required
                          />
                        </div>
                        <div style={{ padding: "12px 14px" }}>
                          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#1e293b", letterSpacing: 0.5, textTransform: "uppercase" }}>Check-out</div>
                          <DatePicker
                            selected={selectedCheckOutDate}
                            onChange={(selectedDate: Date | null) =>
                              setBookingForm((currentForm) => ({
                                ...currentForm,
                                checkOut: selectedDate
                                  ? formatLocalDate(selectedDate)
                                  : "",
                              }))
                            }
                            minDate={checkoutMinDate}
                            maxDate={checkoutMaxDate || undefined}
                            placeholderText={
                              selectedCheckInDate
                                ? "dd/mm/yyyy"
                                : "Select check-in first"
                            }
                            dateFormat="dd/MM/yyyy"
                            className="hs-datepicker-input"
                            wrapperClassName="hs-datepicker-wrapper"
                            popperPlacement="bottom-end"
                            disabled={!selectedCheckInDate}
                            required
                          />
                        </div>
                      </div>
                      <div style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#1e293b", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Guests</div>
                        <select
                          style={{ border: "none", outline: "none", width: "100%", fontSize: "0.87rem", color: "#475569", padding: 0, background: "transparent" }}
                          value={bookingForm.guests}
                          onChange={e => setBookingForm({ ...bookingForm, guests: e.target.value })}
                        >
                          {Array.from({ length: property.maxGuests || 4 }, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary-hs"
                      style={{
                        width: "100%",
                        marginBottom: 12,
                        fontSize: "0.95rem",
                        opacity: isBookingDisabled ? 0.75 : 1,
                        cursor: isBookingDisabled ? "not-allowed" : "pointer",
                      }}
                      disabled={isBookingDisabled}
                    >
                      <Calendar size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                      {isSubmittingBooking
                        ? "Submitting request..."
                        : availabilityState.isChecking
                        ? "Checking availability..."
                        : availabilityState.isAvailable === false
                        ? "Dates unavailable"
                        : "Request booking"}
                    </button>

                    <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.78rem", margin: "0 0 14px" }}>
                      We will create a pending booking and show the transfer details next.
                    </p>

                    <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.78rem", margin: "0 0 14px" }}>
                      Busy dates are locked in the calendar so you can spot unavailable periods before submitting.
                    </p>

                    <p
                      style={{
                        textAlign: "center",
                        color: "#1d4ed8",
                        fontSize: "0.78rem",
                        margin: "0 0 14px",
                        fontWeight: 600,
                      }}
                    >
                      Standard check-in is after 2:00 PM and check-out is
                      before 12:00 PM.
                    </p>

                    {availabilityState.message && !bookingError && (
                      <div
                        style={{
                          background:
                            availabilityState.isAvailable === false
                              ? "#fef2f2"
                              : "#f0fdf4",
                          border: `1px solid ${
                            availabilityState.isAvailable === false
                              ? "#fecaca"
                              : "#bbf7d0"
                          }`,
                          borderRadius: 10,
                          padding: "10px 12px",
                          color:
                            availabilityState.isAvailable === false
                              ? "#b91c1c"
                              : "#166534",
                          fontSize: "0.82rem",
                          marginBottom: 14,
                        }}
                      >
                        {availabilityState.message}
                      </div>
                    )}

                    {bookingError && (
                      <div
                        style={{
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          borderRadius: 10,
                          padding: "10px 12px",
                          color: "#b91c1c",
                          fontSize: "0.82rem",
                          marginBottom: 14,
                        }}
                      >
                        {bookingError}
                      </div>
                    )}

                    {nights > 0 && (
                      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "#475569", marginBottom: 8 }}>
                          <span>{formatUsd(property.price)} × {nights} nights</span>
                          <span>{formatUsd(subtotal)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#1e293b", paddingTop: 10, borderTop: "1px solid #e2e8f0" }}>
                          <span>Total</span>
                          <span>{formatUsd(total)}</span>
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {createdBooking && isPaymentModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setIsPaymentModalOpen(false)}
        >
          <div
            style={{
              width: "min(980px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 22,
              padding: 20,
              boxShadow: "0 32px 60px rgba(15, 23, 42, 0.28)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    color: "#1e293b",
                    fontSize: "1.08rem",
                    marginBottom: 4,
                  }}
                >
                  Complete your transfer
                </div>
                <div style={{ color: "#64748b", fontSize: "0.84rem" }}>
                  The QR below is larger so it is easier to scan right after
                  your booking request is created.
                </div>
                <div
                  style={{
                    color: "#1d4ed8",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    marginTop: 6,
                  }}
                >
                  Standard check-in is after 2:00 PM and check-out is before
                  12:00 PM.
                </div>
              </div>
              <button
                className="btn-outline-hs"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                Close
              </button>
            </div>

            <PaymentInstructionsCard
              booking={createdBooking}
              onUpload={handleUploadPaymentProof}
              isUploading={isUploadingProof}
              uploadError={bookingError}
              uploadSuccess={bookingMessage}
              qrMaxWidth={280}
            />
          </div>
        </div>
      )}
    </div>
  );
}

