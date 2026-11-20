import { AUDIT_ACTIONS, type CreateSimplePageResponse } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { createSimplePageRow } from "../../data";

/** An empty page: its content is written through the editorial workflow. */
export function createPage(
  ctx: AuthenticatedContext,
): Promise<CreateSimplePageResponse> {
  return withTransaction(db, async (tx) => {
    const created = await createSimplePageRow(tx, ctx.organizationId);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.simplePage.created,
      entity: { type: "simplePage", id: created.id },
      after: { id: created.id },
    });
    return created;
  });
}
