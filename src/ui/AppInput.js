// import React, { forwardRef } from 'react';
// import { TextInput, StyleSheet } from 'react-native';
// import { colors, spacing, typography } from '../theme';

// const AppInput = forwardRef(function AppInput(
//   {
//     value,
//     onChangeText,
//     placeholder,
//     secureTextEntry = false,
//     editable = true,
//     keyboardType = 'default',
//     multiline = false,           // ⭐ NEW (default false – safe)
//     numberOfLines = 1,           // ⭐ NEW (default 1 – safe)
//     style,
//     ...rest
//   },
//   ref
// ) {
//   return (
//     <TextInput
//       ref={ref}
//       value={value}
//       onChangeText={onChangeText}
//       placeholder={placeholder}
//       placeholderTextColor={colors.mutedText}
//       style={[
//         styles.input,
//         multiline && styles.multilineInput,     // ⭐ NEW (multiline style)
//         !editable && styles.readOnly,
//         style
//       ]}
//       secureTextEntry={secureTextEntry}
//       editable={editable}
//       keyboardType={keyboardType}
//       multiline={multiline}                     // ⭐ NEW
//       numberOfLines={numberOfLines}             // ⭐ NEW
//       underlineColorAndroid="transparent"
//       selectionColor={colors.primary}
//       autoCapitalize={secureTextEntry ? 'none' : 'sentences'}
//       autoCorrect={!secureTextEntry}
//       blurOnSubmit={false}
//       autoComplete="off"
//       {...rest}
//     />
//   );
// });

// export default React.memo(AppInput);

// const styles = StyleSheet.create({
//   input: {
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderRadius: 8,
//     paddingHorizontal: spacing.md,
//     height: 44,                                // ❗ default height untouched
//     color: colors.text,
//     backgroundColor: colors.surface,
//     fontFamily: typography.family.regular,
//     fontSize: 16,
//     lineHeight: 22,
//     includeFontPadding: false,
//     textAlignVertical: 'center',
//   },

//   // ⭐ NEW STYLE — activated ONLY when multiline=true
//   multilineInput: {
//     height: undefined,               // allow auto-expand
//     minHeight: 90,                   // good default for 3–4 lines
//     paddingTop: spacing.sm,
//     paddingBottom: spacing.sm,
//     textAlignVertical: 'top',        // important for multiline
//   },

//   readOnly: {
//     opacity: 0.9,
//   },
// });
import React, { forwardRef } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

const AppInput = forwardRef(function AppInput(
  {
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    editable = true,
    keyboardType = 'default',
    multiline = false,
    numberOfLines = 1,
    variant = 'default',        // ⭐ NEW — "default" | "amount"
    style,
    ...rest
  },
  ref
) {
  const isAmount = variant === 'amount';

  // Right-aligned fields should default to numeric unless user overrides
  const effectiveKeyboardType =
    isAmount && keyboardType === 'default'
      ? 'numeric'
      : keyboardType;

  return (
    <TextInput
      ref={ref}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedText}
      style={[
        styles.input,
        multiline && styles.multilineInput,
        !editable && styles.readOnly,
        isAmount && styles.amountInput,   // ⭐ NEW
        style,
      ]}
      secureTextEntry={secureTextEntry}
      editable={editable}
      keyboardType={effectiveKeyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
      underlineColorAndroid="transparent"
      selectionColor={colors.primary}
      autoCapitalize={secureTextEntry ? 'none' : 'sentences'}
      autoCorrect={!secureTextEntry}
      blurOnSubmit={false}
      autoComplete="off"
      {...rest}
    />
  );
});

export default React.memo(AppInput);

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 44,
    color: colors.text,
    backgroundColor: colors.surface,
    fontFamily: typography.family.regular,
    fontSize: 16,
    lineHeight: 22,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  multilineInput: {
    height: undefined,
    minHeight: 90,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    textAlignVertical: 'top',
  },

  readOnly: {
    opacity: 0.9,
  },

  // ⭐ NEW — Used only when variant="amount"
  amountInput: {
    textAlign: 'right',
    fontVariant: ['tabular-nums'],  // optional: improves digit alignment
  },
});
