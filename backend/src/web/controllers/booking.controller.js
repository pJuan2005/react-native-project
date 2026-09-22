const Booking = require("../models/booking.model");
const { buildPaymentInfo } = require("../common/paymentConfig");
const { savePaymentProof } = require("../common/bookingUpload");
const { removeManagedFile } = require("../common/propertyUpload");
const { calculateRevenueSplit } = require("../common/bookingFinance");
const PlatformSetting = require("../models/platform-setting.model");

function parseInteger(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.trunc(parsed);
}

function toDateOnly(value) {
  if (!value) {
    return null;
  }

  const normalized = new Date(`${value}T00:00:00`);
  if (Number.isNaN(normalized.getTime())) {
    return null;
  }

  return normalized;
}

function getNightCount(checkIn, checkOut) {
  const diff = checkOut.getTime() - checkIn.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDecision(value) {
  return String(value || "").trim().toLowerCase();
}

function serializeBooking(booking, platformSettings) {
  return {
    ...booking,
    paymentInfo: buildPaymentInfo(booking, platformSettings),
  };
}

function parseReviewPayload(body) {
  return {
    decision: normalizeDecision(body.decision),
    hostNote: String(body.hostNote || "").trim(),
    checkinInstructions: String(body.checkinInstructions || "").trim(),
    rejectionReason: String(body.rejectionReason || "").trim(),
  };
}

exports.createBooking = async (req, res) => {
  const guestId = Number(req.currentUser?.id);
  const propertyId = parseInteger(req.body.propertyId);
  const guests = parseInteger(req.body.guests);
  const checkIn = toDateOnly(req.body.checkIn);
  const checkOut = toDateOnly(req.body.checkOut);

  if (!propertyId) {
    return res.status(400).json({
      message: "A valid property is required.",
    });
  }

  if (!checkIn || !checkOut) {
    return res.status(400).json({
      message: "Check-in and check-out dates are required.",
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    return res.status(400).json({
      message: "Check-in date cannot be in the past.",
    });
  }

  const nights = getNightCount(checkIn, checkOut);
  if (nights <= 0) {
    return res.status(400).json({
      message: "Check-out date must be after check-in date.",
    });
  }

  try {
    const property = await Booking.getBookableProperty(propertyId);
    if (!property) {
      return res.status(404).json({
        message: "This property is not available for booking.",
      });
    }

    if (guests <= 0) {
      return res.status(400).json({
        message: "Please choose at least one guest.",
      });
    }

    if (guests > property.maxGuests) {
      return res.status(400).json({
        message: `This property accepts up to ${property.maxGuests} guests.`,
      });
    }

    const normalizedCheckIn = formatDateInput(checkIn);
    const normalizedCheckOut = formatDateInput(checkOut);

    const hasConflict = await Booking.hasDateConflict(
      propertyId,
      normalizedCheckIn,
      normalizedCheckOut,
    );

    if (hasConflict) {
      return res.status(409).json({
        message:
          "The selected dates are no longer available. Please choose another stay period.",
      });
    }

    const subtotal = property.pricePerNight * nights;
    const platformSettings = await PlatformSetting.getPlatformSettings();
    const commissionRate =
      platformSettings.onlineCommissionRate ??
      platformSettings.platformCommissionRate;
    const revenueSplit = calculateRevenueSplit(subtotal, commissionRate);

    const bookingId = await Booking.create({
      propertyId,
      guestId,
      guestNameSnapshot:
        req.currentUser?.full_name || req.currentUser?.fullName || null,
      guestPhoneSnapshot: req.currentUser?.phone || null,
      checkIn: normalizedCheckIn,
      checkOut: normalizedCheckOut,
      nights,
      guests,
      totalPrice: revenueSplit.grossRevenue,
      source: "guest_online",
      createdBy: guestId,
      paymentMethod: "bank_transfer",
      paymentStatus: "unpaid",
      commissionRateApplied: revenueSplit.platformCommissionRate,
      commissionAmount: revenueSplit.platformRevenue,
      hostPayoutAmount: revenueSplit.hostPayout,
    });

    const booking = await Booking.getGuestById(bookingId, guestId);

    return res.status(201).json({
      message:
        "Booking request created successfully. Please transfer the payment and upload your payment proof.",
      data: serializeBooking(booking, platformSettings),
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to create the booking request.",
    });
  }
};

exports.getGuestBookings = async (req, res) => {
  try {
    const bookings = await Booking.getByGuest(req.currentUser.id);
    const platformSettings = await PlatformSetting.getPlatformSettings();
    return res.json(
      bookings.map((booking) => serializeBooking(booking, platformSettings)),
    );
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load your bookings.",
    });
  }
};

exports.getGuestBookingById = async (req, res) => {
  try {
    const booking = await Booking.getGuestById(req.params.id, req.currentUser.id);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    const platformSettings = await PlatformSetting.getPlatformSettings();

    return res.json(serializeBooking(booking, platformSettings));
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load the booking details.",
    });
  }
};

