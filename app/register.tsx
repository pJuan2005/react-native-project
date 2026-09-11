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

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);
    const result = await register(name.trim(), email.trim(), password);
    setLoading(false);

    if (result.success) {
      Alert.alert('Đăng ký thành công! 🎉', result.message, [
        {
          text: 'Vào ứng dụng',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } else {
      Alert.alert('Đăng ký thất bại', result.message);
    }
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
              <Ionicons name="water" size={40} color="#0284C7" />
            </View>
            <Text style={styles.brandTitle}>Tạo tài khoản</Text>
            <Text style={styles.brandSubtitle}>Đăng ký thành viên để nhận ngay 150 điểm thưởng</Text>
          </View>

          {/* Form Inputs */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputPill}>
              <Ionicons name="person" size={19} color="#0284C7" style={styles.icon} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Họ và tên"
                placeholderTextColor="#38BDF8"
                style={styles.input}
              />
            </View>

            {/* Email */}
            <View style={styles.inputPill}>
              <Ionicons name="mail" size={19} color="#0284C7" style={styles.icon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Địa chỉ Email"
                placeholderTextColor="#38BDF8"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {/* Password */}
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

            {/* Confirm Password */}
            <View style={styles.inputPill}>
              <Ionicons name="shield-checkmark" size={19} color="#0284C7" style={styles.icon} />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Xác nhận mật khẩu"
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

            {/* Register Button */}
            <Pressable
              style={[styles.mainBtn, loading && { opacity: 0.8 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.mainBtnText}>Đăng ký thành viên</Text>
              )}
            </Pressable>

            {/* Link back to Login */}
            <Pressable style={styles.switchBtn} onPress={() => router.replace('/login')}>
              <Text style={styles.switchText}>Đã có tài khoản? Đăng nhập</Text>
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
    paddingTop: 36,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoIconBox: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  formContainer: {
    gap: 14,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: '#0284C7',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
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
    height: 50,
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
    fontSize: 15,
    fontWeight: '700',
  },
  switchBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchText: {
    color: '#0284C7',
    fontSize: 14,
    fontWeight: '700',
  },
});
