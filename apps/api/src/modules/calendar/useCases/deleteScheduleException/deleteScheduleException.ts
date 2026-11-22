import { AUDIT_ACTIONS } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { deleteException, findExceptionRow } from "../../data";
import { toScheduleExceptionDto } from "../../mappers";

/** Exceptions are removed for good: they are one-day overrides with nothing pointing at them. */
export function deleteScheduleException(
  ctx: AuthenticatedContext,
  id: string,
): Promise<void> {
  return withTransaction(db, async (tx) => {
    const current = await findExceptionRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The exception was not found");
    await deleteException(tx, ctx.organizationId, id);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.scheduleException.deleted,
      entity: { type: "scheduleException", id },
      before: toScheduleExceptionDto(current),
    });
  });
}
