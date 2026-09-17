import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Đăng nhập thất bại', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* PROFESSIONALLY DESIGNED VECTOR EMBLEM LOGO (Không dùng ảnh chụp thô) */}
          <Animated.View entering={FadeInDown.duration(700)} style={styles.logoContainer}>
            <View style={styles.emblemOuter}>
              <View style={styles.emblemInner}>
                <View style={styles.logoGraphicBox}>
                  {/* Sun / Nature element */}
                  <View style={styles.sunCircle}>
                    <Ionicons name="sunny" size={16} color="#F59E0B" />
                  </View>
                  {/* Homestay Villa Icon */}
                  <Ionicons name="business" size={38} color="#FFFFFF" />
                  {/* Ocean wave ripples */}
                  <View style={styles.waveBar}>
                    <Ionicons name="water" size={14} color="#E0F2FE" />
                    <View style={styles.waveDot} />
                    <Ionicons name="water" size={14} color="#E0F2FE" />
                  </View>
                </View>
              </View>
              {/* Floating Eco Leaf Badge */}
              <View style={styles.ecoBadge}>
                <Ionicons name="leaf" size={13} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.brandTitle}>Homestay Booking</Text>
            <Text style={styles.brandSubtitle}>Hệ sinh thái du lịch & nghỉ dưỡng xanh</Text>
          </Animated.View>

          {/* INPUT FORM WITH ENTRANCE ANIMATION */}
          <Animated.View entering={FadeInUp.delay(200).duration(700)} style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputPill}>
              <Ionicons name="mail" size={19} color="#0284C7" style={styles.icon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#38BDF8"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              {email.length > 0 && (
                <Pressable onPress={() => setEmail('')} hitSlop={8}>
                  <Ionicons name="close-circle-outline" size={18} color="#7DD3FC" />
                </Pressable>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputPill}>
              <Ionicons name="lock-closed" size={19} color="#0284C7" style={styles.icon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mật khẩu"
                placeholderTextColor="#38BDF8"
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={19}
                  color="#0284C7"
                />
              </Pressable>
            </View>

            {/* Main Action Button */}
            <Pressable
              style={[styles.mainBtn, loading && { opacity: 0.8 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.mainBtnText}>Đăng nhập</Text>
              )}
            </Pressable>

            {/* Switch to Register link */}
            <Pressable style={styles.switchBtn} onPress={() => router.push('/register')}>
              <Text style={styles.switchText}>Đăng ký tài khoản mới</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emblemOuter: {
    position: 'relative',
    width: 94,
    height: 94,
    borderRadius: 30,
    backgroundColor: '#E0F2FE',
    padding: 5,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    marginBottom: 14,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemInner: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGraphicBox: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sunCircle: {
    position: 'absolute',
    top: -6,
    right: -10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: -2,
  },
  waveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#BAE6FD',
  },
  ecoBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10B981',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
    letterSpacing: 0.2,
  },
  formContainer: {
    gap: 16,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: '#0284C7',
    borderRadius: 25,
    paddingHorizontal: 18,
    height: 52,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  mainBtn: {
    marginTop: 8,
    height: 52,
    backgroundColor: '#0284C7',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  mainBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  switchBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchText: {
    color: '#0284C7',
    fontSize: 14,
    fontWeight: '700',
  },
});
