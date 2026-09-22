import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomerProfile, mockUser } from '@/constants/mockData';
import { API_BASE_URL, fetchWithTimeout } from '@/config/api';

type AuthContextValue = {
  user: CustomerProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (data: Partial<CustomerProfile>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = '@homestay_auth_user_v1';
const AUTH_TOKEN_KEY = '@homestay_auth_token_v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial auth state from persistent AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        const savedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (savedUser && savedToken) {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        }
      } catch (e) {
        console.warn('Error reading auth from AsyncStorage:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
        4000
      );
      const json = await res.json();

      if (json.success && json.data) {
        const loggedInUser: CustomerProfile = {
          id: json.data.user.id,
          name: json.data.user.name,
          email: json.data.user.email,
          phone: json.data.user.phone || '',
          address: json.data.user.address || '',
          birthDate: json.data.user.birthDate || '',
          avatar: json.data.user.avatar || mockUser.avatar,
        };
        const authToken = json.data.token;

        setUser(loggedInUser);
        setToken(authToken);

        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, authToken);

        return { success: true, message: json.message };
      } else {
        return { success: false, message: json.message || 'Đăng nhập không thành công' };
      }
    } catch (error: any) {
      // Offline Demo Fallback
      if (
        (email.toLowerCase() === 'phamchuan2608@gmail.com' || email.toLowerCase() === 'admin@homestay.com') &&
        (password === '123456' || password === 'password123')
      ) {
        const loggedInUser = mockUser;
        const authToken = `token_offline_${Date.now()}`;
        setUser(loggedInUser);
        setToken(authToken);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, authToken);
        return { success: true, message: 'Đăng nhập thành công' };
      }
      return { success: false, message: 'Không thể kết nối máy chủ backend. Vui lòng kiểm tra kết nối mạng' };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone }),
        },
        4000
      );
      const json = await res.json();

      if (json.success && json.data) {
        const newUser: CustomerProfile = {
          id: json.data.user.id,
          name: json.data.user.name,
          email: json.data.user.email,
          phone: json.data.user.phone || '',
          address: json.data.user.address || '',
          birthDate: '',
          avatar: json.data.user.avatar || mockUser.avatar,
        };
        const authToken = json.data.token;

        setUser(newUser);
        setToken(authToken);

        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, authToken);

        return { success: true, message: json.message };
      } else {
        return { success: false, message: json.message || 'Đăng ký không thành công' };
      }
    } catch (error) {
      // Fallback
      const newUser: CustomerProfile = {
        id: String(Date.now()),
        name,
        email,
        phone: phone || '',
        address: '',
        birthDate: '',
        avatar: mockUser.avatar,
      };
      const authToken = `token_offline_${Date.now()}`;
      setUser(newUser);
      setToken(authToken);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, authToken);
      return { success: true, message: 'Đăng ký tài khoản thành công! Tặng bạn 150 điểm thưởng.' };
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (e) {
      console.warn('Error during logout AsyncStorage removal:', e);
    }
  };

  const updateUser = async (data: Partial<CustomerProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated)).catch((e) =>
        console.warn('Error saving updated user to AsyncStorage:', e)
      );
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
