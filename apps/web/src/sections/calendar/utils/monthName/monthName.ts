// Any year works: only the month name is read.
const REFERENCE_YEAR = 2024;

/** Localized month name for a month index (0-11). */
export function monthName(
  month: number,
  lang: string,
  style: 'long' | 'short'
): string {
  return new Intl.DateTimeFormat(lang, { month: style, timeZone: 'UTC' })
    .format(new Date(Date.UTC(REFERENCE_YEAR, month, 1)))
    .replace('.', '');
}
