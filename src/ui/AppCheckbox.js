import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export default function AppCheckbox({
  label,
  value,
  onValueChange,
  disabled = false,
  style,
  labelStyle,
  testID,
}) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onValueChange(!value)}
      activeOpacity={0.7}
      disabled={disabled}
      style={[styles.container, style, disabled && styles.disabled]}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={typeof label === 'string' ? label : undefined}
      testID={testID}
    >
      <View style={[styles.box, value && styles.boxChecked, disabled && styles.boxDisabled]}>
        {value && <Text style={styles.tick}>✓</Text>}
      </View>

      {typeof label === 'string' ? (
        <Text style={[styles.label, labelStyle]} numberOfLines={2}>
          {label}
        </Text>
      ) : (
        label
      )}
    </TouchableOpacity>
  );
}

const BOX_SIZE = 22;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6, // better touch target without shifting layout
    marginBottom: spacing.md,
  },

  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 4,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.primary,
  },
  boxDisabled: {
    borderColor: colors.border,
    backgroundColor: '#f1f1f1',
  },

  tick: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'center',
    // (Keep as glyph; no need for Poppins here)
  },

  label: {
    fontFamily: typography.family.regular, // Poppins-Regular
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    flexShrink: 1,
  },

  disabled: {
    opacity: 0.6,
  },
});
