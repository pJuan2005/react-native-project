const express = require("express");
const booking = require("../controllers/booking.controller");
const chat = require("../controllers/chat.controller");
const { requireRoles } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireRoles("host"));

router.get("/", booking.getHostBookings);
router.get("/:id", booking.getHostBookingById);
router.get("/:id/chat", chat.getHostBookingConversation);
router.post("/:id/chat/messages", chat.createHostBookingMessage);
router.put("/:id/review", booking.reviewBookingByHost);

module.exports = router;
