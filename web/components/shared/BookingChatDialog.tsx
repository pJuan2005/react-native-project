"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Shield, UserRound } from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import type { BookingRecord } from "@/services/bookingService";
import {
  getBookingConversation,
  sendBookingMessage,
  type BookingChatScope,
  type BookingConversation,
} from "@/services/chatService";

interface BookingChatDialogProps {
  booking: BookingRecord | null;
  scope: BookingChatScope;
  title: string;
  onClose: () => void;
}

function formatChatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRoleAccent(role: string) {
  const normalizedRole = String(role || "").toLowerCase();

  if (normalizedRole === "admin") {
    return {
      color: "#7c3aed",
      background: "#f3e8ff",
      border: "#ddd6fe",
      label: "Admin",
    };
  }

  if (normalizedRole === "host") {
    return {
      color: "#2563EB",
      background: "#eff6ff",
      border: "#bfdbfe",
      label: "Host",
    };
  }

  return {
    color: "#16a34a",
    background: "#f0fdf4",
    border: "#bbf7d0",
    label: "Guest",
  };
}

export function BookingChatDialog({
  booking,
  scope,
  title,
  onClose,
}: BookingChatDialogProps) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<BookingConversation | null>(null);
  const [messageValue, setMessageValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pageError, setPageError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!booking) {
      setConversation(null);
      setMessageValue("");
      setPageError("");
      return undefined;
    }

    const bookingId = booking.id;
    let isActive = true;

    async function loadConversation() {
      setIsLoading(true);
      setPageError("");

      try {
        const data = await getBookingConversation(scope, bookingId);
        if (isActive) {
          setConversation(data);
        }
      } catch (error) {
        if (isActive) {
          setPageError(
            error instanceof Error
              ? error.message
              : "Unable to load the booking chat right now.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadConversation();
    const intervalId = window.setInterval(loadConversation, 8000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [booking, scope]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length]);

  async function handleSendMessage() {
    if (!booking) {
      return;
    }

    const content = messageValue.trim();
    if (!content) {
      return;
    }

    setIsSending(true);
    setPageError("");

    try {
      const response = await sendBookingMessage(scope, booking.id, content);
      setConversation(response.data);
      setMessageValue("");
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to send the message right now.",
      );
    } finally {
      setIsSending(false);
    }
  }

  if (!booking) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 920,
          maxHeight: "90vh",
          overflow: "hidden",
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 30px 80px rgba(15, 23, 42, 0.25)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "22px 24px 16px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <MessageCircle size={18} color="#2563EB" />
              <h3
                style={{
                  margin: 0,
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: "#1e293b",
                }}
              >
                {title}
              </h3>
            </div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
              Thread for booking <strong>{booking.bookingCode}</strong> · {booking.propertyTitle}
            </p>
          </div>
          <button className="btn-outline-hs" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="row g-0" style={{ minHeight: 0, flex: 1 }}>
          <div
            className="col-lg-4"
            style={{
              borderRight: "1px solid #e2e8f0",
              background: "#f8fafc",
              padding: 20,
            }}
          >
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <img
                src={booking.propertyImage}
                alt={booking.propertyTitle}
                style={{ width: "100%", height: 180, objectFit: "cover" }}
              />
              <div style={{ padding: 16 }}>
                <div
                  style={{
                    fontWeight: 800,
                    color: "#1e293b",
                    fontSize: "0.95rem",
                    marginBottom: 4,
                  }}
                >
                  {booking.propertyTitle}
                </div>
                <div style={{ color: "#64748b", fontSize: "0.82rem", marginBottom: 12 }}>
                  {booking.checkIn} to {booking.checkOut}
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    { name: conversation?.participants.guest.name || booking.guestName, role: "guest" },
                    { name: conversation?.participants.host.name || booking.hostName, role: "host" },
                    { name: "Admin support", role: "admin" },
                  ].map((participant) => {
                    const accent = getRoleAccent(participant.role);
                    return (
                      <div
                        key={`${participant.role}-${participant.name}`}
                        style={{
                          borderRadius: 12,
                          padding: "10px 12px",
                          border: `1px solid ${accent.border}`,
                          background: accent.background,
                          color: accent.color,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 4,
                            fontWeight: 700,
                            fontSize: "0.82rem",
                          }}
                        >
                          {participant.role === "admin" ? (
                            <Shield size={13} />
                          ) : (
                            <UserRound size={13} />
                          )}
                          {accent.label}
                        </div>
                        <div style={{ fontSize: "0.84rem", color: "#1e293b" }}>
                          {participant.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div
            className="col-lg-8"
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            {pageError && (
              <div
                style={{
                  margin: "18px 18px 0",
                  borderRadius: 12,
                  padding: "12px 14px",
                  border: "1px solid #fecaca",
                  background: "#fef2f2",
                  color: "#b91c1c",
                  fontSize: "0.84rem",
                }}
              >
                {pageError}
              </div>
            )}

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 18,
                background: "#ffffff",
              }}
            >
              {isLoading ? (
                <div style={{ color: "#94a3b8", fontSize: "0.84rem" }}>
                  Loading messages...
                </div>
              ) : conversation?.messages.length ? (
                conversation.messages.map((message) => {
                  const isOwnMessage = Number(message.senderId) === Number(user?.id);
                  const accent = getRoleAccent(message.senderRole);

                  return (
                    <div
                      key={message.id}
                      style={{
                        display: "flex",
                        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "78%",
                          borderRadius: 16,
                          padding: "12px 14px",
                          background: isOwnMessage ? "#2563EB" : "#f8fafc",
                          border: isOwnMessage ? "none" : "1px solid #e2e8f0",
                          color: isOwnMessage ? "#fff" : "#1e293b",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            marginBottom: 6,
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: "0.8rem" }}>
                            {message.senderName}
                          </div>
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: isOwnMessage ? "rgba(255,255,255,0.82)" : "#94a3b8",
                            }}
                          >
                            {formatChatTime(message.createdAt)}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: "0.84rem",
                            lineHeight: 1.65,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {message.message}
                        </div>
                        <div
                          style={{
                            marginTop: 8,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            borderRadius: 999,
                            padding: "3px 8px",
                            background: isOwnMessage
                              ? "rgba(255,255,255,0.14)"
                              : accent.background,
                            color: isOwnMessage ? "#fff" : accent.color,
                            border: isOwnMessage ? "none" : `1px solid ${accent.border}`,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                          }}
                        >
                          {accent.label}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    height: "100%",
                    minHeight: 260,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: "0.84rem",
                  }}
                >
                  No messages yet. Start the conversation for this booking.
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div
              style={{
                borderTop: "1px solid #e2e8f0",
                padding: 18,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <textarea
                  className="hs-form-control"
                  rows={3}
                  value={messageValue}
                  onChange={(event) => setMessageValue(event.target.value)}
                  placeholder="Write a message about check-in, support, or booking details..."
                  style={{ resize: "none" }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      if (!isSending) {
                        handleSendMessage();
                      }
                    }
                  }}
                />
                <button
                  className="btn-primary-hs"
                  type="button"
                  disabled={isSending || !messageValue.trim()}
                  onClick={handleSendMessage}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Send size={14} />
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
