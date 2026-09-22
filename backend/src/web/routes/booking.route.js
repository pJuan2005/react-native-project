const express = require("express");
const booking = require("../controllers/booking.controller");
const chat = require("../controllers/chat.controller");
const { requireRoles } = require("../middlewares/auth.middleware");
const uploadBooking = require("../middlewares/uploadBooking.middleware");

const router = express.Router();

router.use(requireRoles("guest"));

router.get("/", booking.getGuestBookings);
router.get("/:id", booking.getGuestBookingById);
router.get("/:id/chat", chat.getGuestBookingConversation);
router.post("/", booking.createBooking);
router.post("/:id/chat/messages", chat.createGuestBookingMessage);
router.put(
  "/:id/payment-proof",
  uploadBooking.single("paymentProof"),
  booking.uploadPaymentProof,
);
router.put("/:id/cancel", booking.cancelGuestBooking);

module.exports = router;
