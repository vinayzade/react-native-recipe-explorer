import React, { useCallback, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { durations, useThemedStyles, type Theme } from '../theme';

interface FadeInImageProps {
  uri: string;
  /** Tried if `uri` fails to load (e.g. a thumbnail variant that does not exist). */
  fallbackUri?: string;
  /** Sizing / radius for the frame; the image always fills it with `cover`. */
  style?: StyleProp<ViewStyle>;
  /** Skip the placeholder colour, e.g. when layered over a low-res version. */
  transparent?: boolean;
  /** Omit for decorative images that a parent already describes. */
  accessibilityLabel?: string;
}

/**
 * Image that fades in over a placeholder once loaded, instead of popping in.
 */
export function FadeInImage({
  uri,
  fallbackUri,
  style,
  transparent = false,
  accessibilityLabel,
}: FadeInImageProps) {
  const styles = useThemedStyles(makeStyles);
  const opacity = useSharedValue(0);
  const [useFallback, setUseFallback] = useState(false);

  const imageStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const handleLoad = useCallback(() => {
    opacity.value = withTiming(1, { duration: durations.base });
  }, [opacity]);

  const handleError = useCallback(() => {
    if (fallbackUri) {
      setUseFallback(true);
    }
  }, [fallbackUri]);

  return (
    <View style={[styles.frame, !transparent && styles.placeholder, style]}>
      <Animated.Image
        source={{ uri: useFallback && fallbackUri ? fallbackUri : uri }}
        style={[StyleSheet.absoluteFill, imageStyle]}
        resizeMode="cover"
        onLoad={handleLoad}
        onError={handleError}
        fadeDuration={0} // Android's built-in fade would stack with ours
        accessible={Boolean(accessibilityLabel)}
        accessibilityRole={accessibilityLabel ? 'image' : undefined}
        accessibilityLabel={accessibilityLabel}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    frame: {
      overflow: 'hidden',
    },
    placeholder: {
      backgroundColor: colors.imagePlaceholder,
    },
  });
