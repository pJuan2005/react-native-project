const Booking = require("../models/booking.model");
const Chat = require("../models/chat.model");

function normalizeMessage(value) {
  return String(value || "").trim();
}

function serializeConversation(conversation, booking, messages) {
  return {
    id: conversation.id,
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
    propertyTitle: booking.propertyTitle,
    propertyImage: booking.propertyImage,
    status: booking.status,
    participants: {
      guest: {
        id: booking.guestId,
        name: booking.guestName,
      },
      host: {
        id: booking.hostId,
        name: booking.hostName,
      },
    },
    messages,
  };
}

async function loadGuestBooking(bookingId, userId) {
  return Booking.getGuestById(bookingId, userId);
}

async function loadHostBooking(bookingId, userId) {
  return Booking.getHostById(bookingId, userId);
}

async function loadAdminBooking(bookingId) {
  return Booking.getAdminById(bookingId);
}

async function getConversationResponse(bookingId, loadBooking, userId) {
  const booking = await loadBooking(bookingId, userId);
  if (!booking) {
    return {
      status: 404,
      body: {
        message: "Booking not found.",
      },
    };
  }

  if (booking.status !== "confirmed") {
    return {
      status: 400,
      body: {
        message: "Chat is available after the booking has been confirmed.",
      },
    };
  }

  const conversation = await Chat.ensureConversationForBooking(booking.id);
  const messages = await Chat.getMessagesByConversation(conversation.id);

  return {
    status: 200,
    body: serializeConversation(conversation, booking, messages),
  };
}

async function createMessageResponse(bookingId, loadBooking, userId, body) {
  const booking = await loadBooking(bookingId, userId);
  if (!booking) {
    return {
      status: 404,
      body: {
        message: "Booking not found.",
      },
    };
  }

  if (booking.status !== "confirmed") {
    return {
      status: 400,
      body: {
        message: "Chat is available after the booking has been confirmed.",
      },
    };
  }

  const message = normalizeMessage(body.message);
  if (!message) {
    return {
      status: 400,
      body: {
        message: "Message content cannot be empty.",
      },
    };
  }

  if (message.length > 2000) {
    return {
      status: 400,
      body: {
        message: "Message content is too long.",
      },
    };
  }

  const conversation = await Chat.ensureConversationForBooking(booking.id);
  const createdMessage = await Chat.createMessage(conversation.id, userId, message);
  const messages = await Chat.getMessagesByConversation(conversation.id);

  return {
    status: 201,
    body: {
      message: "Message sent successfully.",
      data: {
        ...serializeConversation(conversation, booking, messages),
        latestMessage: createdMessage,
      },
    },
  };
}

exports.getGuestBookingConversation = async (req, res) => {
  try {
    const response = await getConversationResponse(
      req.params.id,
      loadGuestBooking,
      req.currentUser.id,
    );
    return res.status(response.status).json(response.body);
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load the booking chat right now.",
    });
  }
};

exports.createGuestBookingMessage = async (req, res) => {
  try {
    const response = await createMessageResponse(
      req.params.id,
      loadGuestBooking,
      req.currentUser.id,
      req.body,
    );
    return res.status(response.status).json(response.body);
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to send the message right now.",
    });
  }
};

exports.getHostBookingConversation = async (req, res) => {
  try {
    const response = await getConversationResponse(
      req.params.id,
      loadHostBooking,
      req.currentUser.id,
    );
    return res.status(response.status).json(response.body);
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load the booking chat right now.",
    });
  }
};

exports.createHostBookingMessage = async (req, res) => {
  try {
    const response = await createMessageResponse(
      req.params.id,
      loadHostBooking,
      req.currentUser.id,
      req.body,
    );
    return res.status(response.status).json(response.body);
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to send the message right now.",
    });
  }
};

exports.getAdminBookingConversation = async (req, res) => {
  try {
    const response = await getConversationResponse(
      req.params.id,
      loadAdminBooking,
      req.currentUser.id,
    );
    return res.status(response.status).json(response.body);
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load the booking chat right now.",
    });
  }
};

exports.createAdminBookingMessage = async (req, res) => {
  try {
    const response = await createMessageResponse(
      req.params.id,
      loadAdminBooking,
      req.currentUser.id,
      req.body,
    );
    return res.status(response.status).json(response.body);
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to send the message right now.",
    });
  }
};
