const Booking = require("../models/booking.model");
const Property = require("../models/property.model");
const PlatformSetting = require("../models/platform-setting.model");
const { buildPaymentInfo } = require("../common/paymentConfig");
const { calculateRevenueSplit } = require("../common/bookingFinance");

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

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getNightCount(checkIn, checkOut) {
  const diff = checkOut.getTime() - checkIn.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function buildQuickManageSummary(property, platformSettings, recentBookings, unavailableRanges) {
  return {
    property,
    unavailableRanges,
    recentBookings: recentBookings.map((booking) => ({
      ...booking,
      paymentInfo: buildPaymentInfo(booking, platformSettings),
    })),
    settings: {
      usdToVndRate: platformSettings.usdToVndRate,
      onlineCommissionRate:
        platformSettings.onlineCommissionRate ?? platformSettings.platformCommissionRate,
      directCommissionRate: platformSettings.directCommissionRate,
      directCommissionPercent: Number(
        ((platformSettings.directCommissionRate || 0) * 100).toFixed(2),
      ),
    },
  };
}

exports.getQuickManageProperty = async (req, res) => {
  try {
    const property = await Property.getQuickManageByToken(req.params.token);

    if (!property) {
      return res.status(404).json({
        message: "Quick manage link is invalid or has expired.",
      });
    }

    const [platformSettings, recentBookings, unavailableRanges] = await Promise.all([
      PlatformSetting.getPlatformSettings(),
      Booking.getByProperty(property.id),
      Property.getManagedUnavailableDateRanges(property.id),
    ]);

    return res.json(
      buildQuickManageSummary(
        property,
        platformSettings,
        recentBookings.slice(0, 8),
        unavailableRanges,
      ),
    );
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load the quick management view right now.",
    });
  }
};

exports.createDirectBooking = async (req, res) => {
  const guestName = String(req.body.guestName || "").trim();
  const guestPhone = String(req.body.guestPhone || "").trim();
  const paymentMethod = String(req.body.paymentMethod || "cash").trim().toLowerCase();
  const reservationStatus = String(req.body.reservationStatus || "confirmed")
    .trim()
    .toLowerCase();
  const guests = parseInteger(req.body.guests);
  const checkIn = toDateOnly(req.body.checkIn);
  const checkOut = toDateOnly(req.body.checkOut);

  if (!guestName) {
    return res.status(400).json({
      message: "Guest name is required for a direct booking.",
    });
  }

  if (!guestPhone) {
    return res.status(400).json({
      message: "Guest phone number is required for a direct booking.",
    });
  }

  if (!checkIn || !checkOut) {
    return res.status(400).json({
      message: "Check-in and check-out dates are required.",
    });
  }

  const nights = getNightCount(checkIn, checkOut);
  if (nights <= 0) {
    return res.status(400).json({
      message: "Check-out date must be after check-in date.",
    });
  }

  if (guests <= 0) {
    return res.status(400).json({
      message: "Please choose at least one guest.",
    });
  }

  if (!["cash", "bank_transfer"].includes(paymentMethod)) {
    return res.status(400).json({
      message: "Only cash or bank transfer is supported for direct bookings.",
    });
  }

  if (!["confirmed", "pending"].includes(reservationStatus)) {
    return res.status(400).json({
      message: "Reservation status must be pending or confirmed.",
    });
  }

  try {
    const property = await Property.getQuickManageByToken(req.params.token);

    if (!property) {
      return res.status(404).json({
        message: "Quick manage link is invalid or has expired.",
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
      property.id,
      normalizedCheckIn,
      normalizedCheckOut,
    );

    if (hasConflict) {
      return res.status(409).json({
        message:
          "These dates are already blocked by another booking. Please choose another stay period.",
      });
    }

    const platformSettings = await PlatformSetting.getPlatformSettings();
    const subtotal = Number((property.price * nights).toFixed(2));
    const revenueSplit = calculateRevenueSplit(
      subtotal,
      platformSettings.directCommissionRate,
    );

    const bookingId = await Booking.create({
      propertyId: property.id,
      guestId: null,
      guestNameSnapshot: guestName,
      guestPhoneSnapshot: guestPhone,
      checkIn: normalizedCheckIn,
      checkOut: normalizedCheckOut,
      nights,
      guests,
      totalPrice: revenueSplit.grossRevenue,
      status: reservationStatus,
      source: "host_direct",
      createdBy: property.hostId,
      paymentMethod,
      paymentStatus: reservationStatus === "confirmed" ? "verified" : "unpaid",
      commissionRateApplied: revenueSplit.platformCommissionRate,
      commissionAmount: revenueSplit.platformRevenue,
      hostPayoutAmount: revenueSplit.hostPayout,
    });

    const createdBooking = await Booking.getByProperty(property.id);
    const booking =
      createdBooking.find((item) => item.id === bookingId) || null;

    return res.status(201).json({
      message:
        reservationStatus === "confirmed"
          ? "Direct booking created and marked as confirmed."
          : "Direct booking created and the dates are now reserved.",
      data: booking
        ? {
            ...booking,
            paymentInfo: buildPaymentInfo(booking, platformSettings),
          }
        : null,
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to create the direct booking right now.",
    });
  }
};
