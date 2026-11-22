import { AUDIT_ACTIONS } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { findActivityRow, softDeleteActivity } from "../../data";
import { toRecurringActivityDto } from "../../mappers";

/** Logical delete. */
export function deleteRecurringActivity(
  ctx: AuthenticatedContext,
  id: string,
): Promise<void> {
  return withTransaction(db, async (tx) => {
    const current = await findActivityRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The activity was not found");
    await softDeleteActivity(tx, ctx.organizationId, id);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.recurringActivity.deleted,
      entity: { type: "recurringActivity", id },
      before: toRecurringActivityDto(current),
    });
  });
}