exports.uploadPaymentProof = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Please upload a payment proof image.",
    });
  }

  try {
    const booking = await Booking.getGuestById(req.params.id, req.currentUser.id);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can receive a new payment proof.",
      });
    }

    const paymentProofImage = await savePaymentProof(req.file, booking.id);

    if (booking.paymentProofImage) {
      await removeManagedFile(booking.paymentProofImage);
    }

    await Booking.updatePaymentProof(booking.id, req.currentUser.id, paymentProofImage);
    const updatedBooking = await Booking.getGuestById(booking.id, req.currentUser.id);
    const platformSettings = await PlatformSetting.getPlatformSettings();

    return res.json({
      message:
        "Payment proof uploaded successfully. Your booking is now waiting for review.",
      data: serializeBooking(updatedBooking, platformSettings),
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to upload the payment proof.",
    });
  }
};

exports.cancelGuestBooking = async (req, res) => {
  try {
    const booking = await Booking.getGuestById(req.params.id, req.currentUser.id);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be cancelled.",
      });
    }

    await Booking.cancelByGuest(booking.id, req.currentUser.id);
    const updatedBooking = await Booking.getGuestById(booking.id, req.currentUser.id);
    const platformSettings = await PlatformSetting.getPlatformSettings();

    return res.json({
      message: "Booking cancelled successfully.",
      data: serializeBooking(updatedBooking, platformSettings),
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to cancel the booking.",
    });
  }
};

exports.getHostBookings = async (req, res) => {
  try {
    const bookings = await Booking.getByHost(req.currentUser.id);
    const platformSettings = await PlatformSetting.getPlatformSettings();
    return res.json(
      bookings.map((booking) => serializeBooking(booking, platformSettings)),
    );
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load the host booking list.",
    });
  }
};

exports.getHostBookingById = async (req, res) => {
  try {
    const booking = await Booking.getHostById(req.params.id, req.currentUser.id);
    if (!booking) {
      return res.status(404).json({
        message: "Host booking not found.",
      });
    }

    const platformSettings = await PlatformSetting.getPlatformSettings();

    return res.json(serializeBooking(booking, platformSettings));
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load the host booking details.",
    });
  }
};

exports.reviewBookingByHost = async (req, res) => {
  const payload = parseReviewPayload(req.body);

  if (!["approve", "reject"].includes(payload.decision)) {
    return res.status(400).json({
      message: "A valid review decision is required.",
    });
  }

  if (payload.decision === "reject" && !payload.rejectionReason) {
    return res.status(400).json({
      message: "Please provide a rejection reason before rejecting the booking.",
    });
  }

  try {
    const booking = await Booking.getHostById(req.params.id, req.currentUser.id);
    if (!booking) {
      return res.status(404).json({
        message: "Host booking not found.",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be reviewed.",
      });
    }

    if (booking.paymentStatus !== "proof_uploaded") {
      return res.status(400).json({
        message: "The guest has not uploaded a payment proof yet.",
      });
    }

    if (payload.decision === "approve") {
      await Booking.confirmByHost(booking.id, req.currentUser.id, req.currentUser.id, payload);
    } else {
      await Booking.rejectByHost(booking.id, req.currentUser.id, req.currentUser.id, payload);
    }

    const updatedBooking = await Booking.getHostById(booking.id, req.currentUser.id);
    const platformSettings = await PlatformSetting.getPlatformSettings();

    return res.json({
      message:
        payload.decision === "approve"
          ? "Booking confirmed successfully."
          : "Booking rejected successfully.",
      data: serializeBooking(updatedBooking, platformSettings),
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to review the booking.",
    });
  }
};

exports.getAdminBookings = async (_req, res) => {
  try {
    const bookings = await Booking.getAllAdmin();
    const platformSettings = await PlatformSetting.getPlatformSettings();
    return res.json(
      bookings.map((booking) => serializeBooking(booking, platformSettings)),
    );
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load the admin booking list.",
    });
  }
};

exports.getAdminBookingById = async (req, res) => {
  try {
    const booking = await Booking.getAdminById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    const platformSettings = await PlatformSetting.getPlatformSettings();

    return res.json(serializeBooking(booking, platformSettings));
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load the admin booking details.",
    });
  }
};

exports.reviewBookingByAdmin = async (req, res) => {
  const payload = parseReviewPayload(req.body);

  if (!["approve", "reject"].includes(payload.decision)) {
    return res.status(400).json({
      message: "A valid review decision is required.",
    });
  }

  if (payload.decision === "reject" && !payload.rejectionReason) {
    return res.status(400).json({
      message: "Please provide a rejection reason before rejecting the booking.",
    });
  }

  try {
    const booking = await Booking.getAdminById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be reviewed.",
      });
    }

    if (booking.paymentStatus !== "proof_uploaded") {
      return res.status(400).json({
        message: "The guest has not uploaded a payment proof yet.",
      });
    }

    if (payload.decision === "approve") {
      await Booking.confirmByAdmin(booking.id, req.currentUser.id, payload);
    } else {
      await Booking.rejectByAdmin(booking.id, req.currentUser.id, payload);
    }

    const updatedBooking = await Booking.getAdminById(booking.id);
    const platformSettings = await PlatformSetting.getPlatformSettings();

    return res.json({
      message:
        payload.decision === "approve"
          ? "Booking confirmed successfully."
          : "Booking rejected successfully.",
      data: serializeBooking(updatedBooking, platformSettings),
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to review the booking.",
    });
  }
};
