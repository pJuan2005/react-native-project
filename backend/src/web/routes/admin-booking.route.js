const express = require("express");
const booking = require("../controllers/booking.controller");
const chat = require("../controllers/chat.controller");
const { requireRoles } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireRoles("admin"));

router.get("/", booking.getAdminBookings);
router.get("/:id", booking.getAdminBookingById);
router.get("/:id/chat", chat.getAdminBookingConversation);
router.post("/:id/chat/messages", chat.createAdminBookingMessage);
router.put("/:id/review", booking.reviewBookingByAdmin);

module.exports = router;
