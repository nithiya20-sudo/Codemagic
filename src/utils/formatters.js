// src/utils/formatters.js

/**
 * Remove all non-numeric characters except dot.
 * Used for amount inputs (loan amounts etc.)
 */
export const stripToNumber = (val) => {
  if (!val) return '';
  return val.replace(/[^0-9.]/g, '');
};

/**
 * Remove all non-numeric characters.
 * Used for tenure and other integer-only fields.
 */
export const stripToInteger = (val) => {
  if (!val) return '';
  return val.replace(/[^0-9]/g, '');
};

/**
 * Format a raw numeric value into "ZMW 200,000" format.
 * Used only for DISPLAY (never use this for input).
 */
export const displayAmount = (val) => {
  if (!val) return '-';

  const num = Number(val);
  if (isNaN(num)) return '-';

  return `${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
/**
 * Format generic numbers with comma separation only.
 */
export const formatWithCommas = (val) => {
  if (!val) return '';
  const num = Number(val);
  return isNaN(num) ? '' : num.toLocaleString();
};
