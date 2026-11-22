import { yearOf } from "../dateOnly";

export interface DayActivityCandidate {
  scheduleSetId: string;
  weekday: number;
  isPublic: boolean;
  isFixed: boolean;
  year: number | null;
}

/**
 * The public activities that happen on a resolved day: those of its schedule set that fall on its
 * weekday. Fixed activities always show; the ones of a year only when that year (the year of the
 * day, so a week that crosses New Year is judged day by day) is published.
 */
export function selectDayActivities<
  Activity extends DayActivityCandidate,
>(input: {
  day: { date: string; weekday: number; set: { id: string } | null };
  activities: readonly Activity[];
  publishedYears: ReadonlySet<number>;
}): Activity[] {
  const { day, activities, publishedYears } = input;
  if (day.set === null) return [];
  const dayYear = yearOf(day.date);
  return activities.filter(
    (activity) =>
      activity.scheduleSetId === day.set?.id &&
      activity.weekday === day.weekday &&
      activity.isPublic &&
      (activity.isFixed ||
        (activity.year === dayYear && publishedYears.has(dayYear))),
  );
}
