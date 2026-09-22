import { apiRequest, buildAssetUrl } from "@/lib/apiClient";

export type BookingChatScope = "guest" | "host" | "admin";

export interface BookingChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

export interface BookingConversation {
  id: number;
  bookingId: number;
  bookingCode: string;
  propertyTitle: string;
  propertyImage: string;
  status: string;
  participants: {
    guest: {
      id: number;
      name: string;
    };
    host: {
      id: number;
      name: string;
    };
  };
  messages: BookingChatMessage[];
}

function getConversationPath(scope: BookingChatScope, bookingId: number) {
  if (scope === "host") {
    return `/api/host/bookings/${bookingId}/chat`;
  }

  if (scope === "admin") {
    return `/api/admin/bookings/${bookingId}/chat`;
  }

  return `/api/bookings/${bookingId}/chat`;
}

function getMessagePath(scope: BookingChatScope, bookingId: number) {
  if (scope === "host") {
    return `/api/host/bookings/${bookingId}/chat/messages`;
  }

  if (scope === "admin") {
    return `/api/admin/bookings/${bookingId}/chat/messages`;
  }

  return `/api/bookings/${bookingId}/chat/messages`;
}

function mapConversation(conversation: any): BookingConversation {
  return {
    id: Number(conversation.id),
    bookingId: Number(conversation.bookingId),
    bookingCode: String(conversation.bookingCode || ""),
    propertyTitle: String(conversation.propertyTitle || ""),
    propertyImage: buildAssetUrl(conversation.propertyImage || ""),
    status: String(conversation.status || ""),
    participants: {
      guest: {
        id: Number(conversation.participants?.guest?.id || 0),
        name: String(conversation.participants?.guest?.name || ""),
      },
      host: {
        id: Number(conversation.participants?.host?.id || 0),
        name: String(conversation.participants?.host?.name || ""),
      },
    },
    messages: Array.isArray(conversation.messages)
      ? conversation.messages.map((message: any) => ({
          id: Number(message.id),
          senderId: Number(message.senderId),
          senderName: String(message.senderName || ""),
          senderRole: String(message.senderRole || ""),
          message: String(message.message || ""),
          createdAt: String(message.createdAt || ""),
        }))
      : [],
  };
}

export async function getBookingConversation(
  scope: BookingChatScope,
  bookingId: number,
) {
  const response = await apiRequest<any>(getConversationPath(scope, bookingId));
  return mapConversation(response);
}

export async function sendBookingMessage(
  scope: BookingChatScope,
  bookingId: number,
  message: string,
) {
  const response = await apiRequest<{ message: string; data: any }>(
    getMessagePath(scope, bookingId),
    {
      method: "POST",
      body: JSON.stringify({ message }),
    },
  );

  return {
    ...response,
    data: mapConversation(response.data),
  };
}
