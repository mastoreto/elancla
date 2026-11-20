import { db } from "@ancla/db";
import { deleteOrganizationVisitorsBefore } from "../../data";
import { urlDate } from "../../domain";

/**
 * Deletes the anonymous visitors of every day before today. "Today" is the day in each
 * organization's own time zone, the same one `recordPostView` hashes with. Returns how many rows
 * were removed. No audit entry: these rows are anonymous counters, not a change of anyone's data.
 */
export async function purgeViewVisitors(
  now: Date = new Date(),
): Promise<number> {
  const organizations = await db.organization.findMany({
    select: { id: true, timezone: true },
  });
  let purged = 0;
  for (const { id, timezone } of organizations) {
    purged += await deleteOrganizationVisitorsBefore(
      id,
      urlDate(now, timezone),
    );
  }
  return purged;
}
