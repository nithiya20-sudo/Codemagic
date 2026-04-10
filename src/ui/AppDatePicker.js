import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography } from '../theme';

export default function AppDatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
  style,
  testID,
}) {
  const [open, setOpen] = useState(false);
  const displayText = value || '';

  const handleChange = (event, date) => {
    setOpen(false);
    if (date) onChange(date.toISOString().split('T')[0]);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.input, style]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        testID={testID}
      >
        <Text
          style={[
            styles.text,
            { color: displayText ? colors.text : colors.mutedText },
          ]}
          numberOfLines={1}
        >
          {displayText || placeholder}
        </Text>
      </TouchableOpacity>

      {open && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 44,
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  text: {
    fontFamily: typography.family.regular, // ✅ Poppins-Regular
    fontSize: 16,
    lineHeight: 22,
  },
});
