const express = require("express");
const booking = require("../controllers/booking.controller");
const chat = require("../controllers/chat.controller");
const { requireRoles } = require("../middlewares/auth.middleware");
const uploadBooking = require("../middlewares/uploadBooking.middleware");
const mobileBookingController = require("../../controllers/booking.controller");

const router = express.Router();

// 1. Mobile Route: GET /api/bookings/my-bookings
router.get("/my-bookings", mobileBookingController.getMyBookings);

// 2. Authentication check for both Web guest and Mobile customer
router.use(requireRoles("guest", "customer"));

router.get("/", booking.getGuestBookings);

router.get("/:id", (req, res, next) => {
  if (req.params.id === "my-bookings") {
    return mobileBookingController.getMyBookings(req, res, next);
  }
  return booking.getGuestBookingById(req, res, next);
});

router.get("/:id/chat", chat.getGuestBookingConversation);

router.post("/", (req, res, next) => {
  // Route to Mobile controller if request contains userId or homestayId
  if (req.body?.homestayId || req.body?.userId) {
    return mobileBookingController.createBooking(req, res, next);
  }
  return booking.createBooking(req, res, next);
});

router.post("/:id/chat/messages", chat.createGuestBookingMessage);

router.put(
  "/:id/payment-proof",
  uploadBooking.single("paymentProof"),
  booking.uploadPaymentProof,
);

router.post(
  "/:id/payment-proof",
  mobileBookingController.uploadPaymentProof,
);

router.put("/:id/cancel", (req, res, next) => {
  if (req.body?.userId || req.body?.reason) {
    return mobileBookingController.cancelBooking(req, res, next);
  }
  return booking.cancelGuestBooking(req, res, next);
});

router.post("/:id/cancel", mobileBookingController.cancelBooking);

module.exports = router;

