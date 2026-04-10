import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors, spacing, typography } from '../theme';

// ------- Responsive helpers -------
const { width, height } = Dimensions.get('window');
const BASE_W = 375;
const BASE_H = 812;
const hs = size => Math.round((width / BASE_W) * size);
const vs = size => Math.round((height / BASE_H) * size);
const ms = (size, factor = 0.5) =>
  Math.round(size + (hs(size) - size) * factor);

// ------- Styles -------
export const formStyles = StyleSheet.create({
  // Common wrappers
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: hs(spacing.lg),
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: hs(spacing.lg),
    backgroundColor: colors.background,
  },

  // Card
  card: {
    width: '92%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: hs(18),
    overflow: 'visible', // 👈 IMPORTANT
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  cardwithTBmargin: {
    width: '92%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: hs(18),
    overflow: 'visible', // 👈 IMPORTANT
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  // Typography
  title: {
    ...typography.header, // ✅ Poppins-SemiBold
    fontSize: ms(22),
    textAlign: 'center',
    marginBottom: vs(spacing.xl),
    color: colors.primary,
  },
  label: {
    fontFamily: typography.family.medium, // ✅ Poppins-Medium
    fontSize: ms(14),
    lineHeight: 20,
    color: colors.mutedText ?? colors.text,
    marginBottom: vs(spacing.xs),
  },
  sectionTitle: {
    fontFamily: typography.family.semibold,
    fontSize: ms(16),
    color: colors.text,
    marginBottom: vs(8),
  },

  // Inputs
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: hs(spacing.md),
    height: Math.max(44, vs(44)),
    backgroundColor: colors.surface,
    color: colors.text,
    marginBottom: vs(spacing.md),
    width: '100%',
    fontFamily: typography.family.regular,
  },
  readOnly: {
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: hs(spacing.md),
    height: Math.max(44, vs(44)),
    backgroundColor: colors.surface,
    color: colors.text,
    marginBottom: vs(spacing.md),
    width: '100%',
    fontFamily: typography.family.regular,
  },
  readOnlyDense: {
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: typography.family.regular,
  },

  // Buttons
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: Math.max(12, vs(spacing.md)),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(spacing.lg),
    width: '100%',
    minHeight: Math.max(44, vs(44)),
  },
  buttonText: {
    fontFamily: typography.family.medium, // ✅ Poppins-Medium
    color: '#fff',
    fontSize: ms(16),
  },
  dueChipText: {
    fontFamily: typography.family.regular, // ✅ Poppins-Medium
    color: '#fff',
    fontSize: spacing.md + 2,
  },
  // Alignment helpers
  flexContainer: {
    flex: 1,
    backgroundColor: colors.background || '#fff',
  },
  centeredScreen: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  // Vertical stacks
  vstackXs: { width: '100%', gap: 6 },
  vstackSm: { width: '100%', gap: 10 },
  vstackMd: { width: '100%', gap: 14 },
  vstackLg: { width: '100%', gap: 18 },
  vstackTight: { width: '100%', gap: 6 },
  vstackUltraTight: { width: '100%', gap: 4 },

  // Margins
  mbXs: { marginBottom: spacing.xs },
  mbSm: { marginBottom: spacing.sm },
  mbMd: { marginBottom: spacing.md },
  mbLg: { marginBottom: spacing.lg },

  // Margins
  mtXs: { marginTop: spacing.xs },
  mtSm: { marginTop: spacing.sm },
  mtMd: { marginTop: spacing.md },
  mtLg: { marginTop: spacing.lg },

  // Pipe divider row
  hstackCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  pipeText: {
    fontFamily: typography.family.medium,
    color: colors.text,
    opacity: 0.6,
    marginHorizontal: 4,
  },

  // Links
  link: {
    fontFamily: typography.family.medium,
    color: colors.primary,
    textAlign: 'center',
    marginTop: vs(spacing.md),
    fontSize: ms(14),
  },

  // Bottom padding to avoid keyboard overlap
  kbPadLg: {
    paddingBottom: 48,
  },
  // Inline info rows (Label: Value)
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2, // or spacing.xs
  },

  infoLabel: {
    fontFamily: typography.family.medium, // Poppins-Medium
    fontSize: 14,
    lineHeight: 20,
    color: colors.mutedText ?? colors.text, // a bit dimmer than value
    marginRight: 8,
    flexShrink: 0,
  },

  infoValue: {
    fontFamily: typography.family.semibold, // Poppins-SemiBold (stands out)
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    textAlign: 'left',
    flexShrink: 1,
  },
  success: {
    fontFamily: typography.family.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.success,
    textAlign: 'left',
    flexShrink: 1,
  },
  // Inline label + control row (e.g., "Basic Pay  |  [ 10,000 ]")
  fieldRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  fieldLabelInline: {
    fontFamily: typography.family.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.mutedText ?? colors.text,
    marginRight: spacing.sm,
    width: 150, // tweak if label truncates
  },
  fieldControl: {
    flex: 1,
  },
  // For horizontal product cards on Affordability screen
  productCard: {
    // card look (radius, bg, border) should already come from .card
    // this is just layout for horizontal scroll
    width: 300,
    marginRight: spacing.sm,
  },

  productCardTitle: {
    fontSize: 16,
    fontFamily: typography.family.bold || typography.family.medium,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },

  productCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },

  productCardLabel: {
    fontSize: 13,
    color: colors.mutedText,
    fontFamily: typography.family.bold || typography.family.medium,
  },

  productCardValue: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: typography.family.bold || typography.family.medium,
  },

  productCardValueStrong: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: typography.family.bold || typography.family.medium,
  },

  productCardBadgeRow: {
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },

  productCardBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },

  productCardBadgeYes: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },

  productCardBadgeNo: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Colored header strip on top of each box
  cardHeader: {
    width: '100%',
    height: 6,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: spacing.sm,
  },

  cardBlue: { backgroundColor: '#E8F0FE' },
  cardRed: { backgroundColor: '#FDECEA' },
  cardGreen: { backgroundColor: '#E6F4EA' },

  summaryLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: spacing.xs,
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginTop: spacing.xs,
  },

  // ======================
  // Loan Statement Styles
  // ======================
  statementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  statementCol: {
    width: '48%',
  },

  statementLabel: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
    fontFamily: 'Poppins-Regular', // 👈 use your base Poppins
  },

  statementValue: {
    fontSize: 15,
    color: '#222',
    fontFamily: 'Poppins-SemiBold', // 👈 or Poppins-Medium if you prefer
  },

  statementHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  downloadIconButton: {
    padding: 4,
  },

  transactionCard: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  transactionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  transactionBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  transactionDate: {
    fontSize: 14,
    color: '#222',
    fontFamily: 'Poppins-SemiBold',
  },

  transactionRemarks: {
    fontSize: 14,
    color: '#444',
    maxWidth: '60%',
    fontFamily: 'Poppins-Regular',
  },

  transactionSmall: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },

  transactionSmallGreen: {
    fontSize: 13,
    color: '#028826ff',
    fontFamily: 'Poppins-Regular',
  },
  transactionSmallRed: {
    fontSize: 13,
    color: '#e41010ff',
    fontFamily: 'Poppins-Regular',
  },
  statementPickerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    zIndex: 9999, // 👈 must be high
    elevation: 9999, // 👈 for Android
  },

  statementPickerWrapper: {
    flex: 1,
    marginRight: spacing.sm,
    zIndex: 9999,
    elevation: 9999,
  },

  statementLoadIconButton: {
    paddingHorizontal: 10,
    paddingVertical: 13,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    verticalAlign: 'top',
  },
  // =============================
  // Loan Status Timeline Styles
  // =============================
  statusRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },

  statusLeftCol: {
    alignItems: 'center',
    width: 30,
  },

  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 2,
  },

  statusDotDone: {
    backgroundColor: '#1A73E8', // blue
  },

  statusDotCurrent: {
    backgroundColor: '#F9A825', // orange
  },

  statusDotPending: {
    backgroundColor: '#BDBDBD', // grey
  },

  statusLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#D6D6D6',
    marginTop: 2,
  },

  statusRightCol: {
    flex: 1,
    paddingLeft: spacing.sm,
  },

  statusLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#222',
    marginBottom: 2,
  },

  statusDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#666',
  },

  statusNoData: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  resultCard: {
    alignItems: 'center',
  },
  resultTitle: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  resultInfoText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
  },
  resultInfoValue: {
    fontWeight: 'bold',
  },
  resultSummaryBox: {
    marginTop: spacing.md,
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: spacing.md,
  },
  resultSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  resultSummaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  resultSummaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  resultErrorText: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: '#D93025',
    textAlign: 'center',
  },
  resultButtonContainer: {
    marginTop: spacing.lg,
    width: '100%',
  },
  // Document Upload Grid
  docGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },

  // Individual card (2 per row)
  docCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  docHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },

  docTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  docOptional: {
    fontSize: 11,
    color: '#777',
  },

  docPreviewRow: {
    position: 'relative',
    marginBottom: spacing.sm,
  },

  docPreviewImage: {
    width: '100%',
    height: 100,
    borderRadius: 6,
  },

  docRemoveBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 2,
  },

  docPlaceholder: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: spacing.sm,
  },

  docPlaceholderText: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },

  docUploadBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
  },

  loanTypeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loanTypeSelected: {
    backgroundColor: '#EB6A00', // primary blue
    borderColor: '#EB6A00',
  },

  loanTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344054',
  },

  loanTypeTextSelected: {
    color: '#FFFFFF',
  },
});
