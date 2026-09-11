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

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Logo Brand Header */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIconBox}>
              <Ionicons name="home-outline" size={42} color="#1E3A8A" />
            </View>
            <Text style={styles.brandTitle}>Homestay Booking</Text>
          </View>

          {/* Input Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputPill}>
              <Ionicons name="mail" size={20} color="#4EBA87" style={styles.icon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#52B788"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              {email.length > 0 && (
                <Pressable onPress={() => setEmail('')} hitSlop={8}>
                  <Ionicons name="close-circle-outline" size={18} color="#88D49E" />
                </Pressable>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputPill}>
              <Ionicons name="lock-closed" size={20} color="#4EBA87" style={styles.icon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#52B788"
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#4EBA87"
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
                <Text style={styles.mainBtnText}>Login</Text>
              )}
            </Pressable>

            {/* Switch to Register link */}
            <Pressable style={styles.switchBtn} onPress={() => router.push('/register')}>
              <Text style={styles.switchText}>Register</Text>
            </Pressable>

            {/* Demo 1-Click Login Helper */}
            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>Tài khoản mẫu thử nghiệm (1-Click):</Text>
              <View style={styles.demoButtonsRow}>
                <Pressable
                  style={styles.demoChip}
                  onPress={() => fillDemoAccount('phamchuan2608@gmail.com', '123456')}
                >
                  <Ionicons name="person-outline" size={13} color="#2D6A4F" />
                  <Text style={styles.demoChipText}>Khách hàng (Chuẩn)</Text>
                </Pressable>

                <Pressable
                  style={styles.demoChip}
                  onPress={() => fillDemoAccount('admin@homestay.com', '123456')}
                >
                  <Ionicons name="shield-outline" size={13} color="#2D6A4F" />
                  <Text style={styles.demoChipText}>Admin Quản trị</Text>
                </Pressable>
              </View>
            </View>
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
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoIconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#D8F3DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E3A8A',
    letterSpacing: 0.5,
  },
  formContainer: {
    gap: 16,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: '#4EBA87',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#222222',
  },
  mainBtn: {
    marginTop: 8,
    height: 50,
    backgroundColor: '#4EBA87',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  switchBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchText: {
    color: '#4EBA87',
    fontSize: 15,
    fontWeight: '600',
  },
  demoBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#E8F5E9',
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#B7E4C7',
  },
  demoChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D6A4F',
  },
});
