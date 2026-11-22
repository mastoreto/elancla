import type { RecurringActivityDto } from "@ancla/contracts";

/** Index = `weekday` of the API (0 = Sunday), same as `Date#getDay`. */
export const WEEKDAY_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;

export interface WeekdayGroup {
  weekday: number;
  label: string;
  activities: RecurringActivityDto[];
}

/** "10:00" or "10:00 – 12:00". */
export function describeTimeRange(start: string, end: string | null): string {
  return end === null ? start : `${start} – ${end}`;
}

/** Activities grouped by day of the week (Sunday first), by start time inside the day. Empty days are left out. */
export function groupByWeekday(activities: readonly RecurringActivityDto[]): WeekdayGroup[] {
  return WEEKDAY_LABELS.map((label, weekday) => ({
    weekday,
    label,
    activities: activities
      .filter((activity) => activity.weekday === weekday)
      .sort((a, b) => a.start.localeCompare(b.start)),
  })).filter((group) => group.activities.length > 0);
}
