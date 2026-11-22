import {
  AUDIT_ACTIONS,
  type RecurringActivityDto,
  type UpsertRecurringActivityBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { assertTranslationLocales } from "../../../ministries";
import { createActivityRow } from "../../data";
import { toRecurringActivityDto } from "../../mappers";
import { assertActivityReferences } from "../assertActivityReferences";

export function createRecurringActivity(
  ctx: AuthenticatedContext,
  body: UpsertRecurringActivityBody,
): Promise<RecurringActivityDto> {
  return withTransaction(db, async (tx) => {
    await assertTranslationLocales(tx, ctx.organizationId, body.translations);
    await assertActivityReferences(tx, ctx.organizationId, body);
    const created = toRecurringActivityDto(
      await createActivityRow(tx, ctx.organizationId, body),
    );
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.recurringActivity.created,
      entity: { type: "recurringActivity", id: created.id },
      after: created,
    });
    return created;
  });
}
