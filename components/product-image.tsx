import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, ImageStyle, Platform, StyleProp, View, ViewStyle } from 'react-native';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

export function ProductImage({
  uri,
  style,
  containerStyle,
}: {
  uri: string;
  style: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const [failed, setFailed] = useState(false);

  // Trên Web, các URL file:// từ thiết bị di động bị trình duyệt chặn vì bảo mật
  const isInvalidFileUrlOnWeb = Platform.OS === 'web' && typeof uri === 'string' && uri.startsWith('file:');
  const safeUri = isInvalidFileUrlOnWeb || !uri || failed ? DEFAULT_FALLBACK_IMAGE : uri;

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
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}
