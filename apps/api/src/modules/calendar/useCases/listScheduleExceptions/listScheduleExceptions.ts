import type { ScheduleExceptionListDto } from "@ancla/contracts";
import { listExceptionRows } from "../../data";
import { toScheduleExceptionDto } from "../../mappers";

export async function listScheduleExceptions(
  organizationId: string,
): Promise<ScheduleExceptionListDto> {
  return {
    items: (await listExceptionRows(organizationId)).map(
      toScheduleExceptionDto,
    ),
  };
}
