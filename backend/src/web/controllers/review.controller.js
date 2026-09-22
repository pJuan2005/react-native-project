const Booking = require("../models/booking.model");
const Review = require("../models/review.model");

function hasCheckoutPassed(checkOutDate) {
  if (!checkOutDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const checkoutValue =
    checkOutDate instanceof Date
      ? formatLocalDate(checkOutDate)
      : String(checkOutDate).slice(0, 10);
  const checkout = new Date(`${checkoutValue}T00:00:00`);

  if (Number.isNaN(checkout.getTime())) {
    return false;
  }

  checkout.setHours(0, 0, 0, 0);

  return checkout < today;
}

exports.createReview = async (req, res) => {
  const bookingId = Number(req.body.bookingId);
  const rating = Number(req.body.rating);
  const comment = String(req.body.comment || "").trim();

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return res.status(400).json({
      message: "A valid booking is required.",
    });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      message: "Rating must be between 1 and 5.",
    });
  }

  if (comment.length < 10) {
    return res.status(400).json({
      message: "Review comment must be at least 10 characters long.",
    });
  }

  try {
    const booking = await Booking.getGuestById(bookingId, req.currentUser.id);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed bookings can be reviewed.",
      });
    }

    if (!hasCheckoutPassed(booking.checkOut)) {
      return res.status(400).json({
        message: "You can only review this property after checkout.",
      });
    }

    if (booking.reviewId) {
      return res.status(409).json({
        message: "You have already reviewed this booking.",
      });
    }

    const reviewId = await Review.create({
      bookingId: booking.id,
      propertyId: booking.propertyId,
      guestId: req.currentUser.id,
      rating,
      comment,
    });

    const review = await Review.findByBookingId(booking.id);

    return res.status(201).json({
      message: "Review submitted successfully.",
      data: {
        id: reviewId,
        bookingId: booking.id,
        propertyId: booking.propertyId,
        guestId: req.currentUser.id,
        authorName: review?.authorName || req.currentUser.full_name,
        rating,
        comment,
        date: review?.createdAt || new Date().toISOString(),
      },
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to submit the review.",
    });
  }
};
