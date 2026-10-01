"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { getMyBookingById, type BookingRecord } from "@/services/bookingService";
import { createReview } from "@/services/reviewService";

export default function CreateReviewPage() {
  const params = useParams<{ bookingId: string }>();
  const router = useRouter();
  const { user, isAuthenticated, isInitializing } = useAuth();

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isInitializing, isAuthenticated, router]);

  useEffect(() => {
    async function loadBooking() {
      setIsLoading(true);
      setError("");
      try {
        const data = await getMyBookingById(params.bookingId);
        setBooking(data);
      } catch (err: any) {
        setError(err?.message || "Không tìm thấy thông tin đơn đặt phòng.");
      } finally {
        setIsLoading(false);
      }
    }

    if (params.bookingId) {
      loadBooking();
    }
  }, [params.bookingId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!booking) return;
    if (!comment.trim()) {
      setError("Vui lòng nhập cảm nhận/đánh giá của bạn về chuyến đi.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await createReview({
        bookingId: booking.id,
        rating,
        comment: comment.trim(),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Lỗi khi gửi đánh giá.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-medium">
        Đang tải thông tin chuyến đi...
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-slate-50 min-h-screen py-16">
        <div className="container max-w-lg mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Cảm ơn đánh giá của bạn! 🎉</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Nhận xét chân thực của bạn sẽ giúp cộng đồng khách du lịch có thêm thông tin hữu ích và giúp chủ homestay hoàn thiện chất lượng dịch vụ hơn.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
              >
                Về Chuyến đi của tôi
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="container max-w-2xl mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft size={14} />
          <span>Quay lại Chuyến đi của tôi</span>
        </Link>

        {/* Review Card Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h1 className="text-xl font-extrabold text-slate-900 mb-1">
            Đánh giá trải nghiệm chuyến đi ⭐
          </h1>
          <p className="text-xs text-slate-500 mb-6">
            Chia sẻ cảm nhận của bạn sau khi lưu trú tại {booking?.propertyTitle}
          </p>

          {/* Booking Mini Summary */}
          {booking && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 mb-6">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 relative shrink-0">
                <Image
                  src={booking.propertyImage || "/img/banner-home.jpg"}
                  alt={booking.propertyTitle}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{booking.propertyTitle}</h3>
                <p className="text-xs text-slate-500">Mã đơn: {booking.bookingCode}</p>
                <p className="text-xs text-blue-600 font-semibold mt-0.5">
                  Lưu trú: {booking.checkIn} ➔ {booking.checkOut} ({booking.nights} đêm)
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Star Rating Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Mức độ hài lòng của bạn:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl focus:outline-none transition transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={isFilled ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-extrabold text-amber-600 ml-2">
                  {rating === 5 && "Tuyệt vời (5/5)"}
                  {rating === 4 && "Rất tốt (4/5)"}
                  {rating === 3 && "Bình thường (3/5)"}
                  {rating === 2 && "Chưa hài lòng (2/5)"}
                  {rating === 1 && "Rất thất vọng (1/5)"}
                </span>
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Nhận xét chi tiết về không gian, tiện ích & thái độ phục vụ:
              </label>
              <textarea
                rows={5}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="VD: Không gian homestay rất sạch sẽ, chủ nhà thân thiện và nhiệt tình hỗ trợ. View đồi núi buổi sáng rất chill..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={14} />
                <span>{isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
