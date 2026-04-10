// src/styles/uploadStyles.js
import { StyleSheet } from 'react-native';
import { spacing, colors } from '../theme';

export const uploadStyles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    alignItems:'center',
  },

  imagePreview: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },

  pdfText: {
    color: colors.primary,
    fontSize: 15,
  },

  fileSize: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: 12,
  },
});
