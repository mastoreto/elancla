import type { RecurringActivityListDto } from "@ancla/contracts";
import { listActivityRows } from "../../data";
import { toRecurringActivityDto } from "../../mappers";

export async function listRecurringActivities(
  organizationId: string,
  scheduleSetId: string | undefined,
): Promise<RecurringActivityListDto> {
  const rows = await listActivityRows(organizationId, scheduleSetId);
  return { items: rows.map(toRecurringActivityDto) };
}
