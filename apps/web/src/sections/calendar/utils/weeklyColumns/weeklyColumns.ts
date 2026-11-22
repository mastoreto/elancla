import type { CalendarWeeklySlot } from 'src/sections/calendar/types';

/** The API numbers weekdays like `Date#getDay` (0 = Sunday); the grids start on Monday. */
export const WEEK_COLUMNS = 7;
export const SUNDAY_COLUMN = 6;

/** Weekday (0 = Sunday) shown in a Monday-first column (0 = Monday). */
export function weekdayOfColumn(column: number): number {
  return (column + 1) % WEEK_COLUMNS;
}

/** Monday-first column (0 = Monday) of a weekday (0 = Sunday). */
export function columnOfWeekday(weekday: number): number {
  return (weekday + 6) % WEEK_COLUMNS;
}

/** Weekly slots ordered Monday first, then by start time. */
export function sortWeekly(weekly: CalendarWeeklySlot[]): CalendarWeeklySlot[] {
  return [...weekly].sort(
    (a, b) =>
      columnOfWeekday(a.weekday) - columnOfWeekday(b.weekday) ||
      a.start.localeCompare(b.start)
  );
}

/** The slots of one Monday-first column, in time order. */
export function weeklyOfColumn(
  weekly: CalendarWeeklySlot[],
  column: number
): CalendarWeeklySlot[] {
  const weekday = weekdayOfColumn(column);
  return sortWeekly(weekly).filter((slot) => slot.weekday === weekday);
}
