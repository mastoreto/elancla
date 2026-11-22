import {
  findOrganizationTimezone,
  findPublicActivities,
  findScheduleContext,
  type PublicActivityRow,
} from "../../data";
import {
  addDays,
  localDateIn,
  resolveWeek,
  selectDayActivities,
  WEEK_LENGTH,
} from "../../domain";
import { toResolvableException, toResolvableSet } from "../../mappers";

export interface PublicWeekSlot {
  /** Weekday of the day the slot falls on (0 = Sunday). */
  weekday: number;
  activity: PublicActivityRow;
}

interface PublicWeekFilter {
  /** Only the activities that are a service time. */
  serviceOnly?: boolean;
  /** Only the activities linked to this ministry. */
  ministryId?: string;
}

/**
 * The public activities of the week that starts today (in the church's time zone): for each of the
 * 7 days the schedule set that governs it (exception, manual switch, validity, default) and its
 * activities of that weekday. Fixed ones always; those of a year only if that year is published.
 */
export async function resolvePublicWeekActivities(
  organizationId: string,
  now: Date,
  filter: PublicWeekFilter = {},
): Promise<PublicWeekSlot[]> {
  const organization = await findOrganizationTimezone(organizationId);
  if (!organization) return [];
  const today = localDateIn(organization.timezone, now);
  const context = await findScheduleContext(organizationId, {
    from: today,
    to: addDays(today, WEEK_LENGTH - 1),
  });
  const days = resolveWeek({
    today,
    sets: context.sets.map(toResolvableSet),
    exceptions: context.exceptions.map(toResolvableException),
  });
  const scheduleSetIds = [
    ...new Set(days.flatMap((day) => (day.set ? [day.set.id] : []))),
  ];
  if (scheduleSetIds.length === 0) return [];
  const activities = await findPublicActivities(organizationId, {
    scheduleSetIds,
    ...filter,
  });
  const publishedYears = new Set(context.publishedYears);
  return days.flatMap((day) =>
    selectDayActivities({ day, activities, publishedYears }).map(
      (activity) => ({ weekday: day.weekday, activity }),
    ),
  );
}
