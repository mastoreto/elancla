import type { ScheduleSetListDto } from "@ancla/contracts";
import { listScheduleSetRows } from "../../data";
import { toScheduleSetDto } from "../../mappers";

export async function listScheduleSets(
  organizationId: string,
): Promise<ScheduleSetListDto> {
  return {
    items: (await listScheduleSetRows(organizationId)).map(toScheduleSetDto),
  };
}
