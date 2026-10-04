import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, ImageResizeMode, ImageStyle, Platform, StyleProp, View, ViewStyle } from 'react-native';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80';

export function ProductImage({
  uri,
  style,
  containerStyle,
  resizeMode = 'cover',
}: {
  uri: string;
  style: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  resizeMode?: ImageResizeMode;
}) {
  const [failed, setFailed] = useState(false);

  // Trên Web, các URL file:// hoặc blob:// tạm thời bị trình duyệt báo lỗi net::ERR_FILE_NOT_FOUND khi tải lại trang
  const isInvalidUrlOnWeb =
    Platform.OS === 'web' &&
    typeof uri === 'string' &&
    (uri.startsWith('file:') || uri.startsWith('blob:'));
  const safeUri = isInvalidUrlOnWeb || !uri || failed ? DEFAULT_FALLBACK_IMAGE : uri;

  if (failed && !safeUri) {
    return (
      <View style={[containerStyle, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF' }]}>
        <Ionicons name="image-outline" size={26} color="#0284C7" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: safeUri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
}

