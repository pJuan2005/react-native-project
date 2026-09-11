import { Platform } from 'react-native';

// Bảng màu Xanh Nước Biển Đại Dương (Ocean Blue) & Trắng Tinh Khiết (Mệnh Thủy)
const oceanBlue = '#0284C7';
const deepOceanBlue = '#0369A1';
const skyBlue = '#0EA5E9';
const softAqua = '#E0F2FE';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#FFFFFF',
    tint: oceanBlue,
    primary: oceanBlue,
    primaryDark: deepOceanBlue,
    primaryLight: softAqua,
    secondary: skyBlue,
    border: '#BAE6FD',
    icon: oceanBlue,
    tabIconDefault: '#94A3B8',
    tabIconSelected: oceanBlue,
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    tint: skyBlue,
    primary: skyBlue,
    primaryDark: oceanBlue,
    primaryLight: '#075985',
    secondary: '#38BDF8',
    border: '#0369A1',
    icon: skyBlue,
    tabIconDefault: '#64748B',
    tabIconSelected: skyBlue,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    mono: "monospace",
  },
});
