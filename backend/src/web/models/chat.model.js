const db = require("../common/db");

const Chat = {};

function mapMessageRow(row) {
  return {
    id: Number(row.id),
    senderId: Number(row.senderId),
    senderName: row.senderName,
    senderRole: row.senderRole,
    message: row.message,
    createdAt: row.createdAt,
  };
}

Chat.getConversationForBooking = async (bookingId) => {
  const [rows] = await db.promise().query(
    `SELECT id, booking_id AS bookingId, created_at AS createdAt
     FROM booking_conversations
     WHERE booking_id = ?
     LIMIT 1`,
    [bookingId],
  );

  return rows[0]
    ? {
        id: Number(rows[0].id),
        bookingId: Number(rows[0].bookingId),
        createdAt: rows[0].createdAt,
      }
    : null;
};

Chat.ensureConversationForBooking = async (bookingId) => {
  const existingConversation = await Chat.getConversationForBooking(bookingId);
  if (existingConversation) {
    return existingConversation;
  }

  await db.promise().query(
    `INSERT IGNORE INTO booking_conversations (booking_id)
     VALUES (?)`,
    [bookingId],
  );

  return Chat.getConversationForBooking(bookingId);
};

Chat.getMessagesByConversation = async (conversationId) => {
  const [rows] = await db.promise().query(
    `SELECT
      m.id,
      m.sender_id AS senderId,
      u.full_name AS senderName,
      u.role AS senderRole,
      m.message,
      m.created_at AS createdAt
     FROM booking_messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = ?
     ORDER BY m.created_at ASC, m.id ASC`,
    [conversationId],
  );

  return rows.map(mapMessageRow);
};

Chat.createMessage = async (conversationId, senderId, message) => {
  const [result] = await db.promise().query(
    `INSERT INTO booking_messages (conversation_id, sender_id, message)
     VALUES (?, ?, ?)`,
    [conversationId, senderId, message],
  );

  const [rows] = await db.promise().query(
    `SELECT
      m.id,
      m.sender_id AS senderId,
      u.full_name AS senderName,
      u.role AS senderRole,
      m.message,
      m.created_at AS createdAt
     FROM booking_messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.id = ?
     LIMIT 1`,
    [result.insertId],
  );

  return rows[0] ? mapMessageRow(rows[0]) : null;
};

Chat.getUserConversations = async (userId) => {
  const [rows] = await db.promise().query(
    `SELECT
      c.id,
      c.booking_id AS bookingId,
      c.created_at AS createdAt,
      b.booking_code AS bookingCode,
      p.name AS propertyTitle,
      p.cover_image AS propertyImage,
      b.status AS bookingStatus,
      host.id AS hostId,
      COALESCE(host.full_name, host.name) AS hostName,
      guest.id AS guestId,
      COALESCE(guest.full_name, guest.name, b.guest_name_snapshot) AS guestName,
      (SELECT message FROM booking_messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) AS lastMessage,
      (SELECT created_at FROM booking_messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) AS lastMessageAt
     FROM booking_conversations c
     JOIN bookings b ON b.id = c.booking_id
     JOIN properties p ON p.id = b.property_id
     LEFT JOIN users host ON host.id = p.host_id
     LEFT JOIN users guest ON guest.id = COALESCE(b.guest_id, b.user_id)
     WHERE b.user_id = ? OR b.guest_id = ? OR p.host_id = ?
     ORDER BY COALESCE(lastMessageAt, c.created_at) DESC`,
    [userId, userId, userId]
  );
  return rows.map((r) => ({
    id: Number(r.id),
    bookingId: Number(r.bookingId),
    bookingCode: r.bookingCode,
    propertyTitle: r.propertyTitle,
    propertyImage: r.propertyImage,
    bookingStatus: r.bookingStatus,
    host: { id: Number(r.hostId), name: r.hostName },
    guest: { id: Number(r.guestId), name: r.guestName },
    lastMessage: r.lastMessage || 'Chưa có tin nhắn',
    lastMessageAt: r.lastMessageAt || r.createdAt,
    createdAt: r.createdAt,
  }));
};

module.exports = Chat;
