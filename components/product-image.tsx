import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, ImageResizeMode, ImageStyle, Platform, StyleProp, View, ViewStyle } from 'react-native';
import { API_BASE_URL } from '@/config/api';

const DEFAULT_HOMESTAY_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80';
const DEFAULT_AVATAR_IMAGE = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

const resolveImageUrl = (rawUri?: string | null, fallback: string = DEFAULT_HOMESTAY_IMAGE): string => {
  if (!rawUri || typeof rawUri !== 'string') return fallback;
  const trimmed = rawUri.trim();
  if (!trimmed) return fallback;

  // Trên Web, loại bỏ các URL file://, blob: hết hạn hoặc data: quá ngắn/hỏng
  if (Platform.OS === 'web') {
    if (trimmed.startsWith('file:')) return fallback;
    if (trimmed.startsWith('blob:') && !trimmed.includes('localhost')) return fallback;
    if (trimmed.startsWith('data:') && (trimmed.length < 100 || !trimmed.includes(';base64,'))) return fallback;
  }

  // Nếu là đường dẫn tương đối từ backend server (vd: /uploads/...)
  if (trimmed.startsWith('/')) {
    return `${API_BASE_URL}${trimmed}`;
  }

  return trimmed;
};

export function ProductImage({
  uri,
  style,
  containerStyle,
  resizeMode = 'cover',
  fallbackType = 'homestay',
}: {
  uri?: string | null;
  style: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  resizeMode?: ImageResizeMode;
  fallbackType?: 'homestay' | 'avatar';
}) {
  const [failed, setFailed] = useState(false);

  const fallback = fallbackType === 'avatar' ? DEFAULT_AVATAR_IMAGE : DEFAULT_HOMESTAY_IMAGE;
  const resolved = resolveImageUrl(uri, fallback);
  const safeUri = failed ? fallback : resolved;

  if (failed && !safeUri) {
    return (
      <View style={[containerStyle, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF' }]}>
        <Ionicons name={fallbackType === 'avatar' ? 'person-circle-outline' : 'image-outline'} size={26} color="#0284C7" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: safeUri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}


