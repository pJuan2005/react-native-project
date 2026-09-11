import { Platform } from 'react-native';

// Bảng màu xanh ngọc / lá cây tự nhiên (Green / Emerald) theo phong cách ứng dụng cổ điển thân thiện
const tintColorLight = '#4EBA87';
const tintColorDark = '#52B788';

export const Colors = {
  light: {
    text: '#222222',
    background: '#FFFFFF',
    tint: tintColorLight,
    primary: '#4EBA87',
    primaryDark: '#2D6A4F',
    primaryLight: '#E8F5E9',
    border: '#52B788',
    icon: '#52B788',
    tabIconDefault: '#888888',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    primary: '#52B788',
    primaryDark: '#40916C',
    primaryLight: '#1B4332',
    border: '#52B788',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
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
