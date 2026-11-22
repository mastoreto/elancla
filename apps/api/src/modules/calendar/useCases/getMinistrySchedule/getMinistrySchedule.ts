import type { PublicMinistryScheduleSlotDto } from "@ancla/contracts";
import { resolvePublicWeekActivities } from "../resolvePublicWeekActivities";

/**
 * When a ministry meets this week: its public linked activities, by the same resolution as the
 * service times (so an internal activity or one of an unpublished year never shows).
 */
export async function getMinistrySchedule(
  organizationId: string,
  ministryId: string,
  now: Date = new Date(),
): Promise<PublicMinistryScheduleSlotDto[]> {
  const slots = await resolvePublicWeekActivities(organizationId, now, {
    ministryId,
  });
  return slots
    .map(({ weekday, activity }) => ({
      weekday,
      start: activity.start,
      ...(activity.end ? { end: activity.end } : {}),
    }))
    .sort((a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start));
}
