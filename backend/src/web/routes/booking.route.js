const express = require("express");
const booking = require("../controllers/booking.controller");
const chat = require("../controllers/chat.controller");
const { requireRoles } = require("../middlewares/auth.middleware");
const uploadBooking = require("../middlewares/uploadBooking.middleware");
const mobileBookingController = require("../../controllers/booking.controller");
const cancellationController = require("../../controllers/cancellation.controller");

const router = express.Router();

// 1. Mobile Route: GET /api/bookings/my-bookings
router.get("/my-bookings", mobileBookingController.getMyBookings);

// 2. Cancellation Preview & Execution (Chính sách hủy hoàn tiền chuẩn)
router.get("/:id/cancellation-preview", cancellationController.getCancellationPreview);
router.post("/:id/cancel", cancellationController.cancelBooking);
router.put("/:id/cancel", cancellationController.cancelBooking);

// 3. Authentication check for both Web guest and Mobile customer
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

module.exports = router;

