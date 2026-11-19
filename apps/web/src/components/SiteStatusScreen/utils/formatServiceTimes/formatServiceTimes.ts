import type { Locale } from '../../../../i18n/config';

const WEEKDAY_INDEX: Record<string, number> = {
  Mo: 1,
  Tu: 2,
  We: 3,
  Th: 4,
  Fr: 5,
  Sa: 6,
  Su: 0,
};

// 2024-01-07 is a Sunday: adding the weekday index gives that day in UTC.
const SUNDAY_UTC = Date.UTC(2024, 0, 7);
const MS_PER_DAY = 86_400_000;
const SUMMARY =
  /^(Mo|Tu|We|Th|Fr|Sa|Su)\s+(\d{1,2}:\d{2})(?:\s*-\s*(\d{1,2}:\d{2}))?/;

export interface ServiceTimesFact {
  /** Localized weekday ("Domingo"), or null when the summary is free text. */
  label: string | null;
  /** "11:15 – 13:00", or the raw summary when it does not follow the "Su 11:15-13:00" shape. */
  value: string;
}

function weekdayName(index: number, locale: Locale): string {
  const name = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(new Date(SUNDAY_UTC + index * MS_PER_DAY));
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}

/** Turns `SiteConfig.serviceTimes` ("Su 11:15-13:00") into a label and value for a fact card. */
export function formatServiceTimes(
  summary: string,
  locale: Locale
): ServiceTimesFact {
  const match = SUMMARY.exec(summary.trim());
  if (!match) return { label: null, value: summary.trim() };
  const [, day, opens, closes] = match;
  return {
    label: weekdayName(WEEKDAY_INDEX[day], locale),
    value: closes ? `${opens} – ${closes}` : opens,
  };
}
