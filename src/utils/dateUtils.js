export function formatDateFromServer(raw) {
  if (!raw || typeof raw !== 'string') return '-';

  const trimmed = raw.trim();
  if (!trimmed) return '-';

  let day, month, year;

  // ISO Format (YYYY-MM-DD)
  if (trimmed.includes('T') || /^\d{4}-/.test(trimmed)) {
    const main = trimmed.split(/[T ]/)[0];
    const parts = main.split('-');

    if (parts.length === 3) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    }
  }
  // API Format (MM/DD/YYYY)
  else if (trimmed.includes('/')) {
    const main = trimmed.split(' ')[0];
    const parts = main.split('/');

    if (parts.length === 3) {
      month = parseInt(parts[0], 10);
      day = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }
  }

  if (
    !day ||
    !month ||
    !year ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return trimmed;
  }

  const MONTH_NAMES = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const dd = day.toString().padStart(2, '0');
  const mmm = MONTH_NAMES[month - 1];

  return `${dd}-${mmm}-${year}`;
}
