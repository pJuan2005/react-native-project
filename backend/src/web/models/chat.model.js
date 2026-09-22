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

module.exports = Chat;
