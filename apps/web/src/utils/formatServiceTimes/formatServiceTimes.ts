import type { ServiceTime } from '@ancla/content';
import type { Locale } from 'src/i18n/config';

// 2024-01-07 is a Sunday: adding the weekday index gives that day in UTC.
const SUNDAY_UTC = Date.UTC(2024, 0, 7);
const MS_PER_DAY = 86_400_000;
const TIME_SEPARATOR = ' – ';

export interface ServiceTimeRow {
  kind: ServiceTime['kind'];
  /** Localized weekday ("Domingo"). */
  dayLabel: string;
  /** "09:30 – 11:00", or just the start when the slot has no end. */
  timeLabel: string;
}

function weekdayName(
  weekday: number,
  locale: Locale,
  style: 'long' | 'short'
): string {
  const name = new Intl.DateTimeFormat(locale, {
    weekday: style,
    timeZone: 'UTC',
  })
    .format(new Date(SUNDAY_UTC + weekday * MS_PER_DAY))
    // Short names come with a trailing dot in some locales ("dom.").
    .replace(/\.$/, '');
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}

function timeRange(time: ServiceTime): string {
  return time.end ? `${time.start}${TIME_SEPARATOR}${time.end}` : time.start;
}

/** Rows for a schedule list, in the order the church configured them. */
export function formatServiceTimes(
  times: readonly ServiceTime[],
  locale: Locale
): ServiceTimeRow[] {
  return times.map((time) => ({
    kind: time.kind,
    dayLabel: weekdayName(time.weekday, locale, 'long'),
    timeLabel: timeRange(time),
  }));
}

/** Compact text for a chip: "Dom · 09:30". */
export function formatServiceTimeShort(
  time: ServiceTime,
  locale: Locale
): string {
  return `${weekdayName(time.weekday, locale, 'short')} · ${time.start}`;
}
