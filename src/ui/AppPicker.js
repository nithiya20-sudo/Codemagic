import React, { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { StyleSheet, View, Platform } from 'react-native';
import { colors, spacing, typography } from '../theme';

export default function AppPicker({
  selectedValue,
  onValueChange,
  items = [],
  placeholder = 'Select',
  style,
  enabled = true,
  zIndex = 1000, // raise if you stack multiple pickers
}) {
  const [open, setOpen] = useState(false);

  return (
    <View
      style={[
        styles.container,
        style,
        !enabled && styles.disabled,
        { zIndex, elevation: Platform.OS === 'android' ? zIndex : 0 },
      ]}
    >
      <DropDownPicker
        open={open}
        value={selectedValue}
        items={items.map(i => ({ label: i.label, value: i.value }))}
        setOpen={setOpen}
        // controlled: reflect changes back to parent
        setValue={(setter) => {
          const next = typeof setter === 'function' ? setter(selectedValue) : setter;
          onValueChange(next);
        }}
        onChangeValue={onValueChange}
        placeholder={placeholder}
        disabled={!enabled}
        listMode="SCROLLVIEW"             // use "SCROLLVIEW" if you want inline list
        showArrowIcon
        showTickIcon
        dropDownDirection="AUTO"

        // styles
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropContainer}
        textStyle={styles.text}
        listItemLabelStyle={styles.listItem}
        placeholderStyle={styles.placeholder}
        arrowIconStyle={styles.arrow}
        tickIconStyle={styles.tick}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  dropdown: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    height: 48,
    justifyContent: 'center',
  },
  dropContainer: {
    borderColor: colors.borderLight || '#eee',
    backgroundColor: colors.surface,
    borderRadius: 10,
    zIndex: 9999,           // 👈 new
    elevation: 9999,        // 👈 new (Android)
  },
  text: {
    fontFamily: typography.family.regular, // ✅ Poppins everywhere
    fontSize: 15,
    color: colors.text,
  },
  listItem: {
    fontFamily: typography.family.regular,
    fontSize: 15,
    color: colors.text,
  },
  placeholder: {
    color: colors.mutedText || '#999',
    fontFamily: typography.family.regular,
  },
  arrow: { tintColor: colors.text },
  tick: { tintColor: colors.primary },
  disabled: { opacity: 0.6 },
});
