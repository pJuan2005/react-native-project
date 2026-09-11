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
              <Ionicons name="home-outline" size={42} color="#1E3A8A" />
            </View>
            <Text style={styles.brandTitle}>Homestay Booking</Text>
          </View>

          {/* Form Inputs */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputPill}>
              <Ionicons name="person" size={20} color="#4EBA87" style={styles.icon} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor="#52B788"
                style={styles.input}
              />
            </View>

            {/* Email */}
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
            </View>

            {/* Password */}
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

            {/* Confirm Password */}
            <View style={styles.inputPill}>
              <Ionicons name="lock-closed" size={20} color="#4EBA87" style={styles.icon} />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
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

            {/* Register Button */}
            <Pressable
              style={[styles.mainBtn, loading && { opacity: 0.8 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.mainBtnText}>Register</Text>
              )}
            </Pressable>

            {/* Link back to Login */}
            <Pressable style={styles.switchBtn} onPress={() => router.replace('/login')}>
              <Text style={styles.switchText}>Login</Text>
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
    paddingTop: 30,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
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
    gap: 15,
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
    marginTop: 10,
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
});
