import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';

// Kích thước chuẩn thiết kế Mobile (Base Prototype: 375 x 812 dp)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Co giãn theo chiều ngang (Width-based scale)
 */
export const scale = (size: number): number => {
  const currentWidth = Dimensions.get('window').width;
  return (currentWidth / BASE_WIDTH) * size;
};

/**
 * Co giãn theo chiều dọc (Height-based scale)
 */
export const verticalScale = (size: number): number => {
  const currentHeight = Dimensions.get('window').height;
  return (currentHeight / BASE_HEIGHT) * size;
};

/**
 * Co giãn thông minh có kiểm soát (Moderate scale)
 * Rất phù hợp cho fontSize, icon size, padding, border radius
 * Tránh trường hợp chữ quá nhỏ trên máy 360px hoặc quá to trên máy 430px+
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  const currentWidth = Dimensions.get('window').width;
  return size + ((currentWidth / BASE_WIDTH) * size - size) * factor;
};

/**
 * Tính phần trăm chiều rộng màn hình (0 - 100%)
 */
export const wp = (percent: number): number => {
  const currentWidth = Dimensions.get('window').width;
  return (currentWidth * percent) / 100;
};

/**
 * Tính phần trăm chiều cao màn hình (0 - 100%)
 */
export const hp = (percent: number): number => {
  const currentHeight = Dimensions.get('window').height;
  return (currentHeight * percent) / 100;
};

/**
 * React Hook responsive thời gian thực (hỗ trợ xoay màn hình và đa kích cỡ)
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isSmallDevice = width < 375; // iPhone SE, Android 360dp
  const isMediumDevice = width >= 375 && width < 414; // iPhone 12/13/14/15 thường
  const isLargeDevice = width >= 414; // iPhone 8 Plus, 14/15/16 Pro Max
  const isTablet = width >= 600;

  // Tính chiều rộng tối ưu cho thẻ 2 cột
  const getGridCardWidth = (paddingHorizontal: number = 16, gap: number = 10) => {
    return (width - paddingHorizontal * 2 - gap) / 2;
  };

  // Tính chiều rộng tối ưu cho Modal
  const getModalWidth = (maxWidth: number = 400, marginHorizontal: number = 16) => {
    return Math.min(width - marginHorizontal * 2, maxWidth);
  };

  return {
    width,
    height,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    isTablet,
    wp: (percent: number) => (width * percent) / 100,
    hp: (percent: number) => (height * percent) / 100,
    scale: (size: number) => (width / BASE_WIDTH) * size,
    verticalScale: (size: number) => (height / BASE_HEIGHT) * size,
    moderateScale: (size: number, factor: number = 0.5) =>
      size + ((width / BASE_WIDTH) * size - size) * factor,
    getGridCardWidth,
    getModalWidth,
  };
}
