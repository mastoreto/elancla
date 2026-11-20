import { type Locale, localeMeta } from 'src/i18n/config';

export type BlogDateStyle = 'full' | 'compact';

const SEPARATOR = ' · ';

/**
 * The editorial date of the design: `17 · NOV · 2026` (`full`) or `17 · NOV` (`compact`).
 * `date` is a `YYYY-MM-DD` (or the start of an ISO date-time): the day is read as written, so the
 * visitor's time zone never moves it.
 */
export function formatBlogDate(
  date: string,
  locale: Locale,
  style: BlogDateStyle = 'full'
): string {
  const day = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(day.getTime())) return '';
  const parts = new Intl.DateTimeFormat(localeMeta[locale].htmlLang, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(day);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? '';
  const month = part('month').replace('.', '').toUpperCase();
  const pieces = [part('day'), month];
  if (style === 'full') pieces.push(part('year'));
  return pieces.join(SEPARATOR);
}
