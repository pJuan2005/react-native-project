import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Tự động lấy địa chỉ IP của máy tính đang chạy Expo Metro Server.
 * Giúp điện thoại thật, Android Emulator, iOS Simulator và Web đều kết nối chính xác và tức thì!
 */
const getDevServerIp = (): string => {
  if (Platform.OS === 'web') {
    return 'localhost';
  }

  // 1. Lấy tự động từ Expo Metro Host URI
  const hostUri =
    Constants.expoConfig?.hostUri ||
    // @ts-ignore
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    // @ts-ignore
    Constants.manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }

  // 2. Fallback IPv4 mạng LAN hiện tại của máy tính
  return '192.168.0.110';
};

export const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:3000'
    : `http://${getDevServerIp()}:3000`;

/**
 * Fetch wrapper với cơ chế Timeout (mặc định 4 giây).
 * Nếu Backend chưa bật hoặc không cùng mạng, hàm sẽ tự động ngắt sau 4s
 * thay vì bị đơ/treo 60 giây như fetch mặc định!
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs = 4000
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Yêu cầu hết thời gian chờ (Network Timeout)');
    }
    throw error;
  }
};

export default API_BASE_URL;
