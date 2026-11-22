import {
  AUDIT_ACTIONS,
  type RecurringActivityDto,
  type UpdateRecurringActivityBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { StaleVersionError } from "../../../blog";
import { assertTranslationLocales } from "../../../ministries";
import { findActivityRow, replaceActivityIfVersion } from "../../data";
import { toRecurringActivityDto } from "../../mappers";
import { assertActivityReferences } from "../assertActivityReferences";

/** Replaces the whole activity; `version` is the one the editor loaded. */
export function updateRecurringActivity(
  ctx: AuthenticatedContext,
  id: string,
  { version, ...body }: UpdateRecurringActivityBody,
): Promise<RecurringActivityDto> {
  return withTransaction(db, async (tx) => {
    const current = await findActivityRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The activity was not found");
    await assertTranslationLocales(tx, ctx.organizationId, body.translations);
    await assertActivityReferences(tx, ctx.organizationId, body);

    const applied = await replaceActivityIfVersion(
      tx,
      { id, organizationId: ctx.organizationId, version },
      body,
    );
    if (!applied) throw new StaleVersionError();

    const updated = await findActivityRow(tx, ctx.organizationId, id);
    if (!updated) throw new NotFoundError("The activity was not found");
    const after = toRecurringActivityDto(updated);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.recurringActivity.updated,
      entity: { type: "recurringActivity", id },
      before: toRecurringActivityDto(current),
      after,
    });
    return after;
  });
}
