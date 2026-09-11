import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
          {/* Logo Brand Header - Ocean Theme */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIconBox}>
              <Ionicons name="water" size={44} color="#0284C7" />
            </View>
            <Text style={styles.brandTitle}>Homestay Booking</Text>
            <Text style={styles.brandSubtitle}>Kỳ nghỉ biển & homestay sinh thái 2026</Text>
          </View>

          {/* Input Form */}
          <View style={styles.formContainer}>
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
          </View>
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
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoIconBox: {
    width: 86,
    height: 86,
    borderRadius: 26,
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
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
    shadowOpacity: 0.2,
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
