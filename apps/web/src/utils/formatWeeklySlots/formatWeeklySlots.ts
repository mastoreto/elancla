import type { PublicMinistry } from '@ancla/content';
import type { Locale } from 'src/i18n/config';
import { timeRange, weekdayName } from 'src/utils/formatServiceTimes';

type WeeklySlot = PublicMinistry['schedule'][number];

export interface WeeklySlotRow {
  /** Localized weekday ("Viernes"). */
  dayLabel: string;
  /** "20:00 – 22:00", or just the start when the slot has no end. */
  timeLabel: string;
}

const DAYS_PER_WEEK = 7;
/** The API numbers days from Sunday (0); the site reads a week from Monday. */
const mondayFirst = (weekday: number): number =>
  (weekday + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK;

/** Rows for a "when" list, Monday first and by start time within a day. */
export function formatWeeklySlots(
  slots: readonly WeeklySlot[],
  locale: Locale
): WeeklySlotRow[] {
  return [...slots]
    .sort(
      (a, b) =>
        mondayFirst(a.weekday) - mondayFirst(b.weekday) ||
        a.start.localeCompare(b.start)
    )
    .map((slot) => ({
      dayLabel: weekdayName(slot.weekday, locale, 'long'),
      timeLabel: timeRange(slot),
    }));
}
