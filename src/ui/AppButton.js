// src/ui/AppButton.js
import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, typography } from '../theme';

const BASE_W = 375;

export default function AppButton({
  title,
  onPress,
  style,
  textStyle,
  icon,
  iconPosition = 'left',       // 'left' | 'right' | 'top'
  iconSize,
  iconColor,
  variant = 'primary',         // 'primary' | 'outline' | 'link'
  loading = false,
  disabled = false,
  size = 'md',                 // 'xs' | 'sm' | 'md' | 'lg'
  hitSlop = { top: 6, bottom: 6, left: 6, right: 6 },
  accessibilityLabel,
}) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.85, Math.min(1.25, width / BASE_W));

  // 🔥 Added XS size
  const sizes = {
    xs: { padV: 6 * scale, padH: 6 * scale, minH: 32 * scale, fs: 12 * scale, lh: 16 * scale, icon: 16 * scale, gap: 4 * scale, radius: 8 * scale },
    sm: { padV: 8 * scale, padH: 10 * scale, minH: 38 * scale, fs: 13 * scale, lh: 18 * scale, icon: 22 * scale, gap: 6 * scale, radius: 10 * scale },
    md: { padV: 12 * scale, padH: 14 * scale, minH: 44 * scale, fs: 15 * scale, lh: 20 * scale, icon: 26 * scale, gap: 6 * scale, radius: 12 * scale },
    lg: { padV: 14 * scale, padH: 16 * scale, minH: 48 * scale, fs: 17 * scale, lh: 22 * scale, icon: 28 * scale, gap: 8 * scale, radius: 14 * scale },
  };

  const S = sizes[size] || sizes.md;

  const isLink = variant === 'link';
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  // Colors
  const bgColor = isLink ? 'transparent' :
    (isPrimary ? colors.primary : colors.surface);

  const bdColor = isOutline ? colors.primary : 'transparent';

  const effectiveTextColor =
    textStyle?.color ??
    (isPrimary ? '#fff' : colors.primary);

  const effectiveIconColor =
    iconColor ??
    (isPrimary ? '#fff' : colors.primary);

  const displayTitle =
    typeof title === 'string' ? title.replace(/\\n/g, '\n') : title;

  const contentDirection = icon && iconPosition === 'top' ? 'column' : 'row';

  // Link variant trims padding/height
  const padV = isLink ? 0 : S.padV;
  const padH = isLink ? 0 : S.padH;
  const minH = isLink ? undefined : S.minH;

  const activeOpacity = isLink ? 0.6 : 0.8;
  const gap = isLink ? Math.max(4, S.gap - 2) : S.gap;
  const linkFontScale = isLink ? 0.95 : 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={activeOpacity}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ||
        (typeof title === 'string' ? title.replace(/\\n/g, ' ') : undefined)
      }
      style={[
        {
          backgroundColor: bgColor,
          borderRadius: isLink ? 0 : S.radius,
          paddingVertical: padV,
          paddingHorizontal: padH,
          minHeight: minH,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: contentDirection,
          borderWidth: isLink ? 0 : (isOutline ? 1 : 0),
          borderColor: bdColor,

          // 🔥 Leave width fully controlled by parent (grid)
          width: undefined,
          alignSelf: 'auto',
        },
        style,
        disabled ? { opacity: 0.6 } : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={effectiveTextColor} />
      ) : (
        <View
          style={{
            flexDirection: contentDirection,
            alignItems: 'center',
            justifyContent: 'center',
            gap,
            maxWidth: '100%',
          }}
        >

          {icon && iconPosition !== 'right' && (
            <MaterialIcons name={icon} size={iconSize || S.icon} color={effectiveIconColor} />
          )}

          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={[
              {
                color: effectiveTextColor,
                fontFamily: typography.family.italic,
                textAlign: 'center',
                includeFontPadding: false,
                fontSize: S.fs * linkFontScale,
                lineHeight: S.lh * linkFontScale,
                fontWeight:'600'
              },
              textStyle,
            ]}
          >
            {displayTitle}
          </Text>

          {icon && iconPosition === 'right' && (
            <MaterialIcons name={icon} size={iconSize || S.icon} color={effectiveIconColor} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
