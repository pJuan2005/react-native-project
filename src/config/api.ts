import { Platform } from 'react-native';

// Khi chạy trên trình duyệt Web máy tính -> dùng localhost
// Khi chạy trên thiết bị thật / Expo Go -> dùng IP mạng LAN hiện tại
const DEV_MACHINE_IP = '192.168.88.199';

const API_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : `http://${DEV_MACHINE_IP}:3000`;

export default API_BASE_URL;
