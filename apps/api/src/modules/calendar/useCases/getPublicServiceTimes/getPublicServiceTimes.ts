import type { ServiceTimeDto } from "@ancla/contracts";
import { toServiceKindDto } from "../../mappers";
import { resolvePublicWeekActivities } from "../resolvePublicWeekActivities";

/**
 * The worship times of this week, in the shape the site settings always had: the public activities
 * with a service kind of the schedule sets in force the next 7 days (fixed ones, plus those of the
 * current year when it is published).
 * ponytail: resolved per request; the cache TTL (60s) makes midnight switches lag at most a minute.
 */
export async function getPublicServiceTimes(
  organizationId: string,
  now: Date = new Date(),
): Promise<ServiceTimeDto[]> {
  const slots = await resolvePublicWeekActivities(organizationId, now, {
    serviceOnly: true,
  });
  return slots
    .flatMap(({ weekday, activity }): ServiceTimeDto[] => {
      const kind = toServiceKindDto(activity.serviceKind);
      return kind
        ? [{ kind, weekday, start: activity.start, end: activity.end }]
        : [];
    })
    .sort((a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start));
}
