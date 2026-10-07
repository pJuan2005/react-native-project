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
        message: "Không tìm thấy đơn đặt phòng hoặc bạn không có quyền truy cập.",
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
        message: "Không tìm thấy đơn đặt phòng hoặc bạn không có quyền truy cập.",
      },
    };
  }

  const message = normalizeMessage(body.message);
  if (!message) {
    return {
      status: 400,
      body: {
        message: "Nội dung tin nhắn không được để trống.",
      },
    };
  }

  if (message.length > 2000) {
    return {
      status: 400,
      body: {
        message: "Nội dung tin nhắn quá dài (tối đa 2000 ký tự).",
      },
    };
  }

  const conversation = await Chat.ensureConversationForBooking(booking.id);
  const createdMessage = await Chat.createMessage(conversation.id, userId, message);
  const messages = await Chat.getMessagesByConversation(conversation.id);

  return {
    status: 201,
    body: {
      message: "Gửi tin nhắn thành công.",
      data: {
        ...serializeConversation(conversation, booking, messages),
        latestMessage: createdMessage,
      },
    },
  };
}

exports.getGuestBookingConversation = async (req, res) => {
  try {
    const userId = req.currentUser?.id || req.user?.id || req.query?.userId || 4;
    const response = await getConversationResponse(
      req.params.id,
      loadGuestBooking,
      userId,
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
    const userId = req.currentUser?.id || req.user?.id || req.body?.userId || 4;
    const response = await createMessageResponse(
      req.params.id,
      loadGuestBooking,
      userId,
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
    const userId = req.currentUser?.id || req.user?.id || req.query?.userId || 2;
    const response = await getConversationResponse(
      req.params.id,
      loadHostBooking,
      userId,
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
    const userId = req.currentUser?.id || req.user?.id || req.body?.userId || 2;
    const response = await createMessageResponse(
      req.params.id,
      loadHostBooking,
      userId,
      req.body,
    );
    return res.status(response.status).json(response.body);
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to send the message right now.",
    });
  }
};

exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.currentUser?.id || req.user?.id || req.query?.userId || 4;
    const data = await Chat.getUserConversations(userId);
    return res.json({ success: true, data });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: "Không thể tải danh sách cuộc trò chuyện lúc này.",
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
