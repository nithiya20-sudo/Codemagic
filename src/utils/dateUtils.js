export function formatDateFromServer(raw) {
  if (!raw || typeof raw !== 'string') return '-';

  const trimmed = raw.trim();
  if (!trimmed) return '-';

  let day, month, year;

  // ---- ISO Format (yyyy-MM-dd) ----
  if (trimmed.includes('T') || trimmed.includes('-')) {
    const main = trimmed.split(/[T ]/)[0];
    const parts = main.split('-'); // yyyy-mm-dd
    if (parts.length === 3) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    }
  }

  // ---- Slash Formats (dd/MM/yyyy OR MM/dd/yyyy) ----
  if (!day && trimmed.includes('/')) {
    const main = trimmed.split(' ')[0];
    const parts = main.split('/'); // dd/MM/yyyy OR MM/dd/yyyy

    if (parts.length === 3) {
      const p1 = parseInt(parts[0], 10);
      const p2 = parseInt(parts[1], 10);
      const p3 = parseInt(parts[2], 10);

      // Identify which is day and month
      // If second part > 12 ⇒ second part = day (MM/dd/yyyy)
      if (p2 > 12) {
        month = p1; // MM
        day = p2;   // dd
        year = p3;
      }
      // If first part > 12 ⇒ first part = day (dd/MM/yyyy)
      else if (p1 > 12) {
        day = p1;   // dd
        month = p2; // MM
        year = p3;
      }
      // Ambiguous (01/06/2024), default to dd/MM/yyyy
      else {
        day = p1;
        month = p2;
        year = p3;
      }
    }
  }

  // ---- Fallback ----
  if (!day || !month || !year || month < 1 || month > 12) {
    return trimmed;
  }

  // Convert to dd-MMM-yyyy
  const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const dd = day.toString().padStart(2, '0');
  const mmm = MONTH_NAMES[month - 1];
  const yyyy = year.toString();

  return `${dd}-${mmm}-${yyyy}`;
}
