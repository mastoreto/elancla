import { AUDIT_ACTIONS } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import {
  findScheduleSetRow,
  isScheduleSetInUse,
  softDeleteScheduleSet,
} from "../../data";
import { ScheduleSetInUseError } from "../../domain";
import { toScheduleSetDto } from "../../mappers";

/**
 * Logical delete, with the activities of the set. A set an exception uses as its replacement
 * cannot go (409 `schedule_set_in_use`).
 */
export function deleteScheduleSet(
  ctx: AuthenticatedContext,
  id: string,
): Promise<void> {
  return withTransaction(db, async (tx) => {
    const current = await findScheduleSetRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The schedule set was not found");
    if (await isScheduleSetInUse(tx, ctx.organizationId, id)) {
      throw new ScheduleSetInUseError();
    }
    await softDeleteScheduleSet(tx, ctx.organizationId, id);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.scheduleSet.deleted,
      entity: { type: "scheduleSet", id },
      before: toScheduleSetDto(current),
    });
  });
}
