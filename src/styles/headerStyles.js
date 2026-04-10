// src/styles/headerStyles.js
import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export const headerStyles = StyleSheet.create({
  // 🔹 Left section (hamburger + "Home")
  leftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  leftText: {
    fontFamily: typography.family.semibold, // Poppins-SemiBold
    fontSize: 18,
    lineHeight: 24,
    color: '#fff', // white text on colored header
    marginLeft: spacing.xs,
  },

  // 🔹 Center title (optional)
  title: {
    fontFamily: typography.family.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: '#fff',
  },

  // 🔹 Right section (user icon + name)
  rightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  rightText: {
    fontFamily: typography.family.medium, // Poppins-Medium
    fontSize: 16,
    lineHeight: 22,
    color: '#fff',
  },
});
