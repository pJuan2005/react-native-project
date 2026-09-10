import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native';

export function ProductImage({ uri, style, containerStyle }: { uri: string; style: StyleProp<ImageStyle>; containerStyle?: StyleProp<ViewStyle> }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <View style={[containerStyle, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF' }]}><Ionicons name="image-outline" size={30} color="#2563EB" /></View>;
  return <Image source={{ uri }} style={style} resizeMode="cover" onError={() => setFailed(true)} />;
}
