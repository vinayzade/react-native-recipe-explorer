import { Platform, type ViewStyle } from 'react-native';

/**
 * Subtle elevation presets. iOS uses shadow* props, Android uses elevation.
 * Note: iOS shadows are clipped by `overflow: 'hidden'`, so clip an inner
 * image frame instead of the card itself.
 */
function makeShadow(
  elevation: number,
  opacity: number,
  radius: number,
  offsetY: number,
): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
    android: { elevation },
    default: {},
  }) as ViewStyle;
}

export const shadows = {
  none: {} as ViewStyle,
  /** Small floating controls */
  sm: makeShadow(2, 0.06, 4, 1),
  /** Floating buttons */
  md: makeShadow(4, 0.1, 8, 3),
  /** Tab bar, modals */
  lg: makeShadow(12, 0.12, 16, -2),
  /**
   * Grid cards. iOS gets a soft shadow; Android gets none on purpose:
   * elevation shadows show through a view while its opacity is animating,
   * which makes fading cards look muddy. On Android the card is separated
   * from the tinted screen background by its border instead.
   */
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOpacity: 0.07,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    default: {},
  }) as ViewStyle,
} as const;
