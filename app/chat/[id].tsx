import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL, fetchWithTimeout } from '@/config/api';

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
  messageType?: 'text' | 'system' | 'image';
}

interface ConversationData {
  id: number;
  bookingId: number;
  bookingCode: string;
  propertyTitle: string;
  propertyImage: string;
  status: string;
  participants: {
    guest: { id: number; name: string };
    host: { id: number; name: string };
  };
  messages: Message[];
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark, colors } = useAppTheme();
  const { token, user } = useAuth();

  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const authHeaders = useMemo(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, [token]);

  const loadConversation = async () => {
    if (!id) return;
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/api/bookings/${id}/chat?userId=${user?.id || 4}`,
        { headers: authHeaders },
        4000
      );
      const json = await res.json();
      if (res.ok && json.id) {
        setConversation(json);
        setMessages(json.messages || []);
      }
    } catch (err) {
      console.warn('Load chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversation();
    const interval = setInterval(loadConversation, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setInputText('');
    setSending(true);

    // Optimistic UI update
    const tempId = Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      senderId: Number(user?.id || 4),
      senderName: user?.name || 'Tôi',
      senderRole: 'guest',
      message: text,
      createdAt: new Date().toISOString(),
      messageType: 'text',
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/api/bookings/${id}/chat/messages`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            userId: user?.id,
            message: text,
          }),
        },
        4000
      );
      const json = await res.json();
      if (json.data?.messages) {
        setMessages(json.data.messages);
      }
    } catch (err) {
      console.warn('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderColor: colors.cardBorder }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.text }]}>
            {conversation?.propertyTitle || 'Hội thoại đặt phòng'}
          </Text>
          <Text style={styles.headerSub}>
            Chủ nhà: {conversation?.participants?.host?.name || 'Chủ chỗ nghỉ'} • Mã: {conversation?.bookingCode || id}
          </Text>
        </View>
        <Pressable onPress={loadConversation} style={styles.refreshBtn} hitSlop={8}>
          <Ionicons name="reload" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 8, fontSize: 12, color: colors.textSecondary }}>Đang nạp tin nhắn...</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Security Guarantee Notice */}
            <View style={[styles.securityNoticeBox, { backgroundColor: isDark ? '#1C2541' : '#F0F9FF', borderColor: colors.cardBorder }]}>
              <Ionicons name="shield-checkmark" size={14} color="#0284C7" />
              <Text style={[styles.securityNoticeText, { color: isDark ? '#BAE6FD' : '#0369A1' }]}>
                Kênh liên lạc chính thức giữa bạn và Chủ homestay. Không chia sẻ mã OTP hoặc mật khẩu thẻ ngân hàng.
              </Text>
            </View>

            {messages.map((msg) => {
              const isMe = String(msg.senderId) === String(user?.id || '4') || msg.senderRole === 'guest';
              const isSystem = msg.messageType === 'system' || msg.senderRole === 'system' || msg.senderId === 1;

              if (isSystem) {
                return (
                  <View key={msg.id} style={styles.systemMsgContainer}>
                    <View style={[styles.systemMsgBox, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                      <Ionicons name="notifications" size={13} color="#0284C7" />
                      <Text style={[styles.systemMsgText, isDark && { color: '#E2E8F0' }]}>{msg.message}</Text>
                    </View>
                    <Text style={styles.systemMsgTime}>{new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                );
              }

              return (
                <View
                  key={msg.id}
                  style={[
                    styles.msgRow,
                    isMe ? styles.msgRowRight : styles.msgRowLeft,
                  ]}
                >
                  {!isMe && (
                    <View style={styles.hostAvatarSmall}>
                      <Ionicons name="person" size={14} color="#0284C7" />
                    </View>
                  )}
                  <View style={{ maxWidth: '78%' }}>
                    {!isMe && (
                      <Text style={styles.senderLabel}>{msg.senderName} (Chủ nhà)</Text>
                    )}
                    <View
                      style={[
                        styles.bubble,
                        isMe
                          ? [styles.bubbleMe, { backgroundColor: colors.primary }]
                          : [styles.bubbleOther, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }],
                      ]}
                    >
                      <Text
                        style={[
                          styles.bubbleText,
                          isMe ? styles.bubbleTextMe : [styles.bubbleTextOther, { color: colors.text }],
                        ]}
                      >
                        {msg.message}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.msgTime,
                        isMe ? { textAlign: 'right' } : { textAlign: 'left' },
                      ]}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.headerBg, borderColor: colors.cardBorder }]}>
          <TextInput
            style={[styles.chatInput, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder, color: colors.text }]}
            placeholder="Nhập tin nhắn cho chủ nhà..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <Pressable
            style={[
              styles.sendBtn,
              { backgroundColor: colors.primary },
              (!inputText.trim() || sending) && { opacity: 0.5 },
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={16} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, marginRight: 8 },
  refreshBtn: { padding: 4, marginLeft: 8 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 14, fontWeight: '800' },
  headerSub: { fontSize: 10, color: '#64748B', marginTop: 1 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messagesContainer: { padding: 14, paddingBottom: 20 },
  securityNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  securityNoticeText: { fontSize: 10, flex: 1, fontWeight: '500' },
  systemMsgContainer: { alignItems: 'center', marginVertical: 8 },
  systemMsgBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: '90%',
  },
  systemMsgText: { fontSize: 11, color: '#475569', fontWeight: '500', textAlign: 'center' },
  systemMsgTime: { fontSize: 9, color: '#94A3B8', marginTop: 3 },
  msgRow: { flexDirection: 'row', marginVertical: 4, alignItems: 'flex-end', gap: 6 },
  msgRowRight: { justifyContent: 'flex-end' },
  msgRowLeft: { justifyContent: 'flex-start' },
  hostAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  senderLabel: { fontSize: 10, color: '#64748B', marginBottom: 2, marginLeft: 4 },
  bubble: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  bubbleMe: { borderBottomRightRadius: 2 },
  bubbleOther: { borderBottomLeftRadius: 2, borderWidth: 1 },
  bubbleText: { fontSize: 13, lineHeight: 18 },
  bubbleTextMe: { color: '#FFFFFF', fontWeight: '500' },
  bubbleTextOther: { fontWeight: '500' },
  msgTime: { fontSize: 9, color: '#94A3B8', marginTop: 2, marginHorizontal: 4 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  chatInput: {
    flex: 1,
    maxHeight: 90,
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
