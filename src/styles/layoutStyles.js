// src/styles/layoutStyles.js
import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors, spacing, typography } from '../theme';

// --- responsive helpers ---
const { width, height } = Dimensions.get('window'); // ✅ define first
const BASE_W = 375;
const BASE_H = 812;

const hs = size => Math.round((width / BASE_W) * size);
const vs = size => Math.round((height / BASE_H) * size);
const ms = (size, factor = 0.5) =>
  Math.round(size + (hs(size) - size) * factor);

// ✅ small screen detection
const isSmallDevice = width < 380;

export const layoutStyles = StyleSheet.create({
  // 🔹 Header Block
  headerWrap: {
    backgroundColor: colors.surface,
    borderRadius: ms(12),
    padding: hs(spacing.md),
    marginHorizontal: hs(spacing.sm),
    marginTop: vs(spacing.sm),
    marginBottom: vs(spacing.lg),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  greeting: {
    ...typography.header,
    fontSize: ms(20),
    color: colors.text,
    marginBottom: vs(spacing.xs),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: hs(spacing.sm ?? 8),
  },
  badgeLabel: {
    ...typography.label,
    fontSize: ms(12),
    color: colors.mutedText ?? colors.text,
    marginRight: hs(spacing.sm),
  },
  badgeValue: {
    ...typography.label,
    fontSize: ms(13),
    fontWeight: '600',
    color: colors.primary,
  },

  // 🔹 Generic Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: ms(12),
    padding: hs(spacing.md),
    marginBottom: vs(spacing.lg),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },
  cardAuth: {
    alignSelf: 'center',
    width: '95%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },

  authLogo: {
    width: 200,
    height: 100,
    alignSelf: 'center',
    marginBottom: 10,
  },

  // 🔹 2-column layout
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: hs(spacing.sm ?? 10),
  },
  fieldBlock: {
    flexBasis: '33.333%',
    maxWidth: '33.333%',
    paddingVertical: 4,
  },
  cardCompact: {
    padding: 10, // was larger; adjust if needed
  },

  // tighter 2-column rows inside dense cards
  twoColumnTight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 0,
  },
  // 🔹 Quick Action Row (auto grid)
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: vs(spacing.md),
  },

  quickActionButton: {
    width: '48%', // 2 per row
    paddingVertical: 6, // 🔥 reduce height
    paddingHorizontal: 4, // reduce horizontal padding
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderRadius: 10, // nice rounded corners
  },
  // layoutStyles.js (add inside StyleSheet.create)
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8, // row/col gaps
  },
  gridCell: {
    // width will be set dynamically in the screen (32% or 48%)
  },
  cellLabel: {
    // reuse your compact label if you added it; else:
    fontWeight: '600',
    marginBottom: 2,
  },
  cellValue: {
    // reuse readOnlyDense; else keep it simple:
    paddingVertical: 6,
  },
  // Page-level wrappers (for Screens / ScrollViews)
  pageContainer: {
    flex: 1,
    backgroundColor: colors.background, // or colors.backgroundLight if you add it
  },
  pageContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  screenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background || '#fff',
  },
  logoCentered: {
    width: 240,
    height: 240,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surfaceAlt || '#FFF8F3', // subtle off-white / warm tone
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight || '#f2f2f2',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },

  infoLabel: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 14,
  },

  infoValue: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
  },

  divider: {
    height: 1,
    backgroundColor: colors.borderLight || '#eee',
    marginVertical: spacing.sm,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt || '#fae0cdff', // soft brand-tinted bg
    borderWidth: 1,
    borderColor: colors.borderLight || '#f1e6de',
    marginTop: 0,
    marginBottom: 10,
  },

  dueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  dueLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.8,
  },

  dueChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.primaryDark, // brand orange chip
  },

  dueChipText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  dueRowPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    marginTop: 4,
  },
  dueLabelPill: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedText || colors.text,
  },
  duePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: (colors.primary && colors.primary + '22') || '#FFE7D6', // faint brand tint
  },
  duePillText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  loanPickerWrap: {
    backgroundColor: colors.surface || '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border || '#ddd',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginVertical: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  loanPickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedText || '#666',
    marginBottom: spacing.xs / 2,
  },
});
