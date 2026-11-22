import type { CalendarYearListDto } from "@ancla/contracts";
import { listYearRows } from "../../data";
import { toCalendarYearDto } from "../../mappers";

export async function listCalendarYears(
  organizationId: string,
): Promise<CalendarYearListDto> {
  const rows = await listYearRows(organizationId);
  return { items: rows.map(toCalendarYearDto) };
}
