import type { CalendarMinistry } from "../../types";

/** The ministries of an event in the event's own order; ids the CRM cannot see are left out. */
export function resolveEventMinistries(
  ministryIds: readonly string[],
  ministries: readonly CalendarMinistry[],
): CalendarMinistry[] {
  return ministryIds.flatMap((id) => {
    const ministry = ministries.find((candidate) => candidate.id === id);
    return ministry ? [ministry] : [];
  });
}
